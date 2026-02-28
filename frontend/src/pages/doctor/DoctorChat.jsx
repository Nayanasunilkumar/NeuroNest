import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { initSocket, getSocket, disconnectSocket } from '../../services/socket';
import { getConversations, getMessages, markAsRead, getPatientContext, startConversation, sendMessage } from '../../api/chat';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatHeader from '../../components/chat/ChatHeader';
import PatientInfoPanel from '../../components/chat/PatientInfoPanel';
import { ChevronLeft } from 'lucide-react';
import { getUser } from '../../utils/auth';
import { toEpochMs } from '../../utils/time';
import '../../styles/doctor-chat.css';

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
    const isFocusedMode = Boolean(patientIdParam); // Single-patient focused view

    const fetchConversations = useCallback(async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            return data;
        } catch (err) {
            console.error("Clinical Inbox error:", err);
            return [];
        }
    }, []);

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
            const contextData = await getPatientContext(conv.other_user.id);
            setPatientContext(contextData);
        } catch (err) {
            console.error("Session synchronization error:", err);
        } finally {
            setLoadingMessages(false);
            setLoadingContext(false);
        }
    }, [selectedConv?.id]);

    const handleIncomingMessage = useCallback((msg) => {
        // Update messages if currently viewing this thread
        setSelectedConv((current) => {
            if (current?.id === msg.conversation_id) {
                setMessages((prev) => {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
            return current;
        });

        // Update main list
        setConversations(prev => {
            const updated = prev.map(c => {
                if (c.id === msg.conversation_id) {
                    return {
                        ...c,
                        last_message: {
                            content: msg.content,
                            created_at: msg.created_at,
                            is_read: false,
                            sender_id: msg.sender_id
                        },
                        unread_count: String(msg.sender_id) !== String(currentUser?.id) ? (c.unread_count + 1) : c.unread_count
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
    }, [currentUser?.id]);

    useEffect(() => {
        const user = getUser();
        if (user) setCurrentUser(user);

        const socket = initSocket();
        
        const initChat = async () => {
            const convs = await fetchConversations();
            
            if (patientIdParam) {
                // Check if conversation already exists in full list
                const existing = convs.find(c => c.other_user.id === parseInt(patientIdParam));
                
                if (existing) {
                    handleSelectConversation(existing);
                } else {
                    // Try to start a new one
                    try {
                        const newConvData = await startConversation(patientIdParam);
                        // Re-fetch to get the full formatted conversation object
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
            socket.on("new_message", (msg) => {
                handleIncomingMessage(msg);
            });
        }

        initChat();

        return () => {
            // Only disconnect if we created it ? Actually shared socket is better.
            // disconnectSocket(); 
        };
    }, [fetchConversations, handleIncomingMessage, handleSelectConversation, patientIdParam]);

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
                // HTTP Fallback for reliability
                const savedMsg = await sendMessage(selectedConv.id, content, type);
                handleIncomingMessage(savedMsg);
            }
        } catch (err) {
            console.error("Clinical dispatch error:", err);
        }
    };

    const handleVideoCall = async () => {
        if (!selectedConv) return;
        const roleStr = currentUser?.role === 'doctor' ? 'Doctor' : 'Patient';
        await handleSendMessage(`${roleStr} is initiating a secure video consultation.`, 'call_request');
        navigate(`/consultation/${selectedConv.id}`);
    };

    return (
        <div className="doctor-chat-nexus">
            {/* Column 1: Inbox — hidden when in focused patient mode */}
            {!isEmbedded && !isFocusedMode && (
                <ConversationList 
                    conversations={conversations}
                    activeId={selectedConv?.id}
                    onSelect={handleSelectConversation}
                    currentUserId={currentUser?.id}
                    isDoctor={true}
                />
            )}

            {/* Column 2: Chat Nexus */}
            <div className="nexus-hub" style={isFocusedMode ? { borderRadius: '20px', overflow: 'hidden' } : {}}>
                {/* Focused-mode top bar with back navigation */}
                {isFocusedMode && selectedConv && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 20px',
                        borderBottom: '1px solid #F1F5F9',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <button
                            onClick={() => navigate(`/doctor/patient-records?patientId=${patientIdParam}`)}
                            title="Back to Clinical Dossier"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', borderRadius: '50%',
                                border: '1px solid #E2E8F0', background: '#F8FAFC',
                                color: '#64748B', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8' }}>Clinical Dossier / Chat</div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center' }}>
                        {isFocusedMode ? (
                            <>
                                <div style={{ width: 48, height: 48, border: '4px solid #E2E8F0', borderTop: '4px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                                <p style={{ color: '#64748B', fontWeight: 600, fontSize: '14px' }}>Connecting to patient thread…</p>
                            </>
                        ) : (
                            <>
                                <div className="nexus-panel-avatar" style={{ width: '80px', height: '80px', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '2rem' }}>💬</span>
                                </div>
                                <h2 className="nexus-panel-name">Clinical Communication Panel</h2>
                                <p className="nexus-status-text" style={{ maxWidth: '320px', lineHeight: '1.6' }}>
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
        </div>
    );
};

export default DoctorChat;
