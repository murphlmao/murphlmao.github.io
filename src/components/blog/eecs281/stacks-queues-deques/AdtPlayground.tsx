import { useReducer, useState, type CSSProperties } from 'react';
import css from './AdtPlayground.module.css';

/* A stack, a queue and a deque all keep their items in one line. What separates them is
   which ends you may insert at, remove from and look at, so each kind here is a list of
   operations over the same array: items[0] is the front (a stack's bottom) and the last
   item is the back (a stack's top). */

type Kind = 'stack' | 'queue' | 'deque';
type End = 'front' | 'back';
type Op =
  | { name: string; does: 'insert' | 'remove' | 'peek'; end: End }
  | { name: string; does: 'isEmpty' | 'size' };

/* Rename an operation here and its button and its log line both follow. */
const KINDS: Record<Kind, { title: string; ops: Op[] }> = {
  stack: {
    title: 'stack',
    ops: [
      { name: 'push', does: 'insert', end: 'back' },
      { name: 'pop', does: 'remove', end: 'back' },
      { name: 'top', does: 'peek', end: 'back' },
      { name: 'isEmpty', does: 'isEmpty' },
      { name: 'size', does: 'size' },
    ],
  },
  queue: {
    title: 'queue',
    ops: [
      { name: 'push', does: 'insert', end: 'back' },
      { name: 'pop', does: 'remove', end: 'front' },
      { name: 'front', does: 'peek', end: 'front' },
      { name: 'isEmpty', does: 'isEmpty' },
      { name: 'size', does: 'size' },
    ],
  },
  deque: {
    title: 'deque',
    ops: [
      { name: 'push_front', does: 'insert', end: 'front' },
      { name: 'push_back', does: 'insert', end: 'back' },
      { name: 'pop_front', does: 'remove', end: 'front' },
      { name: 'pop_back', does: 'remove', end: 'back' },
      { name: 'front', does: 'peek', end: 'front' },
      { name: 'back', does: 'peek', end: 'back' },
      { name: 'isEmpty', does: 'isEmpty' },
      { name: 'size', does: 'size' },
    ],
  },
};

/* How a call is written in the log, with the real value rather than an `x`. The receiver
   (the `s` of the ADT table's push(s, x)) is left out: there is one container on screen. */
const written = (op: Op, arg = '') => `${op.name}(${arg})`;

const MAX = 5; // items the stage has room for; the real containers have no such limit
const LOG_LINES = 8; // more than the log box shows at any width; the overflow fades out of its top

interface Item { id: number; value: string }
interface Line { id: number; call: string; ret?: string; note?: string; error?: string }
interface State {
  items: Item[];
  log: Line[];
  tick: number; // operations run so far; ids for items, log lines and the ghost come from it
  pushes: number; // successful inserts, which is where the next suggested value comes from
  hit: number[]; // ids the last operation touched, outlined until the next one
  fresh: { id: number; end: End } | null; // the item the last operation inserted
  ghost: { value: string; end: End } | null; // the item the last operation removed
  failed: boolean;
}
type Action = { op: Op; x: string } | 'reset';

const EMPTY: State = { items: [], log: [], tick: 0, pushes: 0, hit: [], fresh: null, ghost: null, failed: false };

function step(state: State, kind: Kind, op: Op, x: string): State {
  const tick = state.tick + 1;
  const { items } = state;
  const next: State = { ...state, tick, hit: [], fresh: null, ghost: null, failed: false };
  const say = (line: Omit<Line, 'id'>) => [...state.log, { id: tick, ...line }].slice(-LOG_LINES);
  const fail = (call: string, error: string): State => ({ ...next, failed: true, log: say({ call, error }) });

  if (op.does === 'insert') {
    if (items.length >= MAX) return fail(written(op, x), `this figure stops at ${MAX}`);
    const item = { id: tick, value: x };
    return {
      ...next,
      items: op.end === 'back' ? [...items, item] : [item, ...items],
      pushes: state.pushes + 1,
      hit: [tick],
      fresh: { id: tick, end: op.end },
      log: say({ call: written(op, x) }),
    };
  }

  const call = written(op);
  if (!('end' in op)) {
    return op.does === 'isEmpty'
      ? { ...next, log: say({ call, ret: String(items.length === 0) }) }
      : { ...next, hit: items.map((it) => it.id), log: say({ call, ret: String(items.length) }) };
  }

  // remove and peek share the "requires not empty" clause of the ADT table
  if (items.length === 0) return fail(call, `requires ${kind} not empty`);
  const target = op.end === 'back' ? items[items.length - 1] : items[0];
  if (op.does === 'peek') return { ...next, hit: [target.id], log: say({ call, ret: target.value }) };
  return {
    ...next,
    items: items.filter((it) => it !== target),
    ghost: { value: target.value, end: op.end },
    log: say({ call, note: `removed ${target.value}` }),
  };
}

