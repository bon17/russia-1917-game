import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reducer, applyDelta } from './state.js';
import { scenes } from '../data/scenes.js';
test('all 180 choice combinations follow the fixed historical bridge and finish', () => {
  let count = 0;
  for (const a of scenes[0].choices) for (const b of scenes[1].choices) for (const c of scenes[2].choices) for (const d of scenes[3].choices) {
    let state = reducer(initialState(), { type: 'START' });
    for (const selected of [a,b,c]) {
      state = reducer(state, { type: 'PICK', id: selected.id });
      assert.equal(state.phase, 'result');
      assert.equal(reducer(state, { type: 'PICK', id: selected.id }), state);
      state = reducer(state, { type: 'CONTINUE' });
    }
    assert.equal(state.phase, 'bridge');
    state = reducer(state, { type: 'CONTINUE' });
    assert.equal(scenes[state.index].id, 'scene-5');
    state = reducer(state, { type: 'PICK', id: d.id });
    const beforeHistory = state.crisis;
    state = reducer(state, { type: 'CONTINUE' });
    assert.equal(state.phase, 'end');
    assert.deepEqual(state.crisis, applyDelta(beforeHistory, scenes[3].historicalDelta));
    assert.equal(state.choices.length, 4);
    assert.equal(state.badges.length, d.id === 'continue-war' ? 1 : 0);
    assert.deepEqual(reducer(state, { type: 'RESET' }), initialState());
    count++;
  }
  assert.equal(count, 180);
});
test('crisis stays within bounds without ending the game', () => {
  assert.deepEqual(applyDelta({ war: 99, life: 1, politics: 100 }, { war: 20, life: -20 }), { war: 100, life: 0, politics: 100 });
  const state = { ...initialState(), phase: 'scene', crisis: { war: 100, life: 100, politics: 100 } };
  assert.equal(reducer(state, { type: 'PICK', id: 'orders' }).phase, 'result');
});
test('invalid and out-of-phase actions do not change state', () => {
  const state = initialState();
  assert.equal(reducer(state, { type: 'PICK', id: 'orders' }), state);
  assert.equal(reducer(state, { type: 'CONTINUE' }), state);
  const started = reducer(state, { type: 'START' });
  assert.equal(reducer(started, { type: 'PICK', id: 'missing' }), started);
});
