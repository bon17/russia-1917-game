import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reducer, applyDelta } from './state.js';
import { scenes } from '../data/scenes.js';

test('all 19440 paths preserve both revolutions and reach ungraded reflection', () => {
  let count = 0;
  function walk(state, events = []) {
    if (state.phase === 'end') {
      assert.deepEqual(events, ['2월 혁명', '10월 혁명']);
      assert.equal(state.choices.length, 8);
      const reflection = reducer(state, { type: 'CONTINUE' });
      for (const answer of [0,1,2]) {
        const completed = reducer(reflection, { type: 'REFLECT', answer });
        assert.equal(completed.phase, 'complete');
        assert.equal(completed.reflectionAnswer, answer);
        assert.deepEqual(completed.crisis, state.crisis);
        assert.deepEqual(reducer(completed, { type: 'RESET' }), initialState());
      }
      assert.equal(state.badges.length, Number(state.choices.find(c => c.sceneId === 'scene-4').choiceId === 'join') + Number(state.choices.find(c => c.sceneId === 'scene-5').choiceId === 'continue-war'));
      count++;
      return;
    }
    const scene = scenes[state.index];
    assert.deepEqual(state.crisis, scene.historicalCrisis);
    if (scene.kind === 'history') {
      const event = reducer(state, { type: 'CONTINUE' });
      assert.equal(event.phase, 'event');
      const next = reducer(event, { type: 'CONTINUE' });
      assert.deepEqual(next.crisis, scenes[next.index].historicalCrisis);
      walk(next, [...events, scene.event.title]);
      return;
    }
    for (const choice of scene.choices) {
      const result = reducer(state, { type: 'PICK', id: choice.id });
      assert.equal(result.phase, 'result');
      assert.deepEqual(result.crisis, state.crisis);
      assert.deepEqual(result.result.after, applyDelta(state.crisis, choice.delta));
      assert.equal(reducer(result, { type: 'PICK', id: choice.id }), result);
      let next = reducer(result, { type: 'CONTINUE' });
      let history = events;
      if (scene.event) {
        assert.equal(next.phase, 'event');
        history = [...events, scene.event.title];
        next = reducer(next, { type: 'CONTINUE' });
      }
      walk(next, history);
    }
  }
  walk(reducer(initialState(), { type: 'START' }));
  assert.equal(count, 19440);
});
test('bounds never cause game over and invalid actions are ignored', () => {
  assert.deepEqual(applyDelta({ war: 99, life: 1, politics: 100 }, { war: 20, life: -20 }), { war: 100, life: 0, politics: 100 });
  const start = initialState();
  assert.equal(reducer(start, { type: 'PICK', id: 'orders' }), start);
  const state = { ...start, phase: 'scene', crisis: { war: 100, life: 100, politics: 100 } };
  assert.equal(reducer(state, { type: 'PICK', id: 'orders' }).phase, 'result');
  assert.equal(reducer(state, { type: 'CONTINUE' }), state);
  assert.equal(reducer(state, { type: 'PICK', id: 'missing' }), state);
});
