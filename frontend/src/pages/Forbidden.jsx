import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="text-center max-w-lg">
        <div className="mb-6 w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto ring-4 ring-red-50 dark:ring-red-950">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 className="text-6xl font-black mb-2 text-slate-800 dark:text-white">403</h1>
        <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">
          You do not have the credentials or clinical oversight level required to access this protocol or clinical path within NeuroNest.
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

export default Forbidden;
