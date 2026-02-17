import React, { useState, useEffect } from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';

// Components
import MedicalRecordTable from '../../components/patient/medicalRecords/MedicalRecordTable';
import UploadMedicalRecordModal from '../../components/patient/medicalRecords/UploadMedicalRecordModal';
import DeleteConfirmationModal from '../../components/patient/medicalRecords/DeleteConfirmationModal';
import ViewMedicalRecordModal from '../../components/patient/medicalRecords/ViewMedicalRecordModal';
import RecordFilters from '../../components/patient/medicalRecords/RecordFilters';

// Services
import medicalRecordService from '../../services/medicalRecordService';

// Styles
import '../../styles/medical-records.css';

const MedicalRecords = () => {
  // State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [recordToView, setRecordToView] = useState(null);

  // Fetch Records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordService.getRecords();
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching medical records:", err);
      setError(err.response?.data?.error || "Failed to load record content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handlers
  const handleUpload = async (formData) => {
    try {
        await medicalRecordService.uploadRecord(formData);
        fetchRecords(); // Refresh list
    } catch (err) {
        console.error("Upload failed", err);
        throw err; // Modal handles error display
    }
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
        await medicalRecordService.deleteRecord(recordToDelete.id);
        // Optimistic update
        setRecords(records.filter(r => r.id !== recordToDelete.id));
        setIsDeleteOpen(false);
        setRecordToDelete(null);
    } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete record.");
    }
  };

  const viewRecord = (record) => {
    setRecordToView(record);
    setIsViewOpen(true);
  };

  const downloadRecord = async (record) => {
    try {
        await medicalRecordService.downloadRecord(record.file_path, record.title);
    } catch {
        alert("Download failed.");
    }
  };

  // Filtering Logic
  const filteredRecords = records.filter(record => {
    const matchesSearch = (record.title && record.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (record.doctor_name && record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "All" || record.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="medical-records-container fade-in">
        {/* Header */}
        <div className="medical-header">
            <h1>
                Medical Records
            </h1>
            <button className="upload-btn" onClick={() => setIsUploadOpen(true)}>
                <Plus size={20} />
                Upload Record
            </button>
        </div>

        {/* Filters */}
        <RecordFilters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            categoryFilter={categoryFilter} 
            setCategoryFilter={setCategoryFilter} 
        />

        {/* Content */}
        {error ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-600 flex flex-col items-center gap-2">
                <AlertCircle size={32} />
                <p>{error}</p>
                <button onClick={fetchRecords} className="text-blue-600 hover:underline text-sm font-semibold mt-2">Try Again</button>
            </div>
        ) : (
            <MedicalRecordTable 
                records={filteredRecords} 
                onView={viewRecord} 
                onDelete={confirmDelete}
                onDownload={downloadRecord}
                loading={loading}
            />
        )}

        {/* Modals */}
        <UploadMedicalRecordModal 
            isOpen={isUploadOpen} 
            onClose={() => setIsUploadOpen(false)} 
            onUpload={handleUpload} 
        />
        
        <DeleteConfirmationModal 
            isOpen={isDeleteOpen} 
            onClose={() => setIsDeleteOpen(false)} 
            onConfirm={handleDelete} 
            record={recordToDelete} 
        />

        <ViewMedicalRecordModal 
            isOpen={isViewOpen} 
            onClose={() => setIsViewOpen(false)} 
            record={recordToView} 
        />
    </div>
  );
};

export default MedicalRecords;
