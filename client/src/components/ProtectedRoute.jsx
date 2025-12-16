import { Outlet, useNavigate } from "react-router-dom";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    return <navigate to="/login" replace />;
  }

  return <Outlet />;
}
