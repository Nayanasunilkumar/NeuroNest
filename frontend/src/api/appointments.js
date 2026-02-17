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

export const rescheduleAppointment = async (id, date, time) => {
  const response = await axios.put(`/appointments/${id}/reschedule`, {
    date,
    time
  });
  return response.data;
};

export const getDoctors = async () => {
  const response = await axios.get("/appointments/doctors");
  return response.data;
};
