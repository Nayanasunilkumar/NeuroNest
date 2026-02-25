import React, { useState, useEffect } from 'react';
import { Plus, Search, Megaphone, CheckCircle, Clock, Archive } from 'lucide-react';
import { adminAnnouncementApi } from '../../api/announcementApi';
import AnnouncementTable from '../../components/announcements/AnnouncementTable';
import CreateAnnouncementModal from '../../components/announcements/CreateAnnouncementModal';
import "../../styles/admin-announcements.css";

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const data = await adminAnnouncementApi.getAll();
            setAnnouncements(data);
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreateOrUpdate = async (formData) => {
        try {
            if (selectedAnnouncement) {
                await adminAnnouncementApi.update(selectedAnnouncement.id, formData);
            } else {
                await adminAnnouncementApi.create(formData);
            }
            fetchAnnouncements();
            setIsModalOpen(false);
            setSelectedAnnouncement(null);
        } catch (error) {
            console.error("Error saving announcement:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this announcement?")) {
            try {
                await adminAnnouncementApi.delete(id);
                fetchAnnouncements();
            } catch (error) {
                console.error("Error deleting announcement:", error);
            }
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await adminAnnouncementApi.updateStatus(id, status);
            fetchAnnouncements();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const stats = {
        total: announcements.length,
        active: announcements.filter(a => a.status === 'Published').length,
        scheduled: announcements.filter(a => a.status === 'Scheduled').length,
        archived: announcements.filter(a => a.status === 'Archived').length
    };

    const filteredAnnouncements = announcements.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-announcements-root">
            <div className="announcements-header">
                <div className="header-titles">
                    <h1>Organization Announcements</h1>
                    <p>Broadcast critical updates, policy changes, and system alerts to NeuroNest users.</p>
                </div>
                <button className="btn-primary" onClick={() => { setSelectedAnnouncement(null); setIsModalOpen(true); }}>
                    <Plus size={18} />
                    New Announcement
                </button>
            </div>

            <div className="announcements-stats">
                <div className="stat-card">
                    <div className="flex justify-between items-center">
                        <span className="stat-label">Total Posts</span>
                        <Megaphone size={18} className="text-slate-400" />
                    </div>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-card">
                    <div className="flex justify-between items-center">
                        <span className="stat-label">Published</span>
                        <CheckCircle size={18} className="text-green-500" />
                    </div>
                    <span className="stat-value">{stats.active}</span>
                </div>
                <div className="stat-card">
                    <div className="flex justify-between items-center">
                        <span className="stat-label">Scheduled</span>
                        <Clock size={18} className="text-blue-500" />
                    </div>
                    <span className="stat-value">{stats.scheduled}</span>
                </div>
                <div className="stat-card">
                    <div className="flex justify-between items-center">
                        <span className="stat-label">Archived</span>
                        <Archive size={18} className="text-slate-500" />
                    </div>
                    <span className="stat-value">{stats.archived}</span>
                </div>
            </div>

            <div className="announcements-table-container">
                <div className="table-controls">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search by title or content..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {/* More filters can go here */}
                    </div>
                </div>
                {loading ? (
                    <div className="py-20 text-center text-slate-500 font-bold animate-pulse">
                        LOADING COMMUNICATIONS NEXUS...
                    </div>
                ) : (
                    <AnnouncementTable 
                        announcements={filteredAnnouncements} 
                        onEdit={(item) => { setSelectedAnnouncement(item); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </div>

            {isModalOpen && (
                <CreateAnnouncementModal 
                    announcement={selectedAnnouncement}
                    onClose={() => { setIsModalOpen(false); setSelectedAnnouncement(null); }}
                    onSave={handleCreateOrUpdate}
                />
            )}
        </div>
    );
};

export default AnnouncementsPage;
