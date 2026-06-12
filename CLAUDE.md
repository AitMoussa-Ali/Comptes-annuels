# CLAUDE.md — Aplitec Reporting Project

> **Single source of truth.** Before answering any question or producing any output, read this file and stay consistent with everything recorded here.

---

## Project Overview

**Name:** Aplitec Reporting Tool  
**Purpose:** Automate the generation of annual financial reports (Comptes Annuels) for investment funds (OPCVM, FIA) in Excel (`.xlsm`) format.  
**Domain:** French financial reporting (régulation AMF). Reports are bilingual (FR / ENG).  
**Organization:** Groupe Aplitec  

**Core workflow:**
1. User uploads two Excel balance sheets — year N and year N-1 — via the web UI.
2. The backend parses them into Pandas DataFrames and stores them in Redis under a session ID.
3. The user fills in a presentation form (fund name, company name, dates, address…).
4. On "Générer le rapport", the backend loads all cached DataFrames, runs every financial calculation (Bilan Actif, Bilan Passif, Compte de résultat, Capitaux propres, Expositions, Sommes distribuables), fills an Excel template, and streams the populated `.xlsm` back to the browser as a download.

---

## Repository Structure

```
Reporting/
└── Automation/
    ├── Backend/               FastAPI backend (Python)
    │   ├── main.py            App entry point; routers registered here
    │   ├── db.py              SQLAlchemy engine + session factory
    │   ├── controllers/       Business logic (one file per report section)
    │   ├── routes/            FastAPI routers (mirror of controllers)
    │   ├── Models/            SQLAlchemy ORM models (Fund, ManagementCompany, ReportSection)
    │   ├── schemas/           Pydantic request/response schemas
    │   ├── core/              config.py, redis_client.py, session_store.py, dependencies.py
    │   ├── services/          excel_report_service.py (openpyxl template filling)
    │   ├── parsers/           Excel balance-sheet parsers
    │   ├── templates/         Excel .xlsm template files
    │   ├── tools/             Utility helpers
    │   └── docker-compose.yml Redis 7 Alpine container
    ├── Frontend/              React 19 + Vite main frontend
    │   ├── src/
    │   │   ├── api/           axios instance (api.js)
    │   │   ├── components/    Layout, UI, Modal, Icons
    │   │   ├── pages/         Presentation.jsx, UploadFiles.jsx
    │   │   ├── routes/        Router.jsx, Protectedroute.jsx
    │   │   ├── context/       AppContext.jsx (global state)
    │   │   ├── config/        Steps.js (wizard step config)
    │   │   └── Requests/      Axios.jsx (configured axios instance)
    │   └── package.json
    ├── my-project/            Secondary simpler React+Vite prototype (minimal deps)
    ├── Lib/ Scripts/ share/   Python virtual environment
    └── pyvenv.cfg
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI (async) |
| ORM | SQLAlchemy |
| Database | PostgreSQL (`reports_db`, localhost) |
| Caching / Sessions | Redis 7 (Docker, `redis://localhost:6379/0`) |
| Excel manipulation | openpyxl (template filling + VBA preservation via `keep_vba=True`) |
| Data processing | Pandas DataFrames |
| Config | pydantic-settings (`.env` file) |
| Serialization | pickle (DataFrames in Redis) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19.2.6 |
| Build tool | Vite 8.0.12 |
| Styling | Tailwind CSS 3.4.19 |
| UI Libraries | Material UI 9.0.1, Shadcn/ui, Base UI |
| Forms | React Hook Form 7.75.0 |
| HTTP client | Axios 1.16.1 |
| Routing | React Router DOM 7.15.1 |
| Notifications | React Hot Toast 2.6.0 |
| Icons | Lucide React |
| File upload | React Dropzone |

---

## Architecture Decisions

### Session Management (Redis)
- On file upload, the backend creates a UUID session ID and stores parsed DataFrames under the key pattern `session:{session_id}:{dataset}`.
- Dataset keys used: `balance_N`, `balance_N_1`.
- TTL is 3600 seconds (1 hour), refreshed on every active request.
- The session ID is passed from the frontend via the `X-Session-ID` HTTP header on all subsequent API calls.
- `require_session` dependency in `core/dependencies.py` validates this header.
- Sessions are deleted after the report is downloaded (or expire automatically).

### Fund Type: "New" vs "Old"
- `type_fund = "Old"` → report includes both N and N-1 columns in all sheets.
- `type_fund = "New"` → report includes only the N column.
- This flag is passed through to all `fill_*` functions in `excel_report_service.py`.

### Language Support
- `lang = "FR"` or `lang = "ENG"`.
- Language controls labels in Présentation sheet, Capitaux propres sheet, and all sheet headers.
- Header format: `"{fund_name} - Comptes annuels au {closing_date}"` (FR) or `"... - Financial statements as of ..."` (ENG).

### Excel Template Structure
The `.xlsm` template (in `templates/`) contains the following named worksheets (exact names matter for openpyxl access):
| Sheet name | Content |
|---|---|
| `Présentation` | Fund/company header info |
| `Bilan Actif` | Asset balance sheet |
| `Bilan Passif` | Liability balance sheet |
| `Compte de résultat 1` | Income statement part 1 |
| `Compte de résultat 2` | Income statement part 2 |
| `III. Capitaux propres` | Equity statement |
| `VIII. Exposition portefeuille` | Portfolio exposure |
| `XIII. Sommes distribuables` | Distributable amounts |

