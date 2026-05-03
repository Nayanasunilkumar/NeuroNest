import React, { useEffect, useState } from 'react';
import { Bell, ChevronRight, Pin, ExternalLink, Calendar, User, Info, Megaphone } from 'lucide-react';
import { userAnnouncementApi } from '../../services/api/announcementApi';
import './BulletinBoard.css';

const BulletinBoard = ({ limit = 3 }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await userAnnouncementApi.getMine();
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch bulletins", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await userAnnouncementApi.markRead(id);
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            await userAnnouncementApi.acknowledge(id);
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_read: true, acknowledged: true } : a));
            setSelectedAnnouncement(null); // Close modal on success
        } catch (err) {
            console.error("Failed to acknowledge", err);
            alert("Acknowledgement failed. Please try again.");
        }
    };

    const sorted = [...announcements].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.publish_at || b.created_at) - new Date(a.publish_at || a.created_at);
    });

    const displayList = sorted.slice(0, limit);

    if (loading) {
        return (
            <div className="bulletin-board-loading">
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span className="ms-2">Fetching updates...</span>
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="bulletin-board-empty">
                <div className="empty-icon"><Info size={24} /></div>
                <p>No new announcements from administration.</p>
            </div>
        );
    }

    return (
        <div className="bulletin-board-root">
            <div className="bulletin-list">
                {displayList.map((item) => (
                    <div 
                        key={item.id} 
                        className={`bulletin-item ${item.is_pinned ? 'is-pinned' : ''} ${!item.is_read ? 'is-unread' : ''}`}
                        onClick={() => {
                            setSelectedAnnouncement(item);
                            if (!item.is_read) handleMarkRead(item.id);
                        }}
                    >
                        <div className="bulletin-item-header">
                            <div className="bulletin-icon-wrapper">
                                {item.is_pinned ? <Pin size={14} className="pinned-icon" /> : <Megaphone size={14} />}
                            </div>
                            <div className="bulletin-content-brief">
                                <h4 className="bulletin-title text-truncate">{item.title}</h4>
                                <div className="bulletin-meta">
                                    <span className="bulletin-date">
                                        {new Date(item.publish_at || item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    {item.priority === 'Critical' && <span className="priority-tag critical">URGENT</span>}
                                    {item.priority === 'High' && <span className="priority-tag high">HIGH</span>}
                                </div>
                            </div>
                            <ChevronRight size={16} className="bulletin-arrow" />
                        </div>
                    </div>
                ))}
            </div>

            {selectedAnnouncement && (
                <div className="bulletin-modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
                    <div className="bulletin-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="bulletin-modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <div className={`priority-indicator ${selectedAnnouncement.priority?.toLowerCase()}`}></div>
                                <span className="text-uppercase fw-bold opacity-50" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                    {selectedAnnouncement.category || 'General'} Announcement
                                </span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setSelectedAnnouncement(null)}>&times;</button>
                        </div>
                        
                        <div className="bulletin-modal-body">
                            <h2 className="bulletin-modal-title">{selectedAnnouncement.title}</h2>
                            <div className="bulletin-modal-meta">
                                <div className="meta-item"><Calendar size={14} /> {new Date(selectedAnnouncement.publish_at || selectedAnnouncement.created_at).toLocaleString()}</div>
                                <div className="meta-item"><User size={14} /> {selectedAnnouncement.author_name || 'Admin'}</div>
                            </div>
                            <div className="bulletin-modal-content">
                                {selectedAnnouncement.content}
                            </div>
                        </div>

                        <div className="bulletin-modal-footer">
                            {selectedAnnouncement.require_acknowledgement && !selectedAnnouncement.acknowledged ? (
                                <button 
                                    className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
                                    onClick={() => handleAcknowledge(selectedAnnouncement.id)}
                                >
                                    Acknowledge Receipt
                                </button>
                            ) : (
                                <button 
                                    className="btn btn-light w-100 rounded-pill py-2 fw-bold"
                                    onClick={() => setSelectedAnnouncement(null)}
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulletinBoard;
