import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, AlertCircle, X, Sun, Sunrise, Sunset, Moon, Minus, ChevronUp, ChevronDown, ChevronLeft, Flame, Activity, Pill, FileText, Search, Filter, Video, Phone, Mail, MapPin, Briefcase, Calendar, User, Edit3 } from "lucide-react";
import { toAssetUrl } from "../../utils/media";
import { getPatientDossier } from "../../api/doctor";
import { getUser } from "../../utils/auth";
import { getDoctorProfile } from "../../services/doctorProfileService";
import { getClinicalSummary } from "../../api/profileApi";

// Components
import MedicalRecordTable from "../../components/patient/medicalRecords/MedicalRecordTable";
import UploadMedicalRecordModal from "../../components/patient/medicalRecords/UploadMedicalRecordModal";
import DeleteConfirmationModal from "../../components/patient/medicalRecords/DeleteConfirmationModal";
import ViewMedicalRecordModal from "../../components/patient/medicalRecords/ViewMedicalRecordModal";
import RecordFilters from "../../components/patient/medicalRecords/RecordFilters";

// Services
import medicalRecordService from "../../services/medicalRecordService";

// Styles
import "../../styles/medical-records.css";
import "../../styles/patient-records.css";

const ALLERGY_REACTIONS = [
  "Rash",
  "Anaphylaxis",
  "Breathing difficulty",
  "Swelling",
  "Nausea",
  "Other",
];

