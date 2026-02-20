import React from 'react';
import { Search, Filter, Star, Flag, Calendar } from 'lucide-react';

const ReviewFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="appt-filters-container">
      <div className="appt-hierarchy-bar">
        <div className="filter-node search-node">
          <label><Search size={12} /> Search Matrix</label>
          <div className="search-nexus">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Filter by Patient, Doctor, or Content..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-node">
          <label><Star size={12} /> Rating Tier</label>
          <select 
            className="filter-select-nexus"
            value={filters.rating || ''}
            onChange={(e) => onFilterChange({ rating: e.target.value })}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars - Exceptional</option>
            <option value="4">4 Stars - Satisfactory</option>
            <option value="3">3 Stars - Neutral</option>
            <option value="2">2 Stars - Poor</option>
            <option value="1">1 Star - Critical/Fail</option>
          </select>
        </div>

        <div className="filter-node">
          <label><Flag size={12} /> Compliance Status</label>
          <select 
            className="filter-select-nexus"
            value={filters.is_flagged || ''}
            onChange={(e) => onFilterChange({ is_flagged: e.target.value })}
          >
            <option value="">All Reviews</option>
            <option value="true">Flagged / Escalated</option>
            <option value="false">Cleared / Normal</option>
          </select>
        </div>

        <div className="filter-node">
          <label><Calendar size={12} /> Temporal Axis</label>
          <select className="filter-select-nexus">
            <option value="today">Today's Feedback</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Monthly Audit</option>
            <option value="all" selected>Full History</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;
