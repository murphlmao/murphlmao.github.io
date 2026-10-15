import { useReducer, useState, type CSSProperties } from 'react';
import css from './DequeMemory.module.css';

/* What a std::deque looks like underneath, after libstdc++: a "map", a small array of
   pointers, each pointing at a fixed-size block of elements, and two positions, start and
   finish, each a map slot plus a cell. start is the front element; finish is the cell after
   the back, where the next push_back lands. An element never moves once stored. A push at
   either end fills that end's block and allocates a new block when it runs out of cells; a
   pop frees a block once nothing is left in it. When the map itself runs out of slots on
   one side, only the pointers are touched: they slide back to the middle if the map is
   roomy enough (libstdc++'s rule, _M_reallocate_map), else a bigger map is allocated and
   the pointers copied into it. Either way no element is copied.

   As in libstdc++, finish always points at a real cell: the push_back that fills the last
   cell of a block allocates the next block right then, for finish to sit on, and that
   trailing block is freed again by the pop_back that moves finish back out of it. push_front
   allocates only when it must, since start points at a cell that is in use.

   The figure draws the map down the left, one row per slot, and each slot's block to its
   right. Rows are memory order: the front is the top-left used cell and the back the
   bottom-right, so at(i) can be read off the picture.

   Simplifications: a real block is 512 bytes (128 ints), here it is 4 so one fills in a few
   clicks; and the map never grows, the figure stops where a real deque would reallocate it. */

type End = 'front' | 'back';
type Op =
  | { name: 'push_front' | 'push_back'; does: 'insert'; end: End }
  | { name: 'pop_front' | 'pop_back'; does: 'remove'; end: End }
  | { name: 'at'; does: 'index' };

const OPS: Op[] = [
  { name: 'push_front', does: 'insert', end: 'front' },
  { name: 'push_back', does: 'insert', end: 'back' },
  { name: 'pop_front', does: 'remove', end: 'front' },
  { name: 'pop_back', does: 'remove', end: 'back' },
  { name: 'at', does: 'index' },
];

const LOG_LINES = 16; // beside the map the log is tall; the overflow fades out of its top
const letter = (i: number) => String.fromCharCode(97 + (i % 26)); // blocks are named a, b, c... as they are allocated

interface Item { id: number; value: string }
interface Line { id: number; call: string; ret?: string; note?: string; error?: string }
interface State {
  start: number; // the front element's cell, as slot * blockSize + cell; finish is start + items.length
  items: Item[]; // front first; item i lives at start + i
  names: string[]; // the allocated blocks in slot order, from start's block to finish's block
  allocated: number; // blocks allocated so far, which names the next one
  log: Line[];
  tick: number;
  pushes: number; // successful inserts, which is where the next suggested value comes from
  hit: number[]; // item ids the last operation touched
  hitSlot: number | null; // the map slot at(i) went through
  fresh: string | null; // the block the last operation allocated
  failed: boolean;
}
type Action = { op: Op; x: string } | 'reset';

/* One more block at `end`, one slot further out. At the map's edge libstdc++ recentres the
   pointers when the map is more than twice what is needed, else it reallocates it, which
   this figure does not do. Returns the new start, the block list, the slot used and the
   notes for the log, or an error. */
type Allocated = { ok: true; start: number; names: string[]; name: string; notes: string[] } | { ok: false; error: string };

function allocate(s: Pick<State, 'start' | 'names' | 'allocated'>, B: number, M: number, end: End): Allocated {
  const firstSlot = Math.floor(s.start / B);
  let { start } = s;
  let slot = end === 'back' ? firstSlot + s.names.length : firstSlot - 1;
  const notes: string[] = [];
  if (slot < 0 || slot >= M) {
    const need = s.names.length + 1;
    if (M <= 2 * need) return { ok: false, error: 'map full: a real deque allocates a bigger map & copies its pointers across; this figure stops here' };
    const newFirst = Math.floor((M - need) / 2) + (end === 'front' ? 1 : 0);
    const shift = newFirst - firstSlot;
    start += shift * B;
    slot += shift;
    const last = s.names[s.names.length - 1];
    const where = s.names.length === 1 ? `block ${s.names[0]} now at map[${newFirst}]` : `blocks ${s.names[0]}..${last} now at map[${newFirst}..${newFirst + s.names.length - 1}]`;
    notes.push(`map edge: pointers recentered, ${where}`);
  }
  const full = end === 'back' ? s.names[s.names.length - 1] : s.names[0];
  const name = letter(s.allocated);
  notes.push(`${notes.length ? 'new' : `block ${full} full: new`} block ${name} at map[${slot}]${end === 'back' ? ' so finish has a cell' : ''}`);
  return { ok: true, start, names: end === 'back' ? [...s.names, name] : [name, ...s.names], name, notes };
}

