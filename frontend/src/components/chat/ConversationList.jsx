import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Avatar from '../shared/Avatar';
import { formatTimeIST, parseServerDate } from '../../utils/time';
import '../../styles/patient-chat.css';

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
                className={`nexus-conversation-card ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                onClick={() => onSelect(conv)}
            >
                <div className="nexus-avatar-wrapper">
                    <Avatar 
                        src={otherUser?.profile_image} 
                        alt={otherUser?.name} 
                        className="nexus-avatar"
                    />
                    {otherUser?.is_online && <div className="nexus-online-dot" />}
                </div>
                
                <div className="nexus-card-content">
                    <div className="nexus-card-header">
                        <h3 className="nexus-patient-name">{otherUser?.name}</h3>
                        <span className="nexus-timestamp">
                            {lastMessage ? formatTimeIST(lastMessage.created_at) : ''}
                        </span>
                    </div>
                    
                    <div className="nexus-card-footer">
                        <p className="nexus-last-message">
                            {lastMessage ? (
                                <span>
                                    {String(lastMessage.sender_id) === String(currentUserId) ? 'You: ' : ''}{lastMessage.content}
                                </span>
                            ) : (
                                <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Start a conversation</span>
                            )}
                        </p>
                        {isUnread && (
                            <div className="nexus-unread-badge">{conv.unread_count}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="nexus-inbox">
            <div className="nexus-inbox-header">
                <div className="nexus-inbox-title-row">
                    <h2 className="nexus-inbox-title">Inbox</h2>
                </div>
                <div className="nexus-search-container">
                    <Search size={16} className="nexus-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search conversations..." 
                        className="nexus-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="nexus-conversation-list custom-scrollbar">
                {filtered.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        <p>No conversations found.</p>
                    </div>
                ) : (
                    <>
                        {recentConvs.length > 0 && (
                            <>
                                <div className="nexus-list-section">Recent</div>
                                {recentConvs.map(renderConversation)}
                            </>
                        )}
                        
                        {earlierConvs.length > 0 && (
                            <>
                                <div className="nexus-list-section">Earlier</div>
                                {earlierConvs.map(renderConversation)}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
