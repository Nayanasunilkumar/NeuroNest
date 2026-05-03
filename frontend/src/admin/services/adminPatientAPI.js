import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const API_URL = `${API_BASE_URL}/api/admin/patients`;

const getAuthHeader = () => {
  const token = localStorage.getItem('neuronest_token'); // Fix: Correct token key
  return { Authorization: `Bearer ${token}` };
};

export const fetchPatients = async (params = {}) => {
  const response = await axios.get(`${API_URL}/`, {
    headers: getAuthHeader(),
    params
  });
  return response.data;
};

export const fetchPatientDetail = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updatePatientStatus = async (id, statusData) => {
  const response = await axios.patch(`${API_URL}/${id}/status`, statusData, {
    headers: getAuthHeader()
  });
  return response.data;
};
