import type { Atom, Scope, WritableAtom } from './atom';
import { getScopeContainer } from './contexts';
import { READ_ATOM, WRITE_ATOM } from './store';

export function getValue<Value, Update>(
  atom: Atom<Value> | WritableAtom<Value, Update>,
  scope: Scope | undefined = undefined
) {
  const [store] = getScopeContainer(scope);
  return store[READ_ATOM](atom);
}

export const setValue = <Value, Update>(
  atom: Atom<Value> | WritableAtom<Value, Update>,
  update: Update,
  scope: Scope | undefined = undefined
) => {
  if (isWritable(atom)) {
    const [store] = getScopeContainer(scope);
    store[WRITE_ATOM](atom, update)
  } else {
    throw new Error('not writable atom')
  }
}

const isWritable = <Value, Update>(
  atom: Atom<Value> | WritableAtom<Value, Update>
): atom is WritableAtom<Value, Update> =>
  !!(atom as WritableAtom<Value, Update>).write