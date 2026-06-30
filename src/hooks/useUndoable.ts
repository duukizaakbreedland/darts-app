import { useReducer } from 'react'

type Internal<A> = { type: 'do'; action: A } | { type: 'undo' }

/**
 * Generieke reducer met snapshot-undo. Elke actie die de state wijzigt, bewaart
 * de vorige state; undo zet één stap terug. Herbruikbaar voor alle spelmodi.
 */
export function useUndoable<S, A>(reducer: (state: S, action: A) => S, initial: S) {
  const [state, dispatch] = useReducer(
    (st: { past: S[]; present: S }, ia: Internal<A>) => {
      if (ia.type === 'undo') {
        if (st.past.length === 0) return st
        return { past: st.past.slice(0, -1), present: st.past[st.past.length - 1] }
      }
      const next = reducer(st.present, ia.action)
      if (next === st.present) return st
      return { past: [...st.past, st.present], present: next }
    },
    { past: [], present: initial }
  )

  return {
    state: state.present,
    canUndo: state.past.length > 0,
    dispatch: (action: A) => dispatch({ type: 'do', action }),
    undo: () => dispatch({ type: 'undo' }),
  }
}
