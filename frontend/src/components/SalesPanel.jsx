function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function SalesPanel({ sales, compact = false }) {
  if (!sales?.length) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-6 text-center text-sm text-ink-500">
        No sales recorded for this product.
      </p>
    );
  }

  return (
    <div className={compact ? '' : ''}>
      {!compact && (
        <p className="mb-3 text-xs font-medium text-ink-500">
          {sales.length} sale{sales.length === 1 ? '' : 's'}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-3 py-2.5 font-semibold">Check #</th>
              <th className="px-3 py-2.5 font-semibold">Date</th>
              <th className="px-3 py-2.5 font-semibold text-right">Qty</th>
              <th className="px-3 py-2.5 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.SaleID}
                className="border-b border-ink-50 last:border-0"
              >
                <td className="px-3 py-2.5 font-mono text-xs text-ink-700">
                  {sale.CheckNo}
                </td>
                <td className="px-3 py-2.5 text-ink-600">
                  {formatDate(sale.SaleDate)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-800">
                  {sale.Quantity}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium text-ink-900">
                  {formatMoney(sale.TotalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
