import Navbar from "../../components/Navbar";

const SuperAdminDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">System administration and monitoring.</p>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
