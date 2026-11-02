# TechStore REST Dashboard

Full-stack interface for the existing **TechStoreDB** MS SQL Server database.

- **Backend:** Node.js, Express, `mssql`, CORS  
- **Frontend:** React (Vite), Tailwind CSS, Axios, Lucide React, react-hot-toast

## Project structure

```
techstore-rest-api/
├── backend/
│   ├── server.js          # Express API + mssql pool
│   ├── package.json
│   ├── .env.example
│   └── .env               # local DB credentials (gitignored)
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── api/client.js
        └── components/
            ├── ProductsTable.jsx
            ├── SalesPanel.jsx
            ├── PurchaseForm.jsx
            └── StatsPanel.jsx
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | Products JOIN Brands + Categories |
| `GET` | `/api/products/:id/sales` | Sales history for a product |
| `POST` | `/api/purchase` | Executes `usp_ProcessPurchase` |
| `GET` | `/api/stats/cheaper-than-avg` | Scalar `udf_CountProductsCheaperThanAvg()` |
| `GET` | `/api/stats/max-check/:brand` | Table `udf_GetMaxCheckByBrand` |
| `GET` | `/api/health` | DB connectivity check |

### Purchase error handling

If SQL Server raises a custom error (e.g. **50003** insufficient stock), the API responds with **HTTP 400** and the exact SQL error message. The React purchase form surfaces that message via `react-hot-toast`.

## Setup

### 1. Database

Ensure SQL Server is running and `TechStoreDB` (with the listed tables, SP, and functions) is available. Update `backend/.env`:

```env
DB_SERVER=localhost
DB_DATABASE=TechStoreDB
DB_USER=sa
DB_PASSWORD=YourStrongPassword123
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
PORT=5000
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173` (Vite proxies `/api` → `:5000`)

## Example purchase body

```json
{
  "ProductID": 1,
  "Quantity": 2,
  "CheckNo": "CHK-10042"
}
```
