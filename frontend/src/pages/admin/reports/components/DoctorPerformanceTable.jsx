import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, UserCheck } from 'lucide-react';

const DoctorPerformanceTable = ({ doctors }) => {
    
    // Quick helper to color the completion rate
    const getRateColor = (rate) => {
        if (rate >= 80) return "text-emerald-500 bg-emerald-50";
        if (rate >= 50) return "text-amber-500 bg-amber-50";
        return "text-rose-500 bg-rose-50";
    };

    return (
        <div className="reports-table-container">
            {doctors && doctors.length > 0 ? (
                <table className="premium-admin-table">
                    <thead>
                        <tr>
                            <th>Doctor Profile</th>
                            <th className="text-right">Total Appts</th>
                            <th className="text-right">Completed</th>
                            <th className="text-right">Cancelled</th>
                            <th className="text-right">Completion Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map(doc => (
                            <tr key={doc.doctor_id}>
                                <td className="font-semibold text-gray-900">{doc.doctor_name}</td>
                                <td className="text-right font-medium">{doc.total_appointments}</td>
                                <td className="text-right text-emerald-600 font-medium">{doc.completed}</td>
                                <td className="text-right text-rose-500 font-medium">{doc.cancelled}</td>
                                <td className="text-right">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${getRateColor(doc.completion_rate_pct)}`}>
                                        {doc.completion_rate_pct >= 80 ? <ArrowUpRight size={14} /> : 
                                         doc.completion_rate_pct >= 50 ? <Minus size={14} /> : 
                                         <ArrowDownRight size={14} />}
                                        {doc.completion_rate_pct}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="empty-table-state">
                    <UserCheck size={32} className="opacity-20 mb-3 text-emerald-500" />
                    <p>No doctor performance data generated yet.</p>
                </div>
            )}
        </div>
    );
};

export default DoctorPerformanceTable;
