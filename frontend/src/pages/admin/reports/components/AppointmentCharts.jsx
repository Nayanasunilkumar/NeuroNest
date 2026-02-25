import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const AppointmentCharts = ({ data }) => {
    // Format dates for display
    const chartData = data?.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })) || [];

    const totalVolume = chartData.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const avgDaily = chartData.length > 0 ? (totalVolume / chartData.length).toFixed(1) : 0;
    const peakDay = chartData.length > 0 ? Math.max(...chartData.map(item => Number(item.count || 0))) : 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-chart-tooltip">
                    <p className="tooltip-date">{label}</p>
                    <p className="tooltip-value">
                        <span className="tooltip-dot bg-blue-500"></span>
                        {payload[0].value} Appointments
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="reports-chart-container flex flex-col h-full justify-between">
            {chartData.length > 0 ? (
                <>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94A3B8', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94A3B8', fontSize: 12 }} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorCount)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563EB' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                
                {/* Dynamic Summary Strip to fill empty space */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex flex-col">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">Period Volume</div>
                        <div className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">{totalVolume}</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">Daily Average</div>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none">{avgDaily}</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">Peak Traffic</div>
                        <div className="text-2xl font-black text-emerald-500 tracking-tight leading-none">{peakDay}</div>
                    </div>
                </div>
            </>
            ) : (
                <div className="empty-chart-state">
                    <Activity size={32} className="opacity-20 mb-3 text-blue-500" />
                    <p>No appointment data available for this period.</p>
                </div>
            )}
        </div>
    );
};

export default AppointmentCharts;
