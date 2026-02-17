import api from "../api/axios";
import axios from "axios";
import { API_BASE_URL } from "../config/env";

// Upload Record
const uploadRecord = async (formData) => {
  const token = localStorage.getItem("neuronest_token");
  const baseURL = api.defaults.baseURL || API_BASE_URL;
  
  // Use raw axios to bypass default headers (fixing multipart boundary issue)
  const response = await axios.post(`${baseURL}/medical-records/`, formData, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return response.data;
};

// Get All Records
const getRecords = async () => {
  const response = await api.get("/medical-records/");
  return response.data;
};

// Delete Record
const deleteRecord = async (id) => {
  const response = await api.delete(`/medical-records/${id}`);
  return response.data;
};

// Get Record Blob for Viewing
const getRecordBlob = async (file_path) => {
    try {
        const filename = file_path.split('/').pop();
        const response = await api.get(`/medical-records/download/${filename}`, {
            responseType: 'blob',
        });
        return {
            url: URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] })),
            type: response.headers['content-type']
        };
    } catch (error) {
        console.error("View failed", error);
        throw error;
    }
};

// Download Record
const downloadRecord = async (file_path, title) => {
  try {
    const filename = file_path.split('/').pop();
    const response = await api.get(`/medical-records/download/${filename}`, {
      responseType: 'blob',
    });
    
    const file = new Blob([response.data], { type: response.headers['content-type'] });
    const fileURL = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileURL;
    
    // Ext
    let ext = filename.split('.').pop();
    // Verify ext length to avoid junk
    if (ext.length > 4) ext = "pdf"; // fallback

    link.setAttribute('download', `${title || 'Medical_Record'}.${ext}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    URL.revokeObjectURL(fileURL);
    return true;
  } catch (error) {
    console.error("Download failed", error);
    throw error;
  }
};

const medicalRecordService = {
  uploadRecord,
  getRecords,
  deleteRecord,
  downloadRecord,
  getRecordBlob
};

export default medicalRecordService;
