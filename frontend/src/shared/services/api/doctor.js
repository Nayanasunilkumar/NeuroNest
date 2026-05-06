import axios from "./axios";

const DOCTOR_API = "/api/doctor";

export const getAppointmentRequests = async () => {
  const response = await axios.get(`${DOCTOR_API}/appointment-requests`);
  return response.data;
};

export const approveAppointment = async (id) => {
  const response = await axios.patch(`${DOCTOR_API}/appointments/${id}/approve`);
  return response.data;
};

export const rejectAppointment = async (id) => {
  const response = await axios.patch(`${DOCTOR_API}/appointments/${id}/reject`);
  return response.data;
};

export const rescheduleAppointment = async (id, date, time, consultationType = null) => {
  const payload = {
    appointment_date: date,
    appointment_time: time,
  };
  if (consultationType) {
    payload.consultation_type = consultationType;
  }
  const response = await axios.patch(`${DOCTOR_API}/appointments/${id}/reschedule`, payload);
  return response.data;
};

export const getSchedule = async (date = null, status = 'all', fallback = null) => {
  let url = `${DOCTOR_API}/schedule`;
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (status) params.append("status", status);
  if (fallback) params.append("fallback", fallback);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await axios.get(url);
  return response.data;
};

export const getScheduleSlots = async (date) => {
  const response = await axios.get(`${DOCTOR_API}/schedule/slots?date=${date}`);
  return response.data;
};

export const generateScheduleSlots = async (horizonDays = 60) => {
  const response = await axios.post(`${DOCTOR_API}/schedule/generate`, { horizon_days: horizonDays });
  return response.data;
};

export const getScheduleSettings = async () => {
  const response = await axios.get(`${DOCTOR_API}/schedule/settings`);
  return response.data;
};

export const updateScheduleSettings = async (payload) => {
  const response = await axios.put(`${DOCTOR_API}/schedule/settings`, payload);
  return response.data;
};

export const blockSlot = async (slotId) => {
  const response = await axios.patch(`${DOCTOR_API}/slots/${slotId}/block`);
  return response.data;
};

export const unblockSlot = async (slotId) => {
  const response = await axios.patch(`${DOCTOR_API}/slots/${slotId}/unblock`);
  return response.data;
};

export const getScheduleOverrides = async (date = null) => {
  const suffix = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await axios.get(`${DOCTOR_API}/schedule/overrides${suffix}`);
  return response.data;
};

export const createScheduleOverride = async (payload) => {
  const response = await axios.post(`${DOCTOR_API}/schedule/overrides`, payload);
  return response.data;
};

export const deleteScheduleOverride = async (overrideId) => {
  const response = await axios.delete(`${DOCTOR_API}/schedule/overrides/${overrideId}`);
  return response.data;
};

export const extendAppointment = async (appointmentId, minutes) => {
  const response = await axios.post(`${DOCTOR_API}/appointments/${appointmentId}/extend`, { minutes });
  return response.data;
};

export const completeAppointment = async (id) => {
  const response = await axios.patch(`${DOCTOR_API}/appointments/${id}/complete`);
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await axios.patch(`${DOCTOR_API}/appointments/${id}/cancel`);
  return response.data;
};

export const markNoShow = async (id) => {
  const response = await axios.patch(`${DOCTOR_API}/appointments/${id}/no-show`);
  return response.data;
};

export const getDoctorAppointmentCallState = async (id) => {
  const response = await axios.get(`${DOCTOR_API}/appointments/${id}/call-state`);
  return response.data;
};

export const joinDoctorAppointmentCall = async (id) => {
  const response = await axios.post(`${DOCTOR_API}/appointments/${id}/join-call`);
  return response.data;
};

export const leaveDoctorAppointmentCall = async (id) => {
  const response = await axios.post(`${DOCTOR_API}/appointments/${id}/leave-call`);
  return response.data;
};

export const getAppointmentHistory = async () => {
  const response = await axios.get(`${DOCTOR_API}/appointments/history`);
  return response.data;
};

export const getDoctorStats = async () => {
  const response = await axios.get(`${DOCTOR_API}/stats`);
  return response.data;
};

export const getPatients = async () => {
  const response = await axios.get(`${DOCTOR_API}/patients`);
  return response.data;
};

export const getPatientRecords = async (patientId) => {
  const response = await axios.get(`${DOCTOR_API}/patients/${patientId}/records`);
  return response.data;
};

export const getPatientDossier = async (patientId) => {
  const response = await axios.get(`${DOCTOR_API}/patients/${patientId}/dossier`);
  return response.data;
};

export const saveClinicalRemark = async (patientId, content) => {
  const response = await axios.post(`${DOCTOR_API}/patients/${patientId}/remarks`, { content });
  return response.data;
};

export const getClinicalRemarks = async (patientId) => {
  const response = await axios.get(`${DOCTOR_API}/patients/${patientId}/remarks`);
  return response.data;
};

// ============================================
// DOCTOR SETTINGS API (New Refactored Routes)
// ============================================

export const getAllDoctorSettings = async () => {
  const response = await axios.get("/api/doctor/settings/");
  return response.data;
};

export const updateDoctorScheduleConfig = async (payload) => {
  const response = await axios.put("/api/doctor/settings/schedule", payload);
  return response.data;
};

export const updateDoctorNotificationSettings = async (payload) => {
  const response = await axios.put("/api/doctor/settings/notifications", payload);
  return response.data;
};

export const updateDoctorPrivacySettings = async (payload) => {
  const response = await axios.put("/api/doctor/settings/privacy", payload);
  return response.data;
};

export const updateDoctorConsultationSettings = async (payload) => {
  const response = await axios.put("/api/doctor/settings/consultation", payload);
  return response.data;
};

export const updateDoctorAccount = async (payload) => {
  const response = await axios.put("/api/doctor/settings/account", payload);
  return response.data;
};

export const changeDoctorPassword = async (payload) => {
  const response = await axios.post("/api/doctor/settings/change-password", payload);
  return response.data;
};

// ============================================
// CLINICAL PINS API
// ============================================

export const getClinicalPins = async () => {
  const response = await axios.get(`${DOCTOR_API}/pins`);
  return response.data;
};

export const createClinicalPin = async (payload) => {
  const response = await axios.post(`${DOCTOR_API}/pins`, payload);
  return response.data;
};

export const updateClinicalPin = async (id, payload) => {
  const response = await axios.patch(`${DOCTOR_API}/pins/${id}`, payload);
  return response.data;
};

export const deleteClinicalPin = async (id) => {
  const response = await axios.delete(`${DOCTOR_API}/pins/${id}`);
  return response.data;
};
