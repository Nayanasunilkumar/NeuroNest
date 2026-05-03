import { useState, useEffect, useCallback } from 'react';
import { doctorFeedbackService } from '../services/doctorFeedbackService';

export const useDoctorFeedback = (doctorId) => {
  const [summary, setSummary]           = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [trend, setTrend]               = useState([]);
  const [tags, setTags]                 = useState([]);
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchAll = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const [s, d, tr, tg, rv] = await Promise.all([
        doctorFeedbackService.getSummary(doctorId),
        doctorFeedbackService.getDistribution(doctorId),
        doctorFeedbackService.getTrend(doctorId),
        doctorFeedbackService.getTags(doctorId),
        doctorFeedbackService.getReviews(doctorId),
      ]);
      setSummary(s);
      setDistribution(d);
      setTrend(tr);
      setTags(tg);
      setReviews(rv);
    } catch (err) {
      setError(err.message || 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { summary, distribution, trend, tags, reviews, loading, error, refresh: fetchAll };
};