Sheets at index 0–2 are skipped for the header fill (loop starts at `wb.worksheets[3:]`).

### Data Format Returned by Controllers
Each controller returns a dict with a `"sections"` key containing a list of section objects. Each section has:
- `"name"` — section label
- `"value"` — dict with keys `"N"`, `"N-1"` (and `"Variation"` for capitaux propres)
- `"items"` (optional) — list of child section objects (same structure, recursive)

---

## API Routes

All routes are prefixed with `/api`. Session ID passed via `X-Session-ID` header.

| Method | Path | Description |
|---|---|---|
| POST | `/api/upload` | Upload balance sheet files (N + N-1), returns session ID |
| GET | `/api/bilan_actif` | Compute and return Bilan Actif |
| GET | `/api/bilan_passif` | Compute and return Bilan Passif |
| GET | `/api/compte_resultat` | Compute and return Compte de résultat |
| POST | `/api/generate_report` | Generate full `.xlsm` report (streams binary response) |
| GET | `/api/capitaux_propres` | Compute and return Capitaux propres |
| GET | `/api/expositions_portfeuille` | Compute and return Expositions portefeuille |
| GET | `/api/sommes_distribuables` | Compute and return Sommes distribuables |
| CRUD | `/api/funds` | Manage fund records (Fund model) |
| CRUD | `/api/management_company` | Manage management company records |
| POST | `/api/upload_templates` | Upload Excel report templates |

---

## Database Models

### Fund (`Backend/Models/fund.py`)
Persistent fund reference data.

### ManagementCompany (`Backend/Models/management_company.py`)
Persistent management company reference data.

### ReportSection (`Backend/Models/section.py`)
Stores report section definitions/configuration.

Database URL: `postgresql://postgres:$Ofiane592003@localhost/reports_db`

---

## Frontend State (AppContext)

Global state managed via React Context (`src/context/AppContext.jsx`):

| State | Type | Purpose |
|---|---|---|
| `files` | `{ fileN, fileN1 }` | The two uploaded balance sheet files |
| `sessionId` | `string \| null` | Redis session ID returned after upload |
| `datasetsStored` | `array` | List of datasets confirmed stored in Redis |
| `uploadStatus` | `"idle" \| "loading" \| "success" \| "error"` | Upload UI state |
| `presentation` | object | Form fields: `company_name`, `fund_name`, `closing_date`, `adress`, `departement`, `report_title` |

### Navigation / Routing
- `/upload_files` — always accessible; entry point of the wizard
- `/presentation` — protected (requires `sessionId`)
- `/bilan-actif`, `/bilan-passif`, `/capitaux-propres` — protected (placeholders, not yet implemented as full pages)
- Default redirect: `/` → `/upload_files`

---

## Report Generation Flow (Detail)

```
POST /api/generate_report
  Body: { company_name, fund_name, closing_date, adress, departement, report_title, ... }
  Header: X-Session-ID: <uuid>

Backend:
  1. load balance_N and balance_N_1 from Redis
  2. call all controllers (bilan_actif, bilan_passif, compte_resultat, capitaux_propres, expositions, sommes_distribuables)
  3. determine type_fund and lang from form data
  4. call fill_template() → openpyxl loads .xlsm template, fills all sheets
  5. save to a temp BytesIO buffer, stream as response (Content-Disposition: attachment)

Frontend:
  - responseType: "blob"
  - creates a temporary <a> element and triggers download as `rapport_{company_name}.xlsm`
```

---

## Environment & Infrastructure

- **Python venv** located at `Automation/` root (`pyvenv.cfg`).
- **Redis** runs in Docker: `docker-compose.yml` in `Backend/`.
- **CORS**: `allow_origins=["*"]` — open for development.
- **Session TTL**: 3600 s (configured in `core/config.py` via `SESSION_TTL_SECONDS`).
- **Redis URL**: `redis://localhost:6379/0` (default, overridable via `.env`).

---

## Known Issues / Open Work

- Routes `/bilan-actif`, `/bilan-passif`, `/capitaux-propres` in the frontend are placeholder `<span>` elements — not yet implemented as full detail pages.
- `AppContext.jsx` has duplicate keys in the Provider value object (`files`, `setFiles`, `presentation`, `setPresentation` are listed twice — harmless but should be cleaned up).
- CORS is fully open (`allow_origins=["*"]`) — should be restricted before production.
- Database credentials are hardcoded in `db.py` — should be moved to `.env`.

---

## Conventions

- All user-facing text is in **French** (UI labels, form placeholders, error messages).
- Financial section names follow **French AMF/regulatory naming** (e.g. "Bilan Actif", "Capitaux propres", "Sommes distribuables").
- The `_write(ws, row, value_dict, type)` helper in `excel_report_service.py` is the canonical way to write N / N-1 values into a worksheet cell.
- Column 7 = N value, Column 8 = N-1 value (in `_write`).
- Controllers are async; route handlers `await` controller results.
