import { logout } from "../utils/auth";

const LogoutButton = () => {
  return (
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
