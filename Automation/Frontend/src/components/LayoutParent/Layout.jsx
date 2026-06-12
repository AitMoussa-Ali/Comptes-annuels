import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";

import { useApp } from "../../context/AppContext";
import Modal from "../tools/Modal/Modal";
import {
  CheckIcon,
  LockIcon,
  HamburgerIcon,
  XIcon,
  WarningIcon,
  StepIcons,
} from "../tools/Icons/Icons";
import { STEPS } from "../../config/Steps";

import logoAplitec from "../../assets/logo_aplitec.jpg";

/* ─────────────────────────────────────────────────────────────
   Navigation helpers
───────────────────────────────────────────────────────────── */
function useNavigation(currentIndex, sessionId) {
  const navigate = useNavigate();

  const isFirst     = currentIndex === 0;
  const isLast      = currentIndex === STEPS.length - 1;
  const isStepLocked = (stepIndex) => stepIndex > 0 && !sessionId;
  const progressPct  = currentIndex >= 0
    ? Math.round((currentIndex / (STEPS.length - 1)) * 100)
    : 0;

  const goNext = () => {
    if (!isLast) navigate(STEPS[currentIndex + 1].path);
  };

  const goPrev = () => {
    if (!isFirst) navigate(STEPS[currentIndex - 1].path);
  };

  const goTo = (step) => navigate(step.path);

  return { isFirst, isLast, isStepLocked, progressPct, goNext, goPrev, goTo };
}

/* ─────────────────────────────────────────────────────────────
   StepList sub-component
───────────────────────────────────────────────────────────── */
function StepList({ currentIndex, isStepLocked, onStepClick }) {
  return STEPS.map((step) => {
    const isDone   = step.index < currentIndex;
    const isActive = step.index === currentIndex;
    const locked   = isStepLocked(step.index);

    return (
      <button
        key={step.path}
        className={`step-item${isActive ? " active" : ""}${isDone ? " done" : ""}${locked ? " locked" : ""}`}
        onClick={() => onStepClick(step)}
        aria-current={isActive ? "step" : undefined}
        title={locked ? "Importez vos fichiers pour débloquer" : step.label}
      >
        <span className="step-num">
          {isDone && !locked
            ? <CheckIcon />
            : locked
            ? <LockIcon />
            : step.index + 1}
        </span>
        <span className="step-label">{step.label}</span>
        {locked && <span className="step-lock-badge">Verrouillé</span>}
      </button>
    );
  });
}

