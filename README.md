# Trading Terminal

> A complete, production-ready, professional multi-user web application for trade execution tracking and quantitative journaling.

Designed & Developed by **Mithilesh Kumar**.

---

## 1. Overview

**Trading Terminal** is a high-precision personal trading terminal and analytical journal designed for serious traders across global and Indian markets (Equities, Options, Futures, Crypto, Forex).

It provides automated mathematical tracking for:
- Automatic realized **P&L** calculations for BUY and SELL trades
- Risk and Reward per unit calculation based on Stop Loss & Targets
- Exact **Risk:Reward (R:R)** ratios
- Statistical metrics including **Win Rate**, **Profit Factor**, Average P&L, and Average R:R
- Cumulative **Equity Curve** based exclusively on real database transactions
- Daily P&L breakdown and Strategy / Instrument edge attribution
- Psychological session reflections with mood tracking and lessons learned
- Direct external launcher cards for **TradingView** and **Delta Exchange**
- Multi-format data exports (**Microsoft Excel .xlsx** and **PDF**) for 15 Days, 1 Month, or All-Time
- True **Multi-User Data Isolation** ensuring no trader can ever access another user's records, analytics, screenshots, or exports
- Dark and Light mode themes with persisted user preference

> **Zero Admin Policy**: In accordance with the system design, there are **NO Admin dashboards, roles, or panels**. Every user has direct, secure, and private access to their personal trading workspace.

---

## 2. Technology Stack

### Backend
- **Language**: Python 3.10+
- **Framework**: Flask, Flask-CORS, Flask-JWT-Extended
- **Database / ORM**: SQLite (development) / PostgreSQL compatible via SQLAlchemy & Flask-SQLAlchemy
- **Authentication**: JWT authentication with Werkzeug password hashing
- **Exports**: `openpyxl` (Excel) and `reportlab` (PDF)
- **Timezone**: `pytz` configured for `Asia/Kolkata` (Indian Standard Time)

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React
- **Visualizations**: Recharts (Responsive AreaChart, BarChart, PieChart)
- **API Client**: Centralized API service with Bearer token interceptor and binary blob handling

---

## 3. Project Structure

```
trading-terminal-app/
├── backend/
│   ├── app.py                     # Flask application factory, CORS, JWT, Blueprints
│   ├── config.py                  # App configuration & environment variables
│   ├── models/                    # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── user.py                # Users table with secure password hashing
│   │   ├── trade.py               # Trades table with financial calculation helpers
│   │   └── journal.py             # Journal table for reflections and notes
│   ├── routes/                    # Scoped REST API routes
│   │   ├── __init__.py
│   │   ├── auth.py                # /api/auth (signup, login, me)
│   │   ├── trades.py              # /api/trades (CRUD, filters, screenshot retrieval)
│   │   ├── dashboard.py           # /api/dashboard (real-time user metrics & equity curve)
│   │   ├── analytics.py           # /api/analytics (deep performance charts & ratios)
│   │   ├── journal.py             # /api/journal (CRUD for journal entries)
│   │   ├── profile.py             # /api/profile (user details & update)
│   │   └── export.py              # /api/export (Excel .xlsx & PDF generator)
│   ├── services/
│   │   ├── financial.py           # P&L, Risk/Reward, Win Rate, Profit Factor math
│   │   ├── export_service.py      # openpyxl & ReportLab export builders
│   │   └── upload_service.py      # Secure screenshot handling & validation
│   ├── uploads/screenshots/       # Local screenshot storage (protected)
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example
│   ├── .env                       # Local environment secrets
│   └── test_multi_user.py         # Automated test suite for multi-user isolation
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                # React Router setup & protected routes
│   │   ├── index.css
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state, login, signup, logout
│   │   │   └── ThemeContext.jsx   # Light / Dark mode persistence
│   │   ├── services/
│   │   │   └── api.js             # Centralized API service with JWT interceptor
│   │   ├── utils/
│   │   │   └── formatters.js      # Indian Rupee, Number, and IST Date formatters
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx     # Public landing navbar
│   │   │   │   ├── Footer.jsx     # Landing footer with credit to Mithilesh Kumar
│   │   │   │   ├── AppLayout.jsx  # Workspace layout (sidebar + topbar)
│   │   │   │   └── Sidebar.jsx    # Desktop/mobile navigation
│   │   │   ├── common/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── ThemeToggle.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── trades/
│   │   │   │   ├── TradeFormModal.jsx   # Full 17-field entry with live P&L preview
│   │   │   │   ├── TradeDetailModal.jsx # View details & screenshot
│   │   │   │   ├── TradeTable.jsx       # Interactive table with sort & actions
│   │   │   │   ├── TradeFilters.jsx     # Real-time search & filters
│   │   │   │   └── ExportModal.jsx      # Excel/PDF range selector
│   │   │   └── journal/
│   │   │       ├── JournalModal.jsx     # Add/edit journal entry
│   │   │       └── JournalCard.jsx      # Journal entry card view
│   │   └── pages/
│   │       ├── LandingPage.jsx    # Public landing page with TradingView & Delta links
│   │       ├── AuthPage.jsx       # Login & Signup with validation
│   │       ├── DashboardPage.jsx  # Real statistics, equity curve, recent trades
│   │       ├── TerminalPage.jsx   # All trades, filters, search, export
│   │       ├── JournalPage.jsx    # Daily trading journal & reflections
│   │       ├── AnalyticsPage.jsx  # Win/Loss, Strategy, Instrument, Daily P&L charts
│   │       └── ProfilePage.jsx    # User details & settings
│   └── ...
└── README.md
```

