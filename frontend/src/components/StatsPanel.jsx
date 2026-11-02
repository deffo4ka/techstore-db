import { useState } from 'react';
import { BarChart3, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCheaperThanAvg,
  getErrorMessage,
  getMaxCheckByBrand,
} from '../api/client';

export default function StatsPanel() {
  const [cheaperCount, setCheaperCount] = useState(null);
  const [loadingCheaper, setLoadingCheaper] = useState(false);

  const [brand, setBrand] = useState('');
  const [maxCheckRows, setMaxCheckRows] = useState(null);
  const [loadingMax, setLoadingMax] = useState(false);

  async function runCheaperThanAvg() {
    setLoadingCheaper(true);
    try {
      const data = await getCheaperThanAvg();
      setCheaperCount(data.count);
      toast.success('Scalar function executed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to run scalar function'));
    } finally {
      setLoadingCheaper(false);
    }
  }

  async function runMaxCheck(e) {
    e.preventDefault();
    if (!brand.trim()) {
      toast.error('Enter a brand name');
      return;
    }

    setLoadingMax(true);
    try {
      const rows = await getMaxCheckByBrand(brand.trim());
      setMaxCheckRows(rows);
      toast.success(
        rows.length
          ? 'Table function executed'
          : 'No rows returned for this brand',
      );
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to run table function'));
    } finally {
      setLoadingMax(false);
    }
  }

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-accent" />
        <h2 className="font-display text-lg font-semibold text-ink-900">
          Stats
        </h2>
      </div>

      <div className="mb-5 rounded-xl border border-ink-100 bg-ink-50/70 p-4">
        <h4 className="font-medium text-slate-800">Price Analytics</h4>
        <p className="text-xs text-slate-500 mb-3">
          Find the number of products priced below the catalog average.
        </p>

        <button
          type="button"
          className="btn-primary mt-3 w-full"
          onClick={runCheaperThanAvg}
          disabled={loadingCheaper}
        >
          {loadingCheaper ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running…
            </>
          ) : (
            'Count cheaper than average'
          )}
        </button>

        {cheaperCount !== null && (
          <div className="mt-3 rounded-xl bg-white px-4 py-3 text-center ring-1 ring-ink-100">
            <p className="text-xs uppercase tracking-wide text-ink-400">
              Result
            </p>
            <p className="font-display text-3xl font-bold tabular-nums text-accent">
              {cheaperCount}
            </p>
            <p className="text-xs text-ink-500">products below average price</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-ink-100 bg-ink-50/70 p-4">
        <h4 className="font-medium text-slate-800">Top Receipt by Brand</h4>
        <p className="text-xs text-slate-500 mb-3">
          Find the check containing the largest quantity of products for a
          specific brand.
        </p>

        <form onSubmit={runMaxCheck} className="mt-3 space-y-2.5">
          <input
            className="field"
            type="text"
            placeholder="Brand name (e.g. Samsung)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loadingMax}
          >
            {loadingMax ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Get max check
              </>
            )}
          </button>
        </form>

        {maxCheckRows && (
          <div className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-ink-100">
            {maxCheckRows.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-500">
                No results for “{brand.trim()}”.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-white text-xs uppercase tracking-wide text-ink-500">
                    <th className="px-3 py-2 font-semibold">CheckNo</th>
                    <th className="px-3 py-2 font-semibold text-right">
                      TotalQuantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {maxCheckRows.map((row, idx) => (
                    <tr
                      key={`${row.CheckNo}-${idx}`}
                      className="border-b border-ink-50 last:border-0"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-ink-700">
                        {row.CheckNo}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-ink-900">
                        {row.TotalQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
