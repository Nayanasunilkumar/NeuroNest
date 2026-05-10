import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
    X, Download, Calendar, User, FileText, Tag,
    ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCw,
    RefreshCw, AlertCircle, Loader2, Info, ExternalLink
} from 'lucide-react';
import medicalRecordService from '../../services/medicalRecordService';
import { API_BASE_URL } from '../../../config/env';

const ViewMedicalRecordModal = ({ isOpen, onClose, record, patientId = null }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const resetView = useCallback(() => {
        setZoom(1);
        setRotation(0);
    }, []);

    useEffect(() => {
        if (!isOpen || !record) return;

        let cancelled = false;
        setLoading(true);
        setError(null);
        setFileUrl(null);
        resetView();

        const load = async () => {
            try {
                // Use the new /view-url endpoint — returns Cloudinary URL as JSON, no CORS issue
                const data = await medicalRecordService.getRecordViewUrl(record.id, patientId);
                if (cancelled) return;

                const urlPart = data.file_url?.split('?')[0] || '';
                const ext = (data.file_type || urlPart.split('.').pop() || '').toLowerCase();
                setFileUrl(data.file_url);
                setFileType(ext);
                console.log('[Viewer] Got direct URL. ext:', ext, 'url:', data.file_url);
            } catch (err) {
                if (cancelled) return;
                console.error('[Viewer] Failed to get view URL:', err);
                // Final fallback: use file_path from the record object if API is down
                    const urlPart = record.file_path.split('?')[0];
                    const ext = (record.file_type || urlPart.split('.').pop() || '').toLowerCase();
                    setFileUrl(record.file_path);
                    setFileType(ext);
                } else {
                    setError('Could not load this document. The file may have been removed.');
                    setLoading(false);
                }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [isOpen, record, patientId, refreshKey, resetView]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (e.key === 'Escape') { if (isFullscreen) setIsFullscreen(false); else onClose(); }
            if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 4));
            if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5));
            if (e.key === '0') resetView();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, isFullscreen, onClose, resetView]);

    if (!isOpen || !record) return null;

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileType);
    const isPDF = fileType === 'pdf';
    const isDICOM = fileType === 'dcm';
    const isWord = ['doc', 'docx'].includes(fileType);

    // Cloudinary URLs are public CDN links — load them directly in an iframe.
    // Google Docs Viewer fails because it cannot proxy Cloudinary CDN URLs.

    // For PDFs: use backend proxy with JWT so we bypass Cloudinary's X-Frame-Options.
    const jwtToken = localStorage.getItem('neuronest_token') || '';
    const previewBase = patientId
        ? `${API_BASE_URL}/api/patient/doctor/patients/${patientId}/medical-records/${record.id}/preview`
        : `${API_BASE_URL}/api/patient/medical-records/${record.id}/preview`;
    const proxyPreviewUrl = `${previewBase}?token=${encodeURIComponent(jwtToken)}`;

    const handleDownload = () => {
        medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId);
    };

    const handleContentLoad = () => setLoading(false);
    const handleContentError = () => {
        setError('Your browser could not render this file. Please download it instead.');
        setLoading(false);
    };

    return ReactDOM.createPortal(
        <div
            style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(2, 6, 23, 0.92)',
                zIndex: 100000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(12px)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: isFullscreen ? '100%' : '92%',
                    maxWidth: isFullscreen ? '100%' : '1300px',
                    height: isFullscreen ? '100%' : '88vh',
                    backgroundColor: '#0f172a',
                    borderRadius: isFullscreen ? '0' : '20px',
                    overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 22px',
                    background: '#1e293b',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexShrink: 0,
                }}>
                    {/* Left: metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', flexShrink: 0 }}>
                            <FileText size={20} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {record.title}
                            </h2>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={11} />
                                    {new Date(record.record_date || record.created_at).toLocaleDateString()}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Tag size={11} /> {record.category}
                                </span>
                                {record.doctor_name && (
                                    <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <User size={11} /> {record.doctor_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '16px' }}>
                        {/* Zoom strip — only meaningful for images */}
                        {isImage && (
                            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', marginRight: '6px' }}>
                                <IconBtn onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} title="Zoom Out"><ZoomOut size={17}/></IconBtn>
                                <button
                                    onClick={resetView}
                                    style={{ ...iconBtnBase, fontSize: '11px', fontWeight: 700, width: 'auto', padding: '0 10px', color: '#94a3b8' }}
                                >
                                    {Math.round(zoom * 100)}%
                                </button>
                                <IconBtn onClick={() => setZoom(z => Math.min(z + 0.25, 4))} title="Zoom In"><ZoomIn size={17}/></IconBtn>
                            </div>
                        )}

                        <IconBtn onClick={() => setRefreshKey(k => k + 1)} title="Refresh Preview"><RefreshCw size={17}/></IconBtn>
                        <IconBtn onClick={() => setIsFullscreen(f => !f)} title="Toggle Fullscreen">
                            {isFullscreen ? <Minimize2 size={17}/> : <Maximize2 size={17}/>}
                        </IconBtn>

                        {/* Open in new tab — reliable fallback */}
                        {fileUrl && (
                            <IconBtn onClick={() => window.open(fileUrl, '_blank')} title="Open in new tab">
                                <ExternalLink size={17}/>
                            </IconBtn>
                        )}

                        <button onClick={handleDownload} style={{
                            padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white',
                            border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                            marginLeft: '8px'
                        }}>
                            <Download size={15}/> Download
                        </button>
                        <IconBtn onClick={onClose} style={{ color: '#64748b', marginLeft: '4px' }}><X size={22}/></IconBtn>
                    </div>
                </div>

                {/* ── Viewport ── */}
                <div style={{
                    flex: 1, position: 'relative', overflow: 'hidden',
                    backgroundColor: '#020617',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {/* Loading overlay */}
                    {loading && (
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 20,
                            backgroundColor: '#020617',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px'
                        }}>
                            <Loader2 size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                                Loading document…
                            </p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && !loading && (
                        <div style={{
                            zIndex: 30, textAlign: 'center', maxWidth: '440px', padding: '48px',
                            background: 'rgba(239,68,68,0.05)', borderRadius: '28px',
                            border: '1px solid rgba(239,68,68,0.1)'
                        }}>
                            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '10px' }}>Preview Unavailable</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>{error}</p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button onClick={() => setRefreshKey(k => k + 1)} style={outlineBtn}><RefreshCw size={16}/> Retry</button>
                                <button onClick={handleDownload} style={{ ...outlineBtn, background: '#3b82f6', border: 'none' }}><Download size={16}/> Download</button>
                            </div>
                        </div>
                    )}

                    {/* Actual content */}
                    {!error && fileUrl && (
                        <>
                            {isPDF ? (
                                // Backend proxy: fetches from Cloudinary and serves with
                                // Content-Disposition: inline — avoids X-Frame-Options block.
                                <iframe
                                    key={refreshKey}
                                    src={proxyPreviewUrl}
                                    title="PDF Preview"
                                    onLoad={handleContentLoad}
                                    onError={handleContentError}
                                    style={{
                                        width: '100%', height: '100%',
                                        border: 'none',
                                        backgroundColor: 'white',
                                        display: loading ? 'none' : 'block',
                                    }}
                                />
                            ) : isImage ? (
                                <div style={{
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    transition: 'transform 0.25s ease',
                                    maxWidth: '100%', maxHeight: '100%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <img
                                        key={refreshKey}
                                        src={fileUrl}
                                        alt="Medical Record"
                                        onLoad={handleContentLoad}
                                        onError={handleContentError}
                                        style={{
                                            maxWidth: '90vw', maxHeight: '80vh',
                                            objectFit: 'contain',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                            borderRadius: '4px',
                                            display: loading ? 'none' : 'block',
                                        }}
                                    />
                                </div>
                            ) : isDICOM ? (
                                <div style={{ textAlign: 'center', color: 'white', maxWidth: '400px', padding: '40px' }}>
                                    <Info size={56} color="#60a5fa" style={{ marginBottom: '20px' }} />
                                    <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>DICOM Medical Scan</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                                        DICOM files require specialized medical imaging software. Please download to view.
                                    </p>
                                    <button onClick={handleDownload} style={{ ...outlineBtn, background: '#3b82f6', border: 'none' }}>
                                        <Download size={16}/> Download DICOM File
                                    </button>
                                </div>
                            ) : isWord ? (
                                <div style={{ textAlign: 'center', color: 'white', maxWidth: '400px', padding: '40px' }}>
                                    <FileText size={56} color="#60a5fa" style={{ marginBottom: '20px' }} />
                                    <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Word Document</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                                        Microsoft Word documents (".{fileType}") cannot be previewed directly in the browser. Please download to view.
                                    </p>
                                    <button onClick={handleDownload} style={{ ...outlineBtn, background: '#3b82f6', border: 'none' }}>
                                        <Download size={16}/> Download Document
                                    </button>
                                </div>
                            ) : (
                                // Unknown type — show a download prompt
                                <div style={{ textAlign: 'center', color: 'white', maxWidth: '400px', padding: '40px' }}>
                                    <FileText size={56} color="#64748b" style={{ marginBottom: '20px', opacity: 0.5 }} />
                                    <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Preview Not Available</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                                        {`Files of type ".${fileType || 'unknown'}" cannot be previewed. Download to view the contents.`}
                                    </p>
                                    <button onClick={handleDownload} style={{ ...outlineBtn, background: '#3b82f6', border: 'none' }}>
                                        <Download size={16}/> Download File
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer status bar ── */}
                <div style={{
                    padding: '8px 22px', background: '#0f172a',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '11px', color: '#334155', flexShrink: 0,
                }}>
                    <span>
                        {record.file_type?.toUpperCase() || 'UNKNOWN'}
                        {record.file_size_bytes ? ` · ${(record.file_size_bytes / 1024).toFixed(1)} KB` : ''}
                    </span>
                    <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                        Encrypted Connection
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>,
        document.body
    );
};

const iconBtnBase = {
    width: '34px', height: '34px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', backgroundColor: 'transparent',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
};

const IconBtn = ({ onClick, title, children, style = {} }) => (
    <button onClick={onClick} title={title} style={{ ...iconBtnBase, ...style }}>
        {children}
    </button>
);

const outlineBtn = {
    padding: '10px 20px', backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)', color: 'white',
    borderRadius: '12px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
};

export default ViewMedicalRecordModal;