---

## 4. Environment Variables

Create `.env` inside `backend/`:

```env
SECRET_KEY=dev-secret-key-trading-terminal-99124
JWT_SECRET_KEY=dev-jwt-secret-key-trading-terminal-88371
DATABASE_URL=sqlite:///trading_terminal.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

For production with PostgreSQL:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/trading_terminal
```

---

## 5. Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run multi-user isolation verification test
python test_multi_user.py

# Start Flask Backend server (runs on http://127.0.0.1:5000)
python app.py
```

### Step 2: Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite Development server (runs on http://localhost:5173)
npm run dev
```

---

## 6. Verification & Testing

The application includes an automated test suite verifying:
1. User registration with input validation & password hashing
2. User login & JWT issuance
3. Trade creation with BUY/SELL realized P&L calculations
4. Risk, Reward, and Risk:Reward ratio calculations
5. Open trades status handling (unrealized P&L not counting toward equity)
6. Strict **Multi-User Isolation**:
   - User A cannot view, edit, or delete User B's trades
   - User A cannot view User B's trade screenshots
   - User A cannot view or delete User B's journal entries
   - User A cannot export User B's trades
7. Microsoft Excel `.xlsx` generation using `openpyxl`
8. PDF generation using `ReportLab`

To run the verification suite:
```bash
cd backend
python test_multi_user.py
```

---

## 7. REST API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Yes |
| `GET` | `/api/trades` | List user trades (supports search & filters) | Yes |
| `POST` | `/api/trades` | Create trade (supports screenshot upload) | Yes |
| `GET` | `/api/trades/<id>` | Fetch single trade details | Yes |
| `PUT` | `/api/trades/<id>` | Update trade details / screenshot | Yes |
| `DELETE` | `/api/trades/<id>` | Delete trade & associated screenshot | Yes |
| `GET` | `/api/trades/<id>/screenshot` | Protected screenshot file retrieval | Yes |
| `GET` | `/api/dashboard` | Dashboard metrics & cumulative equity curve | Yes |
| `GET` | `/api/analytics` | Deep performance charts, win/loss, strategies | Yes |
| `GET` | `/api/journal` | List user journal entries | Yes |
| `POST` | `/api/journal` | Create journal entry | Yes |
| `PUT` | `/api/journal/<id>` | Update journal entry | Yes |
| `DELETE` | `/api/journal/<id>` | Delete journal entry | Yes |
| `GET` | `/api/profile` | View profile and performance summary | Yes |
| `PUT` | `/api/profile` | Update profile info / change password | Yes |
| `GET` | `/api/export/excel?range={15days\|1month\|all}` | Download trades as styled Excel (.xlsx) | Yes |
| `GET` | `/api/export/pdf?range={15days\|1month\|all}` | Download trades as landscape PDF report | Yes |

---

## 8. Production Deployment

### Backend (Gunicorn / uWSGI)
Run Flask with a production WSGI server:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Frontend (Static Hosting / Nginx)
Build optimized production bundle:
```bash
cd frontend
npm run build
```
Deploy the resulting `frontend/dist/` directory to Nginx, Vercel, Netlify, or Cloudflare Pages.

---

## 9. Credit

Designed & Developed by **Mithilesh Kumar**.
