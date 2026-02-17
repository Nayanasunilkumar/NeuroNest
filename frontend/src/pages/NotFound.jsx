import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <h1 style={{ fontSize: '42px', marginBottom: '8px' }}>404</h1>
        <h2 style={{ marginBottom: '10px' }}>Page not found</h2>
        <p style={{ opacity: 0.75, marginBottom: '18px' }}>
          The route does not exist in the current module configuration.
        </p>
        <Link to="/login">Go to Login</Link>
      </div>
    </div>
  );
};

export default NotFound;
