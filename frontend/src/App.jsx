import { useCallback, useEffect, useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, getProducts } from './api/client';
import ProductsTable from './components/ProductsTable';
import PurchaseForm from './components/PurchaseForm';
import StatsPanel from './components/StatsPanel';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-display text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            TechStoreDB
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
            Inventory Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            Browse products, review sales history, manage inventory, and check
            store analytics.
          </p>
        </div>

        <button
          type="button"
          className="btn-ghost self-start sm:self-auto"
          onClick={() => loadProducts()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
              <Package className="h-5 w-5 text-accent" />
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Products
              </h2>
              <span className="ml-auto rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600">
                {products.length} items
              </span>
            </div>
            <ProductsTable products={products} loading={loading} />
          </div>
        </section>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <PurchaseForm onSuccess={() => loadProducts(true)} products={products} />
          <StatsPanel />
        </aside>
      </div>
    </div>
  );
}
