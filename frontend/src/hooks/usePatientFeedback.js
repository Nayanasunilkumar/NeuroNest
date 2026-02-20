import { useState, useEffect, useCallback, useMemo } from 'react';
import { patientFeedbackService } from '../services/patientFeedbackService';
import { getToken, getUser } from '../utils/auth';

const getPatientId = () => {
  try {
    const user = getUser(); // reads from neuronest_user
    return user?.id || null;
  } catch { return null; }
};

export const usePatientFeedback = () => {
  const patientId = useMemo(getPatientId, []);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews]           = useState([]);
  const [complaints, setComplaints]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchAll = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const [appts, revs, comps] = await Promise.all([
        patientFeedbackService.getEligibleAppointments(),
        patientFeedbackService.getMyReviews(patientId),
        patientFeedbackService.getMyComplaints(patientId),
      ]);
      setAppointments(appts);
      setReviews(Array.isArray(revs) ? revs : []);
      setComplaints(Array.isArray(comps) ? comps : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const submitReview = useCallback(async (payload) => {
    await patientFeedbackService.submitReview({ ...payload, patient_id: patientId });
    await fetchAll();
  }, [patientId, fetchAll]);

  const editReview = useCallback(async (reviewId, payload) => {
    await patientFeedbackService.editReview(reviewId, { ...payload, patient_id: patientId });
    await fetchAll();
  }, [patientId, fetchAll]);

  return { patientId, appointments, reviews, complaints, loading, error, submitReview, editReview, refresh: fetchAll };
};
