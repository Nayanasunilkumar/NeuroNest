import { API_BASE_URL } from "../config/env";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("neuronest_token")}`,
});

const baseUrl = API_BASE_URL;

export async function getMonitoredPatients() {
  const res = await fetch(`${baseUrl}/api/vitals/patients`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch monitored patients");
  return res.json();
}

export async function getLatestVitals(patientId) {
  const url = patientId
    ? `${baseUrl}/api/vitals/latest?patient_id=${patientId}`
    : `${baseUrl}/api/vitals/latest`;
  const res = await fetch(url, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch vitals");
  return res.json();
}

export async function getVitalsHistory(patientId) {
  const url = patientId
    ? `${baseUrl}/api/vitals/history?patient_id=${patientId}`
    : `${baseUrl}/api/vitals/history`;
  const res = await fetch(url, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch vitals history");
  return res.json();
}

export async function downloadAssessmentReport(patientId) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let urlWithTz = `${baseUrl}/api/vitals/assessment-report?tz=${encodeURIComponent(tz)}`;
  if (patientId) {
    urlWithTz += `&patient_id=${patientId}`;
  }
  
  const fetchBlob = async (url) => {
    const res = await fetch(url, { headers: authHeader() });
    if (!res.ok) {
      const tex = await res.text().catch(() => "");
      throw new Error(`Failed to download assessment report (${res.status}): ${tex}`);
    }
    return res.blob();
  };

  try {
    return await fetchBlob(urlWithTz);
  } catch (err) {
    // If timezone caused an issue, retry without tz parameter.
    try {
      return await fetchBlob(`${baseUrl}/api/vitals/assessment-report`);
    } catch (err2) {
      throw err;
    }
  }
}
