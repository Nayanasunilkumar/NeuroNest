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
        <div className="appt-filters-container">
            <div className="appt-hierarchy-bar">
                {/* 1. Sector Selection */}
                <div className="filter-node mandatory">
                    <label><MapPin size={10} /> Sector Axis</label>
                    <select 
                        className="filter-select-nexus"
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                    >
                        <option value="">Select Branch...</option>
                        {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* 2. Department Selection */}
                <div className="filter-node mandatory">
                    <label><Building2 size={10} /> Specialty Axis</label>
                    <select 
                        className="filter-select-nexus"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        disabled={!selectedSector}
                    >
                        <option value="">Select Dept...</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* 3. Doctor Selection */}
                <div className="filter-node mandatory">
                    <label><Stethoscope size={10} /> Specialist Axis</label>
                    <select 
                        className="filter-select-nexus"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        disabled={!selectedDept}
                    >
                        <option value="">Select Doctor...</option>
                        {doctors.map(dr => {
                            const displayName = dr.full_name.startsWith('Dr.') ? dr.full_name : `Dr. ${dr.full_name}`;
                            return <option key={dr.id} value={dr.id}>{displayName}</option>;
                        })}
                    </select>
                </div>

                {/* 4. Secondary Filters: Status */}
                <div className="filter-node">
                    <label><Clock size={10} /> Event Status</label>
                    <select 
                        className="filter-select-nexus"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="all">Institutional: All</option>
                        <option value="Pending">Queue: Pending</option>
                        <option value="Approved">Queue: Approved</option>
                        <option value="Completed">Outcome: Completed</option>
                        <option value="Cancelled">Outcome: Cancelled</option>
                        <option value="No-show">Outcome: No-Show</option>
                    </select>
                </div>

                <div className="search-node">
                    <div className="search-label-nexus">
                        <button 
                            className="filter-clear-btn-nexus"
                            onClick={() => {
                                setSelectedSector('');
                                setSelectedDept('');
                                setSelectedDoctor('');
                                setSearch('');
                                setStatus('all');
                            }}
                        >
                            <Trash2 size={12} /> Clear All
                        </button>
                    </div>
                    <div className="search-nexus">
                        <Search size={14} />
                        <input 
                            type="text" 
                            placeholder="ID / Patient Search..."
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
