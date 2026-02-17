import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Loader2, Download, Calendar, User, FileText, Tag } from 'lucide-react';
import medicalRecordService from '../../../services/medicalRecordService';

const ViewMedicalRecordModal = ({ isOpen, onClose, record }) => {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState(null);
    const [fileType, setFileType] = useState(null);

    useEffect(() => {
        if (isOpen && record) {
            const fetchBlob = async () => {
                try {
                    setLoading(true);
                    const blobData = await medicalRecordService.getRecordBlob(record.file_path);
                    setContent(blobData.url);
                    setFileType(blobData.type);
                } catch (err) {
                    console.error("Failed to load record content", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchBlob();
        }
    }, [isOpen, record]);

    useEffect(() => {
        return () => {
            if (content) URL.revokeObjectURL(content);
        };
    }, [content]);

    if (!isOpen || !record) return null;

    const isImage = fileType?.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    return ReactDOM.createPortal(
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)'
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    width: '90%',
                    maxWidth: '1000px',
                    height: '85vh',
                    backgroundColor: '#111827', // gray-900
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #374151', // gray-700
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    backgroundColor: '#1f2937', // gray-800
                    borderBottom: '1px solid #374151', // gray-700
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)', // blue-500/10
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#60a5fa', // blue-400
                            flexShrink: 0
                        }}>
                            <FileText size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.title}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}> {/* gray-400 */}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} /> 
                                    {new Date(record.record_date || record.created_at).toLocaleDateString()}
                                </span>
                                <span style={{ width: '4px', height: '4px', backgroundColor: '#4b5563', borderRadius: '50%' }}></span> {/* gray-600 */}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Tag size={12} /> {record.category}
                                </span>
                                {record.doctor_name && (
                                    <>
                                        <span style={{ width: '4px', height: '4px', backgroundColor: '#4b5563', borderRadius: '50%' }}></span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={12} /> {record.doctor_name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            style={{
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#d1d5db', // gray-300
                                backgroundColor: 'transparent',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            onClick={() => medicalRecordService.downloadRecord(record.file_path, record.title)}
                        >
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                        <button 
                            onClick={onClose} 
                            style={{
                                padding: '8px',
                                color: '#9ca3af',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{
                    flex: 1,
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'auto',
                    width: '100%',
                    height: '100%'
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#9ca3af' }}>
                            <Loader2 size={40} className="animate-spin" color="#3b82f6" />
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Loading document...</span>
                        </div>
                    ) : content ? (
                        isImage ? (
                            <img 
                                src={content} 
                                alt="Record Preview" 
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        ) : isPDF ? (
                            <iframe 
                                src={`${content}#toolbar=0&view=FitH`} 
                                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'white' }}
                                title="PDF Preview"
                            ></iframe>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', maxWidth: '400px' }}>
                                <FileText size={48} color="#4b5563" style={{ margin: '0 auto 16px auto' }} />
                                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Preview Unavailable</h3>
                                <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '14px' }}>
                                    This file type ({fileType || 'Unknown'}) cannot be previewed directly.
                                </p>
                                <button 
                                    style={{
                                        backgroundColor: '#2563eb', // blue-600
                                        color: 'white',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        margin: '0 auto',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => medicalRecordService.downloadRecord(record.file_path, record.title)}
                                >
                                    <Download size={18} /> Download to View
                                </button>
                            </div>
                        )
                    ) : (
                        <div style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <X size={20} /> Failed to load content
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ViewMedicalRecordModal;
