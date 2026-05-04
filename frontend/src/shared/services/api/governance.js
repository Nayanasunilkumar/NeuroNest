import api from "./axios";

export const governanceApi = {
    getEscalations: async (status = 'open') => {
        const response = await api.get(`/api/admin/governance/escalations?status=${status}`);
        return response.data;
    },
    getEscalationDetails: async (id) => {
        const response = await api.get(`/api/admin/governance/escalations/${id}`);
        return response.data;
    },
    takeAction: async (id, actionData) => {
        const response = await api.post(`/api/admin/governance/escalations/${id}/action`, actionData);
        return response.data;
    },
    getDoctorGovernance: async (doctorId) => {
        const response = await api.get(`/api/admin/governance/doctor/${doctorId}/governance`);
        return response.data;
    },
    takeDoctorAction: async (doctorId, actionData) => {
        const response = await api.post(`/api/admin/governance/doctor/${doctorId}/action`, actionData);
        return response.data;
    }
};
