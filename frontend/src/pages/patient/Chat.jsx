import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { initSocket, getSocket } from '../../services/socket';
import chatAPI from '../../services/chatAPI';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatHeader from '../../components/chat/ChatHeader';
import { getUser } from '../../utils/auth';
import { formatDateTimeIST, toEpochMs } from '../../utils/time';
import { useCall } from '../../context/CallContext';

const Chat = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messagesLoadError, setMessagesLoadError] = useState('');
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const { startVideoCall } = useCall();
    const conversationsRef = React.useRef([]);
    const messagesRef = React.useRef([]);
    const selectedConvRef = React.useRef(selectedConv);
    const syncInFlightRef = React.useRef(false);

    const joinConversationRooms = useCallback((socketClient, convs) => {
        if (!socketClient || !Array.isArray(convs) || convs.length === 0) return;
        convs.forEach((conv) => {
            if (conv?.id) {
                socketClient.emit('join_conversation', { conversation_id: conv.id });
            }
        });
    }, []);

    const fetchConversations = useCallback(async () => {
        try {
            const data = await chatAPI.getConversations();
            setConversations(data);
            const socket = getSocket();
            joinConversationRooms(socket, data);
        } catch (err) {
            console.error("Failed to load conversations", err);
        }
    }, [joinConversationRooms]);

    const [context, setContext] = useState(null); // Added context state

    const handleSelectConversation = async (conv) => {
        if (selectedConv?.id === conv.id) return;
        
        setSelectedConv(conv);
        setShowInfoPanel(false);
        setMessages([]);
        setContext(null); // Reset context for new doctor
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

        // Fetch Messages and Context
        try {
            const data = await chatAPI.getMessages(conv.id);
            const normalized = Array.isArray(data) ? data : [];

            if (normalized.length === 0 && conv.last_message?.content) {
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

            // Fetch Context
            try {
                const contextData = await chatAPI.getChatContext(conv.other_user.id);
                setContext(contextData);
            } catch (ctxErr) {
                console.error("Context sync failed:", ctxErr);
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

    // USE REFS FOR STABLE VALUES IN SOCKET LISTENERS
    const currentUserRef = React.useRef(currentUser);

    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const handleNewMessage = useCallback((msg) => {
        if (!msg) return;

        const current = selectedConvRef.current;
        const currentUserId = currentUserRef.current?.id;
        
        // 1. ROUTE TO ACTIVE MESSAGE WINDOW IF MATCH
        if (current && Number(current.id) === Number(msg.conversation_id)) {
            setMessages((prev) => {
                const isMyOwnMessage = String(msg.sender_id) === String(currentUserId);
                
                // If it's my own message, try to replace optimistic temp message
                if (isMyOwnMessage) {
                    const optimisticIndex = prev.findIndex(m => m.is_optimistic && m.content === msg.content);
                    if (optimisticIndex > -1) {
                        const newMsgs = [...prev];
                        newMsgs[optimisticIndex] = msg;
                        return newMsgs;
                    }
                }

                const existingIndex = prev.findIndex(m => m.id === msg.id);
                if (existingIndex > -1) {
                    const next = [...prev];
                    next[existingIndex] = { ...next[existingIndex], ...msg, is_optimistic: false };
                    return next;
                }
                return [...prev, msg];
            });
        }

        // 2. ALWAYS UPDATE SIDEBAR PREVIEWS
        setConversations(prev => (
            prev
                .map(c => {
                    if (Number(c.id) === Number(msg.conversation_id)) {
                        return {
                            ...c,
                            last_message: {
                                content: msg.content,
                                created_at: msg.created_at,
                                is_read: false,
                                sender_id: msg.sender_id,
                                type: msg.type,
                                is_deleted: msg.is_deleted
                            },
                            unread_count:
                                String(msg.sender_id) !== String(currentUserId) && 
                                (!current || Number(current.id) !== Number(msg.conversation_id))
                                    ? c.unread_count + 1
                                    : c.unread_count
                        };
                    }
                    return c;
                })
                .sort((a, b) => toEpochMs(b.last_message?.created_at) - toEpochMs(a.last_message?.created_at))
        ));
        const exists = conversationsRef.current.some((c) => Number(c.id) === Number(msg.conversation_id));
        if (!exists) {
            fetchConversations();
        }

        // Hard fix: if sidebar got a call_request for the currently open conversation,
        // force refresh full message stream so consultation card appears immediately.
        const activeConvId = selectedConvRef.current?.id;
        if (
            msg?.type === 'call_request' &&
            activeConvId &&
            Number(activeConvId) === Number(msg.conversation_id) &&
            !syncInFlightRef.current
        ) {
            syncInFlightRef.current = true;
            chatAPI
                .getMessages(activeConvId)
                .then((latest) => {
                    if (Array.isArray(latest)) setMessages(latest);
                })
                .catch((error) => {
                    console.error("Failed to hard-sync call_request message stream:", error);
                })
                .finally(() => {
                    syncInFlightRef.current = false;
                });
        }
    }, [fetchConversations]);

    const handleDeleteMessage = async (message) => {
        try {
            const deleted = await chatAPI.deleteMessage(message.id);
            handleNewMessage(deleted);
        } catch (err) {
            console.error("Failed to delete message", err);
            alert("Failed to delete message.");
        }
    };

    useEffect(() => {
        const user = getUser();
        if (user) setCurrentUser(user);

        const socket = initSocket();
        if (!conversations.length) fetchConversations();

        if (socket) {
            const handleSocketConnect = () => {
                joinConversationRooms(socket, conversationsRef.current);
                if (selectedConvRef.current?.id) {
                    socket.emit('join_conversation', { conversation_id: selectedConvRef.current.id });
                }
            };
            socket.on("new_message", handleNewMessage);
            socket.on("receive_message", handleNewMessage);
            socket.on("message_deleted", handleNewMessage);
            socket.on("connect", handleSocketConnect);
            return () => {
                socket.off("new_message", handleNewMessage);
                socket.off("receive_message", handleNewMessage);
                socket.off("message_deleted", handleNewMessage);
                socket.off("connect", handleSocketConnect);
            };
        }
    }, [conversations.length, fetchConversations, handleNewMessage, joinConversationRooms]);

    // Hard fallback polling: guarantees updates without manual refresh.
    useEffect(() => {
        const timer = setInterval(async () => {
            if (document.hidden) return;
            await fetchConversations();
            const active = selectedConvRef.current;
            if (!active?.id) return;
            try {
                const latest = await chatAPI.getMessages(active.id);
                const current = messagesRef.current || [];
                const lastCurrentId = current[current.length - 1]?.id;
                const lastLatestId = latest[latest.length - 1]?.id;
                if (lastLatestId && lastLatestId !== lastCurrentId) {
                    setMessages(latest);
                }
            } catch (error) {
                console.error("Patient chat polling sync failed:", error);
            }
        }, 2500);
        return () => clearInterval(timer);
    }, [fetchConversations]);

    const handleSendMessage = async (content, type = 'text') => {
        if (!selectedConv || !currentUser) return;
        
        // --- OPTIMISTIC UPDATE ---
        // Create a temporary message object to show in UI immediately
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            conversation_id: selectedConv.id,
            sender_id: currentUser.id,
            content: content,
            type: type,
            created_at: new Date().toISOString(),
            is_optimistic: true, // Flag to identify it as temporary
            status: 'sending'
        };

        // Add to local UI state for instant response (optimistic)
        setMessages(prev => [...prev, optimisticMsg]);
        
        try {
            // --- FAIL-SAFE PROTOCOL: USE HTTP FOR SENDING, SOCKET FOR RECEIVING ---
            const savedMsg = await chatAPI.sendMessage(selectedConv.id, content, type);
            
            // Re-sync UI with the authoritative server record
            handleNewMessage({ ...savedMsg, tempId }); 
        } catch (err) {
            console.error("Failed to send message via Protocol Bridge", err);
            // On failure, remove the optimistic message
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Delivery failed. Please check your medical network connection.");
        }
    };

    const handleVideoCall = async () => {
        if (!selectedConv) return;
        const session = await startVideoCall({
            receiverId: selectedConv.other_user?.id,
            conversationId: selectedConv.id,
            callType: 'video',
        });
        if (session) {
            handleSendMessage(`${currentUser?.full_name || 'Patient'} is requesting a secure video consultation.`, 'call_request')
                .catch((err) => {
                    console.error("Failed to send call_request message:", err);
                });
        }
    };

    return (
        <div className="d-flex bg-white h-100 overflow-hidden rounded-4 shadow-sm">
            {/* Sidebar */}
            <ConversationList 
                conversations={conversations}
                selectedId={selectedConv?.id}
                onSelect={handleSelectConversation}
                currentUserId={currentUser?.id}
            />

            {/* Chat Area */}
            {selectedConv ? (
                <div className="d-flex flex-column flex-grow-1 min-w-0 bg-transparent position-relative" style={{ minHeight: 0, overflow: 'hidden' }}>
                    <ChatHeader 
                        otherUser={selectedConv.other_user}
                        context={context}
                        isDoctor={false}
                        showSidebar={showInfoPanel}
                        onToggleSidebar={() => setShowInfoPanel((prev) => !prev)}
                        onVideoCall={handleVideoCall}
                    />
                    <div className="d-flex flex-grow-1 overflow-hidden">
                        <ChatWindow 
                            messages={messages}
                            currentUserId={currentUser?.id}
                            onSendMessage={handleSendMessage}
                            onDeleteMessage={handleDeleteMessage}
                            loadingMessages={loadingMessages}
                            messagesLoadError={messagesLoadError}
                            isDoctor={false}
                            otherUser={selectedConv.other_user}
                        />
                        
                        {showInfoPanel && (
                            <aside className="border-start bg-light overflow-y-auto custom-scrollbar" style={{ width: '380px', flexShrink: 0 }}>
                                <div className="p-4 border-bottom bg-white sticky-top">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h4 className="fw-bolder text-dark mb-0" style={{ fontSize: '1.1rem' }}>Doctor Details</h4>
                                        <button className="btn-close shadow-none d-lg-none" onClick={() => setShowInfoPanel(false)}></button>
                                    </div>
                                    <p className="text-secondary small fw-medium mb-0">Care provider profile</p>
                                    {selectedConv?.other_user?.id && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary mt-2"
                                            onClick={() => navigate(`/patient/doctor/${selectedConv.other_user.id}`)}
                                        >
                                            Open Full Profile
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 d-flex flex-column gap-3">
                                    {[
                                        { label: 'Doctor Name', value: selectedConv.other_user?.name || 'Unknown' },
                                        { label: 'Email', value: selectedConv.other_user?.email || 'N/A' },
                                        { label: 'Role', value: selectedConv.other_user?.role || 'doctor' },
                                        { label: 'Status', value: selectedConv.other_user?.is_online ? 'Online' : 'Last seen recently' },
                                        { label: 'Last Interaction', value: selectedConv.last_message?.created_at ? formatDateTimeIST(selectedConv.last_message.created_at) : 'N/A' }
                                    ].map((info, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-4 border shadow-sm">
                                            <span className="d-block text-secondary text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>{info.label}</span>
                                            <div className="fw-bolder text-dark" style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>{info.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-grow-1 align-items-center justify-content-center bg-light bg-opacity-50">
                    <div className="text-center p-5">
                        <div className="display-1 mb-4 opacity-25">💬</div>
                        <h2 className="fw-bolder text-dark mb-2">Clinical Support Portal</h2>
                        <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '300px' }}>Connecting you with your care team in a secure, encrypted environment.</p>
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            {['Secure Messaging', 'File Sharing', 'Care Coordination'].map((hint, i) => (
                                <span key={i} className="badge bg-white text-secondary border rounded-pill px-3 py-2 fw-bold shadow-sm">
                                    {hint}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Chat;
