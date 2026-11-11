import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const RouteGuard = () => {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  // If user has a token (session exists), redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no token, show login page (current route is already "/")
  return null;
};

export default RouteGuard;
