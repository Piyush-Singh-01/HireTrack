import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoutes = () => {
  const token = useSelector((state) => state.auth.token)
  const location = useLocation()

  if (!token) {
    return (
      <Navigate to="/" replace state={{from:location}} />
    )
  }

  return <Outlet/>
}

export default ProtectedRoutes;
