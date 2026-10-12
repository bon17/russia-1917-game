import React, { useEffect, useReducer, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { scenes, crisisLabels, crisisHelp } from './data/scenes.js';
import { initialState, reducer } from './game/state.js';
import './styles.css';
import './theme.css';

function Badge({ badge }) {
  return <div className="badge"><span aria-hidden="true">✦</span><div><small>역사 발견 배지</small><strong>{badge.title}</strong><p>{badge.description}</p></div></div>;
}
function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const heading = useRef(null);
  const continueButton = useRef(null);
  const scene = scenes[state.index];
  useEffect(() => {
    if (state.phase === 'result') continueButton.current?.focus();
    else heading.current?.focus();
    window.scrollTo(0, 0);
  }, [state.phase, state.index]);
  const next = () => dispatch({ type: 'CONTINUE' });
  return <div className="shell">
    <header className="masthead"><a href="#" onClick={e => { e.preventDefault(); dispatch({ type: 'RESET' }); }}>1917 <span>러시아를 구하라</span></a><span className="edition">수업용 게임</span></header>
    {state.phase === 'start' ? <main className="intro">
      <div className="eyebrow">선택으로 만나는 세계사</div><h1 ref={heading} tabIndex={-1}>나라가 바뀌면,<br/>삶도 바뀔까요?</h1>
      <p className="intro-copy">전쟁은 길어지고, 빵은 부족합니다.<br/>1917년 러시아. 사람들에게 필요한 변화를 골라보세요.</p>
      <div className="intro-note"><strong>선택하고, 영향을 살펴보고, 실제 역사와 만납니다.</strong><p>선택이 실제 역사를 바꾸지는 않습니다. 어떤 선택을 해도 이야기는 이어집니다.</p></div>
      <button className="primary" onClick={() => dispatch({ type: 'START' })}>1917년 러시아로 들어가기 <span>→</span></button>
      <p className="scope">9개의 장면을 따라 두 번의 혁명을 만나보세요.<br/>새로고침하면 처음부터 시작합니다.</p>
    </main> : <>
      <section className="gauges" aria-label="위기 상태"><div className="gauge-caption">실제 당시 상황 · 막대가 길수록 어려움이 큽니다.<span>학습용 표시이며 실제 측정값은 아닙니다.</span></div><div className="gauge-row">{Object.entries(state.crisis).map(([key, value]) => <div className={'gauge '+key} key={key}><div className="gauge-title"><strong>{crisisLabels[key]}</strong><span>{value >= 75 ? '매우 어려움' : value >= 45 ? '어려움' : '비교적 낮음'}</span></div><div role="meter" aria-label={crisisLabels[key]+' 위기'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={value >= 75 ? '매우 어려움' : value >= 45 ? '어려움' : '비교적 낮음'} className="track"><div style={{width: value+'%'}}/></div><small>{crisisHelp[key]}</small></div>)}</div></section>
      {['scene', 'result'].includes(state.phase) && <main className="play" inert={state.phase === 'result' ? true : undefined}>
        <div className="scene-meta"><span>{scene.date} · {scene.role}</span><span>장면 {scene.number} / 9</span></div>
        <h1 ref={heading} tabIndex={-1}>{scene.title}</h1>
        <div className="scene-grid"><div className={'illustration historical-art art-'+state.index} role="img" aria-label={scene.place+' 역사 상황 일러스트'}><span className="art-caption">{scene.place}</span></div><section className="story" aria-label="상황과 인물의 말">{scene.narrative.map(p => <p key={p}>{p}</p>)}<div className="dialogues">{scene.dialogue.map(([who, words]) => <blockquote key={who}><cite>{who}</cite><p>“{words}”</p></blockquote>)}</div></section></div>
        <section className="decision">{scene.kind === 'history' ? <button className="primary" onClick={next}>10월 혁명 확인하기 →</button> : <><div className="eyebrow">당신의 결정</div><h2>{scene.question}</h2><div className="choices">{scene.choices.map((choice, i) => <button key={choice.id} onClick={() => dispatch({ type: 'PICK', id: choice.id })}><span className="choice-number">{i+1}</span><span>{choice.text}</span><span className="arrow" aria-hidden="true">→</span></button>)}</div></>}</section>
      </main>}
      {state.phase === 'event' && <main className="event"><div className="eyebrow">실제 역사의 전환점</div><h1 ref={heading} tabIndex={-1}>{scene.event.title}</h1><div className="timeline"><strong>{scene.event.title}</strong>{scene.event.steps.map(step => <React.Fragment key={step}><span>↓</span><strong>{step}</strong></React.Fragment>)}</div><p>{scene.event.description}</p><p className="scope">{scene.event.dateNote}</p><button className="primary" onClick={next}>계속 →</button></main>}
      {state.phase === 'end' && <main className="ending"><div className="eyebrow">역사 흐름 정리</div><h1 ref={heading} tabIndex={-1}>러시아 혁명은<br/>한 사람이 일으킨 일이 아니었습니다.</h1><p>전쟁과 생활고, 정치적 불만이 쌓인 결과였습니다.</p><div className="ending-flow">{['전쟁 · 생활고 · 정치적 불만', '2월 혁명 → 차르 퇴위 → 임시 정부', '전쟁 계속 → 불만 지속', '레닌·볼셰비키 → 10월 혁명 → 소비에트 정부'].map((text,i) => <React.Fragment key={text}>{i > 0 && <span aria-hidden="true">↓</span>}<strong>{text}</strong></React.Fragment>)}</div><p>새 정부가 들어선 뒤에도 갈등과 내전이 이어졌습니다. 이후 1922년에는 소련이 세워졌습니다.</p><section className="badge-collection" aria-label="발견한 역사 배지">{state.badges.map(b => <Badge key={b.id} badge={b}/>)}</section>{state.badges.length > 0 && <p className="scope">배지는 실제 역사 속 행동을 발견했다는 표시예요. 그 행동이 사람들에게 어떤 영향을 주었는지도 생각해 보세요.</p>}<button className="primary" onClick={next}>마지막으로 생각해 보기 →</button></main>}
      {state.phase === 'reflection' && <main className="ending"><div className="eyebrow">마지막 사고 질문 · 정답은 하나가 아닙니다</div><h1 ref={heading} tabIndex={-1}>임시 정부가 전쟁을<br/>빨리 끝냈다면?</h1><p>10월 혁명으로 이어지는 불만은 어떻게 달라졌을까요?</p><div className="choices">{['병사와 시민의 어려움이 줄어 불만도 줄었을 것이다.', '식량과 땅 문제가 남아 불만은 여전히 컸을 것이다.', '두 가지 모두 가능해서 쉽게 판단하기 어렵다.'].map((answer,i) => <button key={answer} onClick={() => dispatch({ type: 'REFLECT', answer: i })}><span className="choice-number">{i+1}</span><span>{answer}</span></button>)}</div></main>}
      {state.phase === 'complete' && <main className="ending"><div className="eyebrow">역사 탐험 완료</div><h1 ref={heading} tabIndex={-1}>변화를 요구한 이유를<br/>생각해 보았나요?</h1><p>이 질문에는 하나의 정답이 없습니다.<br/>전쟁을 끝내는 일이 무엇을 바꾸고, 어떤 문제를 남겼을지 생각해 보세요.</p><div className="completion-actions"><a className="primary next-game" href="https://bon17.github.io/1919choice/?release=57ae58935dba">다음 게임으로 넘어가기 <span aria-hidden="true">→</span></a><button className="primary replay" onClick={() => dispatch({ type: 'RESET' })}>다시 플레이 →</button></div></main>}

    </>}
    {state.phase === 'result' && <div className="modal-backdrop"><section className="result" role="dialog" aria-modal="true" aria-labelledby="result-title" onKeyDown={e => {
      if (e.key === 'Tab') { e.preventDefault(); continueButton.current?.focus(); }
      if (e.key === 'Escape') e.preventDefault();
    }}><div className="eyebrow">선택의 영향</div><h2 id="result-title">{state.result.selected.text}</h2><p>{state.result.selected.feedback}</p><div className="delta-list" aria-label="선택에 따른 게이지 변화">{Object.entries(crisisLabels).map(([key, label]) => { const change = state.result.after[key] - state.result.before[key]; return <span key={key} className={change > 0 ? 'up' : change < 0 ? 'down' : 'same'}>{label} {change > 0 ? '↑ 상승' : change < 0 ? '↓ 하락' : '— 유지'}</span>; })}</div><p className="fine">위 변화는 선택의 예상 영향입니다. 다음 장면의 게이지는 실제 당시 상황을 보여줍니다.</p><div className="history"><div className="eyebrow">실제 역사와 비교</div><p className="history-connection">{state.result.selected.historyMatch && <strong className="history-match">당신의 선택과 역사가 같아요!</strong>}{state.result.selected.connection}</p><p>{scene.history}</p>{scene.historicalDelta && <small>계속하면 실제 전쟁 지속에 따른 전쟁·생활·정치 위기의 상승을 반영합니다.</small>}</div>{state.result.selected.badge && <><Badge badge={state.result.selected.badge}/><p className="fine">실제 역사 속 행동을 발견해서 배지를 받았어요!</p></>}<button ref={continueButton} className="primary" onClick={next}>{state.index === scenes.length - 1 ? '역사 흐름 정리하기' : '계속'} →</button></section></div>}
    <footer>@BONSSAM 보은쌤과 함께하는 역사 수업</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
