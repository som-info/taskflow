import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

/** Show the dashboard for signed-in users, otherwise the login/register screen. */
export default function App() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <div className="splash"><span className="spinner" /></div>;
  }
  return user ? <DashboardPage /> : <AuthPage />;
}
