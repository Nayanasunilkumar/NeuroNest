import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDoctorPublicProfile } from "../../api/appointments";
import { toAssetUrl } from "../../utils/toAssetUrl";

const DoctorProfileView = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getDoctorPublicProfile(doctorId);
        setProfile(data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load doctor profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  if (loading) {
    return <div className="text-center py-5">Loading doctor profile...</div>;
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <img
              src={toAssetUrl(profile.profile_image) || "https://via.placeholder.com/96"}
              alt={profile.full_name}
              style={{ width: 96, height: 96, borderRadius: 20, objectFit: "cover" }}
            />
            <div>
              <h3 className="mb-1">{profile.full_name}</h3>
              <div className="text-muted">
                {profile.specialization || "General Physician"}
              </div>
              <div className="small text-secondary">{profile.hospital_name || "Hospital not specified"}</div>
            </div>
          </div>

          <hr />

          <div className="row g-3">
            <div className="col-md-6">
              <div><strong>Qualification:</strong> {profile.qualification || "N/A"}</div>
              <div><strong>Experience:</strong> {profile.experience_years ?? "N/A"} years</div>
              <div><strong>Department:</strong> {profile.department || "N/A"}</div>
              <div><strong>Consultation Mode:</strong> {profile.consultation_mode || "N/A"}</div>
              <div>
                <strong>Fee:</strong> {profile.consultation_fee == null ? "Hidden by doctor" : `₹${profile.consultation_fee}`}
              </div>
            </div>
            <div className="col-md-6">
              <div><strong>Sector:</strong> {profile.sector || "N/A"}</div>
              <div><strong>Email:</strong> {profile.email || "N/A"}</div>
            </div>
          </div>

          <div className="mt-4">
            <h5 className="mb-2">Professional Bio</h5>
            <p className="text-muted mb-0">{profile.bio || "No professional bio added."}</p>
          </div>

          <div className="mt-4">
            <h5 className="mb-2">Expertise</h5>
            <div className="d-flex flex-wrap gap-2">
              {(profile.expertise_tags || []).length > 0 ? (
                profile.expertise_tags.map((tag) => (
                  <span key={tag.id} className="badge text-bg-light border">
                    {tag.tag_name}
                  </span>
                ))
              ) : (
                <span className="text-muted">No expertise tags listed.</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h5 className="mb-2">Experience Timeline</h5>
            {(profile.experience || []).length > 0 ? (
              <div className="list-group">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="list-group-item border rounded-3 mb-2">
                    <div className="fw-semibold">{exp.title}</div>
                    <div className="small text-secondary">{exp.hospital} • {exp.period}</div>
                    {exp.description && <div className="small mt-1">{exp.description}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted">No experience entries added.</span>
            )}
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/patient/book")}>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileView;