/* The opening state is built by running real inserts, so the log already shows the calls
   that produced the picture. Nothing is marked fresh or hit: no animation on page load. */
function start(kind: Kind, initial: (string | number)[]): State {
  const insert = KINDS[kind].ops.find((op) => op.does === 'insert' && op.end === 'back')!;
  const built = initial.slice(0, MAX).reduce<State>((s, v) => step(s, kind, insert, String(v)), EMPTY);
  return { ...built, hit: [], fresh: null };
}

interface Props {
  kind?: Kind;
  initial?: (string | number)[];
}

export default function AdtPlayground({ kind = 'stack', initial = [1, 2, 3] }: Props) {
  const { title, ops } = KINDS[kind];
  const [state, dispatch] = useReducer(
    (s: State, a: Action) => (a === 'reset' ? start(kind, initial) : step(s, kind, a.op, a.x)),
    null,
    () => start(kind, initial),
  );
  // What the reader typed into each insert's value box, by operation name. An untouched box
  // suggests the next number, so repeated pushes show their order without any typing.
  const [typed, setTyped] = useState<Record<string, string>>({});
  const suggested = String(state.pushes + 1);

  const run = (op: Op) => {
    dispatch({ op, x: typed[op.name]?.trim() || suggested });
    if (op.does === 'insert') setTyped({});
  };

  const last = state.items.length - 1;
  const tagFor = (i: number) => {
    if (kind === 'stack') return i === last ? 'top' : null;
    if (i === 0 && i === last) return 'front & back';
    return i === 0 ? 'front' : i === last ? 'back' : null;
  };

  return (
    <figure className={`fig ${css.root}`} data-adt={kind} aria-label={title} style={{ '--max': MAX } as CSSProperties}>
      <div className={`fig-head ${css.head}`}>
        <span>{title}</span>
        <button
          type="button"
          className={css.reset}
          onClick={() => {
            dispatch('reset');
            setTyped({});
          }}
        >
          reset
        </button>
      </div>
      <div className={`fig-body ${css.frame}`}>
        <div className={css.body}>
          <div className={css.stage}>
            <ol
              className={css.cells}
              data-failed={state.failed || undefined}
              aria-label={`${kind}, ${kind === 'stack' ? 'bottom to top' : 'front to back'}`}
            >
              {state.items.map((it, i) => (
                <li
                  key={it.id}
                  className={css.cell}
                  data-hit={state.hit.includes(it.id) || undefined}
                  data-from={state.fresh?.id === it.id ? state.fresh.end : undefined}
                >
                  {it.value}
                  {/* the space is for screen readers ("3 top", not "3top"); a grid item drops it visually */}
                  {tagFor(i) && <> <span className={css.tag}>{tagFor(i)}</span></>}
                </li>
              ))}
              {state.items.length === 0 && <li className={css.empty}>empty</li>}
              {state.ghost && (
                <li key={`ghost-${state.tick}`} className={`${css.cell} ${css.ghost}`} data-end={state.ghost.end} aria-hidden="true">
                  {state.ghost.value}
                </li>
              )}
            </ol>
          </div>
          <div className={css.ops}>
            {ops.map((op) =>
              op.does === 'insert' ? (
                // push( 4 ): the value box sits inside the call, so the button says what it will do
                <span key={op.name} className={css.call}>
                  <button type="button" aria-label={op.name} onClick={() => run(op)}>{`${op.name}(`}</button>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    aria-label={`value to ${op.name}`}
                    value={typed[op.name] ?? suggested}
                    placeholder={suggested}
                    onChange={(e) => setTyped({ ...typed, [op.name]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') run(op);
                    }}
                  />
                  <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => run(op)}>)</button>
                </span>
              ) : (
                <button key={op.name} type="button" className={css.btn} onClick={() => run(op)}>
                  {written(op)}
                </button>
              ),
            )}
          </div>
          <div className={css.log} role="log" aria-label="calls so far">
            {state.log.map((line) => (
              <div key={line.id} className={css.line}>
                {line.call}
                {line.ret !== undefined && <>{' → '}<span className={css.ret}>{line.ret}</span></>}
                {line.note && <span className={css.note}>{` // ${line.note}`}</span>}
                {line.error && <span className={css.err}>{` ✗ ${line.error}`}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
