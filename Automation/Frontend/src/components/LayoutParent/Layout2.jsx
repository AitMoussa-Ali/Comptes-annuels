// import { useState, useEffect, useRef } from "react";
// import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import "./Layout.css";

// import { useApp } from "../../context/AppContext";
// import { STEPS } from "../../config/Steps";

// import logoAplitec from "../../assets/logo_aplitec.jpg";

// /* ─────────────────────────────────────────────────────────────
//    Navigation helpers
// ───────────────────────────────────────────────────────────── */

// function useNavigation(currentIndex, sessionId){
//   const navigate = useNavigate()

//   const isFirst     = currentIndex === 0;
//   const isLast      = currentIndex === STEPS.length - 1;

//   const isStepLocked = (stepIndex) => stepIndex > 0 && !sessionId;

//   const progressPct  = currentIndex >= 0
//       ? Math.round((currentIndex / (STEPS.length - 1)) * 100)
//       : 0;
    
//   const goNext = () => {
//     if (!isLast) navigate(STEPS[currentIndex + 1].path);
//   };

//   const goPrev = () => {
//     if (!isFirst) navigate(STEPS[currentIndex - 1].path);
//   }

//   const goTo = (step) => navigate(step.path);

//   return { isFirst, isLast, isStepLocked, progressPct, goNext, goPrev, goTo };

// }

//   function StepList({currentIndex, isStepLocked, onStepClick}){
//     return STEPS.map((step) => {
//       const isActive = step.index === currentIndex
//       const isDone = step.index < currentIndex

//       return (
//         <button
//         key={step.path}
//         onClick={()=> onStepClick(step)}
//         >
//           <span>

//           </span>
//           <span>
//             {step.label}
//           </span>
//         </button>
//       )
//     })
//   }


//   function SideBarContent({ currentIndex, isStepLocked, onStepClick, progressPct}){
//     return (
//       <>
//       <p>Progression</p>
//       <nav>
//         <div>
//           <StepList 
//             currentIndex={currentIndex}
//             isStepLocked={isStepLocked}
//             onStepClick={onStepClick}
//           />
//         </div>
//       </nav>

//       <div className="sidebar-footer">
//         <p className="sidebar-footer-label">Progression globale</p>
//         <div className="progress-bar-wrapper sidebar-progress" style={{ marginBottom: 8 }}>
//           <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
//         </div>
//         <p className="sidebar-footer-text">{progressPct}% complété</p>
//       </div>
//       </>
//     )
//   }

// export default function Layout2(){
//   const navigate     = useNavigate();
//   const location     = useLocation();
//   const { sessionId } = useApp();

//   const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);

//   const { isFirst, isLast, isStepLocked, progressPct, goNext, goPrev, goTo } =
//     useNavigation(currentIndex, sessionId);

//   const handleStepClick = (step) => {
//     goTo(step)
//   }

//     const stepListProps = {
//     currentIndex,
//     isStepLocked,
//     onStepClick: handleStepClick,
//     };
//   return(
//     <div>
//       <header>
//         <div>
//           <img src="" alt="" />
//         </div>
//         <div>
//           <span>APLITEC</span>
//           <span>Générateur des comptes annuelles</span>
//         </div>
//       </header>
//       <div>
//         <SideBarContent {...stepListProps} progressPct={progressPct}></SideBarContent>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { STEPS } from "../../config/Steps";
import logoAplitec from "../../assets/logo_aplitec.jpg";

/* ─────────────────────────────────────────────────────────────
   Navigation helpers
───────────────────────────────────────────────────────────── */
function useNavigation(currentIndex, sessionId) {
  const navigate = useNavigate();
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;
  const isStepLocked = (stepIndex) => stepIndex > 0 && !sessionId;
  const progressPct =
    currentIndex >= 0
      ? Math.round((currentIndex / (STEPS.length - 1)) * 100)
      : 0;

  const goNext = () => { if (!isLast) navigate(STEPS[currentIndex + 1].path); };
  const goPrev = () => { if (!isFirst) navigate(STEPS[currentIndex - 1].path); };
  const goTo = (step) => navigate(step.path);
  return { isFirst, isLast, isStepLocked, progressPct, goNext, goPrev, goTo };
}

