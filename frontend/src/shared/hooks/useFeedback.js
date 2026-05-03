import { useState, useEffect, useCallback } from 'react';
import { feedbackService } from '../services/feedbackService';

export const useFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Always start with empty filters — never restore from localStorage
  // Stale saved filters (e.g. days=7, is_flagged=false) were hiding most reviews
  const [filters, setFilters] = useState({});


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
