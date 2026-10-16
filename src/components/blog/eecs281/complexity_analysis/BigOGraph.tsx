import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import css from './BigOGraph.module.css';

/* How fast the common orders of growth grow: one line per row of the article's table, best
   to worst. A row that names a family is drawn as one member of it: polynomial as n³,
   exponential as 2ⁿ. The linear view is the classic picture; the log view is the only one
   where the bad orders stay on screen long enough to compare. */

type Order = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(n³)' | 'O(2ⁿ)' | 'O(n!)' | 'O(2^(2ⁿ))';

const factorial = (n: number) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

/* In table order, best to worst. The colours are a fixed categorical order checked for
   colour-blind separation and contrast against all three palette surfaces; a colour belongs
   to its order, so hiding one never repaints the rest. */
const ORDERS: { key: Order; f: (n: number) => number; color: string }[] = [
  { key: 'O(1)', f: () => 1, color: '#0d9488' },
  { key: 'O(log n)', f: (n) => Math.log2(n), color: '#3b82f6' },
  { key: 'O(n)', f: (n) => n, color: '#b8860b' },
  { key: 'O(n log n)', f: (n) => n * Math.log2(n), color: '#a855f7' },
  { key: 'O(n²)', f: (n) => n ** 2, color: '#ef4444' },
  { key: 'O(n³)', f: (n) => n ** 3, color: '#0891b2' },
  { key: 'O(2ⁿ)', f: (n) => 2 ** n, color: '#ea580c' },
  { key: 'O(n!)', f: factorial, color: '#ec4899' },
  { key: 'O(2^(2ⁿ))', f: (n) => 2 ** (2 ** n), color: '#16a34a' },
];

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sup = (k: number) => String(k).split('').map((c) => SUP[c]).join('');
/* 2432902008176640000 reads as 2.4 × 10¹⁸ */
const fmt = (v: number) => {
  if (v < 1e5) return String(Math.round(v * 100) / 100);
  const k = Math.floor(Math.log10(v));
  return `${(v / 10 ** k).toFixed(1)} × 10${sup(k)}`;
};

const LOG_TOP = 1e20;

interface Props {
  functions?: Order[];
  maxN?: number;
  height?: number;
}

export default function BigOGraph({ functions = ORDERS.map((o) => o.key), maxN = 20, height = 320 }: Props) {
  const [hidden, setHidden] = useState<Set<Order>>(new Set());
  const [log, setLog] = useState(false);
  const shown = ORDERS.filter((o) => functions.includes(o.key));
  const top = log ? LOG_TOP : maxN * maxN * 2;

  // A line leaves through the top of the plot: the first point past the top is kept (the
  // plot clips it), the ones after are dropped so the line ends instead of running flat.
  const data = Array.from({ length: maxN }, (_, i) => ({ n: i + 1 }) as Record<string, number | null>);
  for (const o of shown) {
    let gone = false;
    for (const row of data) {
      const v = o.f(row.n as number);
      row[o.key] = gone ? null : log ? Math.max(1, Math.min(v, top * 10)) : Math.min(v, top * 2);
      if (!(v <= top)) gone = true;
    }
  }

  const toggle = (key: Order) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <figure className={`fig ${css.root}`} data-fig="big-o" aria-label="growth of the common orders">
      <div className={`fig-head ${css.head}`}>
        <span>growth of the common orders</span>
        <button type="button" className={css.scale} aria-pressed={log} onClick={() => setLog(!log)}>
          log scale
        </button>
      </div>
      <div className={`fig-body ${css.body}`}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 18 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="n"
              tickLine={false}
              tick={{ fontSize: 11 }}
              label={{ value: 'n (input size)', position: 'insideBottom', offset: -10, fontSize: 11 }}
            />
            <YAxis
              scale={log ? 'log' : 'linear'}
              domain={log ? [1, LOG_TOP] : [0, top]}
              ticks={log ? [1, 1e5, 1e10, 1e15, 1e20] : undefined}
              allowDataOverflow
              tickLine={false}
              width={log ? 44 : 40}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => (log ? `10${sup(Math.round(Math.log10(v)))}` : String(v))}
            />
            <Tooltip
              cursor={{ stroke: 'var(--line)' }}
              contentStyle={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}
              labelStyle={{ color: 'var(--muted)' }}
              labelFormatter={(n) => `n = ${n}`}
              itemSorter={(item) => ORDERS.findIndex((o) => o.key === item.dataKey)} /* table order, not alphabetical */
              formatter={(v) => fmt(Number(v))}
            />
            {shown
              .filter((o) => !hidden.has(o.key))
              .map((o) => (
                <Line key={o.key} type="monotone" dataKey={o.key} stroke={o.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              ))}
          </LineChart>
        </ResponsiveContainer>
        {/* the legend is the toggle: a struck-through order is hidden */}
        <div className={css.legend}>
          {shown.map((o) => (
            <button key={o.key} type="button" className={css.key} aria-pressed={!hidden.has(o.key)} onClick={() => toggle(o.key)}>
              <span className={css.swatch} style={{ background: o.color }} aria-hidden="true" />
              {o.key}
            </button>
          ))}
        </div>
      </div>
    </figure>
  );
}
