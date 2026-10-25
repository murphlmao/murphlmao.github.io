import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceDot, ResponsiveContainer } from 'recharts';
import css from './ConstantsCrossover.module.css';

/* The "drop constants" example as one figure: A = 100n against B = n². It opens on the
   table the article describes; the graph tab draws the same two functions and marks the
   one place they are equal. A and B reuse BigOGraph's blue (O(log n)) and red (O(n²)). */

const A = { label: 'A (100n)', f: (n: number) => 100 * n, color: '#3b82f6' };
const B = { label: 'B (n²)', f: (n: number) => n ** 2, color: '#ef4444' };

const ROWS = [10, 100, 1_000, 1_000_000];
const TIE = 100; /* 100n = n² at n = 100 */
const MAX_N = 200;

const commas = (v: number) => v.toLocaleString('en-US');

const data = Array.from({ length: MAX_N / 2 + 1 }, (_, i) => {
  const n = i * 2;
  return { n, A: A.f(n), B: B.f(n) };
});

type View = 'table' | 'graph';

export default function ConstantsCrossover() {
  const [view, setView] = useState<View>('table');

  return (
    <figure className={`fig ${css.root}`} data-fig="constants-crossover" aria-label="100n against n squared">
      <div className={`fig-head ${css.head}`}>
        <span>100n vs n²</span>
        <div className={css.tabs} role="group" aria-label="view">
          {(['table', 'graph'] as View[]).map((v) => (
            <button key={v} type="button" className={css.tab} aria-pressed={view === v} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className={`fig-body ${css.body}`}>
        {view === 'table' ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>n</th>
                  <th>{A.label}</th>
                  <th>{B.label}</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((n) => (
                  <tr key={n} className={n === TIE ? css.tie : undefined}>
                    <td>{commas(n)}</td>
                    <td>{commas(A.f(n))}</td>
                    <td>{commas(B.f(n))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 16, right: 16, left: 4, bottom: 18 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="n"
                  type="number"
                  domain={[0, MAX_N]}
                  ticks={[0, 50, 100, 150, 200]}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'n (input size)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis domain={[0, B.f(MAX_N)]} tickLine={false} width={52} tick={{ fontSize: 11 }} tickFormatter={commas} />
                <Tooltip
                  cursor={{ stroke: 'var(--line)' }}
                  contentStyle={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}
                  labelStyle={{ color: 'var(--muted)' }}
                  labelFormatter={(n) => `n = ${n}`}
                  formatter={(v, name) => [commas(Number(v)), name === 'A' ? A.label : B.label]}
                />
                <ReferenceLine
                  x={TIE}
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  label={{ value: `equal at n = ${TIE}`, position: 'insideTopRight', fontSize: 12, className: 'tie-label' }}
                />
                <Line type="linear" dataKey="A" stroke={A.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="B" stroke={B.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                <ReferenceDot
                  x={TIE}
                  y={A.f(TIE)}
                  r={5}
                  fill="var(--accent)"
                  stroke="var(--bg)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className={css.legend}>
              {[A, B].map((s) => (
                <span key={s.label} className={css.key}>
                  <span className={css.swatch} style={{ background: s.color }} aria-hidden="true" />
                  {s.label}
                </span>
              ))}
            </div>
            <p className={css.note}>
              Left of n = {TIE}, B is cheaper; right of it, A is. The graph stops at n = {MAX_N}; the table's last two rows are far off the right edge.
            </p>
          </>
        )}
      </div>
    </figure>
  );
}
