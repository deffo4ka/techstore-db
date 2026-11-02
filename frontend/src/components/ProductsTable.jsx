import { useState } from 'react';
import { ChevronDown, ChevronUp, History, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, getProductSales } from '../api/client';
import SalesPanel from './SalesPanel';

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export default function ProductsTable({ products, loading }) {
  const [expandedId, setExpandedId] = useState(null);
  const [salesByProduct, setSalesByProduct] = useState({});
  const [loadingSalesId, setLoadingSalesId] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);

  async function ensureSales(productId) {
    if (salesByProduct[productId]) return salesByProduct[productId];

    setLoadingSalesId(productId);
    try {
      const sales = await getProductSales(productId);
      setSalesByProduct((prev) => ({ ...prev, [productId]: sales }));
      return sales;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load sales'));
      return null;
    } finally {
      setLoadingSalesId(null);
    }
  }

  async function toggleExpand(productId) {
    if (expandedId === productId) {
      setExpandedId(null);
      return;
    }
    const sales = await ensureSales(productId);
    if (sales) setExpandedId(productId);
  }

  async function openModal(product) {
    const sales = await ensureSales(product.ProductID);
    if (sales) setModalProduct(product);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-5 py-16 text-ink-500">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        Loading products…
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="px-5 py-16 text-center text-sm text-ink-500">
        No products found in TechStoreDB.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3 font-semibold">Brand</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold text-right">Price</th>
              <th className="px-5 py-3 font-semibold text-right">Stock</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isExpanded = expandedId === product.ProductID;
              const isLoadingSales = loadingSalesId === product.ProductID;

              return (
                <ProductRows
                  key={product.ProductID}
                  product={product}
                  isExpanded={isExpanded}
                  isLoadingSales={isLoadingSales}
                  sales={salesByProduct[product.ProductID]}
                  onToggle={() => toggleExpand(product.ProductID)}
                  onOpenModal={() => openModal(product)}
                  formatMoney={formatMoney}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {modalProduct && (
        <SalesModal
          product={modalProduct}
          sales={salesByProduct[modalProduct.ProductID] || []}
          onClose={() => setModalProduct(null)}
        />
      )}
    </>
  );
}

function ProductRows({
  product,
  isExpanded,
  isLoadingSales,
  sales,
  onToggle,
  onOpenModal,
  formatMoney,
}) {
  return (
    <>
      <tr className="border-b border-ink-50 transition hover:bg-ink-50/60">
        <td className="px-5 py-3 font-mono text-xs text-ink-500">
          {product.ProductID}
        </td>
        <td className="px-5 py-3 font-medium text-ink-900">{product.Title}</td>
        <td className="px-5 py-3 text-ink-600">
          <span>{product.BrandName}</span>
          {product.Country && (
            <span className="ml-1 text-xs text-ink-400">({product.Country})</span>
          )}
        </td>
        <td className="px-5 py-3 text-ink-600">{product.CategoryName}</td>
        <td className="px-5 py-3 text-right tabular-nums text-ink-800">
          {formatMoney(product.Price)}
        </td>
        <td className="px-5 py-3 text-right">
          <StockBadge qty={product.StockQuantity} />
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="btn-ghost !px-2.5 !py-1.5"
              onClick={onToggle}
              disabled={isLoadingSales}
              title="Expand sales inline"
            >
              {isLoadingSales && !isExpanded ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Sales
            </button>
            <button
              type="button"
              className="btn-ghost !px-2.5 !py-1.5"
              onClick={onOpenModal}
              disabled={isLoadingSales}
              title="Open sales modal"
            >
              <History className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-ink-100 bg-ink-50/40">
          <td colSpan={7} className="px-5 py-4">
            <SalesPanel sales={sales || []} compact />
          </td>
        </tr>
      )}
    </>
  );
}

function StockBadge({ qty }) {
  const value = Number(qty) || 0;
  const tone =
    value <= 0
      ? 'bg-red-50 text-red-700 ring-red-100'
      : value < 10
        ? 'bg-amber-50 text-amber-800 ring-amber-100'
        : 'bg-accent-muted text-teal-800 ring-teal-100';

  return (
    <span
      className={`inline-flex min-w-[2.5rem] justify-center rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset tabular-nums ${tone}`}
    >
      {value}
    </span>
  );
}

function SalesModal({ product, sales, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sales-modal-title"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Sales history
            </p>
            <h3
              id="sales-modal-title"
              className="font-display text-lg font-semibold text-ink-900"
            >
              {product.Title}
            </h3>
            <p className="mt-0.5 text-xs text-ink-500">
              Product #{product.ProductID} · {product.BrandName} ·{' '}
              {product.CategoryName}
            </p>
          </div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <SalesPanel sales={sales} />
        </div>
      </div>
    </div>
  );
}
