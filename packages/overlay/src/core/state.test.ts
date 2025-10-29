import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStore, createDefaultRuntimeState } from './state';
import type { RuntimeState } from './types';

describe('createStore', () => {
  let baseState: RuntimeState;

  beforeEach(() => {
    baseState = {
      ...createDefaultRuntimeState(),
      timestamp: 1000,
    };
  });

  it('sets a fresh timestamp when updater omits or reuses the existing one', () => {
    const store = createStore(baseState);
    const listener = vi.fn();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(2000);

    store.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);

    store.setState((state) => ({
      ...state,
      active: !state.active,
      timestamp: state.timestamp,
    }));

    expect(nowSpy).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledTimes(2);
    const updatedState = store.getState();
    expect(updatedState.active).toBe(true);
    expect(updatedState.timestamp).toBe(2000);

    nowSpy.mockRestore();
  });

  it('does not notify listeners when the state reference is unchanged', () => {
    const store = createStore(baseState);
    const listener = vi.fn();
    const nowSpy = vi.spyOn(Date, 'now');

    store.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);

    store.setState((state) => state);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(nowSpy).not.toHaveBeenCalled();

    nowSpy.mockRestore();
  });

  it('supports unsubscribe semantics for listeners', () => {
    const store = createStore(baseState);
    const first = vi.fn();
    const second = vi.fn();

    const unsubscribeFirst = store.subscribe(first);
    store.subscribe(second);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeFirst();

    store.setState((state) => ({ ...state, active: true }));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });
});
