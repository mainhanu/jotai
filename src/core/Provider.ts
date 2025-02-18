import { createElement, useCallback, useDebugValue, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import type { Atom, Scope } from './atom'
import {
  ScopeContainer,
  createScopeContainer,
  getScopeContext,
  isDevScopeContainer,
} from './contexts'
import type { ScopeContainerForDevelopment } from './contexts'
import { DEV_GET_ATOM_STATE, DEV_GET_MOUNTED } from './store'
import type { AtomState, Store } from './store'
import { useMutableSource } from './useMutableSource'

export const Provider = ({
  initialValues,
  scope,
  children,
}: PropsWithChildren<{
  initialValues?: Iterable<readonly [Atom<unknown>, unknown]>
  scope?: Scope
}>) => {
  const scopeContainerRef = useRef<ScopeContainer>()
  if (!scopeContainerRef.current) {
    // lazy initialization
    scopeContainerRef.current = createScopeContainer(initialValues)
  }

  if (
    typeof process === 'object' &&
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test' &&
    isDevScopeContainer(scopeContainerRef.current)
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugState(scopeContainerRef.current)
  }

  const ScopeContainerContext = getScopeContext(scope)
  return createElement(
    ScopeContainerContext.Provider,
    {
      value: scopeContainerRef.current as ReturnType<
        typeof createScopeContainer
      >,
    },
    children
  )
}

const atomToPrintable = (atom: Atom<unknown>) =>
  atom.debugLabel || atom.toString()

const stateToPrintable = ([store, atoms]: [Store, Atom<unknown>[]]) =>
  Object.fromEntries(
    atoms.flatMap((atom) => {
      const mounted = store[DEV_GET_MOUNTED]?.(atom)
      if (!mounted) {
        return []
      }
      const dependents = mounted.d
      const atomState = store[DEV_GET_ATOM_STATE]?.(atom) || ({} as AtomState)
      return [
        [
          atomToPrintable(atom),
          {
            value: atomState.e || atomState.p || atomState.w || atomState.v,
            dependents: Array.from(dependents).map(atomToPrintable),
          },
        ],
      ]
    })
  )

// We keep a reference to the atoms in Provider's registeredAtoms in dev mode,
// so atoms aren't garbage collected by the WeakMap of mounted atoms
const useDebugState = (scopeContainer: ScopeContainerForDevelopment) => {
  const [store, , devMutableSource, devSubscribe] = scopeContainer
  const atoms = useMutableSource(
    devMutableSource,
    useCallback((devContainer) => devContainer.atoms, []),
    devSubscribe
  )
  useDebugValue([store, atoms], stateToPrintable)
}
