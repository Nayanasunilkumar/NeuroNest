import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { initSocket, getSocket } from '../../services/socket';
import { getConversations, getMessages, markAsRead, getChatContext, startConversation, sendMessage } from '../../api/chat';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatHeader from '../../components/chat/ChatHeader';
import PatientInfoPanel from '../../components/chat/PatientInfoPanel';
import { ChevronLeft } from 'lucide-react';
import { getUser } from '../../utils/auth';
import { toEpochMs } from '../../utils/time';
import { useCall } from '../../context/CallContext';

const DOCTOR_TEMPLATES = [
    { label: "Follow-up", text: "Please book a follow-up appointment through your dashboard for further evaluation." },
    { label: "Lab Reports", text: "Kindly upload your latest lab/blood test reports in the 'Medical Records' section." },
    { label: "Medication", text: "I have updated your prescription. Please follow the new dosage instructions carefully." },
    { label: "Telehealth", text: "I would like to schedule a quick video consultation. Are you available for a call now?" },
    { label: "Vital Check", text: "Please monitor your blood pressure and heart rate for the next 3 days and share the logs." },
    { label: "Imaging", text: "The MRI/CT scan results are pending. Please upload them once you receive the digital copy." }
];

const DoctorChat = ({ isEmbedded = false }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [patientContext, setPatientContext] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingContext, setLoadingContext] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientIdParam = searchParams.get('patientId');
    const startVideoParam = searchParams.get('startVideo') === '1';
    const isFocusedMode = Boolean(patientIdParam); // Single-patient focused view
    const hasAutoStartedVideoRef = useRef(false);
    const { startVideoCall } = useCall();
    const conversationsRef = useRef([]);
    const messagesRef = useRef([]);
    const syncInFlightRef = useRef(false);

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
            const data = await getConversations();
            setConversations(data);
            const socket = getSocket();
            joinConversationRooms(socket, data);
            return data;
        } catch (err) {
            console.error("Clinical Inbox error:", err);
            return [];
        }
    }, [joinConversationRooms]);

    const handleSelectConversation = useCallback(async (conv) => {
        if (selectedConv?.id === conv.id) return;
        
        setSelectedConv(conv);
        setMessages([]);
        setPatientContext(null); // Reset context for new patient
        setLoadingMessages(true);
        setLoadingContext(true);

        try {
            // 1. Fetch Messages
            const messagesData = await getMessages(conv.id);
            setMessages(messagesData);
            
            // 2. Mark as read
            if (conv.unread_count > 0) {
                await markAsRead(conv.id);
                // Update local conversation list count
                setConversations(prev => prev.map(c => 
                    c.id === conv.id ? { ...c, unread_count: 0 } : c
                ));
            }

            // 3. Join Socket Room
            const socket = getSocket();
            if (socket) {
                socket.emit('join_conversation', { conversation_id: conv.id });
            }

            // 4. Fetch Patient Context
            const contextData = await getChatContext(conv.other_user.id);
            setPatientContext(contextData);
        } catch (err) {
            console.error("Session synchronization error:", err);
        } finally {
            setLoadingMessages(false);
            setLoadingContext(false);
        }
    }, [selectedConv?.id]);

    // USE REFS FOR STABLE VALUES IN SOCKET LISTENERS
    const selectedConvRef = useRef(selectedConv);
    const currentUserRef = useRef(currentUser);

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

    const handleIncomingMessage = useCallback((msg) => {
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

                // Normal de-duplication
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        }

        // 2. ALWAYS UPDATE SIDEBAR PREVIEWS
        setConversations(prev => {
            const exists = prev.some((c) => Number(c.id) === Number(msg.conversation_id));
            if (!exists) {
                fetchConversations();
            }
            const updated = prev.map(c => {
                if (Number(c.id) === Number(msg.conversation_id)) {
                    return {
                        ...c,
                        last_message: {
                            content: msg.content,
                            created_at: msg.created_at,
                            is_read: false,
                            sender_id: msg.sender_id
                        },
                        unread_count: 
                            String(msg.sender_id) !== String(currentUserId) && 
                            (!current || Number(current.id) !== Number(msg.conversation_id))
                                ? (c.unread_count + 1) 
                                : c.unread_count
                    };
                }
                return c;
            });
            // Re-sort by latest message
            return [...updated].sort((a,b) => {
                const dateA = toEpochMs(a.last_message?.created_at);
                const dateB = toEpochMs(b.last_message?.created_at);
                return dateB - dateA;
            });
        });

        // Hard fix: if sidebar reflects a call_request for active thread,
        // force pull full message history so consultation card renders in chat.
        const activeConvId = selectedConvRef.current?.id;
        if (
            msg?.type === 'call_request' &&
            activeConvId &&
            Number(activeConvId) === Number(msg.conversation_id) &&
            !syncInFlightRef.current
        ) {
            syncInFlightRef.current = true;
            getMessages(activeConvId)
                .then((latest) => {
                    if (Array.isArray(latest)) setMessages(latest);
                })
                .catch((error) => {
                    console.error("Failed to hard-sync call_request in doctor chat:", error);
                })
                .finally(() => {
                    syncInFlightRef.current = false;
                });
        }
    }, [fetchConversations]);

    useEffect(() => {
        const user = getUser();
        if (user) setCurrentUser(user);

        const socket = initSocket();
        
        const initChat = async () => {
            const currentConvs = await fetchConversations();
            
            if (patientIdParam) {
                const existing = currentConvs.find(c => c.other_user.id === parseInt(patientIdParam));
                if (existing) {
                    handleSelectConversation(existing);
                } else {
                    try {
                        const newConvData = await startConversation(patientIdParam);
                        const updatedConvs = await fetchConversations();
                        const newlyCreated = updatedConvs.find(c => c.id === newConvData.conversation_id);
                        if (newlyCreated) {
                            handleSelectConversation(newlyCreated);
                        }
                    } catch (err) {
                        console.error("Failed to bridge clinical thread:", err);
                    }
                }
            }
        };

        if (socket) {
            const handleSocketConnect = () => {
                joinConversationRooms(socket, conversationsRef.current);
                if (selectedConvRef.current?.id) {
                    socket.emit('join_conversation', { conversation_id: selectedConvRef.current.id });
                }
            };
            socket.on("new_message", handleIncomingMessage);
            socket.on("receive_message", handleIncomingMessage);
            socket.on("connect", handleSocketConnect);
            initChat();
            return () => {
                socket.off("new_message", handleIncomingMessage);
                socket.off("receive_message", handleIncomingMessage);
                socket.off("connect", handleSocketConnect);
            };
        } else {
            initChat();
        }

    }, [fetchConversations, handleIncomingMessage, handleSelectConversation, joinConversationRooms, patientIdParam]);

    // Hard fallback polling: ensures chat updates arrive without refresh even under socket jitter.
    useEffect(() => {
        const timer = setInterval(async () => {
            if (document.hidden) return;
            await fetchConversations();
            const active = selectedConvRef.current;
            if (!active?.id) return;
            try {
                const latest = await getMessages(active.id);
                const current = messagesRef.current || [];
                const lastCurrentId = current[current.length - 1]?.id;
                const lastLatestId = latest[latest.length - 1]?.id;
                if (lastLatestId && lastLatestId !== lastCurrentId) {
                    setMessages(latest);
                }
            } catch (error) {
                console.error("Doctor chat polling sync failed:", error);
            }
        }, 2500);
        return () => clearInterval(timer);
    }, [fetchConversations]);

    const handleSendMessage = useCallback(async (content, type = 'text') => {
        if (!selectedConv || !currentUser) return;
        
        // --- OPTIMISTIC UPDATE ---
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            conversation_id: selectedConv.id,
            sender_id: currentUser.id,
            content: content,
            type: type,
            created_at: new Date().toISOString(),
            is_optimistic: true,
            status: 'sending'
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            // --- FAIL-SAFE PROTOCOL: USE HTTP FOR SENDING, SOCKET FOR RECEIVING ---
            const savedMsg = await sendMessage(selectedConv.id, content, type);
            
            // Re-sync UI with the authoritative server record
            handleIncomingMessage(savedMsg); 
        } catch (err) {
            console.error("Clinical dispatch error via Protocol Bridge:", err);
            // On failure, remove the optimistic message
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    }, [selectedConv, currentUser, handleIncomingMessage]);

    const handleVideoCall = useCallback(async () => {
        if (!selectedConv) return;
        const roleStr = currentUser?.role === 'doctor' ? 'Doctor' : 'Patient';
        const session = await startVideoCall({
            receiverId: selectedConv.other_user?.id,
            conversationId: selectedConv.id,
            callType: 'video',
        });
        if (session) {
            handleSendMessage(`${roleStr} is initiating a secure video consultation.`, 'call_request').catch((err) => {
                console.error("Failed to send call_request message:", err);
            });
        }
    }, [selectedConv, currentUser?.role, handleSendMessage, startVideoCall]);

    useEffect(() => {
        if (!startVideoParam || hasAutoStartedVideoRef.current) return;
        if (!selectedConv || !currentUser) return;

        hasAutoStartedVideoRef.current = true;
        handleVideoCall();
    }, [startVideoParam, selectedConv, currentUser, handleVideoCall]);

    return (
        <div className="d-flex w-100 h-100 overflow-hidden rounded-4 shadow-sm" style={{ background: 'var(--nn-surface)', border: '1px solid var(--nn-border)' }}>
            {/* Column 1: Inbox — hidden when in focused patient mode */}
            {!isEmbedded && !isFocusedMode && (
                <ConversationList 
                    conversations={conversations}
                    selectedId={selectedConv?.id}
                    onSelect={handleSelectConversation}
                    currentUserId={currentUser?.id}
                    isDoctor={true}
                />
            )}

            {/* Column 2: Chat Nexus */}
            <div className={`d-flex flex-column flex-grow-1 position-relative bg-transparent ${isFocusedMode ? 'overflow-hidden' : ''}`} style={isFocusedMode ? { borderRadius: '20px' } : { minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
                {/* Focused-mode top bar with back navigation */}
                {isFocusedMode && selectedConv && (
                    <div className="d-flex align-items-center gap-3 px-4 py-2 border-bottom" style={{ background: 'color-mix(in srgb, var(--nn-surface) 92%, transparent)', backdropFilter: 'blur(10px)' }}>
                        <button
                            onClick={() => navigate(`/doctor/patient-records?patientId=${patientIdParam}`)}
                            title="Back to Clinical Dossier"
                            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 border p-0 shadow-sm transition-all hover-btn-back"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div>
                            <div className="fw-bolder text-uppercase" style={{ color: 'var(--nn-text-muted)', fontSize: '0.65rem', letterSpacing: '0.08em' }}>Clinical Dossier / Chat</div>
                            <div className="fw-bolder" style={{ color: 'var(--nn-text-main)', fontSize: '0.875rem', lineHeight: 1.2 }}>
                                {selectedConv.other_user?.full_name || selectedConv.other_user?.name || 'Patient'}
                            </div>
                        </div>
                    </div>
                )}

                {selectedConv ? (
                    <>
                        <ChatHeader 
                            otherUser={selectedConv.other_user} 
                            context={patientContext}
                            isDoctor={currentUser?.role === 'doctor'}
                            showSidebar={showSidebar}
                            onToggleSidebar={() => setShowSidebar(!showSidebar)}
                            onVideoCall={handleVideoCall}
                        />
                        <ChatWindow 
                            messages={messages}
                            currentUserId={currentUser?.id}
                            onSendMessage={handleSendMessage}
                            loadingMessages={loadingMessages}
                            isDoctor={currentUser?.role === 'doctor'}
                            templates={DOCTOR_TEMPLATES}
                            otherUser={selectedConv.other_user}
                        />
                    </>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-center">
                        {isFocusedMode ? (
                            <>
                                <div className="spinner-border text-primary border-4 mb-4" style={{ width: '3rem', height: '3rem' }}></div>
                                <p className="text-secondary fw-bold" style={{ fontSize: '0.875rem' }}>Connecting to patient thread…</p>
                            </>
                        ) : (
                            <>
                                <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary border border-2 border-white rounded-4 shadow-sm mb-4" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                    💬
                                </div>
                                <h2 className="h4 fw-bolder mb-3" style={{ color: 'var(--nn-text-main)' }}>Clinical Communication Panel</h2>
                                <p className="fw-medium mx-auto" style={{ color: 'var(--nn-text-secondary)', maxWidth: '320px', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                    Select a patient thread from your clinical inbox to begin high-fidelity consultation or triage.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Column 3: Clinical Context */}
            {showSidebar && selectedConv && (
                <PatientInfoPanel 
                    context={patientContext} 
                    loading={loadingContext} 
                />
            )}
            <style>{`
                .hover-btn-back:hover { background-color: var(--nn-primary-light) !important; border-color: var(--nn-primary) !important; color: var(--nn-primary) !important; }
            `}</style>
        </div>
    );
};

export default DoctorChat;
