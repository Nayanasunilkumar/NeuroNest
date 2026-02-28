import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';

const UploadMedicalRecordModal = ({ isOpen, onClose, onUpload }) => {
    const [title, setTitle] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [hospitalName, setHospitalName] = useState("");
    const [tags, setTags] = useState("");
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("prescription");
    const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("doctor_name", doctorName);
        formData.append("hospital_name", hospitalName);
        formData.append("category", category);
        formData.append("record_date", recordDate);
        formData.append("tags", tags);
        formData.append("notes", notes);

        try {
            await onUpload(formData);
            onClose();
            // Reset form
            setTitle("");
            setDoctorName("");
            setHospitalName("");
            setTags("");
            setNotes("");
            setFile(null);
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Upload failed";
            alert(`Upload failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Upload Medical Record</h2>
                    <button onClick={onClose} className="close-modal-btn"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-form-group">
                        <label>Record Title</label>
                        <input 
                            className="modal-input" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="e.g. Blood Test Report" 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="modal-form-group">
                            <label>Doctor Name</label>
                            <input 
                                className="modal-input" 
                                value={doctorName} 
                                onChange={(e) => setDoctorName(e.target.value)} 
                                placeholder="Dr. Smith" 
                            />
                        </div>
                        <div className="modal-form-group">
                            <label>Hospital / Facility</label>
                            <input
                                className="modal-input"
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                placeholder="City Hospital"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="modal-form-group">
                            <label>Date</label>
                            <input 
                                type="date" 
                                className="modal-input" 
                                value={recordDate} 
                                onChange={(e) => setRecordDate(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Category</label>
                        <select 
                            className="modal-select" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="prescription">Prescription</option>
                            <option value="lab">Lab Report</option>
                            <option value="scan">Scan (MRI/X-Ray)</option>
                            <option value="discharge">Discharge Summary</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="modal-form-group">
                        <label>Tags (comma separated)</label>
                        <input
                            className="modal-input"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="blood-test, annual-checkup"
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Notes</label>
                        <textarea
                            className="modal-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any important details"
                            rows={3}
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>File Upload</label>
                        <div className="file-drop-zone relative">
                            <input 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange}
                                className="file-input-overlay"
                            />
                            {file ? (
                                <div className="flex flex-col items-center text-blue-600">
                                    <CheckCircle size={32} className="mb-2" />
                                    <span className="font-semibold">{file.name}</span>
                                    <span className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload size={32} className="mb-2 text-gray-400" />
                                    <span className="font-medium text-gray-600">Click to upload or drag & drop</span>
                                    <span className="text-sm text-gray-400 mt-1">PDF, JPG, PNG, DOC (Max 15MB)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
                        disabled={loading || !file}
                    >
                        {loading ? 'Uploading...' : <><Upload size={20}/> Upload Record</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadMedicalRecordModal;
