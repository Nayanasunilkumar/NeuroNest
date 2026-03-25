import React, { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle, Clock, Eye, Megaphone, Plus, Search, UserX } from 'lucide-react';
import { adminAnnouncementApi } from '../../api/announcementApi';
import AnnouncementTable from '../../components/announcements/AnnouncementTable';
import CreateAnnouncementModal from '../../components/announcements/CreateAnnouncementModal';
import '../../styles/admin-announcements.css';

const DEFAULT_STATS = {
  total_posts: 0,
  published: 0,
  scheduled: 0,
  archived: 0,
  total_views: 0,
  unread: 0,
};

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAnnouncementApi.getAll({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
        audience: audienceFilter || undefined,
      });

      if (Array.isArray(data)) {
        setAnnouncements(data);
        setStats({
          total_posts: data.length,
          published: data.filter((a) => a.status === 'Published').length,
          scheduled: data.filter((a) => a.status === 'Scheduled').length,
          archived: data.filter((a) => a.status === 'Archived').length,
          total_views: data.reduce((sum, a) => sum + Number(a.views_count || 0), 0),
          unread: 0,
        });
      } else {
        setAnnouncements(data.items || []);
        setStats({ ...DEFAULT_STATS, ...(data.stats || {}) });
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      const payload = err?.response?.data;
      setError((typeof payload === 'string' && payload) || payload?.error || payload?.msg || 'Failed to load announcements.');
      setAnnouncements([]);
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (selectedAnnouncement) {
        await adminAnnouncementApi.update(selectedAnnouncement.id, formData);
      } else {
        await adminAnnouncementApi.create(formData);
      }
      await fetchAnnouncements();
      setIsModalOpen(false);
      setSelectedAnnouncement(null);
    } catch (err) {
      console.error('Error saving announcement:', err);
      const payload = err?.response?.data;
      setError((typeof payload === 'string' && payload) || payload?.error || payload?.msg || 'Failed to save announcement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await adminAnnouncementApi.delete(id);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      const payload = err?.response?.data;
      setError((typeof payload === 'string' && payload) || payload?.error || payload?.msg || 'Failed to delete announcement.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAnnouncementApi.updateStatus(id, status);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Error updating status:', err);
      const payload = err?.response?.data;
      setError((typeof payload === 'string' && payload) || payload?.error || payload?.msg || 'Failed to update announcement status.');
    }
  };

  const applyClientFilter = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return announcements.filter((a) => {
      if (!q) return true;
      return (a.title || '').toLowerCase().includes(q) || (a.content || '').toLowerCase().includes(q);
    });
  }, [announcements, searchQuery]);

  return (
    <div className="admin-announcements-root">
      <div className="announcements-header">
        <div className="header-titles">
          <h1>Organization Announcements</h1>
          <p>Central communication control panel for alerts, policies, and platform updates.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setSelectedAnnouncement(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      {error && (
        <div className="alert alert-danger border-0 rounded-4 fw-semibold mb-3">{error}</div>
      )}

      <div className="announcements-stats">
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Total Posts</span>
            <Megaphone size={18} className="text-slate-400" />
          </div>
          <span className="stat-value">{stats.total_posts}</span>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Published</span>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <span className="stat-value">{stats.published}</span>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Scheduled</span>
            <Clock size={18} className="text-blue-500" />
          </div>
          <span className="stat-value">{stats.scheduled}</span>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Archived</span>
            <Archive size={18} className="text-slate-500" />
          </div>
          <span className="stat-value">{stats.archived}</span>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Total Views</span>
            <Eye size={18} className="text-cyan-500" />
          </div>
          <span className="stat-value">{stats.total_views}</span>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Unread</span>
            <UserX size={18} className="text-rose-500" />
          </div>
          <span className="stat-value">{stats.unread}</span>
        </div>
      </div>

      <div className="announcements-table-container">
        <div className="table-controls">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <select className="form-select bg-light border-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
              <option value="Archived">Archived</option>
            </select>
            <select className="form-select bg-light border-0" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <select className="form-select bg-light border-0" value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)}>
              <option value="">All Audience</option>
              <option value="all">All Users</option>
              <option value="role:doctor">Doctors</option>
              <option value="role:patient">Patients</option>
              <option value="admin_only">Admin Only</option>
              <option value="monitoring_doctors">Monitoring Doctors</option>
              <option value="suspended_doctors">Suspended Doctors</option>
            </select>
            <select className="form-select bg-light border-0" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Category</option>
              <option value="System">System</option>
              <option value="Policy">Policy</option>
              <option value="Emergency">Emergency</option>
              <option value="General">General</option>
            </select>
            <button className="btn btn-primary px-3" onClick={fetchAnnouncements}>Apply</button>
          </div>
        </div>
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-bold animate-pulse">LOADING COMMUNICATIONS NEXUS...</div>
        ) : (
          <AnnouncementTable
            announcements={applyClientFilter}
            onEdit={(item) => {
              setSelectedAnnouncement(item);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {isModalOpen && (
        <CreateAnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAnnouncement(null);
          }}
          onSave={handleCreateOrUpdate}
        />
      )}
    </div>
  );
};

export default AnnouncementsPage;
