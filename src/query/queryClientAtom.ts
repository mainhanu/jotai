import { QueryClient } from 'react-query'
import { atom } from 'jotai-expose-store'

export const queryClientAtom = atom(new QueryClient())
