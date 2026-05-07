import React from 'react';
import { Search, Filter } from 'lucide-react';

const RecordFilters = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, sourceFilter, setSourceFilter }) => {
    return (
        <div className="records-filters" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <div className="filter-group filter-search-group" style={{ flex: 2, background: 'white', borderRadius: '16px', padding: '12px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Search size={18} className="text-blue-500" />
                <input 
                    type="text" 
                    placeholder="Search by title or doctor..." 
                    style={{ border: 'none', outline: 'none', width: '100%', fontWeight: '600', color: '#1e293b' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-group filter-category-group" style={{ background: 'white', borderRadius: '16px', padding: '12px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Filter size={16} className="text-slate-500" />
                <select 
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontWeight: '700', color: '#475569', cursor: 'pointer', appearance: 'none' }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="prescription">Prescriptions</option>
                    <option value="lab">Lab Reports</option>
                    <option value="scan">Radiology Scans</option>
                    <option value="discharge">Discharge Summaries</option>
                    <option value="other">Other Documents</option>
                </select>
            </div>

            <div className="filter-group filter-source-group" style={{ background: 'white', borderRadius: '16px', padding: '12px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Filter size={16} className="text-slate-500" />
                <select 
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontWeight: '700', color: '#475569', cursor: 'pointer', appearance: 'none' }}
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                >
                    <option value="All">All Sources</option>
                    <option value="patient">Personal Uploads</option>
                    <option value="doctor">Clinical Verified</option>
                </select>
            </div>
        </div>
    );
};

export default RecordFilters;
