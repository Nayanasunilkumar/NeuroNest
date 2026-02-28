import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-black mb-2 text-slate-800 dark:text-white">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          The requested clinical node or module configuration could not be localized within the NeuroNest lattice.
        </p>
        <Link 
          to="/login"
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 inline-block"
        >
          Return to Console
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
