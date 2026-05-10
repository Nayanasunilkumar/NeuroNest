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

const extensionFromType = (value) => {
  const type = String(value || "").toLowerCase();
  if (!type) return "";
  if (type.includes("pdf")) return "pdf";
  if (type.includes("png")) return "png";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  if (type.includes("wordprocessingml") || type.includes("docx")) return "docx";
  if (type.includes("msword") || type === "doc") return "doc";
  if (!type.includes("/") && /^[a-z0-9]+$/.test(type)) return type;
  return "";
};

const filenameFromDisposition = (disposition) => {
  const match = String(disposition || "").match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  return match ? decodeURIComponent(match[1].replace(/"/g, "").trim()) : "";
};

const safeFilename = (title, fileType, contentType = "") => {
  const ext = extensionFromType(fileType) || extensionFromType(contentType) || "pdf";
  const safeTitle = (title || "Medical_Record").replace(/\s+/g, "_").replace(/[^a-z0-9_.-]/gi, "");
  return safeTitle.toLowerCase().endsWith(`.${ext}`) ? safeTitle : `${safeTitle}.${ext}`;
};

const triggerAnchorDownload = (href, filename, { newTab = false } = {}) => {
  const link = document.createElement("a");
  link.href = href;
  if (filename) link.setAttribute("download", filename);
  if (newTab) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const toCloudinaryAttachmentUrl = (url) => {
  if (!url || !url.includes("cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/fl_attachment/")) return url;
  if (url.includes("/upload/fl_inline/")) return url.replace("/upload/fl_inline/", "/upload/fl_attachment/");
  return url.replace("/upload/", "/upload/fl_attachment/", 1);
};

const isJsonBlob = (response) => String(response.headers?.["content-type"] || "").includes("application/json");


// Download Record
const downloadRecord = async (recordOrId, titleOrPatientId = null, fileType = null, patientId = null) => {
  const record = typeof recordOrId === "object" && recordOrId !== null ? recordOrId : null;
  const recordId = record?.id ?? recordOrId;
  const title = record ? record.title : titleOrPatientId;
  const resolvedFileType = record ? record.file_type : fileType;
  const resolvedPatientId = record ? titleOrPatientId : patientId;
  const endpoint = resolvedPatientId
    ? `/api/patient/doctor/patients/${resolvedPatientId}/medical-records/${recordId}/download`
    : `/api/patient/medical-records/${recordId}/download`;

  try {
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });

    if (isJsonBlob(response)) {
      const message = await response.data.text();
      throw new Error(message || "Download returned an error response.");
    }
    
    const file = new Blob([response.data], { type: response.headers['content-type'] });
    const fileURL = URL.createObjectURL(file);
    const headerFilename = filenameFromDisposition(response.headers["content-disposition"]);
    triggerAnchorDownload(fileURL, headerFilename || safeFilename(title, resolvedFileType, response.headers["content-type"]));
    window.setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    return true;
  } catch (error) {
    console.error("Download failed", error);

    try {
      const viewData = await getRecordViewUrl(recordId, resolvedPatientId);
      const fileUrl = toCloudinaryAttachmentUrl(viewData.file_url || record?.file_path);
      if (!fileUrl) throw new Error("No downloadable file URL found.");
      triggerAnchorDownload(fileUrl, safeFilename(viewData.title || title, viewData.file_type || resolvedFileType), { newTab: true });
      return true;
    } catch (fallbackError) {
      console.error("Direct file download fallback failed", fallbackError);
      throw fallbackError;
    }
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
