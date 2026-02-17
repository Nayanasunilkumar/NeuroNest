const ModuleComingSoon = ({ title = 'Module', description = 'This module is prepared and ready for phased rollout.' }) => {
  return (
    <div style={{ padding: '24px' }}>
      <div className="welcome-card">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Future Ready</h3>
          <p>This screen is already wired into the modular sidebar and route system.</p>
        </div>
      </div>
    </div>
  );
};

export default ModuleComingSoon;