/* ─────────────────────────────────────────────────────────────
   Sidebar content (reused in desktop + mobile drawer)
───────────────────────────────────────────────────────────── */
function SidebarContent({ currentIndex, isStepLocked, onStepClick, progressPct }) {
  return (
    <>
      <p className="sidebar-label">Progression</p>
      <nav className="stepper">
        <div className="stepper-line" />
        <StepList
          currentIndex={currentIndex}
          isStepLocked={isStepLocked}
          onStepClick={onStepClick}
        />
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-label">Progression globale</p>
        <div className="progress-bar-wrapper sidebar-progress" style={{ marginBottom: 8 }}>
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="sidebar-footer-text">{progressPct}% complété</p>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Layout
───────────────────────────────────────────────────────────── */
export default function Layout() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { sessionId } = useApp();
  const overlayRef   = useRef(null);

  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [modalConfig,  setModalConfig]  = useState(null); // { title, message } | null

  const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);

  const { isFirst, isLast, isStepLocked, progressPct, goNext, goPrev, goTo } =
    useNavigation(currentIndex, sessionId);

  const isUploadStep = STEPS[currentIndex]?.path === "/upload_files";
  const nextDisabled = isLast || (isUploadStep && !sessionId);

  /* Close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  /* Body scroll lock (drawer) */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  /* ── Modal helpers ── */
  const openFilesRequiredModal = (message) =>
    setModalConfig({ title: "Fichiers requis", message });

  const closeModal = () => setModalConfig(null);

  /* ── Navigation handlers ── */
  const handleNext = () => {
    if (isLast) return;
    if (!sessionId && currentIndex === 0) {
      openFilesRequiredModal(
        "Veuillez importer vos fichiers avant de continuer vers l'étape suivante."
      );
      return;
    }
    goNext();
  };

  const handleStepClick = (step) => {
    if (isStepLocked(step.index)) {
      openFilesRequiredModal(
        "Importez vos fichiers à l'étape 1 pour accéder à cette section."
      );
      return;
    }
    goTo(step);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) setDrawerOpen(false);
  };

  /* ── Shared step-click props ── */
  const stepListProps = {
    currentIndex,
    isStepLocked,
    onStepClick: handleStepClick,
  };

  return (
    <div className="app-shell">

      {/* ── GENERIC MODAL ──────────────────────────────── */}
      <Modal
        isOpen={!!modalConfig}
        onClose={closeModal}
        title={modalConfig?.title}
        message={modalConfig?.message}
        icon={<WarningIcon />}
        variant="warning"
        confirmLabel="Compris"
      />

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <button
            className="mobile-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <HamburgerIcon />
          </button>

          <div className="brand-logo-wrapper">
            {logoAplitec
              ? <img src={logoAplitec} alt="Logo" />
              : <div className="brand-logo-fallback">A</div>
            }
          </div>
          <div className="brand-divider" />
          <div className="brand-text">
            <span className="brand-name">APLITEC</span>
            <span className="brand-tagline">Générateur des comptes annuelles</span>
          </div>
        </div>

        <div className="header-right">
          {!sessionId && (
            <div className="header-locked-notice">
              <LockIcon />
              <span>Fichiers requis</span>
            </div>
          )}
          <div className="header-badge">
            <span className="header-badge-dot" />
            {currentIndex >= 0
              ? `Étape ${currentIndex + 1} / ${STEPS.length}`
              : "Bienvenue"}
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ──────────────────────────────── */}
      <div
        ref={overlayRef}
        className={`mobile-drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={handleOverlayClick}
        aria-hidden={!drawerOpen}
      >
        <aside className="mobile-drawer">
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-title">Navigation</span>
            <button
              className="mobile-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fermer"
            >
              <XIcon />
            </button>
          </div>
          <div className="mobile-drawer-body">
            <SidebarContent {...stepListProps} progressPct={progressPct} />
          </div>
        </aside>
      </div>

      <div className="app-body">

        {/* ── DESKTOP SIDEBAR ────────────────────────── */}
        <aside className="app-sidebar">
          <SidebarContent {...stepListProps} progressPct={progressPct} />
        </aside>

        {/* ── MAIN ───────────────────────────────────── */}
        <main className="app-main">
          <div className="progress-bar-wrapper top-progress">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="page-container">
            <Outlet />
          </div>

          {currentIndex !== -1 && (
            <div className="nav-buttons">
              <button className="btn btn-secondary" onClick={goPrev} disabled={isFirst}>
                ← Précédent
              </button>
              <button
                className={`btn btn-primary${nextDisabled ? " btn-locked" : ""}`}
                onClick={handleNext}
                disabled={isLast}
              >
                {isLast
                  ? "Terminer ✓"
                  : nextDisabled
                  ? <><LockIcon /> Suivant</>
                  : "Suivant →"}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM STEP BAR ─────────────────────── */}
      <nav className="mobile-step-bar" aria-label="Étapes">
        <div className="mobile-step-bar-inner">
          {STEPS.map((step) => {
            const isDone   = step.index < currentIndex;
            const isActive = step.index === currentIndex;
            const locked   = isStepLocked(step.index);

            return (
              <button
                key={step.path}
                className={`mobile-step-tab${isActive ? " active" : ""}${isDone ? " done" : ""}${locked ? " locked" : ""}`}
                onClick={() => handleStepClick(step)}
                aria-label={step.label}
                title={locked ? "Importez vos fichiers pour débloquer" : step.label}
              >
                <span className="msb-icon">
                  {locked
                    ? <LockIcon />
                    : isDone
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    : StepIcons[step.index]
                  }
                </span>
                <span className="msb-label">{step.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}