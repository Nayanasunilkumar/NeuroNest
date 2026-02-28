import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { initSocket, getSocket, disconnectSocket } from '../../services/socket';
import chatAPI from '../../services/chatAPI';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatHeader from '../../components/chat/ChatHeader';
import { getUser } from '../../utils/auth';
import { formatDateTimeIST, toEpochMs } from '../../utils/time';
import '../../styles/patient-chat.css';

const Chat = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messagesLoadError, setMessagesLoadError] = useState('');
    const [showInfoPanel, setShowInfoPanel] = useState(false);

    const fetchConversations = useCallback(async () => {
        try {
            const data = await chatAPI.getConversations();
            setConversations(data);
        } catch (err) {
            console.error("Failed to load conversations", err);
        }
    }, []);

    const handleSelectConversation = async (conv) => {
        if (selectedConv?.id === conv.id) return;
        
        setSelectedConv(conv);
        setShowInfoPanel(false);
        setMessages([]);
        setLoadingMessages(true);
        setMessagesLoadError('');

        // Mark as read immediately if unread
        if (conv.unread_count > 0) {
            try {
                await chatAPI.markAsRead(conv.id);
                setConversations(prev => prev.map(c => 
                    c.id === conv.id ? { ...c, unread_count: 0 } : c
                ));
            } catch (err) {
                console.error("Failed to mark as read", err);
            }
        }

        // Fetch Messages
        try {
            const data = await chatAPI.getMessages(conv.id);
            const normalized = Array.isArray(data) ? data : [];

            if (normalized.length === 0 && conv.last_message?.content) {
                // Fallback: keep the visible conversation preview as minimal history
                // when server returns empty list for an existing thread.
                setMessages([{
                    id: `fallback-${conv.id}`,
                    conversation_id: conv.id,
                    sender_id: conv.last_message.sender_id,
                    content: conv.last_message.content,
                    type: conv.last_message.type || 'text',
                    is_read: conv.last_message.is_read ?? true,
                    created_at: conv.last_message.created_at || new Date().toISOString(),
                }]);
            } else {
                setMessages(normalized);
            }
            
            // Join Room
            const socket = getSocket();
            if (socket) {
                socket.emit('join_conversation', { conversation_id: conv.id });
            }
        } catch (err) {
            console.error("Failed to load messages", err);
            setMessagesLoadError('Unable to load full message history right now.');
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleNewMessage = useCallback((msg) => {
        // If message belongs to current conversation, add it
        // Only if we are viewing THAT conversation
        setSelectedConv((current) => {
            if (current?.id === msg.conversation_id) {
                setMessages((prev) => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
            return current;
        });

        // Update conversation list last message
        setConversations(prev => (
            prev
                .map(c => {
                    if (c.id === msg.conversation_id) {
                        return {
                            ...c,
                            last_message: {
                                content: msg.content,
                                created_at: msg.created_at,
                                is_read: false,
                                sender_id: msg.sender_id
                            },
                            unread_count:
                                String(msg.sender_id) !== String(currentUser?.id) && selectedConv?.id !== msg.conversation_id
                                    ? c.unread_count + 1
                                    : c.unread_count
                        };
                    }
                    return c;
                })
                .sort((a, b) => toEpochMs(b.last_message?.created_at) - toEpochMs(a.last_message?.created_at))
        ));
    }, [currentUser?.id, selectedConv?.id]);

    useEffect(() => {
        // 1. Get User
        const user = getUser();
        if (user) setCurrentUser(user);

        // 2. Init Socket
        const socket = initSocket();

        // 3. Fetch Conversations
        fetchConversations();

        // 4. Socket Listeners
        if (socket) {
            socket.on("new_message", (msg) => {
                handleNewMessage(msg);
            });
            
            socket.on("status", (data) => {
                console.log("Socket Status:", data);
            });
        }

        return () => {
            disconnectSocket();
        };
    }, [fetchConversations, handleNewMessage]);

    const handleSendMessage = async (content, type = 'text') => {
        if (!selectedConv || !currentUser) return;
        
        try {
            const socket = getSocket();
            if (socket && socket.connected) {
                socket.emit('send_message', {
                    conversation_id: selectedConv.id,
                    content: content,
                    type: type
                });
            } else {
                if (type === 'text') {
                    const savedMsg = await chatAPI.sendMessage(selectedConv.id, content);
                    handleNewMessage(savedMsg);
                }
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleVideoCall = async () => {
        if (!selectedConv) return;
        await handleSendMessage(`${currentUser?.full_name || 'Patient'} is requesting a secure video consultation.`, 'call_request');
        navigate(`/consultation/${selectedConv.id}`);
    };

    return (
        <div className="patient-chat-nexus">
            {/* Sidebar */}
            <ConversationList 
                conversations={conversations}
                selectedId={selectedConv?.id}
                onSelect={handleSelectConversation}
                currentUserId={currentUser?.id}
            />

            {/* Chat Area */}
            {selectedConv ? (
                <div className="nexus-chat-pane">
                    <ChatHeader 
                        otherUser={selectedConv.other_user}
                        isDoctor={false} // This is patient view
                        showSidebar={showInfoPanel}
                        onToggleSidebar={() => setShowInfoPanel((prev) => !prev)}
                        onVideoCall={handleVideoCall}
                    />
                    <ChatWindow 
                        messages={messages}
                        currentUserId={currentUser?.id}
                        onSendMessage={handleSendMessage}
                        loadingMessages={loadingMessages}
                        messagesLoadError={messagesLoadError}
                        isDoctor={false}
                        otherUser={selectedConv.other_user}
                    />
                    {showInfoPanel && (
                        <>
                            <div
                                className="nexus-info-popover-backdrop"
                                onClick={() => setShowInfoPanel(false)}
                                aria-hidden="true"
                            />
                            <aside className="nexus-info-popover custom-scrollbar" role="dialog" aria-label="Conversation details">
                                <div className="nexus-conversation-info-header">
                                    <h4>Doctor Details</h4>
                                    <p>Care provider profile</p>
                                </div>
                                <div className="nexus-conversation-info-grid">
                                    <div className="nexus-info-row">
                                        <span>Doctor Name</span>
                                        <strong>{selectedConv.other_user?.name || 'Unknown'}</strong>
                                    </div>
                                    <div className="nexus-info-row">
                                        <span>Email</span>
                                        <strong>{selectedConv.other_user?.email || 'N/A'}</strong>
                                    </div>
                                    <div className="nexus-info-row">
                                        <span>Role</span>
                                        <strong>{selectedConv.other_user?.role || 'doctor'}</strong>
                                    </div>
                                    <div className="nexus-info-row">
                                        <span>Status</span>
                                        <strong>{selectedConv.other_user?.is_online ? 'Online' : 'Last seen recently'}</strong>
                                    </div>
                                    <div className="nexus-info-row">
                                        <span>Last Interaction</span>
                                        <strong>
                                            {selectedConv.last_message?.created_at
                                                ? formatDateTimeIST(selectedConv.last_message.created_at)
                                                : 'N/A'}
                                        </strong>
                                    </div>
                                </div>
                            </aside>
                        </>
                    )}
                </div>
            ) : (
                <div className="nexus-chat-pane empty-chat-state">
                    <div className="nexus-empty-pane">
                        <div className="nexus-empty-icon">💬</div>
                        <h2 className="nexus-empty-title">Clinical Support Portal</h2>
                        <p className="nexus-empty-subtitle">Connecting you with your care team.</p>
                        <div className="nexus-empty-hints">
                            <span className="nexus-empty-hint">Secure Messaging</span>
                            <span className="nexus-empty-hint">File Sharing</span>
                            <span className="nexus-empty-hint">Care Coordination</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
