import { atom } from 'jotai-expose-store'
import type { SetStateAction, WritableAtom } from 'jotai-expose-store'
import { RESET } from './constants'

export function atomWithReset<Value>(initialValue: Value) {
  type Update = SetStateAction<Value> | typeof RESET
  const anAtom = atom<Value, Update>(initialValue, (get, set, update) => {
    if (update === RESET) {
      set(anAtom, initialValue)
    } else {
      set(
        anAtom,
        typeof update === 'function'
          ? (update as (prev: Value) => Value)(get(anAtom))
          : update
      )
    }
  })
  return anAtom as WritableAtom<Value, Update>
}
