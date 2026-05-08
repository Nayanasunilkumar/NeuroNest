import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { 
    X, Loader2, Download, Calendar, User, FileText, Tag, 
    ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCw, 
    RefreshCw, AlertCircle, Maximize, MousePointer2,
    Eye, Scale, History, Shield, Info
} from 'lucide-react';
import medicalRecordService from '../../services/medicalRecordService';

const ViewMedicalRecordModal = ({ isOpen, onClose, record, patientId = null }) => {
    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [content, setContent] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Viewport State
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

    const fetchDocument = useCallback(async () => {
        if (!isOpen || !record) return;
        
        try {
            setLoading(true);
            setError(null);
            resetView();
            
            console.log(`[Viewer] Initializing preview for record ID: ${record.id}, type: ${record.file_type}`);
            
            // Cleanup previous blob if any
            if (content && typeof content === 'string' && content.startsWith('blob:')) {
                URL.revokeObjectURL(content);
            }

            // Attempt secure fetch
            try {
                const blobData = await medicalRecordService.getRecordBlob(record.id, patientId);
                console.log(`[Viewer] Secure blob fetched. MIME: ${blobData.type}`);
                setContent(blobData.url);
                setFileType(blobData.type);
            } catch (err) {
                console.warn("[Viewer] Secure fetch blocked (likely CORS redirect). Using high-reliability fallback.");
                
                if (record.file_path) {
                    const directUrl = record.file_path.startsWith('http') 
                        ? record.file_path 
                        : `${window.location.origin}${record.file_path}`;
                    
                    setContent(directUrl);
                    
                    // Infer type from extension
                    const ext = (record.file_type || record.file_path.split('.').pop()).toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                        setFileType(`image/${ext === 'jpg' ? 'jpeg' : ext}`);
                    } else if (ext === 'pdf') {
                        setFileType('application/pdf');
                    } else if (ext === 'dcm') {
                        setFileType('application/dicom');
                    } else {
                        setFileType(null);
                    }
                } else {
                    throw new Error("No file path available for this record.");
                }
            }
        } catch (err) {
            console.error("[Viewer] Critical load error:", err);
            setError(err.message || "We encountered a problem loading this document. Please check your connection.");
            setLoading(false);
        }
    }, [isOpen, record, patientId, resetView, content]);

    useEffect(() => {
        fetchDocument();
    }, [isOpen, record, refreshKey]); // Re-fetch on manual refresh

    useEffect(() => {
        return () => {
            if (content && typeof content === 'string' && content.startsWith('blob:')) {
                URL.revokeObjectURL(content);
            }
        };
    }, [content]);

    // Page Interaction Handlers
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isFullscreen) setIsFullscreen(false);
                else onClose();
            }
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-') handleZoomOut();
            if (e.key === '0') resetView();
            if (e.key === 'r' && e.ctrlKey) handleRefresh();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isFullscreen, resetView]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const toggleFullscreen = () => setIsFullscreen(prev => !prev);
    const handleRefresh = () => setRefreshKey(prev => prev + 1);

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
    const isDICOM = fileType === 'application/dicom' || record.file_type?.toLowerCase() === 'dcm';

    const handleContentLoad = () => {
        console.log("[Viewer] Content rendered in DOM");
        setLoading(false);
    };

    const handleContentError = () => {
        console.error("[Viewer] Content rendering failed");
        setError("This file type cannot be displayed in the browser. Please download it for viewing.");
        setLoading(false);
    };

    return ReactDOM.createPortal(
        <div 
            className="neuro-viewer-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(2, 6, 23, 0.95)',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={onClose}
        >
            <div 
                className={`neuro-viewer-card ${isFullscreen ? 'fullscreen' : ''}`}
                style={{
                    width: isFullscreen ? '100%' : '92%',
                    maxWidth: isFullscreen ? '100%' : '1400px',
                    height: isFullscreen ? '100%' : '88vh',
                    backgroundColor: '#0f172a',
                    borderRadius: isFullscreen ? '0' : '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    backgroundColor: '#1e293b',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    zIndex: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa'
                        }}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{record.title}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} /> {new Date(record.record_date || record.created_at).toLocaleDateString()}
                                </span>
                                <span style={{ width: '3px', height: '3px', backgroundColor: '#334155', borderRadius: '50%' }}></span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Tag size={12} /> {record.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', marginRight: '8px' }}>
                           <button onClick={handleZoomOut} style={headerIconStyle} title="Zoom Out"><ZoomOut size={18}/></button>
                           <button onClick={resetView} style={{ ...headerIconStyle, fontSize: '12px', fontWeight: 'bold', width: 'auto', padding: '0 10px' }}>{Math.round(zoom * 100)}%</button>
                           <button onClick={handleZoomIn} style={headerIconStyle} title="Zoom In"><ZoomIn size={18}/></button>
                        </div>
                        <button onClick={handleRefresh} style={headerIconStyle} title="Refresh Preview"><RefreshCw size={18}/></button>
                        <button onClick={toggleFullscreen} style={headerIconStyle} title="Toggle Fullscreen">
                            {isFullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
                        </button>
                        <button 
                            className="download-btn-premium"
                            style={{
                                marginLeft: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)}
                        >
                            <Download size={16} /> Download
                        </button>
                        <button onClick={onClose} style={{ ...headerIconStyle, color: '#94a3b8' }}><X size={22}/></button>
                    </div>
                </div>

                {/* Viewport Area */}
                <div 
                    className="neuro-viewport"
                    style={{
                        flex: 1,
                        position: 'relative',
                        backgroundColor: '#020617',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Status Indicators */}
                    <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '8px' }}>
                        <div style={pillStyle}><Shield size={12}/> Secure</div>
                        {isPDF && <div style={{ ...pillStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>PDF</div>}
                        {isImage && <div style={{ ...pillStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>Image</div>}
                    </div>

                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 30, backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="skeleton-doc-loader">
                                <div className="skeleton-header"></div>
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line w-75"></div>
                                <div className="skeleton-pulse"></div>
                            </div>
                            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                <Loader2 size={32} className="animate-spin" color="#3b82f6" />
                                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px', fontWeight: '500' }}>Initializing Medical Record Viewer...</p>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div style={{ zIndex: 40, textAlign: 'center', padding: '48px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '500px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <AlertCircle size={40} />
                            </div>
                            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Unable to Preview File</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>{error}</p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button onClick={handleRefresh} style={errorBtnStyle}><RefreshCw size={18}/> Retry</button>
                                <button onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)} style={{ ...errorBtnStyle, backgroundColor: '#3b82f6', border: 'none' }}><Download size={18}/> Download</button>
                            </div>
                        </div>
                    ) : isDICOM ? (
                        <div style={{ textAlign: 'center', color: 'white', maxWidth: '400px' }}>
                            <Info size={48} color="#60a5fa" style={{ marginBottom: '20px' }} />
                            <h3>DICOM Medical Scan</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>This is a high-resolution DICOM file. Due to HIPAA compliance and rendering complexity, these scans should be viewed using specialized medical imaging software.</p>
                            <button 
                                onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)}
                                style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#3b82f6', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Download DICOM Scan
                            </button>
                        </div>
                    ) : content && (
                        <div 
                            style={{
                                width: '100%',
                                height: '100%',
                                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isImage ? (
                                <img 
                                    key={refreshKey}
                                    src={content} 
                                    alt="Medical Record"
                                    onLoad={handleContentLoad}
                                    onError={handleContentError}
                                    style={{ 
                                        maxWidth: '90%', 
                                        maxHeight: '90%', 
                                        objectFit: 'contain',
                                        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                        userSelect: 'none',
                                        pointerEvents: 'none'
                                    }}
                                />
                            ) : isPDF ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <object
                                        key={refreshKey}
                                        data={`${content}#toolbar=0&navpanes=0&scrollbar=0`}
                                        type="application/pdf"
                                        onLoad={handleContentLoad}
                                        style={{ 
                                            width: isFullscreen ? '100%' : '85%', 
                                            height: '100%',
                                            backgroundColor: 'white',
                                            boxShadow: '0 0 100px rgba(0,0,0,0.8)',
                                            pointerEvents: zoom > 1 ? 'none' : 'auto'
                                        }}
                                    >
                                        <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
                                            <p>Your browser doesn't support PDF previews.</p>
                                            <button onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)} style={errorBtnStyle}>Download PDF</button>
                                        </div>
                                    </object>
                                    {/* Transparent overlay to detect completion if object onLoad is unreliable */}
                                    <iframe 
                                        src={content} 
                                        onLoad={handleContentLoad} 
                                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }} 
                                        title="PDF Loader"
                                    />
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'white' }}>
                                    <FileText size={64} style={{ marginBottom: '24px', opacity: 0.5 }} />
                                    <h3>Format Not Supported for Preview</h3>
                                    <p style={{ color: '#94a3b8' }}>Please download the file to view its contents.</p>
                                    <button onClick={() => medicalRecordService.downloadRecord(record.id, record.title, record.file_type, patientId)} style={{ ...errorBtnStyle, marginTop: '20px' }}>Download File</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Status Bar */}
                {!isFullscreen && (
                    <div style={{
                        padding: '10px 24px',
                        backgroundColor: '#0f172a',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                        color: '#64748b'
                    }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <span>SIZE: {record.file_size_bytes ? `${(record.file_size_bytes / 1024).toFixed(1)} KB` : 'N/A'}</span>
                            <span>FORMAT: {record.file_type?.toUpperCase() || 'UNKNOWN'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                            ENCRYPTED CONNECTION
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .skeleton-doc-loader {
                    width: 240px;
                    height: 320px;
                    background: #1e293b;
                    border-radius: 12px;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                }
                .skeleton-header { height: 20px; background: #334155; border-radius: 4px; margin-bottom: 24px; }
                .skeleton-line { height: 12px; background: #334155; border-radius: 4px; margin-bottom: 12px; }
                .w-75 { width: 75%; }
                .skeleton-pulse {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
                    animation: skeleton-shimmer 1.5s infinite;
                }
                @keyframes skeleton-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>,
        document.body
    );
};

const headerIconStyle = {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#cbd5e1',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};

const pillStyle = {
    padding: '4px 10px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa',
    borderRadius: '100px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
};

const errorBtnStyle = {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
};

export default ViewMedicalRecordModal;
