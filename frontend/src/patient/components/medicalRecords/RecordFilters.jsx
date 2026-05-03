import React from 'react';
import { Search, Filter } from 'lucide-react';

const RecordFilters = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, sourceFilter, setSourceFilter }) => {
    return (
        <div className="records-filters dark:bg-gray-800 dark:border-gray-700">
            <div className="filter-group filter-search-group dark:bg-gray-900 dark:border-gray-700">
                <Search size={18} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by title or doctor..." 
                    className="filter-input bg-transparent border-none outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-group filter-category-group dark:bg-gray-900 dark:border-gray-700">
                <Filter size={16} className="text-gray-600 dark:text-gray-400" />
                <select 
                    className="filter-select bg-transparent border-none outline-none font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="prescription">Prescription</option>
                    <option value="lab">Lab Report</option>
                    <option value="scan">Scan (MRI/X-Ray)</option>
                    <option value="discharge">Discharge Summary</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="filter-group filter-source-group dark:bg-gray-900 dark:border-gray-700" style={{ minWidth: '160px' }}>
                <Filter size={16} className="text-gray-600 dark:text-gray-400" />
                <select 
                    className="filter-select bg-transparent border-none outline-none font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                >
                    <option value="All">All Sources</option>
                    <option value="patient">Added by You</option>
                    <option value="doctor">Added by Doctor</option>
                </select>
            </div>
        </div>
    );
};

export default RecordFilters;
