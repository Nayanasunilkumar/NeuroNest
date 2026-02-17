const DashboardHome = () => {
  return (
    <>
      <div className="welcome-card">
        <h2>Welcome 👋</h2>
        <p>Your health overview and recent activity</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Health Summary</h3>
          <p>No recent health data available.</p>
        </div>

        <div className="dashboard-card">
          <h3>Appointments</h3>
          <p>No upcoming appointments.</p>
        </div>

        <div className="dashboard-card">
          <h3>Alerts</h3>
          <p>No alerts at this time.</p>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
