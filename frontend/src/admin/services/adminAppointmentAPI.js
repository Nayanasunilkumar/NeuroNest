import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const API_URL = `${API_BASE_URL}/api/admin/appointments`;

const getAuthHeader = () => {
    const token = localStorage.getItem('neuronest_token');
    return { Authorization: `Bearer ${token}` };
};

export const fetchAdminAppointments = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/`, {
            params,
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch institutional appointments', error);
        throw error;
    }
};

export const fetchSectors = async () => {
    const response = await axios.get(`${API_URL}/sectors`, { headers: getAuthHeader() });
    return response.data;
};

export const fetchDepartments = async (sector) => {
    const response = await axios.get(`${API_URL}/departments`, { 
        params: { sector },
        headers: getAuthHeader() 
    });
    return response.data;
};

export const fetchDoctorsBySpecialty = async (sector, department) => {
    const response = await axios.get(`${API_URL}/doctors`, {
        params: { sector, department },
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateAppointmentStatus = async (id, status, notes = "") => {
    try {
        const response = await axios.patch(`${API_URL}/${id}/status`, 
            { status, notes },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to update institutional appointment status', error);
        throw error;
    }
};
