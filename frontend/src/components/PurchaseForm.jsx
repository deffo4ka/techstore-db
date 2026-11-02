import { useMemo, useState } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, processPurchase } from '../api/client';

const initialForm = {
  ProductID: '',
  Quantity: '1',
  CheckNo: '',
};

export default function PurchaseForm({ products, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(
    () => products.find((p) => String(p.ProductID) === String(form.ProductID)),
    [products, form.ProductID]
  );

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.ProductID || !form.Quantity || !form.CheckNo.trim()) {
      toast.error('Product, quantity, and check number are required');
      return;
    }

    setSubmitting(true);
    try {
      const result = await processPurchase({
        ProductID: Number(form.ProductID),
        Quantity: Number(form.Quantity),
        CheckNo: form.CheckNo.trim(),
      });

      toast.success(result.message || 'Purchase processed successfully');
      setForm((prev) => ({ ...initialForm, ProductID: prev.ProductID }));
      onSuccess?.();
    } catch (err) {
      const status = err?.response?.status;
      const message = getErrorMessage(err, 'Purchase failed');

      if (status === 400) {
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-accent" />
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Process Purchase
          </h2>
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Select a product and enter the required quantity to place an order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="label" htmlFor="purchase-product">
            Product
          </label>
          <select
            id="purchase-product"
            className="field"
            value={form.ProductID}
            onChange={(e) => updateField('ProductID', e.target.value)}
            required
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.ProductID} value={p.ProductID}>
                #{p.ProductID} — {p.Title} (stock: {p.StockQuantity})
              </option>
            ))}
          </select>
          {selected && (
            <p className="mt-1.5 text-xs text-ink-500">
              Price {Number(selected.Price).toFixed(2)} · Stock{' '}
              <span className="font-semibold text-ink-700">
                {selected.StockQuantity}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="purchase-qty">
            Quantity
          </label>
          <input
            id="purchase-qty"
            className="field"
            type="number"
            min="1"
            step="1"
            value={form.Quantity}
            onChange={(e) => updateField('Quantity', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="purchase-check">
            Check number
          </label>
          <input
            id="purchase-check"
            className="field"
            type="text"
            placeholder="e.g. CHK-10042"
            value={form.CheckNo}
            onChange={(e) => updateField('CheckNo', e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Submit purchase
            </>
          )}
        </button>
      </form>
    </div>
  );
}
