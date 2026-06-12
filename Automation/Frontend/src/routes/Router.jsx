import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout          from "../components/LayoutParent/Layout";
import ProtectedRoute  from "./Protectedroute";

import UploadFiles     from "../pages/UploadFiles";
import Presentation    from "../pages/Presentation";
import Layout2 from "@/components/LayoutParent/Layout2";
// import BilanActif      from "./pages/BilanActif";
// import BilanPassif     from "./pages/BilanPassif";
// import CapitauxPropres from "./pages/CapitauxPropres";

export const router = createBrowserRouter([
  {
    element: <Layout2 />,        // shared chrome (header, sidebar, nav buttons)
    children: [
      // ── Always accessible ──────────────────────────────────
      {
        path: "/upload_files",
        element: <UploadFiles />,
      },

      // ── Requires sessionId (files uploaded) ────────────────
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/presentation",    element: <Presentation /> },
          { path: "/bilan-actif",     element: <span>bilan actif</span> },
          { path: "/bilan-passif",    element: <span>bilan passif</span> },
          { path: "/capitaux-propres",element: <span>capitaux propres</span> },
        ],
      },

      // ── Fallback ───────────────────────────────────────────
      {
        index: true,
        element: <Navigate to="/upload_files" replace />,
      },
    ],
  },
]);