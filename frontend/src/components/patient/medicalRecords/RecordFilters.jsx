import React from 'react';
import { Search, Filter } from 'lucide-react';

const RecordFilters = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }) => {
    return (
        <div className="records-filters dark:bg-gray-800 dark:border-gray-700">
            <div className="filter-group flex-grow dark:bg-gray-900 dark:border-gray-700">
                <Search size={18} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by title or doctor..." 
                    className="bg-transparent border-none outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    style={{fontSize: '0.95rem'}}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-group dark:bg-gray-900 dark:border-gray-700">
                <Filter size={16} className="text-gray-600 dark:text-gray-400" />
                <select 
                    className="bg-transparent border-none outline-none font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="All" className="dark:bg-gray-800">All Categories</option>
                    <option value="Prescription" className="dark:bg-gray-800">Prescription</option>
                    <option value="Lab Report" className="dark:bg-gray-800">Lab Report</option>
                    <option value="Scan" className="dark:bg-gray-800">Scan (MRI/X-Ray)</option>
                    <option value="Discharge Summary" className="dark:bg-gray-800">Discharge Summary</option>
                    <option value="Other" className="dark:bg-gray-800">Other</option>
                </select>
            </div>
        </div>
    );
};

export default RecordFilters;
