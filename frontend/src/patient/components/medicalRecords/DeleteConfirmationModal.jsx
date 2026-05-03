import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, record }) => {
    if (!isOpen || !record) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content delete-record-modal">
                <div className="delete-modal-icon-wrap">
                    <AlertTriangle size={36} />
                </div>
                
                <h2 className="delete-modal-title">Delete Record?</h2>
                <p className="delete-modal-copy">
                    You are about to permanently remove this record:
                </p>
                <div className="delete-modal-record-chip" title={record.title}>
                    "{record.title}"
                </div>
                <p className="delete-modal-warning">
                    This action cannot be undone.
                </p>

                <div className="delete-modal-actions">
                    <button 
                        onClick={onClose}
                        className="delete-modal-btn delete-modal-btn-secondary"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="delete-modal-btn delete-modal-btn-danger"
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