function step(s: State, B: number, M: number, op: Op, x: string): State {
  const tick = s.tick + 1;
  const n = s.items.length;
  const next: State = { ...s, tick, hit: [], hitSlot: null, fresh: null, failed: false };
  const say = (line: Omit<Line, 'id'>) => [...s.log, { id: tick, ...line }].slice(-LOG_LINES);
  const fail = (call: string, error: string): State => ({ ...next, failed: true, log: say({ call, error }) });

  if (op.does === 'insert') {
    const call = `${op.name}(${x})`;
    const item = { id: tick, value: x };
    let { start, names, allocated } = s;
    let notes: string[] = [];
    // push_back lands on finish's cell and then needs a cell for the new finish; push_front
    // needs the cell before start. Either way a block is allocated only when that cell is
    // off the end of what is allocated.
    const needs = op.end === 'back' ? start + n + 1 : start - 1;
    const outside = Math.floor(needs / B) < Math.floor(start / B) || Math.floor(needs / B) >= Math.floor(start / B) + names.length;
    if (outside) {
      const got = allocate(s, B, M, op.end);
      if (!got.ok) return fail(call, got.error);
      ({ start, names, notes } = got);
      allocated += 1;
      next.fresh = got.name;
    }
    return {
      ...next,
      start: op.end === 'front' ? start - 1 : start,
      items: op.end === 'back' ? [...s.items, item] : [item, ...s.items],
      names,
      allocated,
      pushes: s.pushes + 1,
      hit: [tick],
      log: say({ call, note: notes.join('; ') || undefined }),
    };
  }

  if (op.does === 'remove') {
    const call = `${op.name}()`;
    if (n === 0) return fail(call, 'requires deque not empty');
    const target = op.end === 'front' ? s.items[0] : s.items[n - 1];
    let { start, names } = s;
    const notes = [`removed ${target.value}`];
    if (op.end === 'front') {
      // the front block is freed the moment start steps past its last cell
      start += 1;
      if (start % B === 0) {
        notes.push(`block ${names[0]} freed`);
        names = names.slice(1);
      }
    } else if ((start + n) % B === 0) {
      // finish was on the first cell of a trailing block; stepping back out of it frees it
      notes.push(`block ${names[names.length - 1]} freed`);
      names = names.slice(0, -1);
    }
    return { ...next, start, names, items: s.items.filter((it) => it !== target), log: say({ call, note: notes.join(', ') }) };
  }

  // at(i): two hops, the map slot then the cell, which is why it is constant time
  const call = `at(${x})`;
  const i = /^\d+$/.test(x) ? Number(x) : -1;
  if (i < 0 || i >= n) return fail(call, `out of range, size is ${n}`);
  const lin = s.start + i;
  return { ...next, hitSlot: Math.floor(lin / B), hit: [s.items[i].id], log: say({ call, ret: s.items[i].value, note: `map[${Math.floor(lin / B)}], cell ${lin % B}` }) };
}

/* The opening state is built by running real push_backs into an empty deque that owns one
   block in the middle of its map (libstdc++ centres the initial blocks), so the log already
   shows the calls that produced the picture, block allocation included. */
function start(B: number, M: number, initial: (string | number)[]): State {
  const blocks = Math.floor(initial.length / B) + 1;
  const empty: State = {
    start: Math.floor((M - blocks) / 2) * B,
    items: [], names: ['a'], allocated: 1, log: [], tick: 0, pushes: 0, hit: [], hitSlot: null, fresh: null, failed: false,
  };
  const push = OPS.find((op) => op.name === 'push_back')!;
  const built = initial.slice(0, (M - 1) * B - 1).reduce<State>((st, v) => step(st, B, M, push, String(v)), empty);
  return { ...built, hit: [], fresh: null };
}

interface Props {
  blockSize?: number;
  mapSize?: number;
  initial?: (string | number)[];
}

