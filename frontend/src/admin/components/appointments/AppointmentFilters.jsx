import React from 'react';
import { Search, MapPin, Building2, Stethoscope, Clock, Trash2 } from 'lucide-react';

const AppointmentFilters = ({ 
    sectors, selectedSector, setSelectedSector,
    departments, selectedDept, setSelectedDept,
    doctors, selectedDoctor, setSelectedDoctor,
    status, setStatus,
    search, setSearch
}) => {
    return (
        <div className="appt-filters-container-premium">
            <div className="filters-header-nexus">
                <div className="filters-title">
                    <h3>Operational Filters</h3>
                    <p>Narrow down appointments by sector, specialty, and status.</p>
                </div>
                <button 
                    className="filter-clear-btn-premium"
                    onClick={() => {
                        setSelectedSector('');
                        setSelectedDept('');
                        setSelectedDoctor('');
                        setSearch('');
                        setStatus('all');
                        localStorage.removeItem('admin_appt_sector');
                        localStorage.removeItem('admin_appt_dept');
                        localStorage.removeItem('admin_appt_doctor');
                        localStorage.removeItem('admin_appt_status');
                        localStorage.removeItem('admin_appt_search');
                    }}
                >
                    <Trash2 size={14} /> Clear All
                </button>
            </div>

            <div className="appt-hierarchy-grid">
                {/* 1. Sector Selection */}
                <div className="filter-card mandatory">
                    <div className="filter-icon-wrapper"><MapPin size={16} /></div>
                    <div className="filter-content">
                        <label>Sector Axis</label>
                        <select 
                            className="filter-select-premium"
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                        >
                            <option value="">Select Branch...</option>
                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. Department Selection */}
                <div className="filter-card mandatory">
                    <div className="filter-icon-wrapper"><Building2 size={16} /></div>
                    <div className="filter-content">
                        <label>Specialty Axis</label>
                        <select 
                            className="filter-select-premium"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            disabled={!selectedSector}
                        >
                            <option value="">Select Dept...</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* 3. Doctor Selection */}
                <div className="filter-card mandatory">
                    <div className="filter-icon-wrapper"><Stethoscope size={16} /></div>
                    <div className="filter-content">
                        <label>Specialist Axis</label>
                        <select 
                            className="filter-select-premium"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            disabled={!selectedDept}
                        >
                            <option value="">All Specialists</option>
                            {doctors.map(dr => {
                                const displayName = dr.full_name.startsWith('Dr.') ? dr.full_name : `Dr. ${dr.full_name}`;
                                return <option key={dr.id} value={dr.id}>{displayName}</option>;
                            })}
                        </select>
                    </div>
                </div>

                {/* 4. Event Status */}
                <div className="filter-card">
                    <div className="filter-icon-wrapper"><Clock size={16} /></div>
                    <div className="filter-content">
                        <label>Event Status</label>
                        <select 
                            className="filter-select-premium"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="all">All Outcomes</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No-show">No-Show</option>
                        </select>
                    </div>
                </div>

                {/* Search Node */}
                <div className="search-card">
                    <div className="search-input-premium">
                        <Search size={18} className="search-icon-nexus" />
                        <input 
                            type="text" 
                            placeholder="Search Patient ID, Name, Specialist..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentFilters;
