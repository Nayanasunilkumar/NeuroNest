import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, Paperclip } from 'lucide-react';
import MessageBubble from './MessageBubble';
import chatAPI from '../../services/chatAPI';
import { getISTDayKey, getRelativeDayLabelIST } from '../../utils/time';

const ChatWindow = ({ messages, currentUserId, onSendMessage, loadingMessages, messagesLoadError, isDoctor, templates = [], otherUser }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage, 'text');
        setNewMessage('');
        setShowTemplates(false);
    };

    const handleTemplateClick = (text) => {
        setNewMessage(text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = await chatAPI.uploadFile(file);
            console.log("File uploaded:", data.url);
            
            // Determine type
            const isImage = file.type.startsWith('image/');
            const type = isImage ? 'image' : 'file';
            
            onSendMessage(data.url, type);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderMessageStream = () => {
        let lastDayKey = '';
        const blocks = [];

        messages.forEach((msg, index) => {
            const dayKey = getISTDayKey(msg.created_at);
            if (dayKey && dayKey !== lastDayKey) {
                blocks.push(
                    <div className="nexus-day-separator" key={`day-${dayKey}-${index}`}>
                        <span className="nexus-day-pill">{getRelativeDayLabelIST(msg.created_at)}</span>
                    </div>
                );
                lastDayKey = dayKey;
            }

            blocks.push(
                <MessageBubble 
                    key={msg.id || index} 
                    message={msg} 
                    isMe={msg.sender_id === currentUserId}
                />
            );
        });

        return blocks;
    };

    return (
        <div className="nexus-chat-window">
            {/* MESSAGES AREA */}
            <div className="nexus-messages-area custom-scrollbar" ref={messagesContainerRef}>
                {loadingMessages ? (
                    <div className="nexus-chat-feedback">
                         <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ fontSize: '13px', fontWeight: 600 }}>Synchronizing secure channel...</p>
                    </div>
                ) : messagesLoadError ? (
                    <div className="nexus-chat-feedback">
                        <h3 className="nexus-empty-chat-title">Message Sync Issue</h3>
                        <p className="nexus-empty-chat-subtitle">{messagesLoadError}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="nexus-chat-feedback nexus-chat-feedback-empty">
                        <div className="nexus-empty-chat-emoji">💬</div>
                        <h3 className="nexus-empty-chat-title">Start a Conversation</h3>
                        <p className="nexus-empty-chat-subtitle">
                            Connecting with {otherUser?.name || 'your healthcare provider'} is secure and private.
                        </p>
                        <div className="nexus-empty-chat-pills">
                            <span className="nexus-empty-chat-pill">Private</span>
                            <span className="nexus-empty-chat-pill">Encrypted</span>
                            <span className="nexus-empty-chat-pill">Realtime</span>
                        </div>
                    </div>
                ) : (
                    renderMessageStream()
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT PANEL */}
            <div className="nexus-input-area">
                <div className="nexus-quick-actions-shell">
                {/* DOCTOR TEMPLATES */}
                {isDoctor && showTemplates && templates.length > 0 && (
                    <div className="nexus-template-group">
                        {templates.map((t, i) => (
                            <button key={i} className="action-pill" onClick={() => handleTemplateClick(t.text)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* PATIENT QUICK ACTIONS */}
                {!isDoctor && (
                    <div className="nexus-quick-actions custom-scrollbar">
                        <button className="action-pill" onClick={() => handleTemplateClick("I would like to book an appointment.")}>
                            📅 Book Appointment
                        </button>
                        <button className="action-pill" onClick={() => handleTemplateClick("I am uploading my latest report.")}>
                            📄 Upload Report
                        </button>
                        <button className="action-pill" onClick={() => handleTemplateClick("I have a question about my medication.")}>
                            💊 Medication Query
                        </button>
                        <button className="action-pill" onClick={() => handleTemplateClick("Please call me back when free.")}>
                            📞 Request Callback
                        </button>
                    </div>
                )}
                </div>
                
                <div className="nexus-input-wrapper">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileSelect}
                    />
                    <button 
                        className="attach-btn" 
                        title="Attach Files"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip size={20} />
                    </button>
                    
                    {isDoctor && (
                        <button 
                            className="attach-btn"
                            onClick={() => setShowTemplates(!showTemplates)}
                            title="Quick Templates"
                            style={showTemplates ? { color: '#3b82f6' } : {}}
                        >
                            <Zap size={20} />
                        </button>
                    )}

                    <textarea 
                        className="nexus-text-input custom-scrollbar" 
                        placeholder={isDoctor ? "Type clinical note or message..." : "Type your message here..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{ resize: 'none', overflowY: 'auto' }}
                    />
                    
                    <button 
                        className="send-btn-round"
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isUploading}
                    >
                        {isUploading ? "..." : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
