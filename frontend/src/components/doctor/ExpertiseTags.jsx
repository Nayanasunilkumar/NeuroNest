import React, { useState } from 'react';
import { Award, Plus, X } from 'lucide-react';

const ExpertiseTags = ({ tags, onAddTag, onRemoveTag, isEditing }) => {
    const [newTag, setNewTag] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleAdd = () => {
        if (newTag.trim()) {
            onAddTag(newTag.trim());
            setNewTag('');
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        Expertise
                        <Award size={18} className="text-warning" />
                    </h3>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    {tags && tags.length > 0 ? (
                        tags.map((tag, idx) => {
                            const tagName = typeof tag === 'object' ? tag.tag_name : tag;
                            return (
                                <span key={idx} className="badge bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-medium fs-6">
                                    {tagName}
                                    {isEditing && (
                                        <X 
                                            size={14} 
                                            className="text-danger cursor-pointer ms-1 hover-opacity-75" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => onRemoveTag(tagName)}
                                        />
                                    )}
                                </span>
                            );
                        })
                    ) : (
                        !isEditing && <span className="text-muted small fst-italic">No expertise tags added.</span>
                    )}
                    
                    {isEditing && (
                        <div className="d-flex align-items-center ms-1">
                            <div className="input-group input-group-sm rounded-pill overflow-hidden border">
                                <input 
                                    type="text" 
                                    className="form-control border-0 shadow-none bg-light" 
                                    placeholder="Type & Enter..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{ width: '130px', fontSize: '0.875rem' }}
                                />
                                <button 
                                    className="btn btn-light border-0 d-flex align-items-center justify-content-center px-2 text-primary hover-bg-light"
                                    onClick={handleAdd}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpertiseTags;
