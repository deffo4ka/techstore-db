require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 5000;

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'TechStoreDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log('Connected to TechStoreDB');
        pool.on('error', (err) => {
          console.error('SQL pool error:', err);
          poolPromise = null;
        });
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

app.use(cors());
app.use(express.json());

function extractSqlError(err) {
  const sqlErr = err?.precedingErrors?.length
    ? err.precedingErrors[err.precedingErrors.length - 1]
    : err;

  const number = sqlErr?.number ?? err?.number;
  const message =
    sqlErr?.originalError?.info?.message ||
    sqlErr?.message ||
    err?.message ||
    'Database error';

  return { number, message };
}

app.get('/api/products', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        p.ProductID,
        p.Title,
        p.Price,
        p.StockQuantity,
        p.BrandID,
        p.CategoryID,
        b.BrandName,
        b.Country,
        c.CategoryName
      FROM dbo.Products p
      INNER JOIN dbo.Brands b ON p.BrandID = b.BrandID
      INNER JOIN dbo.Categories c ON p.CategoryID = c.CategoryID
      ORDER BY p.ProductID
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('GET /api/products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

app.get('/api/products/:id/sales', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('ProductID', sql.Int, productId)
      .query(`
        SELECT
          SaleID,
          CheckNo,
          ProductID,
          SaleDate,
          Quantity,
          TotalAmount
        FROM dbo.Sales
        WHERE ProductID = @ProductID
        ORDER BY SaleDate DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('GET /api/products/:id/sales:', err);
    res.status(500).json({ error: 'Failed to fetch sales', details: err.message });
  }
});

app.post('/api/purchase', async (req, res) => {
  try {
    const { ProductID, Quantity, CheckNo } = req.body;

    if (ProductID == null || Quantity == null || CheckNo == null || CheckNo === '') {
      return res.status(400).json({
        error: 'ProductID, Quantity, and CheckNo are required',
      });
    }

    const productId = parseInt(ProductID, 10);
    const quantity = parseInt(Quantity, 10);

    if (Number.isNaN(productId) || Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: 'ProductID must be a number and Quantity must be a positive integer',
      });
    }

    const pool = await getPool();
    await pool
      .request()
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .input('CheckNo', sql.NVarChar(50), String(CheckNo))
      .execute('dbo.usp_ProcessPurchase');

    res.status(201).json({
      success: true,
      message: 'Purchase processed successfully',
      ProductID: productId,
      Quantity: quantity,
      CheckNo: String(CheckNo),
    });
  } catch (err) {
    console.error('POST /api/purchase:', err);

    const { number, message } = extractSqlError(err);

    if (number === 50003 || (number != null && number >= 50000)) {
      return res.status(400).json({ error: message, code: number });
    }

    res.status(500).json({
      error: 'Failed to process purchase',
      details: message,
    });
  }
});

app.get('/api/stats/cheaper-than-avg', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT dbo.udf_CountProductsCheaperThanAvg() AS CountCheaperThanAvg
    `);

    const count = result.recordset[0]?.CountCheaperThanAvg ?? 0;
    res.json({ count });
  } catch (err) {
    console.error('GET /api/stats/cheaper-than-avg:', err);
    res.status(500).json({
      error: 'Failed to execute scalar function',
      details: err.message,
    });
  }
});

app.get('/api/stats/max-check/:brand', async (req, res) => {
  try {
    const brandName = decodeURIComponent(req.params.brand);

    if (!brandName?.trim()) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('BrandName', sql.NVarChar(100), brandName)
      .query(`
        SELECT CheckNo, TotalQuantity
        FROM dbo.udf_GetMaxCheckByBrand(@BrandName)
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('GET /api/stats/max-check/:brand:', err);
    res.status(500).json({
      error: 'Failed to execute table function',
      details: err.message,
    });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');
    res.json({ status: 'ok', database: dbConfig.database });
  } catch (err) {
    res.status(503).json({ status: 'unavailable', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TechStore API listening on http://localhost:${PORT}`);
});

module.exports = app;
