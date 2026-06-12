// ProtectedRoute.jsx — redirects to /upload_files if no sessionId in context
//
// Usage in your router:
//   <Route element={<ProtectedRoute />}>
//     <Route path="/presentation"     element={<Presentation />} />
//     <Route path="/bilan-actif"       element={<BilanActif />} />
//     <Route path="/bilan-passif"      element={<BilanPassif />} />
//     <Route path="/capitaux-propres"  element={<CapitauxPropres />} />
//   </Route>

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ redirectTo = "/upload_files" }) {
  const { sessionId } = useApp();
  const location      = useLocation();

  if (!sessionId) {
    // Pass the attempted path so you can redirect back after upload if needed
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
}