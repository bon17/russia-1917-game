import { scenes } from '../data/scenes.js';
export const initialState = () => ({ phase: 'start', index: 0, crisis: { ...scenes[0].historicalCrisis }, choices: [], result: null, badges: [], reflectionAnswer: null });
export const applyDelta = (crisis, delta = {}) => Object.fromEntries(Object.entries(crisis).map(([key, value]) => [key, Math.max(0, Math.min(100, value + (delta[key] || 0)))]));
const advance = state => {
  const index = state.index + 1;
  return index >= scenes.length ? { ...state, phase: 'end', result: null } : { ...state, index, crisis: { ...scenes[index].historicalCrisis }, phase: 'scene', result: null };
};
export function reducer(state, action) {
  if (action.type === 'RESET') return initialState();
  if (action.type === 'START' && state.phase === 'start') return { ...state, phase: 'scene' };
  if (action.type === 'PICK' && state.phase === 'scene') {
    const scene = scenes[state.index];
    const selected = scene.choices.find(c => c.id === action.id);
    if (!selected) return state;
    const after = applyDelta(state.crisis, selected.delta);
    return { ...state, phase: 'result', result: { selected, before: state.crisis, after }, choices: [...state.choices, { sceneId: scene.id, choiceId: selected.id }], badges: selected.badge && !state.badges.some(b => b.id === selected.badge.id) ? [...state.badges, selected.badge] : state.badges };
  }
  if (action.type === 'CONTINUE' && state.phase === 'result') {
    const next = { ...state, result: null };
    return scenes[state.index].event ? { ...next, phase: 'event' } : advance(next);
  }
  if (action.type === 'CONTINUE' && state.phase === 'scene' && scenes[state.index].kind === 'history') return { ...state, phase: 'event' };
  if (action.type === 'CONTINUE' && state.phase === 'event') return advance(state);
  if (action.type === 'CONTINUE' && state.phase === 'end') return { ...state, phase: 'reflection' };
  if (action.type === 'REFLECT' && state.phase === 'reflection' && [0,1,2].includes(action.answer)) return { ...state, reflectionAnswer: action.answer, phase: 'complete' };
  return state;
}