export default function DequeMemory({ blockSize: B = 4, mapSize: M = 8, initial = [1, 2, 3, 4, 5] }: Props) {
  const [state, dispatch] = useReducer(
    (s: State, a: Action) => (a === 'reset' ? start(B, M, initial) : step(s, B, M, a.op, a.x)),
    null,
    () => start(B, M, initial),
  );
  const [typed, setTyped] = useState<Record<string, string>>({});
  const n = state.items.length;
  const finish = state.start + n;
  // an untouched value box suggests the next number; at() suggests the back's index
  const suggested = (op: Op) => (op.does === 'index' ? String(Math.max(0, n - 1)) : String(state.pushes + 1));

  const run = (op: Op) => {
    dispatch({ op, x: typed[op.name]?.trim() || suggested(op) });
    if (op.does === 'insert') setTyped({});
  };

  const firstSlot = Math.floor(state.start / B);
  const tagFor = (i: number) => {
    if (i === 0 && i === n - 1) return 'front & back';
    return i === 0 ? 'front' : i === n - 1 ? 'back' : null;
  };
  // start and finish, the two positions the deque actually keeps; on one cell when empty
  const markFor = (lin: number) => {
    if (lin === state.start && lin === finish) return 'start & finish';
    return lin === state.start ? 'start' : lin === finish ? 'finish' : undefined;
  };
  const at = (lin: number) => `map[${Math.floor(lin / B)}], cell ${lin % B}`;

  return (
    <figure className={`fig ${css.root}`} data-fig="deque-memory" aria-label="inside a deque" style={{ '--map': M } as CSSProperties}>
      <div className={`fig-head ${css.head}`}>
        <span>inside a deque</span>
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
            <ol className={css.map} data-failed={state.failed || undefined} aria-label={`map of ${M} pointers`}>
              {Array.from({ length: M }, (_, slot) => {
                const name = state.names[slot - firstSlot] as string | undefined;
                return (
                  <li
                    key={slot}
                    className={css.row}
                    data-slot={slot}
                    data-block={name}
                    data-hit={state.hitSlot === slot || undefined}
                    data-fresh={(name !== undefined && state.fresh === name) || undefined}
                  >
                    <span className={css.ptr}>{slot}</span>
                    {name !== undefined && (
                      <>
                        <span className={css.arrow} aria-hidden="true">→</span>
                        <ol className={css.cells} aria-label={`block ${name}`}>
                          {Array.from({ length: B }, (_, cell) => {
                            const lin = slot * B + cell;
                            const i = lin - state.start;
                            const item = i >= 0 && i < n ? state.items[i] : null;
                            const mark = markFor(lin);
                            if (!item) {
                              return <li key={`empty-${cell}`} className={css.cell} data-cell data-empty data-mark={mark} aria-hidden={mark ? undefined : 'true'} aria-label={mark && `${mark}, empty`} />;
                            }
                            const tag = tagFor(i);
                            return (
                              <li key={item.id} className={css.cell} data-cell data-mark={mark} data-hit={state.hit.includes(item.id) || undefined}>
                                {item.value}
                                {tag && <> <span className={css.tag}>{tag}</span></>}
                              </li>
                            );
                          })}
                        </ol>
                        <span className={css.name}>{name}</span>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className={css.ops}>
            {OPS.map((op) =>
              op.does === 'remove' ? (
                <button key={op.name} type="button" className={css.btn} onClick={() => run(op)}>
                  {`${op.name}()`}
                </button>
              ) : (
                // push_back( 6 ) / at( 4 ): the value box sits inside the call, so the button says what it will do
                <span key={op.name} className={css.call}>
                  <button type="button" aria-label={op.name} onClick={() => run(op)}>{`${op.name}(`}</button>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    aria-label={op.does === 'index' ? 'index for at' : `value to ${op.name}`}
                    value={typed[op.name] ?? suggested(op)}
                    placeholder={suggested(op)}
                    onChange={(e) => setTyped({ ...typed, [op.name]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') run(op);
                    }}
                  />
                  <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => run(op)}>)</button>
                </span>
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
          <div className={css.readout} data-readout>
            <div><span className={css.mark}>start</span> = {at(state.start)}</div>
            <div><span className={css.mark}>finish</span> = {at(finish)}</div>
          </div>
        </div>
      </div>
    </figure>
  );
}
