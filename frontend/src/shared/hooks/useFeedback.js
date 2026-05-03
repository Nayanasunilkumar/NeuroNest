import { useState, useEffect, useCallback } from 'react';
import { feedbackService } from '../services/feedbackService';

export const useFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_feedback_filters');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      // Never restore is_flagged from localStorage — it caused reviews to be hidden
      const { is_flagged, ...safe } = parsed;
      return safe;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('admin_feedback_filters', JSON.stringify(filters));
  }, [filters]);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.all([
        feedbackService.getReviews(filters),
        feedbackService.getReviewStats()
      ]);
      setReviews(reviewsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const moderateReview = async (reviewId, moderationData) => {
    try {
      const result = await feedbackService.moderateReview(reviewId, moderationData);
      await fetchFeedback(); // Refresh data
      // Normalize: Backend returns { ok: true }, frontend expects { success: true }
      return { success: result.ok || result.success || false, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    reviews,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    moderateReview,
    refresh: fetchFeedback
  };
};
