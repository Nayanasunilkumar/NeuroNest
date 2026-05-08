import axios from "./axios";

export async function getMonitoredPatients() {
  const res = await axios.get("/api/vitals/patients");
  return res.data;
}

export async function getLatestVitals(patientId) {
  const url = patientId
    ? `/api/vitals/latest?patient_id=${patientId}`
    : `/api/vitals/latest`;
  const res = await axios.get(url);
  return res.data;
}

export async function getVitalsHistory(patientId) {
  const url = patientId
    ? `/api/vitals/history?patient_id=${patientId}`
    : `/api/vitals/history`;
  const res = await axios.get(url);
  return res.data;
}

export async function downloadAssessmentReport(patientId) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let urlWithTz = `/api/vitals/assessment-report?tz=${encodeURIComponent(tz)}`;
  if (patientId) {
    urlWithTz += `&patient_id=${patientId}`;
  }
  
  try {
    const response = await axios.get(urlWithTz, { responseType: 'blob' });
    return response.data;
  } catch (err) {
    // Retry without timezone if it fails
    const response = await axios.get(`/api/vitals/assessment-report${patientId ? `?patient_id=${patientId}` : ''}`, { responseType: 'blob' });
    return response.data;
  }
}
