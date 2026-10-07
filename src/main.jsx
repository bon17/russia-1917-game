import React, { useEffect, useReducer, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { scenes, crisisLabels, crisisHelp } from './data/scenes.js';
import { initialState, reducer } from './game/state.js';
import './styles.css';
import './theme.css';

function Badge({ badge }) {
  return <div className="badge"><span aria-hidden="true">✦</span><div><small>역사 발견 배지</small><strong>{badge.title}</strong><p>{badge.description}</p><small>{badge.source}</small></div></div>;
}
function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const heading = useRef(null);
  const continueButton = useRef(null);
  const lastChoice = useRef(null);
  const scene = scenes[state.index];
  useEffect(() => {
    if (state.phase === 'result') continueButton.current?.focus();
    else heading.current?.focus();
    window.scrollTo(0, 0);
  }, [state.phase, state.index]);
  const next = () => dispatch({ type: 'CONTINUE' });
  return <div className="shell">
    <header className="masthead"><a href="#" onClick={e => { e.preventDefault(); dispatch({ type: 'RESET' }); }}>1917 <span>러시아를 구하라</span></a><span className="edition">수업용 시제품</span></header>
    {state.phase === 'start' ? <main className="intro">
      <div className="eyebrow">선택으로 만나는 세계사</div><h1 ref={heading} tabIndex={-1}>나라가 바뀌면,<br/>삶도 바뀔까요?</h1>
      <p className="intro-copy">전쟁은 길어지고, 빵은 부족합니다.<br/>1917년 러시아. 사람들에게 필요한 변화를 골라보세요.</p>
      <div className="intro-note"><strong>선택하고, 영향을 살펴보고, 실제 역사와 만납니다.</strong><p>선택이 실제 역사를 바꾸지는 않습니다. 어떤 선택을 해도 이야기는 이어집니다.</p></div>
      <button className="primary" onClick={() => dispatch({ type: 'START' })}>1917년 러시아로 들어가기 <span>→</span></button>
      <p className="scope">이번 시제품: 장면 1~3 + 2월 혁명 요약 + 임시 정부 배지 예시.<br/>전체 게임과 10월 혁명·최종 엔딩은 아직 포함하지 않았습니다.</p>
    </main> : <>
      <section className="gauges" aria-label="위기 상태"><div className="gauge-caption">막대가 길수록 어려움이 큽니다.<span>점수나 남은 생명이 아닙니다.</span></div><div className="gauge-row">{Object.entries(state.crisis).map(([key, value]) => <div className={'gauge '+key} key={key}><div className="gauge-title"><strong>{crisisLabels[key]}</strong><span>{value >= 75 ? '매우 어려움' : value >= 45 ? '어려움' : '비교적 낮음'}</span></div><div role="meter" aria-label={crisisLabels[key]+' 위기'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={value >= 75 ? '매우 어려움' : value >= 45 ? '어려움' : '비교적 낮음'} className="track"><div style={{width: value+'%'}}/></div><small>{crisisHelp[key]}</small></div>)}</div></section>
      {['scene', 'result'].includes(state.phase) && <main className="play" inert={state.phase === 'result' ? true : undefined}>
        <div className="scene-meta"><span>{scene.date}</span><span>시제품 {state.index + 1} / 4 · 장면 {scene.number}</span></div>
        <h1 ref={heading} tabIndex={-1}>{scene.title}</h1>
        <div className="scene-grid"><div className={'illustration art-'+state.index} role="img" aria-label={scene.place+' 임시 배경'}><div className="snow"/><span className="scene-symbol" aria-hidden="true">{scene.symbol}</span><span className="art-place">{scene.place}</span><span className="placeholder">임시 배경 · 이미지 없이도 플레이할 수 있어요</span></div><section className="story" aria-label="상황과 인물의 말">{scene.narrative.map(p => <p key={p}>{p}</p>)}<div className="dialogues">{scene.dialogue.map(([who, words]) => <blockquote key={who}><cite>{who}</cite><p>“{words}”</p></blockquote>)}</div></section></div>
        <section className="decision"><div className="eyebrow">당신의 결정</div><h2>{scene.question}</h2><div className="choices">{scene.choices.map((choice, i) => <button key={choice.id} onClick={e => { lastChoice.current = e.currentTarget; dispatch({ type: 'PICK', id: choice.id }); }}><span className="choice-number">{i+1}</span><span>{choice.text}</span><span className="arrow" aria-hidden="true">→</span></button>)}</div></section>
      </main>}
      {state.phase === 'bridge' && <main className="event"><div className="eyebrow">실제 역사의 전환점 · 장면 4 요약</div><h1 ref={heading} tabIndex={-1}>거리로 나온 사람들</h1><p>“빵을 달라! 전쟁을 끝내라!”</p><p>시위가 커지고 일부 병사도 합류했습니다.</p><div className="timeline"><strong>2월 혁명</strong><span>↓</span><strong>차르 퇴위</strong><span>↓</span><strong>임시 정부 수립</strong></div><p className="scope">2월은 당시 러시아 달력 기준입니다. 오늘날 달력으로는 3월입니다.<br/>시제품에서는 장면 4의 선택을 생략하고 역사 흐름을 요약했습니다.</p><button className="primary" onClick={next}>임시 정부의 결정 살펴보기 →</button></main>}
      {state.phase === 'end' && <main className="ending"><div className="eyebrow">시제품 체험 완료</div><h1 ref={heading} tabIndex={-1}>정부는 바뀌었지만,<br/>어려움은 남았습니다.</h1><p>전쟁과 생활고, 정치적 불만이 함께 사람들을 힘들게 했습니다.<br/>임시 정부가 들어선 뒤에도 전쟁은 계속되었습니다.</p><section className="badge-collection" aria-label="발견한 역사 배지">{state.badges.length ? state.badges.map(b => <Badge key={b.id} badge={b}/>) : <p>이번에는 실제 임시 정부와 다른 대응을 살펴봤습니다.</p>}</section><p className="scope">배지는 실제 역사와의 연결을 나타냅니다. 좋은 선택이나 정답이라는 뜻은 아닙니다.<br/>다음 이야기인 레닌·볼셰비키와 10월 혁명은 전체 버전에서 이어집니다.</p><button className="primary" onClick={() => dispatch({ type: 'RESET' })}>처음으로 돌아가기 →</button></main>}
    </>}
    {state.phase === 'result' && <div className="modal-backdrop"><section className="result" role="dialog" aria-modal="true" aria-labelledby="result-title" onKeyDown={e => {
      if (e.key === 'Tab') { e.preventDefault(); continueButton.current?.focus(); }
      if (e.key === 'Escape') e.preventDefault();
    }}><div className="eyebrow">선택의 영향</div><h2 id="result-title">{state.result.selected.text}</h2><p>{state.result.selected.feedback}</p><div className="delta-list" aria-label="선택에 따른 게이지 변화">{Object.entries(crisisLabels).map(([key, label]) => { const change = state.result.after[key] - state.result.before[key]; return <span key={key} className={change > 0 ? 'up' : change < 0 ? 'down' : 'same'}>{label} {change > 0 ? '↑ 상승' : change < 0 ? '↓ 하락' : '— 유지'}</span>; })}</div><p className="fine">게이지는 이 선택의 예상 영향을 나타냅니다. 실제 역사가 바뀐 것은 아닙니다.</p><div className="history"><div className="eyebrow">실제 역사에서는</div><p>{scene.history}</p>{scene.historicalDelta && <small>계속하면 실제 전쟁 지속에 따른 전쟁·생활·정치 위기의 상승을 반영합니다.</small>}</div>{state.result.selected.badge && <><Badge badge={state.result.selected.badge}/><p className="fine">배지는 좋은 선택이나 정답을 뜻하지 않습니다.</p></>}<button ref={continueButton} className="primary" onClick={next}>{state.index === scenes.length - 1 ? '시제품 정리 보기' : '계속'} →</button></section></div>}
    <footer>역사적 선택의 영향과 실제 사건을 함께 살펴보는 수업용 게임</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
