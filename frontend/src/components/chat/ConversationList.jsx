import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Avatar from '../shared/Avatar';
import { formatTimeIST, parseServerDate } from '../../utils/time';

const ConversationList = ({ conversations, selectedId, onSelect, currentUserId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = conversations.filter(c => 
        c.other_user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping Logic
    const recentConvs = [];
    const earlierConvs = [];
    const now = new Date();

    filtered.forEach(conv => {
        const lastMsgDate = conv.last_message ? parseServerDate(conv.last_message.created_at) : new Date(0);
        const diffHours = (now - lastMsgDate) / (1000 * 60 * 60);
        // Recent if unread or within 24 hours
        if (conv.unread_count > 0 || diffHours < 24) {
            recentConvs.push(conv);
        } else {
            earlierConvs.push(conv);
        }
    });

    const renderConversation = (conv) => {
        const isActive = selectedId === conv.id;
        const otherUser = conv.other_user;
        const lastMessage = conv.last_message;
        const isUnread = conv.unread_count > 0;
        
        return (
            <div 
                key={conv.id} 
                className={`card border-0 mb-2 transition-all position-relative ${isActive ? 'bg-light bg-opacity-75 shadow-sm' : 'bg-transparent hover-bg-light'}`}
                style={{ cursor: 'pointer', borderRadius: '16px' }}
                onClick={() => onSelect(conv)}
            >
                {isActive && (
                    <div className="position-absolute start-0 top-0 bottom-0 bg-primary rounded-end" style={{ width: '4px', margin: '16px 0' }}></div>
                )}
                
                <div className="card-body p-3 d-flex align-items-center gap-3">
                    <div className="position-relative flex-shrink-0">
                        <Avatar 
                            src={otherUser?.profile_image} 
                            alt={otherUser?.name} 
                            style={{ width: '48px', height: '48px', borderRadius: '12px' }}
                        />
                        {otherUser?.is_online && (
                            <div className="position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle" style={{ width: '14px', height: '14px', marginBottom: '-2px', marginRight: '-2px' }}></div>
                        )}
                    </div>
                    
                    <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <h3 className={`mb-0 text-truncate ${isUnread ? 'fw-black text-dark' : 'fw-bold text-secondary'}`} style={{ fontSize: '0.9rem', maxWidth: '140px' }}>
                                {otherUser?.name}
                            </h3>
                            <span className="small fw-bold text-secondary text-nowrap" style={{ fontSize: '0.65rem' }}>
                                {lastMessage ? formatTimeIST(lastMessage.created_at) : ''}
                            </span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center gap-2">
                            <p className="mb-0 text-truncate text-secondary small" style={{ fontSize: '0.8rem', fontWeight: isUnread ? 700 : 500, color: isUnread ? 'var(--bs-dark)' : 'inherit' }}>
                                {lastMessage ? (
                                    <span>
                                        {String(lastMessage.sender_id) === String(currentUserId) ? 'You: ' : ''}{lastMessage.content}
                                    </span>
                                ) : (
                                    <span className="fst-italic opacity-75">Start a conversation</span>
                                )}
                            </p>
                            
                            {isUnread && (
                                <div className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm" style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>
                                    {conv.unread_count}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="d-flex flex-column bg-white border-end border-light h-100" style={{ width: '340px', flexShrink: 0 }}>
            {/* Header */}
            <div className="p-4">
                <h2 className="fw-bolder text-dark mb-4" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Inbox</h2>
                <div className="position-relative">
                    <Search size={16} className="position-absolute text-secondary" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search conversations..." 
                        className="form-control bg-light border-light rounded-4 shadow-none fw-medium text-dark px-3 py-2"
                        style={{ paddingLeft: '44px', fontSize: '0.875rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-grow-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
                {filtered.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-secondary small fw-medium">No conversations found.</p>
                    </div>
                ) : (
                    <>
                        {recentConvs.length > 0 && (
                            <div className="mb-4">
                                <div className="text-uppercase text-secondary fw-bolder mb-2 ms-2" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Recent</div>
                                {recentConvs.map(renderConversation)}
                            </div>
                        )}
                        
                        {earlierConvs.length > 0 && (
                            <div>
                                <div className="text-uppercase text-secondary fw-bolder mb-2 ms-2" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Earlier</div>
                                {earlierConvs.map(renderConversation)}
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: rgba(248, 249, 250, 0.8) !important; }
                .min-w-0 { min-width: 0; }
                .fw-black { font-weight: 900; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default ConversationList;
