import React, { useEffect, useState, useCallback } from 'react';
import { initSocket, getSocket, disconnectSocket } from '../../services/socket';
import chatAPI from '../../services/chatAPI';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatHeader from '../../components/chat/ChatHeader';
import { getUser } from '../../utils/auth';
import '../../styles/patient-chat.css';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);

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
        setMessages([]);
        setLoadingMessages(true);

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
            setMessages(data);
            
            // Join Room
            const socket = getSocket();
            if (socket) {
                socket.emit('join_conversation', { conversation_id: conv.id });
            }
        } catch (err) {
            console.error("Failed to load messages", err);
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
                                msg.sender_id !== currentUser?.id && selectedConv?.id !== msg.conversation_id
                                    ? c.unread_count + 1
                                    : c.unread_count
                        };
                    }
                    return c;
                })
                .sort((a, b) => new Date(b.last_message?.created_at) - new Date(a.last_message?.created_at))
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
                        showSidebar={false}
                        onToggleSidebar={() => {}} // No sidebar for now
                    />
                    <ChatWindow 
                        messages={messages}
                        currentUserId={currentUser?.id}
                        onSendMessage={handleSendMessage}
                        loadingMessages={loadingMessages}
                        isDoctor={false}
                        otherUser={selectedConv.other_user}
                    />
                </div>
            ) : (
                <div className="nexus-chat-pane empty-chat-state">
                    <div className="text-center p-8">
                        <div className="mb-4 text-6xl opacity-50">💬</div>
                        <h2 className="text-2xl font-bold text-gray-700">Clinical Support Portal</h2>
                        <p className="text-gray-500 mt-2">Connecting you with your care team.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
