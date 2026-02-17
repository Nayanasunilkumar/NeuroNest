import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <h1 style={{ fontSize: '42px', marginBottom: '8px' }}>403</h1>
        <h2 style={{ marginBottom: '10px' }}>Access denied</h2>
        <p style={{ opacity: 0.75, marginBottom: '18px' }}>
          You do not have permission to access this module.
        </p>
        <Link to="/login">Go to Login</Link>
      </div>
    </div>
  );
};

export default Forbidden;
