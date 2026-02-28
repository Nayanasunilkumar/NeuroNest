import axios from "./axios";

export const bookAppointment = async (data) => {
  const response = await axios.post("/appointments/", data);
  return response.data;
};

export const getAppointments = async (status_filter = "") => {
  const url = status_filter 
    ? `/appointments/?status=${status_filter}` 
    : "/appointments/";
  const response = await axios.get(url);
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await axios.put(`/appointments/${id}/cancel`);
  return response.data;
};

export const rescheduleAppointment = async (id, date, time, slotId = null) => {
  const payload = { date, time };
  if (slotId) payload.slot_id = slotId;
  const response = await axios.put(`/appointments/${id}/reschedule`, payload);
  return response.data;
};

export const getDoctors = async () => {
  const response = await axios.get("/appointments/doctors");
  return response.data;
};

export const getAvailableSlots = async (doctorId, date) => {
  const response = await axios.get(`/appointments/doctors/${doctorId}/available-slots?date=${date}`);
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
  };
};

export const bookAppointmentBySlot = async (data) => {
  const response = await axios.post("/appointments/book-by-slot", data);
  return response.data;
};
