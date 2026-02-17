import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const BASE_URL = API_BASE_URL;
const API_URL = `${BASE_URL}/prescriptions`;

// Helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem('neuronest_token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const prescriptionService = {
    // New: Fetch Patient Dossier (Profile + Timeline)
    getPatientDossier: async (patientId) => {
        const response = await axios.get(`${BASE_URL}/doctor/patients/${patientId}/dossier`, getAuthHeaders());
        return response.data;
    },

    // 1. Create Prescription (Doctor)
    createPrescription: async (data) => {
        const response = await axios.post(`${API_URL}/`, data, getAuthHeaders());
        return response.data;
    },

    // 2. Get Doctor's Prescriptions
    getDoctorPrescriptions: async () => {
        const response = await axios.get(`${API_URL}/doctor`, getAuthHeaders());
        return response.data;
    },

    // 2.5 Get Prescriptions for Specific Patient (Doctor View)
    getPrescriptionsByPatient: async (patientId) => {
        const response = await axios.get(`${API_URL}/doctor/patient/${patientId}`, getAuthHeaders());
        return response.data;
    },

    // 3. Get Patient's Prescriptions
    getPatientPrescriptions: async () => {
        const response = await axios.get(`${API_URL}/patient`, getAuthHeaders());
        return response.data;
    },

    // 4. Get Single Prescription Details
    getPrescriptionDetails: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    },

    // 5. Update Status (Doctor)
    updateStatus: async (id, status) => {
        const response = await axios.put(`${API_URL}/${id}/status`, { status }, getAuthHeaders());
        return response.data;
    },

    // 5.5 Update Full Prescription (Doctor)
    updatePrescription: async (id, data) => {
        const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
        return response.data;
    },

    // 6. Delete Prescription (Doctor)
    deletePrescription: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    }
};

export default prescriptionService;
