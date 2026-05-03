import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const API_URL = `${API_BASE_URL}/api/admin/doctors`;

const getAuthHeader = () => {
    const token = localStorage.getItem('neuronest_token');
    return { Authorization: `Bearer ${token}` };
};

export const fetchDoctors = async (params = {}) => {
    const response = await axios.get(`${API_URL}/`, {
        headers: getAuthHeader(),
        params
    });
    return response.data;
};

export const fetchDoctorDetail = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const createDoctor = async (doctorData) => {
    const response = await axios.post(`${API_URL}/`, doctorData, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const verifyDoctor = async (id, status = true) => {
    const response = await axios.patch(`${API_URL}/${id}/verify`, {}, {
        headers: getAuthHeader(),
        params: { status }
    });
    return response.data;
};

export const deleteDoctor = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateDoctorStatus = async (id, statusData) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, statusData, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const fetchSpecialties = async () => {
    const response = await axios.get(`${API_URL}/specialties`, {
        headers: getAuthHeader()
    });
    return response.data;
};
