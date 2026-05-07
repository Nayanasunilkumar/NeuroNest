import axios from "./axios";

const APPOINTMENTS_API = "/api/appointments";

export const bookAppointment = async (data) => {
  const response = await axios.post(`${APPOINTMENTS_API}/`, data);
  return response.data;
};

export const getAppointments = async (status_filter = "") => {
  const url = status_filter 
    ? `${APPOINTMENTS_API}/?status=${status_filter}` 
    : `${APPOINTMENTS_API}/`;
  const response = await axios.get(url);
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await axios.put(`${APPOINTMENTS_API}/${id}/cancel`);
  return response.data;
};

export const rescheduleAppointment = async (id, date, time, slotId = null) => {
  const payload = { date, time };
  if (slotId) payload.slot_id = slotId;
  const response = await axios.put(`${APPOINTMENTS_API}/${id}/reschedule`, payload);
  return response.data;
};

export const confirmReschedule = async (id) => {
  const response = await axios.post(`${APPOINTMENTS_API}/${id}/confirm-reschedule`);
  return response.data;
};

export const getDoctors = async () => {
  const response = await axios.get(`${APPOINTMENTS_API}/doctors?_t=${Date.now()}`);
  return response.data;
};

export const getAvailableSlots = async (doctorId, date) => {
  const response = await axios.get(`${APPOINTMENTS_API}/doctors/${doctorId}/available-slots?date=${date}`);
  const payload = response.data;
  if (Array.isArray(payload)) {
    return {
      slots: payload,
      accepting_new_bookings: true,
      message: null,
    };
  }
  return {
    slots: Array.isArray(payload?.slots) ? payload.slots : [],
    accepting_new_bookings: payload?.accepting_new_bookings !== false,
    message: payload?.message || null,
    timezone: payload?.timezone || "Asia/Kolkata",
  };
};

export const getDoctorPublicProfile = async (doctorId) => {
  const response = await axios.get(`${APPOINTMENTS_API}/doctors/${doctorId}/profile`);
  return response.data;
};

export const bookAppointmentBySlot = async (data) => {
  const response = await axios.post(`${APPOINTMENTS_API}/book-by-slot`, data);
  return response.data;
};

export const getAppointmentCallState = async (id) => {
  const response = await axios.get(`${APPOINTMENTS_API}/${id}/call-state`);
  return response.data;
};

export const joinAppointmentCall = async (id) => {
  const response = await axios.post(`${APPOINTMENTS_API}/${id}/join-call`);
  return response.data;
};

export const leaveAppointmentCall = async (id) => {
  const response = await axios.post(`${APPOINTMENTS_API}/${id}/leave-call`);
  return response.data;
};
