import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const API_URL = `${API_BASE_URL}/api/doctor/profile`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('neuronest_token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getDoctorProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/me`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        throw error;
    }
};

export const updateDoctorProfile = async (data) => {
    try {
        const response = await axios.put(`${API_URL}/me`, data, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        throw error;
    }
};

export const uploadProfileImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const config = {
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'multipart/form-data'
            }
        };
        
        const response = await axios.post(`${API_URL}/image`, formData, config);
        return response.data;
    } catch (error) {
        console.error("Error uploading profile image:", error);
        throw error;
    }
};

export const addAvailabilitySlot = async (slot) => {
    try {
        const response = await axios.post(`${API_URL}/availability`, slot, getAuthHeaders());
        return response.data; // Returns updated profile
    } catch (error) {
        console.error("Error adding availability:", error);
        throw error;
    }
};

export const deleteAvailabilitySlot = async (slotId) => {
    try {
        const response = await axios.delete(`${API_URL}/availability/${slotId}`, getAuthHeaders());
        return response.data; // Returns updated profile
    } catch (error) {
        console.error("Error deleting availability:", error);
        throw error;
    }
};
