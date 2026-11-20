import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

// A middleware takes the store's recipe and returns a new recipe whose `set` does a little more.
// Here: after every change, print the action name and which top-level fields changed (in `npm run dev` only).

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  recipe: StateCreator<T, Mps, Mcs>,
  name: string,
) => StateCreator<T, Mps, Mcs>

type LoggerImpl = <T>(recipe: StateCreator<T, [], []>, name: string) => StateCreator<T, [], []>

const loggerImpl: LoggerImpl = (recipe, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const before = get()
    set(...(args as Parameters<typeof set>))
    if (import.meta.env.MODE !== 'development') return
    const after = get()
    const action = (args as unknown[])[2] ?? 'anonymous' // the name passed to set(…, false, 'name')
    const changed = Object.keys(after as object).filter(
      (key) => (after as Record<string, unknown>)[key] !== (before as Record<string, unknown>)[key],
    )
    console.log(`%c[${name}] ${String(action)}`, 'color: #888', changed)
  }
  return recipe(loggedSet, get, store)
}

// The cast gives it Zustand's full middleware type (the same trick as the Zustand docs' logger example).
export const logger = loggerImpl as unknown as Logger
