import { useState } from "react";
import { useNavigate } from "react-router-dom";

import request from "../Requests/Axios";
import { useApp } from "../context/AppContext";

import Modal from "../components/tools/Modal/Modal";

import {
  WarningIcon,
  CheckIcon,
} from "../components/tools/Icons/Icons";

export default function UploadFiles() {
  const navigate = useNavigate();

  const { setSessionId, files, setFiles } = useApp();


  const [status, setStatus] = useState("idle");
  // idle | processing | success | error

  const [errorMsg, setErrorMsg] = useState("");

  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  
const handleUpload = async () => {
  if (!files.fileN || !files.fileN1) {
    
    setErrorMsg("Veuillez importer les deux fichiers.");
    setErrorModal(true);
    return;
  }

  const formData = new FormData();

  formData.append("file_N", files.fileN);
  formData.append("file_N_1", files.fileN1);

  try {
    setStatus("processing");

    const response = await request.post(
      "/api/upload_files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setSessionId(response.data.session_id);

    setStatus("success");
    setSuccessModal(true);

  } catch (err) {
    setStatus("error");

    setErrorMsg(
      err.response?.data?.detail ||
      err.message ||
      "Erreur inconnue."
    );

    setErrorModal(true);
  }
};
  return (
    <div>

      <h1 className="page-title">Import des fichiers</h1>

      <p className="page-subtitle">
        Importez les fichiers N et N-1 afin de générer automatiquement
        les sections financières du rapport.
      </p>

      <div className="form-card">

        <div className="upload-grid">

          {/* FILE N */}
          <label className={`upload-zone ${files.fileN ? "has-file" : ""}`}>
            <div className="upload-zone-label">
              Fichier N
            </div>

            <div className="upload-hint">
              Balance, inventaire et PVMV
            </div>

            {files.fileN && (
              <div className="upload-filename">
                ✓ {files.fileN.name}
              </div>
            )}

            <input
              type="file"
              className="upload-input"
              onChange={(e) =>
              setFiles((prev) => ({
                ...prev,
                fileN: e.target.files[0],
              }))
              }
            />
          </label>

          {/* FILE N-1 */}
          <label className={`upload-zone ${files.fileN1 ? "has-file" : ""}`}>
            <div className="upload-zone-label">
              Fichier N-1
            </div>

            <div className="upload-hint">
              Balance, inventaire et PVMV
            </div>

            {files.fileN1 && (
              <div className="upload-filename">
                ✓ {files.fileN1.name}
              </div>
            )}

            <input
              type="file"
              className="upload-input"
              onChange={(e) =>
              setFiles((prev) => ({
                ...prev,
                fileN1: e.target.files[0],
              }))
            }
            />
          </label>

        </div>

        <div style={{ marginTop: 28 }}>

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={status === "processing"}
          >
            {status === "processing"
              ? "Traitement en cours..."
              : "Envoyer les fichiers"}
          </button>

        </div>

      </div>

      {/* PROCESSING OVERLAY */}
      {status === "processing" && (
        <div className="processing-overlay">

          <div className="processing-box">

            <div className="processing-spinner" />

            <h3>Traitement automatique en cours</h3>

            <p>
              Analyse des fichiers...
            </p>

            <p>
              Génération des états financiers...
            </p>

            <p>
              Veuillez patienter.
            </p>

          </div>

        </div>
      )}

      {/* SUCCESS MODAL */}
      <Modal
        isOpen={successModal}
        onClose={() => {
          setSuccessModal(false);
          navigate("/presentation");
        }}
        title="Traitement terminé"
        message={
          <>
            <p>
              Les sections automatiques ont été générées avec succès.
            </p>

            <ul style={{
              marginTop: 16,
              paddingLeft: 20,
              lineHeight: 1.8,
            }}>
              <li>Bilan actif</li>
              <li>Bilan passif</li>
              <li>Compte de résultat</li>
              <li>Capitaux propres</li>
              <li>Expositions portefeuille</li>
              <li>Sommes distribuables</li>
            </ul>

            <p style={{ marginTop: 16 }}>
              Vous pouvez maintenant continuer avec la saisie manuelle.
            </p>
          </>
        }
        icon={<CheckIcon />}
        variant="success"
        confirmLabel="Continuer"
      />

      {/* ERROR MODAL */}
      <Modal
        isOpen={errorModal}
        onClose={() => setErrorModal(false)}
        title="Erreur de traitement"
        message={errorMsg}
        icon={<WarningIcon />}
        variant="warning"
        confirmLabel="Fermer"
      />

    </div>
  );
}