import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ComplexityType =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(2ⁿ)';

interface BigOGraphProps {
  functions?: ComplexityType[];
  maxN?: number;
  height?: number;
}

const complexityFunctions: Record<ComplexityType, (n: number) => number> = {
  'O(1)': () => 1,
  'O(log n)': (n) => (n <= 0 ? 0 : Math.log2(n)),
  'O(n)': (n) => n,
  'O(n log n)': (n) => (n <= 0 ? 0 : n * Math.log2(n)),
  'O(n²)': (n) => n * n,
  'O(2ⁿ)': (n) => Math.pow(2, n),
};

const colors: Record<ComplexityType, string> = {
  'O(1)': '#22c55e',      // green
  'O(log n)': '#3b82f6',  // blue
  'O(n)': '#a855f7',      // purple
  'O(n log n)': '#f97316', // orange
  'O(n²)': '#ef4444',     // red
  'O(2ⁿ)': '#ec4899',     // pink
};

export default function BigOGraph({
  functions = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'],
  maxN = 20,
  height = 300,
}: BigOGraphProps) {
  const [isDark, setIsDark] = useState(false);
  const [hidden, setHidden] = useState<Set<ComplexityType>>(new Set());

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleLine = (fn: ComplexityType) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(fn)) {
        next.delete(fn);
      } else {
        next.add(fn);
      }
      return next;
    });
  };

  // Generate data points
  const data = [];
  for (let n = 1; n <= maxN; n++) {
    const point: Record<string, number> = { n };
    for (const fn of functions) {
      const value = complexityFunctions[fn](n);
      // Cap exponential growth for visibility
      point[fn] = Math.min(value, maxN * maxN * 2);
    }
    data.push(point);
  }

  const axisColor = isDark ? '#71717a' : '#a1a1aa';
  const gridColor = isDark ? '#27272a' : '#e4e4e7';
  const bgColor = isDark ? '#18181b' : '#ffffff';
  const textColor = isDark ? '#fafafa' : '#18181b';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: '0.5rem',
        border: `1px solid ${gridColor}`,
        padding: '1rem',
        marginBlock: '1.5rem',
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="n"
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            label={{
              value: 'n (input size)',
              position: 'insideBottom',
              offset: -5,
              fill: axisColor,
              fontSize: 12,
            }}
          />
          <YAxis
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            label={{
              value: 'operations',
              angle: -90,
              position: 'insideLeft',
              fill: axisColor,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: bgColor,
              border: `1px solid ${gridColor}`,
              borderRadius: '0.375rem',
              color: textColor,
              fontSize: '0.875rem',
            }}
            labelStyle={{ color: textColor, fontWeight: 500 }}
            formatter={(value: number) => value.toFixed(2)}
          />
          {functions.map((fn) => (
            <Line
              key={fn}
              type="monotone"
              dataKey={fn}
              stroke={colors[fn]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              hide={hidden.has(fn)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem 1rem',
          justifyContent: 'center',
          marginTop: '0.75rem',
        }}
      >
        {functions.map((fn) => (
          <button
            key={fn}
            onClick={() => toggleLine(fn)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'ui-monospace, monospace',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: hidden.has(fn) ? 0.4 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <span
              style={{
                width: '0.75rem',
                height: '0.125rem',
                backgroundColor: colors[fn],
                borderRadius: '1px',
              }}
            />
            <span style={{ color: textColor }}>{fn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
