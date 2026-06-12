import { useState } from "react";
import { useApp } from "../context/AppContext";
import request from "../Requests/Axios";

export default function Presentation() {
  const { presentation, setPresentation, sessionId } = useApp();
  const [status, setStatus] = useState("idle"); // "idle"|"loading"|"success"|"error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPresentation((prev) => ({ ...prev, [name]: value }));
    setStatus("idle");
  };

  const isFormValid = Object.values(presentation).every((v) => v.trim() !== "");

  const handleGenerate = async () => {
    if (!sessionId) {
      setErrorMsg("Session introuvable. Veuillez d'abord importer les fichiers.");
      setStatus("error");
      return;
    }
    if (!isFormValid) {
      setErrorMsg("Veuillez remplir tous les champs.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await request.post(
        "/api/generate_report",
        presentation,           // JSON body → ReportForm
        {
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,   // how require_session reads it (see note below)
          },
          responseType: "blob",          // ← critical: binary file
        }
      );

      // Build a temporary download link and click it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `rapport_${presentation.company_name}.xlsm`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatus("success");
    } catch (err) {
      // Blob error bodies need to be parsed manually
      let detail = "Erreur inconnue.";
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          detail = JSON.parse(text)?.detail ?? text;
        } catch {
          detail = text;
        }
      } else {
        detail = err.response?.data?.detail ?? err.message;
      }
      setErrorMsg(typeof detail === "string" ? detail : JSON.stringify(detail));
      setStatus("error");
    }
  };

  return (
    <div>
      <h1 className="page-title">Présentation</h1>
      <p className="page-subtitle">
        Informations générales sur le fond ou la société de gestion
      </p>

      <div className="form-card">
        <div className="form-grid">

          <div className="form-group full-width">
            <label className="form-label">
              Nom de la société <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              name="company_name"
              value={presentation.company_name}
              onChange={handleChange}
              placeholder="ex: Société de Gestion Alpha"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              Nom du fond <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              name="fund_name"
              value={presentation.fund_name}
              onChange={handleChange}
              placeholder="ex: Fonds Européen de Croissance"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              Titre du rapport <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              name="report_title"
              value={presentation.report_title}
              onChange={handleChange}
              placeholder="ex: Rapport annuel 2024"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Date de clôture <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="date"
              name="closing_date"
              value={presentation.closing_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Département <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              name="departement"
              value={presentation.departement}
              onChange={handleChange}
              placeholder="ex: 75"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              Adresse <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              name="adress"
              value={presentation.adress}
              onChange={handleChange}
              placeholder="ex: 12 rue de la Paix, Paris"
            />
          </div>

        </div>
      </div>

      {/* Feedback */}
      {status === "error" && (
        <p style={{ color: "var(--color-error, #e53e3e)", marginTop: 12 }}>
          ❌ {errorMsg}
        </p>
      )}
      {status === "success" && (
        <p style={{ color: "var(--color-success, #38a169)", marginTop: 12 }}>
          ✅ Rapport généré et téléchargé avec succès.
        </p>
      )}

      {/* Generate button */}
      <div style={{ marginTop: 24 }}>
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Génération en cours…" : "Générer le rapport"}
        </button>
      </div>
    </div>
  );
}