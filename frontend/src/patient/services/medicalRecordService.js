import api from "../../shared/services/api/axios";
import axios from "axios";
import { API_BASE_URL } from "../../config/env";

// Upload Record
const uploadRecord = async (formData, patientId = null) => {
  const token = localStorage.getItem("neuronest_token");
  const baseURL = api.defaults.baseURL || API_BASE_URL;
  const url = patientId 
    ? `${baseURL}/api/patient/doctor/patients/${patientId}/medical-records`
    : `${baseURL}/api/patient/medical-records`;
  
  // Use raw axios to bypass default headers (fixing multipart boundary issue)
  const response = await axios.post(url, formData, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return response.data;
};

// Get All Records
const getRecords = async (patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/medical-records` : "/api/patient/medical-records";
  const response = await api.get(url);
  return response.data;
};

// Get Summary
const getSummary = async (patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/medical-records/summary` : "/api/patient/medical-records/summary";
  const response = await api.get(url);
  return response.data;
};

const getAllergies = async (patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/allergies` : "/api/patient/allergies";
  const separator = url.includes('?') ? '&' : '?';
  // Add cache-busting so stale CDN/browser responses don't hide inactive rows.
  const response = await api.get(`${url}${separator}include_inactive=true&_ts=${Date.now()}`);
  return response.data;
};

const addAllergy = async (payload, patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/allergies` : "/api/patient/allergies";
  const response = await api.post(url, payload);
  return response.data;
};

const deleteAllergy = async (id, patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/allergies/${id}` : `/api/patient/allergies/${id}`;
  const response = await api.delete(url);
  return response.data;
};

const getConditions = async (patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/conditions` : "/api/patient/conditions";
  const separator = url.includes('?') ? '&' : '?';
  const response = await api.get(`${url}${separator}include_inactive=true`);
  return response.data;
};

const addCondition = async (payload, patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/conditions` : "/api/patient/conditions";
  const response = await api.post(url, payload);
  return response.data;
};

const deleteCondition = async (id, patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/conditions/${id}` : `/api/patient/conditions/${id}`;
  const response = await api.delete(url);
  return response.data;
};

const getMedications = async (patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/medications` : "/api/patient/medications";
  const separator = url.includes('?') ? '&' : '?';
  const response = await api.get(`${url}${separator}include_inactive=true`);
  return response.data;
};

const addMedication = async (payload, patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/medications` : "/api/patient/medications";
  const response = await api.post(url, payload);
  return response.data;
};

const deleteMedication = async (id, patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/medications/${id}` : `/api/patient/medications/${id}`;
  const response = await api.delete(url);
  return response.data;
};

// Delete Record
const deleteRecord = async (id, patientId = null) => {
  const url = patientId ? `/api/patient/doctor/patients/${patientId}/medical-records/${id}` : `/api/patient/medical-records/${id}`;
  const response = await api.delete(url);
  return response.data;
};

// Get Record Blob for Viewing
const getRecordBlob = async (recordId, patientId = null) => {
    try {
        const url = patientId ? `/api/patient/doctor/patients/${patientId}/medical-records/${recordId}/download` : `/api/patient/medical-records/${recordId}/download`;
        const response = await api.get(url, {
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

// Get the direct Cloudinary file URL as JSON (no CORS redirect issues)
const getRecordViewUrl = async (recordId, patientId = null) => {
    const url = patientId
        ? `/api/patient/doctor/patients/${patientId}/medical-records/${recordId}/view-url`
        : `/api/patient/medical-records/${recordId}/view-url`;
    const response = await api.get(url);
    return response.data; // { file_url, file_type, title }
};


// Download Record
const downloadRecord = async (recordId, title, fileType, patientId = null) => {
  try {
    const url = patientId ? `/api/patient/doctor/patients/${patientId}/medical-records/${recordId}/download` : `/api/patient/medical-records/${recordId}/download`;
    
    // Check if we already have a record with an external file_path in our cache or passed in
    // But since we only have recordId, we might need to fetch metadata first or just try the API.
    // For now, let's make the API call more resilient.
    
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    const file = new Blob([response.data], { type: response.headers['content-type'] });
    const fileURL = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileURL;
    
    let ext = fileType || response.headers["content-type"]?.split("/")[1] || "pdf";
    ext = ext.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    
    link.setAttribute('download', `${(title || 'Medical_Record').replace(/\s+/g, '_')}.${ext}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    URL.revokeObjectURL(fileURL);
    return true;
  } catch (error) {
    console.error("Download failed", error);
    // FALLBACK: If axios fails (likely CORS), try opening the download URL in a new tab
    // The browser will handle the redirect and download directly without Authorization header issues
    const baseURL = api.defaults.baseURL || "";
    const endpoint = patientId ? `/api/patient/doctor/patients/${patientId}/medical-records/${recordId}/download` : `/api/patient/medical-records/${recordId}/download`;
    window.open(`${baseURL}${endpoint}`, '_blank');
    return true;
  }
};

const medicalRecordService = {
  uploadRecord,
  getRecords,
  getSummary,
  getAllergies,
  addAllergy,
  deleteAllergy,
  getConditions,
  addCondition,
  deleteCondition,
  getMedications,
  addMedication,
  deleteMedication,
  deleteRecord,
  downloadRecord,
  getRecordBlob,
  getRecordViewUrl
};

export default medicalRecordService;
