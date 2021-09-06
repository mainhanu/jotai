import { useAtom } from 'jotai-expose-store'
import type { Atom } from 'jotai-expose-store'
import type { Scope } from '../core/atom'

export function useAtomValue<Value>(anAtom: Atom<Value>, scope?: Scope) {
  return useAtom(anAtom, scope)[0]
}
