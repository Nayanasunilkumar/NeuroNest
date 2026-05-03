import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertCircle, Ban, Calendar, Clock3, Loader2, Trash2 } from 'lucide-react';
import {
    createScheduleOverride,
    deleteScheduleOverride,
    getScheduleOverrides,
} from '../../shared/services/doctor';
import { useTheme } from '../../context/ThemeContext';

const formatOverrideDate = (value = '') => {
    if (!value) return 'Unknown date';
    const parts = String(value).split('-');
    if (parts.length !== 3) return value;
    const [year, month, day] = parts.map(Number);
    const dt = new Date(Date.UTC(year, month - 1, day));
    return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
};

const formatUtcTime = (value) => {
    if (!value) return '';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    });
};

const todayLocal = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const ScheduleOverrideModal = ({ isOpen, onClose }) => {
    const { isDark } = useTheme();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        date: todayLocal(),
        scope: 'full_day',
        start_time: '09:00',
        end_time: '17:00',
        reason: '',
    });

    const isRange = formData.scope === 'range';
    const validationMessage = useMemo(() => {
        if (!formData.date) return 'Date is required.';
        if (!isRange) return '';
        if (!formData.start_time || !formData.end_time) return 'Start and end time are required.';
        if (formData.start_time >= formData.end_time) return 'End time must be after start time.';
        return '';
    }, [formData, isRange]);

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await getScheduleOverrides();
                setRows(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load schedule overrides', error);
                alert(error.response?.data?.message || 'Failed to load blocked dates.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        if (validationMessage) {
            alert(validationMessage);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                date: formData.date,
                scope: formData.scope,
                reason: formData.reason.trim() || null,
            };
            if (isRange) {
                payload.start_time = formData.start_time;
                payload.end_time = formData.end_time;
            }
            const created = await createScheduleOverride(payload);
            setRows((prev) =>
                [created, ...prev].sort((a, b) => String(a.override_date).localeCompare(String(b.override_date))),
            );
            setFormData((prev) => ({
                ...prev,
                reason: '',
            }));
        } catch (error) {
            console.error('Failed to create schedule override', error);
            alert(error.response?.data?.message || 'Failed to save blocked date.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (overrideId) => {
        if (!window.confirm('Remove this blocked period?')) return;
        try {
            await deleteScheduleOverride(overrideId);
            setRows((prev) => prev.filter((row) => row.id !== overrideId));
        } catch (error) {
            console.error('Failed to delete schedule override', error);
            alert(error.response?.data?.message || 'Failed to remove blocked date.');
        }
    };

    return ReactDOM.createPortal(
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                zIndex: 2050,
            }}
            onClick={onClose}
        >
            <div
                className={`shadow-lg overflow-hidden d-flex flex-column ${isDark ? 'text-light' : 'text-dark'}`}
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: 'min(980px, 92vw)',
                    maxHeight: '90vh',
                    borderRadius: '20px',
                    background: isDark
                        ? 'linear-gradient(145deg, #111827, #1f2937)'
                        : 'linear-gradient(145deg, #ffffff, #f8fafc)',
                    border: isDark
                        ? '1px solid rgba(255,255,255,0.05)'
                        : '1px solid rgba(0,0,0,0.05)',
                }}
            >
                <div
                    className="px-4 py-3 d-flex justify-content-between align-items-center"
                    style={{
                        borderBottom: isDark
                            ? '1px solid rgba(255,255,255,0.05)'
                            : '1px solid rgba(0,0,0,0.06)',
                    }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-danger bg-opacity-10 p-2 rounded-2 text-danger">
                            <Ban size={20} />
                        </div>
                        <div>
                            <h5 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>Blocked Dates</h5>
                            <span className={`small ${isDark ? 'text-secondary' : 'text-muted'}`}>
                                Pause an entire day or a specific time range for bookings.
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`btn-close shadow-none opacity-50 ${isDark ? 'btn-close-white' : ''}`}
                        style={{ fontSize: '12px' }}
                    />
                </div>

                <div className="d-flex flex-column flex-lg-row" style={{ minHeight: 0, overflow: 'hidden' }}>
                    <div
                        className="p-4"
                        style={{
                            flex: '0 0 360px',
                            borderRight: isDark
                                ? '1px solid rgba(255,255,255,0.05)'
                                : '1px solid rgba(0,0,0,0.06)',
                        }}
                    >
                        <h6 className={`fw-bold mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>Create Block</h6>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                min={todayLocal()}
                                onChange={handleChange}
                                className={`form-control shadow-none ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Block Type</label>
                            <select
                                name="scope"
                                value={formData.scope}
                                onChange={handleChange}
                                className={`form-select shadow-none ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                            >
                                <option value="full_day">Full Day</option>
                                <option value="range">Time Range</option>
                            </select>
                        </div>

                        {isRange && (
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-secondary">Start</label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        className={`form-control shadow-none ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-secondary">End</label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        className={`form-control shadow-none ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Reason</label>
                            <textarea
                                name="reason"
                                rows={3}
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Optional note for why this date is blocked"
                                className={`form-control shadow-none ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                            />
                        </div>

                        <div style={{ minHeight: '24px' }} className="mb-3">
                            {validationMessage && (
                                <div className="small text-danger fw-medium d-flex align-items-center gap-1">
                                    <AlertCircle size={14} />
                                    {validationMessage}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={saving || Boolean(validationMessage)}
                            className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                        >
                            {saving ? <Loader2 size={16} className="spin" /> : <Ban size={16} />}
                            {saving ? 'Saving...' : 'Block Schedule'}
                        </button>
                    </div>

                    <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', minHeight: 0 }}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>Active Blocks</h6>
                            <span className={`small ${isDark ? 'text-secondary' : 'text-muted'}`}>{rows.length} active</span>
                        </div>

                        {loading ? (
                            <div className="d-flex align-items-center gap-2 text-secondary">
                                <Loader2 size={16} className="spin" />
                                Loading blocked dates...
                            </div>
                        ) : rows.length === 0 ? (
                            <div
                                className="p-4 rounded-4"
                                style={{
                                    border: isDark ? '1px dashed rgba(255,255,255,0.12)' : '1px dashed rgba(0,0,0,0.12)',
                                }}
                            >
                                <p className={`mb-0 ${isDark ? 'text-secondary' : 'text-muted'}`}>
                                    No blocked dates are active right now.
                                </p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {rows.map((row) => {
                                    const detail = row.scope === 'full_day'
                                        ? 'Entire day blocked'
                                        : `${formatUtcTime(row.start_time_utc)} - ${formatUtcTime(row.end_time_utc)} IST`;
                                    return (
                                        <div
                                            key={row.id}
                                            className="p-3 rounded-4 d-flex align-items-start justify-content-between gap-3"
                                            style={{
                                                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                                                border: isDark
                                                    ? '1px solid rgba(255,255,255,0.06)'
                                                    : '1px solid rgba(15,23,42,0.08)',
                                            }}
                                        >
                                            <div className="d-flex gap-3">
                                                <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
                                                        color: '#ef4444',
                                                    }}
                                                >
                                                    {row.scope === 'full_day' ? <Calendar size={18} /> : <Clock3 size={18} />}
                                                </div>
                                                <div>
                                                    <div className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>
                                                        {formatOverrideDate(row.override_date)}
                                                    </div>
                                                    <div className={`small ${isDark ? 'text-secondary' : 'text-muted'}`}>
                                                        {detail}
                                                    </div>
                                                    {row.reason ? (
                                                        <div className={`small mt-2 ${isDark ? 'text-light' : 'text-dark'}`}>
                                                            {row.reason}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(row.id)}
                                                className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                                                title="Remove block"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>,
        document.body,
    );
};

export default ScheduleOverrideModal;
