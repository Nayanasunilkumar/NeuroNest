import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
    X, Loader2, Download, Calendar, User, FileText, Tag, 
    ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCw, 
    ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
    Maximize, MousePointer2
} from 'lucide-react';
import medicalRecordService from '../../services/medicalRecordService';

const ViewMedicalRecordModal = ({ isOpen, onClose, record, patientId = null }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [content, setContent] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const resetView = useCallback(() => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
        if (isOpen && record) {
            const fetchBlob = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    resetView();
                    
                    // Try to fetch via secure blob first
                    const blobData = await medicalRecordService.getRecordBlob(record.id, patientId);
                    setContent(blobData.url);
                    setFileType(blobData.type);
                } catch (err) {
                    console.error("Secure fetch failed, attempting fallback", err);
                    
                    if (record.file_path) {
                        const directUrl = record.file_path.startsWith('http') 
                            ? record.file_path 
                            : `${window.location.origin}${record.file_path}`;
                        
                        setContent(directUrl);
                        const ext = (record.file_type || record.file_path.split('.').pop()).toLowerCase();
                        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                            setFileType(`image/${ext === 'jpg' ? 'jpeg' : ext}`);
                        } else if (ext === 'pdf') {
                            setFileType('application/pdf');
                        } else {
                            setFileType(null);
                        }
                    } else {
                        setError("File path is missing in record metadata.");
                    }
                } finally {
                    // We don't set loading to false yet for iframes/images
                    // as they take time to render
                }
            };
            fetchBlob();
        }
    }, [isOpen, record, patientId, resetView]);

    useEffect(() => {
        return () => {
            if (content && typeof content === 'string' && content.startsWith('blob:')) {
                URL.revokeObjectURL(content);
            }
        };
    }, [content]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-') handleZoomOut();
            if (e.key === '0') resetView();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isFullscreen, resetView]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const toggleFullscreen = () => setIsFullscreen(prev => !prev);

    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || zoom <= 1) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (!isOpen || !record) return null;

    const isImage = fileType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(record.file_type?.toLowerCase());
    const isPDF = fileType === 'application/pdf' || record.file_type?.toLowerCase() === 'pdf';

    const handleContentLoad = () => {
        console.log("Content loaded successfully");
        setLoading(false);
    };

    const handleContentError = () => {
        console.error("Content failed to load in element");
        setError("The browser was unable to display this document. It might be corrupted or blocked by security settings.");
        setLoading(false);
    };

    return ReactDOM.createPortal(
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isFullscreen ? '#000' : 'rgba(0, 0, 0, 0.9)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease'
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    width: isFullscreen ? '100%' : '94%',
                    maxWidth: isFullscreen ? '100%' : '1200px',
                    height: isFullscreen ? '100%' : '90vh',
                    backgroundColor: '#111827',
                    borderRadius: isFullscreen ? '0' : '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modern Header */}
                {!isFullscreen && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '18px 28px',
                        backgroundColor: '#1f2937',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', overflow: 'hidden' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                color: '#60a5fa',
                                flexShrink: 0
                            }}>
                                <FileText size={22} style={{ margin: '0 auto' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <h2 style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '700', 
                                    margin: 0, 
                                    lineHeight: 1.2, 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    letterSpacing: '-0.01em'
                                }}>{record.title}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                                        <Calendar size={13} /> 
                                        {new Date(record.record_date || record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span style={{ width: '4px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                                        <Tag size={13} /> {record.category}
                                    </span>
                                    {record.doctor_name && (
                                        <>
                                            <span style={{ width: '4px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                                                <User size={13} /> {record.doctor_name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <button 
                                style={{
                                    padding: '10px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'white',
                                    backgroundColor: '#2563eb',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)}
                            >
                                <Download size={18} />
                                <span>Download</span>
                            </button>
                            <button 
                                onClick={onClose} 
                                style={{
                                    padding: '8px',
                                    color: '#9ca3af',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div 
                    ref={containerRef}
                    style={{
                        flex: 1,
                        backgroundColor: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Floating Controls Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: 'rgba(31, 41, 55, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 10,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}>
                        <button onClick={handleZoomOut} style={controlBtnStyle} title="Zoom Out"><ZoomOut size={20}/></button>
                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700', width: '50px', textAlign: 'center' }}>
                            {Math.round(zoom * 100)}%
                        </span>
                        <button onClick={handleZoomIn} style={controlBtnStyle} title="Zoom In"><ZoomIn size={20}/></button>
                        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>
                        <button onClick={handleRotate} style={controlBtnStyle} title="Rotate"><RotateCw size={20}/></button>
                        <button onClick={toggleFullscreen} style={controlBtnStyle} title="Fullscreen">
                            {isFullscreen ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
                        </button>
                        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>
                        <button 
                            onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)} 
                            style={controlBtnStyle} 
                            title="Download"
                        >
                            <Download size={20}/>
                        </button>
                        {isFullscreen && (
                            <button onClick={onClose} style={{ ...controlBtnStyle, color: '#f87171' }} title="Close">
                                <X size={20}/>
                            </button>
                        )}
                    </div>

                    {loading && (
                        <div style={{ 
                            position: 'absolute',
                            inset: 0,
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '16px', 
                            color: '#9ca3af',
                            backgroundColor: '#0f172a',
                            zIndex: 5
                        }}>
                            <Loader2 size={48} className="animate-spin" color="#3b82f6" />
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600', color: 'white', display: 'block' }}>Optimizing preview...</span>
                                <span style={{ fontSize: '13px', opacity: 0.6 }}>Securing clinical document data</span>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px', 
                            maxWidth: '450px',
                            backgroundColor: 'rgba(248, 113, 113, 0.05)',
                            borderRadius: '24px',
                            border: '1px solid rgba(248, 113, 113, 0.1)',
                            zIndex: 6
                        }}>
                            <div style={{ 
                                width: '64px', 
                                height: '64px', 
                                borderRadius: '50%', 
                                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#f87171',
                                margin: '0 auto 20px auto'
                            }}>
                                <AlertCircle size={32} />
                            </div>
                            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Preview Blocked</h3>
                            <p style={{ color: '#9ca3af', marginBottom: '28px', fontSize: '15px', lineHeight: 1.6 }}>
                                {error}
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button 
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        border: '1.5px solid rgba(255,255,255,0.1)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onClick={() => window.location.reload()}
                                >
                                    <RefreshCw size={18} /> Retry
                                </button>
                                <button 
                                    style={{
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)}
                                >
                                    <Download size={18} /> Download
                                </button>
                            </div>
                        </div>
                    ) : content ? (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: isDragging ? 'none' : 'transform 0.2s ease',
                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`
                        }}>
                            {isImage ? (
                                <img 
                                    src={content} 
                                    alt="Record Preview" 
                                    onLoad={handleContentLoad}
                                    onError={handleContentError}
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '100%', 
                                        objectFit: 'contain',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                        userSelect: 'none',
                                        pointerEvents: 'none'
                                    }}
                                />
                            ) : isPDF ? (
                                <iframe 
                                    src={`${content}#toolbar=0&view=FitH`} 
                                    onLoad={handleContentLoad}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        border: 'none', 
                                        backgroundColor: 'white',
                                        pointerEvents: zoom > 1 ? 'none' : 'auto' // Disable clicks while zoomed to allow panning
                                    }}
                                    title="PDF Preview"
                                ></iframe>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#1f2937', borderRadius: '24px', border: '1px solid #374151', maxWidth: '450px' }}>
                                    <FileText size={56} color="#4b5563" style={{ margin: '0 auto 24px auto' }} />
                                    <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Advanced Preview Unavailable</h3>
                                    <p style={{ color: '#9ca3af', marginBottom: '32px', fontSize: '15px', lineHeight: 1.6 }}>
                                        This file type ({record.file_type || 'Unknown'}) is not supported for instant visualization in our secure viewer.
                                    </p>
                                    <button 
                                        style={{
                                            backgroundColor: '#2563eb',
                                            color: 'white',
                                            padding: '14px 28px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            margin: '0 auto',
                                            cursor: 'pointer',
                                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)'
                                        }}
                                        onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)}
                                    >
                                        <Download size={20} /> Download for Clinical Review
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>,
        document.body
    );
};

const controlBtnStyle = {
    padding: '8px',
    color: '#d1d5db',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    outline: 'none'
};

export default ViewMedicalRecordModal;
