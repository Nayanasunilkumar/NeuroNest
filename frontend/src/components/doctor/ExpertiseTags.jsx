import React, { useState } from 'react';
import '../../styles/doctor-profile-premium.css';
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
        <div className="expertise-card">
            <div className="card-heading">
                <span>Expertise</span>
                <Award size={18} className="text-amber-500" />
            </div>

            <div className="skill-tags-wrapper">
                {tags && tags.length > 0 ? (
                    tags.map((tag, idx) => {
                        // Handle both string tags and object tags {tag_name: "X"}
                        const tagName = typeof tag === 'object' ? tag.tag_name : tag;
                        return (
                            <span key={idx} className="skill-tag">
                                {tagName}
                                {isEditing && (
                                    <X 
                                        size={14} 
                                        className="delete-tag" 
                                        onClick={() => onRemoveTag(tagName)}
                                    />
                                )}
                            </span>
                        );
                    })
                ) : (
                    !isEditing && <span className="text-xs text-slate-400 italic">No expertise tags added.</span>
                )}
                
                {isEditing && (
                    <div className="add-tag-wrapper">
                        <input 
                            type="text" 
                            className="add-tag-input" 
                            placeholder="Type & Enter..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button 
                            className="add-tag-btn"
                            onClick={handleAdd}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpertiseTags;