/* ─────────────────────────────────────────────────────────────
   Step indicator pill
───────────────────────────────────────────────────────────── */
function StepPill({ step, isActive, isDone, isLocked, onClick }) {
  return (
    <button
      onClick={() => !isLocked && onClick(step)}
      disabled={isLocked}
      className={`
        group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        text-left transition-all duration-200 outline-none
        ${isActive
          ? "bg-slate-800 text-white shadow-md"
          : isDone
          ? "text-slate-300 hover:bg-slate-800/50 hover:text-white"
          : isLocked
          ? "text-slate-600 cursor-not-allowed"
          : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
        }
      `}
    >
      {/* Connector line */}
      {step.index < STEPS.length - 1 && (
        <span
          className={`
            absolute left-[22px] top-[calc(100%+2px)] w-px h-3
            ${isDone ? "bg-emerald-500/50" : "bg-slate-700/60"}
          `}
        />
      )}

      {/* Circle indicator */}
      <span
        className={`
          relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
          text-xs font-semibold transition-all duration-200 ring-1
          ${isActive
            ? "bg-emerald-400 text-slate-900 ring-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
            : isDone
            ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30"
            : isLocked
            ? "bg-slate-800 text-slate-600 ring-slate-700"
            : "bg-slate-800 text-slate-400 ring-slate-700 group-hover:ring-slate-600"
          }
        `}
      >
        {isDone ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          step.index + 1
        )}
      </span>

      {/* Label */}
      <span className="text-sm font-medium leading-tight truncate">
        {step.label}
      </span>

      {/* Lock icon */}
      {isLocked && (
        <svg className="w-3 h-3 ml-auto flex-shrink-0 text-slate-600" fill="none" viewBox="0 0 12 12">
          <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M4 5V3.5a2 2 0 114 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Step list
───────────────────────────────────────────────────────────── */
function StepList({ currentIndex, isStepLocked, onStepClick }) {
  return (
    <div className="flex flex-col gap-1">
      {STEPS.map((step) => (
        <StepPill
          key={step.path}
          step={step}
          isActive={step.index === currentIndex}
          isDone={step.index < currentIndex}
          isLocked={isStepLocked(step.index)}
          onClick={onStepClick}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sidebar content
───────────────────────────────────────────────────────────── */
function SideBarContent({ currentIndex, isStepLocked, onStepClick, progressPct }) {
  return (
    <div className="flex flex-col h-full bg-amber-600">
      {/* Nav section */}
      <div className="flex-1 overflow-y-auto px-3 pt-6 pb-4 scrollbar-thin scrollbar-thumb-slate-700">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4 px-3">
          Étapes
        </p>
        <nav>
          <StepList
            currentIndex={currentIndex}
            isStepLocked={isStepLocked}
            onStepClick={onStepClick}
          />
        </nav>
      </div>

      {/* Progress footer */}
      <div className="px-4 py-5 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Progression globale
          </p>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {progressPct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          {progressPct === 100
            ? "Toutes les étapes complétées ✓"
            : `${Math.round(((currentIndex + 1) / STEPS.length) * 10) / 10 * 10 | 0} étape${currentIndex > 0 ? "s" : ""} sur ${STEPS.length}`}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mobile drawer overlay
───────────────────────────────────────────────────────────── */
function MobileDrawer({ isOpen, onClose, children }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 lg:hidden
          bg-slate-900 border-r border-slate-800 shadow-2xl
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        {children}
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Layout
───────────────────────────────────────────────────────────── */
export default function Layout2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);
  const { isFirst, isLast, isStepLocked, progressPct, goNext, goPrev, goTo } =
    useNavigation(currentIndex, sessionId);

  const handleStepClick = (step) => {
    goTo(step);
    setSidebarOpen(false);
  };

  const stepListProps = {
    currentIndex,
    isStepLocked,
    onStepClick: handleStepClick,
    progressPct,
  };

  const currentStep = STEPS[currentIndex] ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center h-14 px-4 md:px-6 bg-slate-900 border-b border-slate-800 shadow-sm">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mr-3 p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo + brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 ring-1 ring-slate-700 flex-shrink-0">
            <img
              src={logoAplitec}
              alt="Aplitec"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[13px] font-bold tracking-wide text-white">
              APLITEC
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Générateur des comptes annuelles
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Current step breadcrumb (desktop) */}
        {currentStep && (
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-slate-500">Étape</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium tabular-nums">
              {currentStep.index + 1}/{STEPS.length}
            </span>
            <span className="text-slate-300 font-medium">{currentStep.label}</span>
          </div>
        )}

        {/* Progress mini-bar (mobile) */}
        <div className="flex sm:hidden items-center gap-2">
          <span className="text-xs text-emerald-400 font-semibold">{progressPct}%</span>
          <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 overflow-hidden">
          <SideBarContent {...stepListProps} />
        </aside>

        {/* Mobile drawer */}
        <MobileDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <SideBarContent {...stepListProps} />
        </MobileDrawer>

        {/* ── MAIN CONTENT AREA ────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Content scrollable zone */}
          <div className="flex-1 overflow-y-auto">
            {/* Step header banner */}
            {currentStep && (
              <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 px-6 py-3 flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-400/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {currentStep.index + 1}
                </span>
                <h1 className="text-sm font-semibold text-slate-200 truncate">
                  {currentStep.label}
                </h1>
              </div>
            )}

            {/* Page content */}
            <div className="p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </div>

          {/* ── NAVIGATION FOOTER ──────────────────────────── */}
          <footer className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-4 md:px-6 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">

              {/* Previous */}
              <button
                onClick={goPrev}
                disabled={isFirst}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  border transition-all duration-150
                  ${isFirst
                    ? "border-slate-800 text-slate-600 cursor-not-allowed"
                    : "border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white hover:bg-slate-800 active:scale-[0.97]"
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="hidden sm:inline">Précédent</span>
              </button>

              {/* Step dots (desktop) */}
              <div className="hidden md:flex items-center gap-1.5">
                {STEPS.map((step) => (
                  <button
                    key={step.path}
                    onClick={() => !isStepLocked(step.index) && goTo(step)}
                    disabled={isStepLocked(step.index)}
                    className={`
                      rounded-full transition-all duration-200
                      ${step.index === currentIndex
                        ? "w-5 h-2 bg-emerald-400"
                        : step.index < currentIndex
                        ? "w-2 h-2 bg-emerald-600 hover:bg-emerald-400"
                        : "w-2 h-2 bg-slate-700 hover:bg-slate-600"
                      }
                      ${isStepLocked(step.index) ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                    aria-label={step.label}
                  />
                ))}
              </div>

              {/* Step counter (mobile) */}
              <div className="md:hidden text-xs text-slate-500 font-medium">
                {currentIndex + 1} / {STEPS.length}
              </div>

              {/* Next */}
              <button
                onClick={goNext}
                disabled={isLast}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  border transition-all duration-150
                  ${isLast
                    ? "border-slate-800 text-slate-600 cursor-not-allowed"
                    : "border-emerald-600 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 active:scale-[0.97]"
                  }
                `}
              >
                <span className="hidden sm:inline">Suivant</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
