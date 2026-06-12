import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {

  const [files, setFiles] = useState({
    fileN: null,
    fileN1: null,
  });

  // Redis session
  const [sessionId, setSessionId] = useState(null);

  // Backend returned datasets
  const [datasetsStored, setDatasetsStored] = useState([]);

  // Optional upload state
  const [uploadStatus, setUploadStatus] = useState("idle");

  // Presentation form data
  const [presentation, setPresentation] = useState({
    company_name: "",
    fund_name: "",
    closing_date: "",
    adress: "",
    departement: "",
    report_title: "",
  });

  return (
    <AppContext.Provider
      value={{
        presentation,
        setPresentation,

        files,
        setFiles,

        sessionId,
        setSessionId,

        datasetsStored,
        setDatasetsStored,

        uploadStatus,
        setUploadStatus,

        files, 
        setFiles,

        presentation, 
        setPresentation
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }

  return ctx;
}