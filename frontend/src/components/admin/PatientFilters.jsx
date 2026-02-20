import React from 'react';
import { Search } from 'lucide-react';

const PatientFilters = ({ search, setSearch, status, setStatus }) => {
  return (
    <div className="filter-bar">
      <div className="search-input-wrap">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="SEARCH BY NAME, EMAIL OR PATIENT ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <span style={{fontSize: '0.75rem', fontWeight: 800, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
            Account Status Filter:
        </span>
        <select 
            className="filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
        >
            <option value="">ALL PATIENTS</option>
            <option value="active">ACTIVE ACCOUNTS</option>
            <option value="suspended">SUSPENDED</option>
            <option value="deleted">DEACTIVATED</option>
        </select>
      </div>
    </div>
  );
};

export default PatientFilters;
