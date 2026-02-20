import React from 'react';
import { Calendar, Clock, Eye, MoreVertical } from 'lucide-react';

const AppointmentTable = ({ appointments, onSelect }) => {
    
    const getStatusConfig = (status) => {
        const s = status?.toLowerCase() || '';
        const config = {
            class: '',
            label: status?.replace(/_/g, ' ') || 'UNKNOWN'
        };

        if (s === 'approved') {
            config.class = 'status-approved';
            config.label = 'Approved';
        } else if (s === 'pending') {
            config.class = 'status-pending';
            config.label = 'Pending';
        } else if (s === 'completed') {
            config.class = 'status-completed';
            config.label = 'Completed';
        } else if (s.includes('cancelled')) {
            config.class = 'status-cancelled';
            config.label = s.includes('patient') ? 'Cancelled: Patient' : 'Cancelled: Doctor';
        } else if (s === 'no_show' || s === 'no-show') {
            config.class = 'status-no-show';
            config.label = 'No-Show';
        } else if (s === 'rejected') {
            config.class = 'status-rejected';
            config.label = 'Rejected';
        }

        return config;
    };

    return (
        <div className="appt-table-container">
            <table className="appt-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient Identity</th>
                        <th>Managing Doctor</th>
                        <th>Clinical Window</th>
                        <th>Oversight Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((appt) => (
                        <tr key={appt.id}>
                            <td className="appt-id-cell">#{appt.id}</td>
                            <td>
                                <div className="patient-cell">
                                    <span className="patient-name">{appt.patient_name}</span>
                                    <span className="patient-meta">{appt.patient_email}</span>
                                </div>
                            </td>
                            <td>
                                <div className="doctor-cell">
                                    <span>{appt.doctor_name?.startsWith('Dr.') ? appt.doctor_name : `Dr. ${appt.doctor_name}`}</span>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {appt.doctor_specialization}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="date-time-cell">
                                    <span className="dt-date">
                                        <Calendar size={12} strokeWidth={3} color="var(--admin-accent)" />
                                        {appt.appointment_date}
                                    </span>
                                    <span className="dt-time">
                                        <Clock size={10} strokeWidth={3} />
                                        {appt.appointment_time}
                                    </span>
                                </div>
                            </td>
                            <td>
                                {(() => {
                                    const config = getStatusConfig(appt.status);
                                    return (
                                        <span className={`appt-status-badge ${config.class}`}>
                                            {config.label}
                                        </span>
                                    );
                                })()}
                            </td>
                            <td>
                                <button className="pg-btn" onClick={() => onSelect(appt)} title="Operational Depth-View">
                                    <Eye size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--admin-text-muted)', fontWeight: 800 }}>
                                NO CLINICAL RECORDS MATCHING ACTIVE FILTERS
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AppointmentTable;
