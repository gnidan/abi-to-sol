export interface ForStateOptions<State> {
  state: State;
  setState(newState: State): void;
}

/**
 * Predicate that says whether a value should be interpreted as undefined
 */
export type IsEmpty<State, N extends keyof State> = (
  value: State[N]
) => boolean;

export type MakeSet<State> = <N extends keyof State>(
  propertyName: N,
  isEmpty?: IsEmpty<State, N>
) => (newValue: State[N]) => void;

export const forState =
  <State>({ state, setState }: ForStateOptions<State>): MakeSet<State> =>
  (propertyName, isEmpty) =>
  (value) => {
    const newState = {
      ...state,
    };

    if (isEmpty && isEmpty(value)) {
      delete newState[propertyName];
    } else {
      newState[propertyName] = value;
    }

    setState(newState);
  };
