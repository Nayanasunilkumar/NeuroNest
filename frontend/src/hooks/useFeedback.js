import { useState, useEffect, useCallback } from 'react';
import { feedbackService } from '../services/feedbackService';

export const useFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      await feedbackService.moderateReview(reviewId, moderationData);
      await fetchFeedback(); // Refresh data
      return { success: true };
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
