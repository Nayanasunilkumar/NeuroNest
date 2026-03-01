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
                    <div className="d-flex justify-content-center my-4" key={`day-${dayKey}-${index}`}>
                        <span className="badge bg-light text-secondary border rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                            {getRelativeDayLabelIST(msg.created_at)}
                        </span>
                    </div>
                );
                lastDayKey = dayKey;
            }

            blocks.push(
                <MessageBubble 
                    key={msg.id || index} 
                    message={msg} 
                    isMe={String(msg.sender_id) === String(currentUserId)}
                />
            );
        });

        return blocks;
    };

    return (
        <div className="d-flex flex-column flex-grow-1 position-relative bg-white h-100 min-w-0">
            {/* MESSAGES AREA */}
            <div className="flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-3 custom-scrollbar" ref={messagesContainerRef}>
                {loadingMessages ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-secondary">
                         <div className="spinner-border text-primary mb-3" style={{ width: '2rem', height: '2rem', borderWidth: '0.15em' }}></div>
                        <p className="small fw-bold mb-0">Synchronizing secure channel...</p>
                    </div>
                ) : messagesLoadError ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-secondary">
                        <h3 className="h6 fw-bold text-dark mb-1">Message Sync Issue</h3>
                        <p className="small mb-0 opacity-75">{messagesLoadError}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center px-4">
                        <div className="fs-1 mb-3 opacity-50">💬</div>
                        <h3 className="h5 fw-bolder text-dark mb-2">Start a Conversation</h3>
                        <p className="text-secondary small fw-medium mb-4 mx-auto" style={{ maxWidth: '300px' }}>
                            Connecting with {otherUser?.name || 'your healthcare provider'} is secure and private.
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1">Private</span>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1">Encrypted</span>
                            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 py-1">Realtime</span>
                        </div>
                    </div>
                ) : (
                    renderMessageStream()
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT PANEL */}
            <div className="p-3 p-md-4 border-top border-light bg-white bg-opacity-75" style={{ backdropFilter: 'blur(12px)' }}>
                {/* QUICK ACTIONS */}
                <div className="mb-3 d-flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {/* DOCTOR TEMPLATES */}
                    {isDoctor && showTemplates && templates.length > 0 && (
                        templates.map((t, i) => (
                            <button 
                                key={i} 
                                className="btn btn-sm btn-light border rounded-pill fw-bold text-primary text-nowrap px-3 hover-bg-primary hover-text-white transition-all shadow-sm"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleTemplateClick(t.text)}
                            >
                                {t.label}
                            </button>
                        ))
                    )}

                    {/* PATIENT QUICK ACTIONS */}
                    {!isDoctor && (
                        <>
                            <button className="btn btn-sm btn-light border rounded-pill fw-bold text-secondary text-nowrap px-3 hover-bg-primary hover-text-white transition-all shadow-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleTemplateClick("I would like to book an appointment.")}>
                                📅 Book Appointment
                            </button>
                            <button className="btn btn-sm btn-light border rounded-pill fw-bold text-secondary text-nowrap px-3 hover-bg-primary hover-text-white transition-all shadow-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleTemplateClick("I am uploading my latest report.")}>
                                📄 Upload Report
                            </button>
                            <button className="btn btn-sm btn-light border rounded-pill fw-bold text-secondary text-nowrap px-3 hover-bg-primary hover-text-white transition-all shadow-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleTemplateClick("I have a question about my medication.")}>
                                💊 Medication Query
                            </button>
                            <button className="btn btn-sm btn-light border rounded-pill fw-bold text-secondary text-nowrap px-3 hover-bg-primary hover-text-white transition-all shadow-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleTemplateClick("Please call me back when free.")}>
                                📞 Request Callback
                            </button>
                        </>
                    )}
                </div>
                
                <div className="d-flex align-items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileSelect}
                    />
                    <button 
                        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center text-secondary border hover-bg-light transition-all shadow-sm flex-shrink-0" 
                        title="Attach Files"
                        style={{ width: '40px', height: '40px' }}
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip size={18} />
                    </button>
                    
                    {isDoctor && (
                        <button 
                            className={`btn btn-light rounded-circle d-flex align-items-center justify-content-center border hover-bg-light transition-all shadow-sm flex-shrink-0 ${showTemplates ? 'text-primary bg-primary bg-opacity-10 border-primary' : 'text-secondary'}`}
                            onClick={() => setShowTemplates(!showTemplates)}
                            title="Quick Templates"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <Zap size={18} />
                        </button>
                    )}

                    <textarea 
                        className="form-control bg-light border-light rounded-pill px-4 py-2 shadow-sm text-dark fw-medium custom-scrollbar flex-grow-1" 
                        placeholder={isDoctor ? "Type clinical note or message..." : "Type your message here..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{ resize: 'none', overflowY: 'auto', maxHeight: '100px', fontSize: '0.875rem', lineHeight: '1.5', paddingRight: '46px' }}
                    />
                    
                    <button 
                        className={`btn rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm transition-all ${!newMessage.trim() || isUploading ? 'btn-light text-secondary disabled' : 'btn-primary text-white'}`}
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isUploading}
                        style={{ width: '40px', height: '40px', marginLeft: '-48px', zIndex: 5 }}
                    >
                        {isUploading ? <span className="spinner-border spinner-border-sm" /> : <Send size={16} />}
                    </button>
                </div>
            </div>

            <style>{`
                .hover-bg-primary:hover { background-color: var(--bs-primary) !important; color: white !important; border-color: var(--bs-primary) !important; }
                .hover-bg-light:hover { background-color: rgba(0,0,0,0.05) !important; }
                .min-w-0 { min-width: 0; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default ChatWindow;