const MedicalRecords = ({ patientId: propPatientId = null }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = propPatientId || searchParams.get("patientId");
  const [identity, setIdentity] = useState(null);
  const [currentUser] = useState(() => getUser()); // logged-in user
  const isDoctor = currentUser?.role === 'doctor';
  const canManageClinical = isDoctor && Boolean(patientId);
  const [doctorDefaults, setDoctorDefaults] = useState({ name: '', hospital: '' });

  const formatDate = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAge = (dobString) => {
    if (!dobString || dobString === "N/A") return "N/A";
    const now = new Date();
    const birthDate = new Date(dobString);
    const difference = now.getTime() - birthDate.getTime();
    return Math.abs(new Date(difference).getUTCFullYear() - 1970);
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "N/A";
    const heightMeters = height / 100;
    return (weight / (heightMeters * heightMeters)).toFixed(1);
  };
  const medicationSourceLabel = (item) => {
    if (item.read_only) {
      return "Doctor Prescription";
    }
    if (
      item.medication_origin === "current_doctor" ||
      item.created_by_role === "doctor"
    ) {
      return "Current Doctor";
    }
    if (item.medication_origin === "past_external") {
      return "Past (Other Hospital)";
    }
    return "Patient Entered";
  };
  // State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [allergyFormOpen, setAllergyFormOpen] = useState(false);
  const [conditionFormOpen, setConditionFormOpen] = useState(false);
  const [medicationFormOpen, setMedicationFormOpen] = useState(false);
  const [allergyForm, setAllergyForm] = useState({
    allergy_name: "",
    reaction: "Rash",
    severity: "severe",
    diagnosed_date: "",
    status: "active",
  });
  const [conditionForm, setConditionForm] = useState({
    condition_name: "",
    diagnosed_date: "",
    last_reviewed: "",
    status: "active",
    under_treatment: true,
  });
  const [medicationForm, setMedicationForm] = useState({
    drug_name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: "",
    prescribed_by: "",
    medication_origin: "past_external",
    source_hospital_name: "",
    status: "active",
  });

  // When doctor opens the medication form, pre-fill their name and set correct origin
  const openMedicationForm = () => {
    setMedicationForm(prev => ({
      ...prev,
      prescribed_by: isDoctor ? (currentUser?.full_name || '') : '',
      medication_origin: isDoctor ? 'current_doctor' : 'past_external',
      source_hospital_name: '',
    }));
    setMedicationFormOpen(true);
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [recordToView, setRecordToView] = useState(null);
  const handleStartVideoCall = () => {
    if (!patientId) return;
    navigate(`/doctor/chat?patientId=${patientId}&startVideo=1`);
  };
  const severeAllergyCount = allergies.filter(
    (item) => String(item.severity || "").toLowerCase() === "severe",
  ).length;

  // Fetch Records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const [data, summaryData, allergyData, conditionData, medicationData] =
        await Promise.all([
          medicalRecordService.getRecords(patientId),
          medicalRecordService.getSummary(patientId),
          medicalRecordService.getAllergies(patientId),
          medicalRecordService.getConditions(patientId),
          medicalRecordService.getMedications(patientId),
        ]);
      setRecords(data || []);
      setSummary(summaryData || {});
      setAllergies(allergyData || []);
      setConditions(conditionData || []);
      setMedications(medicationData || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching medical records:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load record content.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor's own profile defaults (name + hospital) once on mount
  useEffect(() => {
    if (isDoctor) {
      getDoctorProfile()
        .then(p => setDoctorDefaults({ name: p.full_name || '', hospital: p.hospital_name || '' }))
        .catch(() => {});
    }
  }, [isDoctor]);

  useEffect(() => {
    fetchRecords();
    
    const fetchDossierData = async () => {
      try {
        const data = patientId 
          ? await getPatientDossier(patientId) 
          : await getClinicalSummary();
        setIdentity(data.identity || data);
      } catch (err) {
        console.error("Error fetching dossier/clinical summary:", err);
        // Fallback for header if identity fetch fails
        if (!patientId && currentUser) {
          setIdentity({
            full_name: currentUser.full_name,
            role: currentUser.role
          });
        }
      }
    };
    
    fetchDossierData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // Handlers
  const handleUpload = async (formData) => {
    try {
      await medicalRecordService.uploadRecord(formData, patientId);
      fetchRecords(); // Refresh list
    } catch (err) {
      console.error("Upload failed", err);
      throw err; // Modal handles error display
    }
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      await medicalRecordService.deleteRecord(recordToDelete.id, patientId);
      // Optimistic update
      setRecords(records.filter((r) => r.id !== recordToDelete.id));
      setIsDeleteOpen(false);
      setRecordToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete record.");
    }
  };

  const viewRecord = (record) => {
    setRecordToView(record);
    setIsViewOpen(true);
  };

  const downloadRecord = async (record) => {
    try {
      await medicalRecordService.downloadRecord(
        record.id,
        record.title,
        record.file_type,
        patientId
      );
    } catch {
      alert("Download failed.");
    }
  };

  // Filtering Logic
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      (record.title &&
        record.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.doctor_name &&
        record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "All" ||
      (record.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesSource = 
      sourceFilter === "All" ||
      (sourceFilter === "patient" && (!record.uploaded_by || record.uploaded_by === record.patient_id)) ||
      (sourceFilter === "doctor" && (record.uploaded_by && record.uploaded_by !== record.patient_id));

    return matchesSearch && matchesCategory && matchesSource;
  });

  const addAllergy = async () => {
    if (!allergyForm.allergy_name.trim()) return;
    try {
      await medicalRecordService.addAllergy({
        allergy_name: allergyForm.allergy_name.trim(),
        reaction: allergyForm.reaction,
        severity: allergyForm.severity,
        diagnosed_date: allergyForm.diagnosed_date || null,
        status: allergyForm.status,
      }, patientId);
      setAllergyForm({
        allergy_name: "",
        reaction: "Rash",
        severity: "severe",
        diagnosed_date: "",
        status: "active",
      });
      setAllergyFormOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add allergy.");
    }
  };

  const addCondition = async () => {
    if (!conditionForm.condition_name.trim()) return;
    try {
      await medicalRecordService.addCondition({
        condition_name: conditionForm.condition_name.trim(),
        diagnosed_date: conditionForm.diagnosed_date || null,
        last_reviewed: conditionForm.last_reviewed || null,
        status: conditionForm.status,
        under_treatment: conditionForm.under_treatment,
      }, patientId);
      setConditionForm({
        condition_name: "",
        diagnosed_date: "",
        last_reviewed: "",
        status: "active",
        under_treatment: true,
      });
      setConditionFormOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add condition.");
    }
  };

  const addMedication = async () => {
    if (!medicationForm.drug_name.trim()) return;
    try {
      await medicalRecordService.addMedication({
        ...medicationForm,
        drug_name: medicationForm.drug_name.trim(),
        start_date: medicationForm.start_date || null,
        end_date: medicationForm.end_date || null,
      }, patientId);
      setMedicationForm({
        drug_name: "",
        dosage: "",
        frequency: "",
        start_date: "",
        end_date: "",
        prescribed_by: "",
        medication_origin: "past_external",
        source_hospital_name: "",
        status: "active",
      });
      setMedicationFormOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add medication.");
    }
  };

  const renderClinicalContent = () => {
    const activeMedsCount = (medications || []).filter(m => m.status === 'active').length;
    const pastMedsCount = (medications || []).filter(m => m.status !== 'active').length;

    return (
      <div className="medical-records-dashboard-premium">
        <h2 className="section-title-premium mt-0 mb-4 px-0" style={{fontSize: '1.8rem', fontWeight: 900}}>Medical Summary</h2>
        {summary && (summary.severe_allergy_count ?? 0) > 0 && (
          <div className="critical-allergy-banner-premium">
            <div className="banner-icon-ring">
              <Flame size={20} className="text-red-600" />
            </div>
            <div className="banner-text-stack">
              <span className="banner-headline">Critical Safety Alert</span>
              <p className="banner-subline">
                {summary.severe_allergy_count} severe{" "}
                {summary.severe_allergy_count === 1 ? "allergy" : "allergies"}{" "}
                recorded. Ensure clinical data is cross-referenced during treatment.
              </p>
            </div>
          </div>
        )}

        {summary && (
          <div className="structured-medical-grid">
            {/* Allergies Card */}
            <div className="structured-card-premium allergies-card shadow-sm">
              <div className="card-premium-header">
                <div className="header-text">
                  <h3>Severe Allergies</h3>
                  <p>{severeAllergyCount} Severe / {allergies.length} Total</p>
                </div>
                {canManageClinical && (
                  <button className="card-action-btn-prm" onClick={() => setAllergyFormOpen(true)}>
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="structured-list-premium custom-scrollbar">
                {allergies.length === 0 ? (
                  <div className="structured-empty-prm">
                    <p>No severe allergies documented.</p>
                  </div>
                ) : (
                  allergies.map((item) => (
                    <div key={item.id} className="structured-item-premium">
                      <div className="item-premium-body">
                        <div className="item-premium-main">
                          <p className="item-title-prm">{item.allergy_name}</p>
                          <span className={`pill-badge-tiny prm-severity-${item.severity || 'mild'}`}>
                            {item.severity}
                          </span>
                        </div>
                        <div className="item-premium-meta-grid">
                           <div className="meta-cell">
                             <span className="meta-label">Reaction</span>
                             <span className="meta-value">{item.reaction || 'N/A'}</span>
                           </div>
                           <div className="meta-cell">
                             <span className="meta-label">Diagnosed</span>
                             <span className="meta-value">{formatDate(item.diagnosed_date)}</span>
                           </div>
                        </div>
                      </div>
                      {canManageClinical && (
                        <div className="item-premium-actions">
                          <button onClick={() => medicalRecordService.deleteAllergy(item.id, patientId).then(fetchRecords)} className="btn-icon-tiny">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conditions Card */}
            <div className="structured-card-premium conditions-card shadow-sm">
              <div className="card-premium-header">
                <div className="header-text">
                  <h3>Active Conditions</h3>
                  <p>{conditions.filter(c => c.status === 'active').length} Active / {conditions.length} Total</p>
                </div>
                {canManageClinical && (
                  <button className="card-action-btn-prm" onClick={() => setConditionFormOpen(true)}>
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="structured-list-premium custom-scrollbar">
                {conditions.length === 0 ? (
                  <div className="structured-empty-prm">
                    <p>No active conditions documented.</p>
                  </div>
                ) : (
                  conditions.map((item) => (
                    <div key={item.id} className="structured-item-premium">
                      <div className="item-premium-body">
                        <div className="item-premium-main">
                          <p className="item-title-prm">{item.condition_name}</p>
                          {item.under_treatment && (
                            <span className="pill-badge-tiny prm-status-active">Treating</span>
                          )}
                        </div>
                        <div className="item-premium-meta-grid">
                           <div className="meta-cell">
                             <span className="meta-label">Diagnosed</span>
                             <span className="meta-value">{formatDate(item.diagnosed_date)}</span>
                           </div>
                           <div className="meta-cell">
                             <span className="meta-label">Last Review</span>
                             <span className="meta-value">{formatDate(item.last_reviewed)}</span>
                           </div>
                        </div>
                      </div>
                      {canManageClinical && (
                        <div className="item-premium-actions">
                          <button onClick={() => medicalRecordService.deleteCondition(item.id, patientId).then(fetchRecords)} className="btn-icon-tiny">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Medications Card */}
            <div className="structured-card-premium medications-card shadow-sm">
              <div className="card-premium-header">
                <div className="header-text">
                  <h3>Medications</h3>
                  <p>{activeMedsCount} Active • {pastMedsCount} Past</p>
                </div>
                {canManageClinical && (
                  <button className="card-action-btn-prm" onClick={openMedicationForm}>
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="structured-list-premium custom-scrollbar">
                {medications.length === 0 && (
                  <div className="structured-empty-prm">
                    <p>No medications recorded. Add details to support interaction checks.</p>
                  </div>
                )}
                {Array.isArray(medications) && medications.map((item) => (
                  <div key={item.id} className="structured-item-premium">
                    <div className="item-premium-body">
                      <div className="item-premium-main">
                        <p className="item-title-prm" style={{ opacity: item.status !== 'active' ? 0.6 : 1 }}>{item.drug_name}</p>
                        <div className="item-premium-badges">
                          <span className={`pill-badge-tiny ${medicationSourceLabel(item).includes("Doctor") ? "prm-source-doc" : "prm-source-past"}`}>
                            {medicationSourceLabel(item)}
                          </span>
                        </div>
                      </div>
                      <div className="item-premium-meta-grid">
                        <div className="meta-cell">
                          <span className="meta-label">Dose</span>
                          <span className="meta-value">{item.dosage || "N/A"}</span>
                        </div>
                        <div className="meta-cell">
                          <span className="meta-label">Frequency</span>
                          <span className="meta-value">{item.frequency || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="item-premium-actions">
                      {canManageClinical && !item.read_only && (
                        <button onClick={() => medicalRecordService.deleteMedication(item.id, patientId).then(fetchRecords)} className="btn-icon-tiny">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="medical-records-archive-section">
          <div className="archive-header-row">
            <div className="header-title-stack">
              <h2 className="archive-main-title">Medical Records</h2>
              <p className="archive-main-subtitle">Secure longitudinal patient documentation and diagnostic reports</p>
            </div>
            <button className="upload-record-btn shadow-sm" onClick={() => setIsUploadOpen(true)}>
              <Plus size={18} />
              <span>Upload Record</span>
            </button>
          </div>

          <div className="archive-filter-vault shadow-sm">
            <div className="vault-filter-toolbar">
              <RecordFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                sourceFilter={sourceFilter}
                setSourceFilter={setSourceFilter}
              />
            </div>

            <div className="vault-table-container">
              {error ? (
                <div className="vault-error-state">
                  <AlertCircle size={40} className="text-red-500" />
                  <p>{error}</p>
                  <button onClick={fetchRecords} className="btn-retry-prm">Try Again</button>
                </div>
              ) : (
                <MedicalRecordTable
                  records={filteredRecords}
                  onView={viewRecord}
                  onDelete={confirmDelete}
                  onDownload={downloadRecord}
                  loading={loading}
                  isDoctorView={!!patientId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div 
        className={patientId ? "opd-dashboard-root patient-dashboard-grid-bg" : "medical-records-container patient-dashboard-grid-bg fade-in"}
        style={patientId ? { padding: '20px' } : { padding: '20px' }}
      >
        <div className="mx-auto" style={{ maxWidth: '1440px' }}>
          {/* PREMIUM PATIENT PROFILE HEADER with Skeletons */}
          <div className="clinical-panel mb-4 border-0 shadow-sm" style={{ borderRadius: '24px', minHeight: '200px' }}>
            {!identity && loading ? (
              <div className="d-flex align-items-center gap-4 animate-pulse p-4">
                <div className="bg-light rounded-4" style={{ width: '120px', height: '120px' }}></div>
                <div className="flex-grow-1">
                  <div className="bg-light h4 mb-3" style={{ width: '40%', height: '24px' }}></div>
                  <div className="bg-light" style={{ width: '60%', height: '16px' }}></div>
                </div>
              </div>
            ) : identity ? (
              <div className="d-flex flex-wrap flex-lg-nowrap gap-4">
                {/* Avatar Col */}
                <div className="d-flex flex-column align-items-center gap-3 pe-lg-3">
                  <div className="patient-img-large overflow-hidden shadow-sm" style={{ border: '4px solid #fff' }}>
                    {identity.profile_image ? (
                      <img src={toAssetUrl(identity.profile_image)} alt={identity.full_name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <div className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-flex align-items-center fw-bold" style={{fontSize: '0.65rem', padding: '0.4rem 0.8rem'}}>
                      <span className="me-1">🚫</span> Alcohol
                    </div>
                    <div className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-flex align-items-center fw-bold" style={{fontSize: '0.65rem', padding: '0.4rem 0.8rem'}}>
                      <span className="me-1">🚬</span> Smoker
                    </div>
                  </div>
                </div>

                {/* Details Col */}
                <div className="flex-grow-1 d-flex flex-column justify-content-between gap-4">
                  {/* Top row */}
                  <div className="d-flex justify-content-between align-items-start w-100">
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <h2 className="fw-black text-dark mb-0" style={{fontSize: '1.6rem'}}>{identity.full_name}</h2>
                        <div className="d-flex gap-2">
                          <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center">
                            <Phone size={14} className="text-secondary"/>
                          </button>
                          <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center">
                            <Mail size={14} className="text-secondary"/>
                          </button>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap gap-4 text-dark fw-bold" style={{fontSize: '0.8rem', opacity: 0.8}}>
                        <span className="d-flex align-items-center gap-2"><User size={14} className="text-secondary"/> {identity.gender || 'Not Specified'}</span>
                        <span className="d-flex align-items-center gap-2"><MapPin size={14} className="text-secondary"/> {identity.city || 'Elshiekh zayed, Giza'}</span>
                        <span className="d-flex align-items-center gap-2"><Briefcase size={14} className="text-secondary"/> {identity.occupation || 'Consultant'}</span>
                        <span className="d-flex align-items-center gap-2"><Calendar size={14} className="text-secondary"/> {identity.dob || identity.date_of_birth || 'N/A'} ({calculateAge(identity.dob || identity.date_of_birth)} years)</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      {isDoctor && patientId && (
                        <button
                          type="button"
                          onClick={handleStartVideoCall}
                          className="btn btn-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                        >
                          <Video size={16} />
                          Video Call
                        </button>
                      )}
                      {!patientId && (
                        <button onClick={() => navigate('/patient/profile')} className="nn-btn nn-btn-secondary d-flex align-items-center gap-2">
                          <Edit3 size={14} /> Edit profile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: Vitals + Tags */}
                  <div className="d-flex flex-wrap flex-xl-nowrap justify-content-between align-items-center gap-4 mt-2">
                    {/* Vitals Box */}
                    <div className="d-flex align-items-center p-3 px-4 rounded-4" style={{border: '1.5px dashed #e2e8f0', gap: '30px', backgroundColor: '#fcfdfe'}}>
                      <div className="text-center">
                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                          <span className="fw-black text-dark lh-1" style={{fontSize: '1.4rem'}}>{calculateBMI(identity.weight_kg, identity.height_cm)}</span>
                        </div>
                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.7rem'}}>
                          BMI <span className="text-success ms-1">▼ 1.2</span>
                        </div>
                      </div>
                      <div style={{width: '1px', height: '40px', backgroundColor: '#e2e8f0'}}></div>
                      <div className="text-center">
                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                          <span className="fw-black text-dark lh-1" style={{fontSize: '1.4rem'}}>{identity.weight_kg || 'N/A'}</span>
                          <span className="fw-bold text-muted fw-bold" style={{fontSize: '0.8rem'}}>kg</span>
                        </div>
                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.7rem'}}>
                          Weight <span className="text-success ms-1">▼ 0.5 kg</span>
                        </div>
                      </div>
                      <div style={{width: '1px', height: '40px', backgroundColor: '#e2e8f0'}}></div>
                      <div className="text-center">
                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                          <span className="fw-black text-dark lh-1" style={{fontSize: '1.4rem'}}>{identity.height_cm || 'N/A'}</span>
                          <span className="fw-bold text-muted fw-bold" style={{fontSize: '0.8rem'}}>Cm</span>
                        </div>
                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.7rem'}}>
                          Height
                        </div>
                      </div>
                      <div style={{width: '1px', height: '40px', backgroundColor: '#e2e8f0'}}></div>
                      <div className="text-center">
                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                          <span className="fw-black text-dark lh-1" style={{fontSize: '1.4rem'}}>124/80</span>
                        </div>
                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.7rem'}}>
                          Blood pressure <span className="text-danger ms-1">▲ 5</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-column align-items-end gap-3 text-end">
                      <div className="d-flex flex-column align-items-end gap-1">
                        <span className="text-dark fw-bolder mb-1" style={{fontSize: '0.75rem', opacity: 0.6}}>Own diagnosis</span>
                        <div className="d-flex gap-2">
                          {conditions.filter(c => c.status === 'active').slice(0, 2).map((c, i) => (
                            <span key={i} className="nn-badge nn-badge-warning px-3 py-2 fw-bold" style={{fontSize: '0.65rem'}}>{c.condition_name}</span>
                          ))}
                          {conditions.filter(c => c.status === 'active').length === 0 && <span className="text-muted small">None</span>}
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1">
                        <span className="text-dark fw-bolder mb-1" style={{fontSize: '0.75rem', opacity: 0.6}}>Known Allergies</span>
                        <div className="d-flex gap-2">
                          {allergies.slice(0, 2).map((a, i) => (
                            <span key={i} className="nn-badge nn-badge-danger px-3 py-2 fw-bold" style={{fontSize: '0.65rem'}}>{a.allergy_name}</span>
                          ))}
                          {allergies.length === 0 && <span className="text-muted small">None documented</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
                <div className="d-flex flex-column align-items-center justify-content-center p-4">
                    <User size={48} className="text-muted mb-2" />
                    <p className="text-muted fw-bold">Clinical Profile Unavailable</p>
                </div>
            )}
          </div>

          <div className="fade-in">
            {loading && !summary ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                 <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%' }}></div>
              </div>
            ) : (
              renderClinicalContent()
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadMedicalRecordModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        defaultDoctorName={isDoctor ? doctorDefaults.name : ''}
        defaultHospitalName={isDoctor ? doctorDefaults.hospital : ''}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        record={recordToDelete}
      />

      <ViewMedicalRecordModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        record={recordToView}
      />

      {canManageClinical && allergyFormOpen && (
        <SimpleMedicalModal
          title="Add Severe Allergy"
          onClose={() => setAllergyFormOpen(false)}
          onSave={addAllergy}
        >
          <input
            value={allergyForm.allergy_name}
            onChange={(e) =>
              setAllergyForm((prev) => ({
                ...prev,
                allergy_name: e.target.value,
              }))
            }
            placeholder="Allergy name"
          />
          <select
            value={allergyForm.reaction}
            onChange={(e) =>
              setAllergyForm((prev) => ({ ...prev, reaction: e.target.value }))
            }
          >
            {ALLERGY_REACTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={allergyForm.severity}
            onChange={(e) =>
              setAllergyForm((prev) => ({ ...prev, severity: e.target.value }))
            }
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
          <input
            type="date"
            value={allergyForm.diagnosed_date}
            onChange={(e) =>
              setAllergyForm((prev) => ({
                ...prev,
                diagnosed_date: e.target.value,
              }))
            }
          />
        </SimpleMedicalModal>
      )}

      {canManageClinical && conditionFormOpen && (
        <SimpleMedicalModal
          title="Add Active Condition"
          onClose={() => setConditionFormOpen(false)}
          onSave={addCondition}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Condition Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                value={conditionForm.condition_name}
                onChange={(e) => setConditionForm((prev) => ({ ...prev, condition_name: e.target.value }))}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', background: '#F8FAFC', color: '#1E293B', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Date Diagnosed
                </label>
                <input
                  type="date"
                  value={conditionForm.diagnosed_date}
                  onChange={(e) => setConditionForm((prev) => ({ ...prev, diagnosed_date: e.target.value }))}
                  style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', background: '#F8FAFC', color: '#1E293B', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Last Reviewed
                </label>
                <input
                  type="date"
                  value={conditionForm.last_reviewed}
                  onChange={(e) => setConditionForm((prev) => ({ ...prev, last_reviewed: e.target.value }))}
                  style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', background: '#F8FAFC', color: '#1E293B', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div
              onClick={() => setConditionForm((prev) => ({ ...prev, under_treatment: !prev.under_treatment }))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                background: conditionForm.under_treatment ? '#EFF6FF' : '#F8FAFC',
                border: `1px solid ${conditionForm.under_treatment ? '#BFDBFE' : '#E2E8F0'}`,
                transition: 'all 0.2s',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Currently Under Treatment</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Patient is actively receiving care for this condition</div>
              </div>
              <div style={{
                width: 42, height: 24, borderRadius: '999px', flexShrink: 0,
                background: conditionForm.under_treatment ? '#2563EB' : '#CBD5E1',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: conditionForm.under_treatment ? 21 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}></div>
              </div>
            </div>
          </div>
        </SimpleMedicalModal>
      )}

      {canManageClinical && medicationFormOpen && (
        <SimpleMedicalModal
          title="Add Medication"
          onClose={() => setMedicationFormOpen(false)}
          onSave={addMedication}
        >
          {!isDoctor && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '4px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Medication Type</label>
              <select
                value={medicationForm.medication_origin}
                onChange={(e) => setMedicationForm((prev) => ({ ...prev, medication_origin: e.target.value }))}
                style={{ margin: 0, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              >
                <option value="past_external">Past Medication (Other Hospital)</option>
                <option value="current_doctor">Current Medication (Treating Doctor)</option>
              </select>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Drug name</label>
            <input
              value={medicationForm.drug_name}
              onChange={(e) =>
                setMedicationForm((prev) => ({ ...prev, drug_name: e.target.value }))
              }
              placeholder="e.g. Paracetamol"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Dosage</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: 'flex', flex: 1, border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc', overflow: 'hidden' }}>
                <input
                  value={String(medicationForm.dosage || "").match(/[0-9.]+/) ? String(medicationForm.dosage || "").match(/[0-9.]+/)[0] : ""}
                  onChange={(e) => {
                    const newNum = e.target.value;
                    const valStr = String(medicationForm.dosage || "0");
                    const currentUnit = valStr.replace(/[0-9.]/g, '').trim() || "mg";
                    setMedicationForm((prev) => ({ ...prev, dosage: newNum ? `${newNum} ${currentUnit}` : currentUnit }));
                  }}
                  placeholder="e.g. 500"
                  style={{ flex: 1, border: 'none', background: 'transparent' }}
                />
                <select
                  value={String(medicationForm.dosage || "").replace(/[0-9.]/g, '').trim() || "mg"}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    const valStr = String(medicationForm.dosage || "0");
                    const numMatch = valStr.match(/[0-9.]+/);
                    const currentNum = numMatch ? numMatch[0] : "";
                    setMedicationForm((prev) => ({ ...prev, dosage: currentNum ? `${currentNum} ${newUnit}` : newUnit }));
                  }}
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '4px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Frequency</label>
            <div style={{ display: "flex", justifyContent: "space-between", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "10px 24px", background: "#f8fafc" }}>
              {[
                { label: "MRNG", icon: <Sunrise size={22} strokeWidth={1.5} />, idx: 0 },
                { label: "AFTN", icon: <Sun size={22} strokeWidth={1.5} />, idx: 1 },
                { label: "EVE", icon: <Sunset size={22} strokeWidth={1.5} />, idx: 2 },
                { label: "NIGHT", icon: <Moon size={22} strokeWidth={1.5} />, idx: 3 }
              ].map((slot) => {
                const parts = (medicationForm.frequency && medicationForm.frequency.split('-').length === 4) 
                  ? medicationForm.frequency.split('-') 
                  : ["0", "0", "0", "0"];
                const isActive = parts[slot.idx] !== "0";
                
                return (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => {
                      const newParts = [...parts];
                      newParts[slot.idx] = isActive ? "0" : "1";
                      setMedicationForm(prev => ({ ...prev, frequency: newParts.join('-') }));
                    }}
                    style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      gap: "8px", 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer",
                      color: isActive ? "#3b82f6" : "#94a3b8",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ transform: isActive ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s" }}>
                      {slot.icon}
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em" }}>
                      {slot.label}
                    </span>
                   </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Start Date</label>
            <input type="date" value={medicationForm.start_date} onChange={(e) => setMedicationForm((prev) => ({ ...prev, start_date: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>End Date</label>
            <input type="date" value={medicationForm.end_date} onChange={(e) => setMedicationForm((prev) => ({ ...prev, end_date: e.target.value }))} />
          </div>
        </SimpleMedicalModal>
      )}
    </>
  );
};

const SimpleMedicalModal = ({ title, children, onClose, onSave }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div
      className="modal-content structured-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button onClick={onClose} className="close-modal-btn">
          <X size={20} />
        </button>
      </div>
      <div className="structured-modal-grid">{children}</div>
      <div className="structured-modal-actions">
        <button className="structured-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="structured-save-btn" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  </div>
);

export default MedicalRecords;
