import { scenes } from '../data/scenes.js';
export const initialState = () => ({ phase: 'start', index: 0, crisis: { war: 60, life: 55, politics: 45 }, choices: [], result: null, badges: [] });
export const applyDelta = (crisis, delta = {}) => Object.fromEntries(Object.entries(crisis).map(([key, value]) => [key, Math.max(0, Math.min(100, value + (delta[key] || 0)))]));
export function reducer(state, action) {
  if (action.type === 'RESET') return initialState();
  if (action.type === 'START' && state.phase === 'start') return { ...state, phase: 'scene' };
  if (action.type === 'PICK' && state.phase === 'scene') {
    const scene = scenes[state.index];
    const selected = scene.choices.find(c => c.id === action.id);
    if (!selected) return state;
    const after = applyDelta(state.crisis, selected.delta);
    return { ...state, phase: 'result', crisis: after, result: { selected, before: state.crisis, after }, choices: [...state.choices, { sceneId: scene.id, choiceId: selected.id }], badges: selected.badge && !state.badges.some(b => b.id === selected.badge.id) ? [...state.badges, selected.badge] : state.badges };
  }
  if (action.type === 'CONTINUE' && state.phase === 'result') {
    const crisis = applyDelta(state.crisis, scenes[state.index].historicalDelta);
    if (state.index === 2) return { ...state, crisis, phase: 'bridge', result: null };
    if (state.index === scenes.length - 1) return { ...state, crisis, phase: 'end', result: null };
    return { ...state, crisis, index: state.index + 1, phase: 'scene', result: null };
  }
  if (action.type === 'CONTINUE' && state.phase === 'bridge') return { ...state, index: 3, phase: 'scene' };
  return state;
}
