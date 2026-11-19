/* Independent adaptation of the exploration, profile and watchlist flows
   in scksh/bizsignal-demo at fcd9425. All procurement rows come from sample.js. */
(() => {
  "use strict";
  const sample = window.BIZ_SAMPLE;
  const icon = window.BizIcon;
  const $ = s => document.querySelector(s);
  const e = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const unique = values => [...new Set(values.filter(Boolean))];
  const fields = unique(sample.notices.map(n => n.field));
  const regions = unique(sample.notices.map(n => n.region));
  const areaShort = name => String(name||"").replace(/특별자치도$|특별자치시$|광역시$|특별시$/,"").replace(/^(경기|강원|제주)도$/,"$1");
  const stages = ["검토 전","검토 중","참여 준비","보류"];
  const pages = {explore:"공고 탐색", market:"조달시장 분석", assistant:"AI 사업 도우미", watch:"관심 사업 · 변경 알림"};
  const icons = {explore:"search",market:"chart",assistant:"sparkles",watch:"bookmark"};
  const defaultProfile = {company:"우리 회사", region:"미설정", categories:[fields[0]].filter(Boolean), keywords:["ERP","시스템"]};
  const storageKey = "bizsignal.essential.public.v1";
  const noticeIndex = new Map(sample.notices.map(n=>[n.id,n]));
  const planIndex = new Map(sample.plans.map(p=>[p.id,p]));
  const planNotices = new Map();
  for (const notice of sample.notices) {
    if (!notice.planId) continue;
    if (!planNotices.has(notice.planId)) planNotices.set(notice.planId,[]);
    planNotices.get(notice.planId).push(notice);
  }
  const byId = id => noticeIndex.get(id);
  const changeFor = id => sample.changes.filter(c => c.noticeId === id);
  const choices = (values,current) => values.map(v=>`<option value="${e(v)}" ${v===current?"selected":""}>${e(v)}</option>`).join("");
  const link = (url,label) => /^https?:\/\//.test(url || "") ? `<a class="source-link" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>` : "";
  const won = value => Number.isFinite(value) ? value.toLocaleString("ko-KR")+"원" : "미확인";
  const dateFormats = [false,true].map(withTime => new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",...(withTime ? {hour:"2-digit",minute:"2-digit",hourCycle:"h23"} : {})}));
  function date(value, withTime=true) {
    if (!value) return "미확인";
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return String(value);
    return dateFormats[Number(withTime)].format(d).replaceAll("-",".");
  }
  const days = n => {
    if (!n.deadline) return null;
    if (Date.parse(n.deadline) <= Date.parse(sample.asOf)) return -1;
    const kstDay = v => Date.parse(date(v,false).replaceAll(".","-") + "T00:00:00Z");
    return Math.round((kstDay(n.deadline)-kstDay(sample.asOf))/86400000);
  };
  function read() {
    const firstChange = sample.changes.find(c=>byId(c.noticeId));
    const initial = {profile:defaultProfile, saved:firstChange ? {[firstChange.noticeId]:stages[0]} : {}, read:[]};
    try {
      const item=JSON.parse(localStorage.getItem(storageKey));
      if (item?.profile && Array.isArray(item.profile.categories) && Array.isArray(item.profile.keywords) && typeof item.profile.company==="string" && typeof item.saved==="object" && item.saved && Array.isArray(item.read)) return item;
    } catch {}
    return initial;
  }
  const state = read();
  const form = {tab:"전체 공고", text:"", field:"전체 분야", region:"전체 지역", open:true, week:false, sort:"관련도 높은 순"};
  const pageSize = 8;
  let resultPage = 1;
  const rangeDays = new Map(sample.notices.map(n=>[n.id,days(n)]));
  const countOpen = sample.notices.filter(n=>rangeDays.get(n.id)!=null && rangeDays.get(n.id)>=0).length;
  const countWeek = sample.notices.filter(n=>rangeDays.get(n.id)!=null && rangeDays.get(n.id)>=0 && rangeDays.get(n.id)<=7).length;
  function normalized(text) {return String(text||"").normalize("NFC").trim().toLocaleLowerCase("ko-KR");}
  const noticeText = new Map(sample.notices.map(n=>[n.id,normalized([n.title,n.org,n.publisher,n.number,n.task,...(n.terms||[])].join(" "))]));
  const planText = new Map(sample.plans.map(p=>[p.id,normalized([p.title,p.org,p.id].join(" "))]));
  const scoreCache = new Map();
  let watchStage="전체", readFilter="전체", activePage="explore", detailId=null;
  function persist() {try {localStorage.setItem(storageKey,JSON.stringify(state));} catch {}}
  function score(n) {
    if (scoreCache.has(n.id)) return scoreCache.get(n.id);
    const p=state.profile, hay=[n.title,n.task,...(n.terms||[])].join(" ").toLowerCase();
    const field=p.categories.includes(n.field);
    const hits=unique(p.keywords).filter(w=>hay.includes(w.toLowerCase())).slice(0,2);
    const region=p.region!=="미설정" && (areaShort(p.region)===areaShort(n.region) || n.region==="전국");
    const match = {points:(field?50:0)+hits.length*20+(region?10:0), matched:field||hits.length>0,
      detail:[field?"분야 "+n.field+" +50":"",...hits.map(w=>"키워드 ‘"+w+"’ +20"),region?"참가 지역 +10":""].filter(Boolean).join(" · ")||"일치한 관심 분야·키워드·지역 없음"};
    scoreCache.set(n.id,match);
    return match;
  }
  function nav(key) {
    return `<button class="nav-link ${key===activePage?"active":""}" data-page="${key}" aria-label="${pages[key]}" ${key===activePage?'aria-current="page"':""}>${icon(icons[key])}${key==="watch"?"관심 · 변경 알림":pages[key]}${key==="watch"?'<span class="nav-count" id="saved-count">'+Object.keys(state.saved).length+'</span>':""}</button>`;
  }
  function brand() {return '<button class="brand" data-page="explore" aria-label="BizSignal 공고 탐색"><span class="brand-symbol"><i></i><i></i><i></i></span>BizSignal<span class="brand-dot">.</span></button>';}
  function badge(text,style="gray") {return '<span class="badge '+style+'">'+e(text)+'</span>';}
  function saved(n) {return Object.hasOwn(state.saved,n.id);}
  function bookmark(n) {
    return `<button class="icon-button bookmark ${saved(n)?"is-saved":""}" data-save="${e(n.id)}" aria-pressed="${saved(n)}" aria-label="${e(n.title)} 관심 ${saved(n)?"해제":"등록"}">${icon("bookmark")}</button>`;
  }
  const watched = () => sample.changes.filter(c=>Object.hasOwn(state.saved,c.noticeId)).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  function shell(page) {
    window.BizAssistant?.destroy?.();
    activePage=page; document.title="BizSignal · "+pages[page];
    const name=e(state.profile.company);
    const initial=e(state.profile.company.slice(0,1));
    const unread=watched().filter(c=>!state.read.includes(c.id)).length;
    $("#app").innerHTML=`<aside class="sidebar" id="workspace-menu" aria-label="주 메뉴">${brand()}
      <button class="workspace" data-profile><span class="workspace-avatar">${initial}</span><span><strong>${name}</strong><small>우리 회사 워크스페이스</small></span>${icon("down")}</button>
      <div class="nav-caption">DISCOVER</div><nav aria-label="탐색">${["explore","market","assistant"].map(nav).join("")}</nav>
      <div class="nav-caption second">WORKSPACE</div><nav aria-label="워크스페이스">${nav("watch")}</nav>
      <div class="sidebar-bottom"><div class="profile-prompt"><span class="profile-prompt-icon">${icon("sparkles")}</span><strong>관심 분야와 역량</strong><p>${e([...state.profile.categories,...state.profile.keywords].join(" · ")||"맞춤 공고를 찾을 조건을 입력하세요.")}</p><button data-profile>기업 프로필 설정 ${icon("chevron")}</button></div>
      <div class="sidebar-foot">BIZSIGNAL <span>ESSENTIAL DEMO</span></div></div></aside>
      <button class="sidebar-backdrop" data-menu-close tabindex="-1" aria-label="메뉴 닫기"></button>
      <div class="app-body"><header class="topbar"><button class="icon-button mobile-menu" data-menu aria-controls="workspace-menu" aria-expanded="false" aria-label="메뉴 열기">${icon("menu")}</button>
      <div class="breadcrumb">${icon("home")}<span>워크스페이스</span>${icon("chevron")}<strong>${pages[page]}</strong></div>
      <div class="topbar-actions"><span class="demo-pill"><i></i> 데모 워크스페이스</span><button class="icon-button notification-button" data-alerts aria-label="읽지 않은 변경 ${unread}건">${icon("bell")}${unread?"<i></i>":""}</button>
      <button class="user-avatar" data-profile aria-label="기업 프로필 설정">${initial}</button></div></header><main id="main" tabindex="-1"></main>
      <footer class="page-footer"><span>나라장터 공개자료</span><span>공고 기준 ${date(sample.asOf)} KST</span></footer></div>`;
    setMenu(false);
    if (page==="explore") explore();
    if (page==="watch") watch();
    if (page==="market") window.BizMarket.render($("#main"));
    if (page==="assistant") window.BizAssistant.render($("#main"),{noticeId:detailId||sample.notices[0]?.id,onOpenNotice:openDetail});
  }
  function heading(title,description,kicker) {return `<div class="page-heading"><div><span class="eyebrow">${e(kicker)}</span><h1>${e(title)}</h1><p>${e(description)}</p></div></div>`;}
  function card(n) {
    const d=rangeDays.get(n.id), s=score(n);
    return `<article class="notice-card"><div class="notice-main"><div class="notice-labels"><span class="category-label">${e(n.field)}</span>${badge(d===null?"마감 미확인":d<0?"마감":d===0?"오늘 마감":"D-"+d,d!==null&&d>=0&&d<=3?"orange":"gray")}
      </div>
      <button class="notice-title" data-detail="${e(n.id)}">${e(n.title)}</button>
      <div class="notice-org"><span>${icon("building")}${e(n.org)}</span><span>${icon("pin")}${e(n.region||"지역 미확인")}</span><span>${e([n.method,n.awardMethod].filter(Boolean).join(" · ")||"방식 미확인")}</span></div>
      <div class="notice-bottom"><span>배정예산 <strong>${won(n.budget)}</strong></span><i></i><span>공고 게시 <b>${e(date(n.posted,false))}</b></span><i></i><span>입찰 마감 <strong>${e(date(n.deadline))}</strong></span><span class="notice-number">${e(n.number)}-${e(n.order)}</span></div>
      </div><div class="notice-side">${bookmark(n)}<button class="match-label" data-detail="${e(n.id)}" aria-label="관련도 ${s.points}점 계산 근거">${icon("nodes")} 관련도 <strong>${s.points}</strong></button></div></article>`;
  }
  function explore() {
    const plan=form.tab==="발주계획";
    $("#main").innerHTML=heading("공고 탐색","우리 회사가 준비할 공공용역을 고르세요.","FIND YOUR NEXT OPPORTUNITY")+`
      <div class="metrics quick-metrics">${[["open","마감 전 공고",countOpen,"search","green"],["week","7일 이내 마감",countWeek,"clock","orange"],["plan","발주계획",sample.plans.length,"calendar","blue"]].map(([key,label,count,symbol,color])=>`<button class="metric-card" data-quick="${key}" aria-label="${label} ${count}건 보기"><span class="metric-top">${label}<span class="metric-icon ${color}">${icon(symbol)}</span></span><strong class="metric-value">${count}<small>건</small></strong></button>`).join("")}</div>
      <section class="panel search-panel"><form id="search-form" class="search-input-wrap">${icon("search")}<input id="search" aria-label="사업명, 기관명 또는 키워드" placeholder="사업명, 기관명 또는 키워드 검색" value="${e(form.text)}"><button class="button primary">검색</button></form>
      <div class="filter-row" ${plan?"hidden":""}><span class="filter-label">${icon("filter")} 검색 조건</span><select id="field" aria-label="사업 분야">${choices(["전체 분야",...fields],form.field)}</select><select id="region" aria-label="참가 지역">${choices(["전체 지역",...regions],form.region)}</select>
      <button class="reset-button" data-reset>초기화</button><label class="check-label deadline-check"><input id="week" type="checkbox" ${form.week?"checked":""}>7일 이내 마감</label><label class="check-label"><input id="open" type="checkbox" ${form.open?"checked":""}>마감 공고 제외</label></div></section>
      <div class="results-toolbar"><div class="results-tabs">${["전체 공고","맞춤 공고","발주계획"].map(t=>`<button data-tab="${t}" class="${t===form.tab?"active":""}" aria-pressed="${t===form.tab}">${t}</button>`).join("")}<span id="result-count"></span></div>
      ${plan?"":'<label class="sort-label">정렬 <select id="sort">'+choices(["관련도 높은 순","마감 임박순","최신 게시순"],form.sort)+'</select></label>'}</div>
      <div class="panel results-list" id="result-list"></div><nav id="result-pages" class="pagination" aria-label="검색 결과 페이지"></nav>`;
    results();
  }
  function results() {
    const plan=form.tab==="발주계획";
    const tokens=normalized(form.text).split(/\s+/).filter(Boolean);
    const textIndex=plan?planText:noticeText;
    const queryMatch = row=>tokens.every(term=>textIndex.get(row.id).includes(term));
    let rows;
    if (plan) rows=sample.plans.filter(queryMatch).sort((a,b)=>b.month.localeCompare(a.month)||a.title.localeCompare(b.title,"ko"));
    else rows=sample.notices.filter(n=>{
      const day=rangeDays.get(n.id);
      return (form.field==="전체 분야"||form.field===n.field) && (form.region==="전체 지역"||form.region===n.region||n.region==="전국"&&form.region!=="지역 미확인") &&
        (!form.open||day!==null&&day>=0) && (!form.week||day!==null&&day>=0&&day<=7) && (form.tab!=="맞춤 공고"||score(n).matched) &&
        queryMatch(n);
    }).sort((a,b)=>{
      const near=(Date.parse(a.deadline)||Infinity)-(Date.parse(b.deadline)||Infinity);
      if (form.sort==="최신 게시순") return String(b.posted).localeCompare(String(a.posted))||a.number.localeCompare(b.number);
      if (form.sort==="마감 임박순") return Number(rangeDays.get(a.id)<0)-Number(rangeDays.get(b.id)<0)||near||a.number.localeCompare(b.number);
      return score(b).points-score(a).points||Number(rangeDays.get(a.id)<0)-Number(rangeDays.get(b.id)<0)||near||a.number.localeCompare(b.number);
    });
    $("#result-count").textContent=rows.length+"건";
    const totalPages=Math.ceil(rows.length/pageSize);
    resultPage=Math.min(resultPage,Math.max(totalPages,1));
    const visible=rows.slice((resultPage-1)*pageSize,resultPage*pageSize);
    $("#result-list").innerHTML=visible.map(n=>plan?`<article class="plan-row"><div class="plan-month"><small>계획 시기</small><strong>${e(n.month.replace("-","."))}</strong></div><div><h2>${e(n.title)}</h2><span>${e(n.org)} · ${e(n.id)}</span><div class="plan-connections">${(planNotices.get(n.id)||[]).map(notice=>`<button data-detail="${e(notice.id)}">${icon("nodes")} 연결 공고 ${e(notice.number)}-${e(notice.order)}</button>`).join("")}</div></div><div class="plan-funding"><small>예정금액</small><strong>${won(n.amount)}</strong>${link(n.source,"계획 원문")}</div></article>`:card(n)).join("")||'<div class="empty-brief">'+icon("search")+'<strong>조건에 맞는 표본이 없습니다.</strong><button class="button small" data-reset>검색 조건 초기화</button></div>';
    $("#result-pages").innerHTML=totalPages>1?`<span>${(resultPage-1)*pageSize+1}–${Math.min(resultPage*pageSize,rows.length)} / ${rows.length}건</span><div><button type="button" data-results-page="${resultPage-1}" ${resultPage===1?"disabled":""}>이전</button><strong>${resultPage} / ${totalPages}</strong><button type="button" data-results-page="${resultPage+1}" ${resultPage===totalPages?"disabled":""}>다음</button></div>`:"";
  }
  function profile() {
    const p=state.profile, dlg=$("#settings-dialog");
    dlg.innerHTML=`<div class="dialog-header"><div><h2>기업 프로필</h2><p class="muted">맞춤 공고를 고를 때 적용할 조건입니다.</p></div><button class="icon-button" data-close aria-label="닫기">${icon("close")}</button></div>
      <form id="profile-form"><label class="form-field">기업명<input name="company" maxlength="40" value="${e(p.company)}" required></label>
      <label class="form-field">사업 지역<select name="region">${choices(unique(["미설정","서울","경기","인천","부산","대전","대구","광주","울산","세종","강원","충북","충남","전북","전남","경북","경남","제주",...regions.filter(r=>r!=="지역 미확인"&&r!=="전국").map(areaShort)]),p.region)}</select></label>
      <fieldset class="profile-categories"><legend>관심 사업 분야</legend>${fields.map(f=>`<label><input type="checkbox" name="fields" value="${e(f)}" ${p.categories.includes(f)?"checked":""}><span>${e(f)}</span></label>`).join("")}</fieldset>
      <label class="form-field">보유 역량 · 검색 키워드<input name="keywords" maxlength="160" value="${e(p.keywords.join(", "))}"><small>쉼표로 구분합니다.</small></label>
      <button class="button primary full-width" type="submit">프로필 저장</button></form>`;
    dlg.showModal();
  }
  function closeDialog() {document.querySelector("dialog[open]")?.close();}
  function openDetail(id) {
    const n=byId(id); if(!n) return;
    detailId=id;
    const dlg=$("#detail-dialog"), s=score(n);
    dlg.innerHTML=`<div class="dialog-inner"><div class="dialog-header">${badge("공고 상세","green")}<button class="icon-button" data-close aria-label="공고 상세 닫기">${icon("close")}</button></div>
      <h2>${e(n.title)}</h2><div class="info-row">수요기관 ${e(n.org)} · 공고기관 ${e(n.publisher)} · ${e(n.region)} · ${e(n.number)}-${e(n.order)}</div>
      <div class="detail-actions">${bookmark(n)} ${link(n.source,"나라장터 공고 원문")} <button class="button primary" data-consult="${e(n.id)}">${icon("nodes")} 도우미에서 검토</button></div>
      <div class="detail-facts"><div><span>배정예산</span><strong>${won(n.budget)}</strong></div><div><span>최초 게시 / 해당 차수 게시</span><strong>${date(n.firstPosted)} / ${date(n.posted)}</strong></div><div><span>입찰 마감</span><strong>${date(n.deadline)}</strong></div><div><span>계약 · 낙찰 방식</span><strong>${e([n.method,n.awardMethod].filter(Boolean).join(" · "))}</strong></div></div>
      ${planIndex.has(n.planId)?`<div class="detail-plan">${icon("nodes")}<strong>연결 발주계획</strong> ${link(planIndex.get(n.planId).source,planIndex.get(n.planId).title+" · "+n.planId)}</div>`:""}
      <section class="detail-fit"><div><strong>관련도 ${s.points}/100</strong><span>${e(s.detail)}</span></div><details><summary>산정 기준</summary><p>관심 분야 50점, 키워드당 20점(최대 2개), 참가 지역 일치 10점입니다. 참가자격은 아래 원문에서 확인하세요.</p></details></section>
      <div class="detail-columns"><div><section class="panel section-box"><h3>주요 과업</h3><p>${e(n.task||"과업 범위는 첨부 원문에서 확인하세요.")}</p>${n.taskSource?link(n.taskSource.url||n.taskSource,n.taskSource.where||n.taskSource.title||"과업 근거 열기"):""}</section>
      <section class="panel section-box"><h3>참가조건 · 평가 기준 · 수행 요건</h3>${(n.checks||[]).map(c=>`<details class="evidence-row"><summary>${e(c.name)} <small>· ${e(c.where)}</small></summary><p>${e(c.text)}</p>${link(c.url,"근거 열기")}</details>`).join("")||'<p>이 표본의 문서 조항은 미확인입니다.</p>'}
      ${n.extra?'<p>'+e(n.extra)+'</p>':''}</section></div>
      <div><section class="panel section-box"><h3>준비 일정</h3><ol class="schedule-list">${(n.dates||[]).map(d=>`<li><strong>${e(date(d.time))}</strong><span>${e(d.label)}</span>${link(d.url,d.where||"일정 근거")}</li>`).join("")||"<li>입찰 마감 · "+e(date(n.deadline))+"</li>"}</ol></section>
      <section class="panel section-box"><h3>첨부문서</h3><ul class="doc-list">${(n.docs||[]).map(d=>'<li>'+icon("file")+link(d.url,d.title)+'</li>').join("")||'<li>'+link(n.source,"공고에서 첨부 확인")+'</li>'}</ul></section></div></div></div>`;
    if(!dlg.open)dlg.showModal();
  }
  function watch() {
    const records=sample.notices.filter(saved);
    const alerts=watched().filter(c=>readFilter==="전체"||!state.read.includes(c.id));
    $("#main").innerHTML=heading(pages.watch,"저장한 공고의 검토 단계와 공식 변경사항을 확인하세요.","YOUR OPPORTUNITY PIPELINE")+`
      <div class="watch-summary">${["전체",...stages].map(s=>`<button data-watch="${s}" class="${watchStage===s?"active":""}" aria-pressed="${watchStage===s}"><span>${s}</span><strong>${records.filter(n=>s==="전체"||state.saved[n.id]===s).length}</strong></button>`).join("")}</div>
      <section class="watch-list">${records.filter(n=>watchStage==="전체"||state.saved[n.id]===watchStage).map(n=>`<div class="panel watch-item">${card(n)}<div class="watch-item-footer"><span>변경 이력 ${changeFor(n.id).length}건</span><label>검토 단계 <select data-stage="${e(n.id)}">${choices(stages,state.saved[n.id])}</select></label></div></div>`).join("")||'<p class="empty-brief">이 단계에 저장한 공고가 없습니다.</p>'}</section>
      <section class="section-box panel" id="change-list"><div class="results-toolbar"><h2>변경 알림</h2><button class="button small" data-read-all ${watched().every(c=>state.read.includes(c.id))?"disabled":""}>모두 확인 처리</button></div>
      <div class="mini-tabs">${["전체","읽지 않음"].map(v=>`<button class="button small" data-alert-filter="${v}" aria-pressed="${readFilter===v}">${v}</button>`).join("")}</div>
      ${alerts.map(c=>`<article class="alert-card"><div class="alert-card-heading"><span>${date(c.at)} · ${state.read.includes(c.id)?"확인함":"읽지 않음"}</span></div><button class="notice-title" data-detail="${e(c.noticeId)}">${e(byId(c.noticeId).title)}</button><p>${e(c.field)}</p><div class="change-comparison"><div><small>변경 전</small><p>${e(c.before)}</p></div>${icon("arrow")}<div><small>변경 후</small><p>${e(c.after)}</p></div></div><div class="alert-card-footer"><span>${link(c.previousSource,"이전 공고 "+(c.fromOrder||""))} · ${link(c.source,"정정 근거 "+(c.toOrder||""))}</span><button class="button small" data-read="${e(c.id)}" ${state.read.includes(c.id)?"disabled":""}>${state.read.includes(c.id)?"확인 완료":"변경 확인"}</button></div></article>`).join("")||'<p class="empty-brief">해당 변경사항이 없습니다.</p>'}</section>`;
  }
  function navigate(page) {
    if(!Object.hasOwn(pages,page)) return;
    const route="#"+page+(page==="assistant" && byId(detailId)?"/"+detailId:"");
    if(location.hash!==route){
      try{history.pushState(null,"",route);}catch{}
    }
    closeDialog();shell(page);window.scrollTo(0,0);
  }
  function openRoute() {
    const [page,id]=location.hash.slice(1).split("/");
    if(page==="main" && $("#main"))return;
    detailId=page==="assistant" && byId(id)?id:null;
    closeDialog();shell(Object.hasOwn(pages,page)?page:"explore");
  }
  const mobileNav = window.matchMedia("(max-width: 780px)");
  function setMenu(requested) {
    const open=mobileNav.matches && requested;
    document.body.classList.toggle("menu-open",open);
    $("#workspace-menu").inert=mobileNav.matches && !open;
    $(".app-body").inert=open;
    $(".mobile-menu").setAttribute("aria-expanded",String(open));
    if(open)$("#workspace-menu [aria-current]").focus();
  }
  mobileNav.addEventListener("change",()=>setMenu(false));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape" && document.body.classList.contains("menu-open") && !document.querySelector("dialog[open]")){
      setMenu(false);$(".mobile-menu").focus();
    }
  });
  document.addEventListener("click",ev=>{
    const b=ev.target.closest("button"); if(!b)return;
    const d=b.dataset;
    if("menu" in d){setMenu(true);return;}
    if("menuClose" in d){setMenu(false);$(".mobile-menu").focus();return;}
    if(d.page) {navigate(d.page);return;}
    if("profile" in d){profile();return;}
    if("close" in d){closeDialog();return;}
    if(d.detail){openDetail(d.detail);return;}
    if(d.consult){detailId=d.consult;navigate("assistant");return;}
    if("alerts" in d){navigate("watch");$("#change-list").scrollIntoView({block:"start"});return;}
    if(d.resultsPage){resultPage=Number(d.resultsPage);results();$("#result-list").scrollIntoView({block:"start"});return;}
    if(d.tab){form.tab=d.tab;resultPage=1;explore();return;}
    if("reset" in d || d.quick){
      Object.assign(form,{text:"",field:"전체 분야",region:"전체 지역",week:d.quick==="week",open:true,sort:"관련도 높은 순"});
      if(d.quick)form.tab=d.quick==="plan"?"발주계획":"전체 공고";
      resultPage=1;explore();return;
    }
    if(d.save){
      const n=byId(d.save); if(!n)return;
      if(saved(n))delete state.saved[n.id];else state.saved[n.id]=stages[0];
      persist();$("#saved-count").textContent=Object.keys(state.saved).length;
      if(activePage==="watch")watch();
      if(activePage==="explore")results();
      if($("#detail-dialog").open)$("#detail-dialog .bookmark").outerHTML=bookmark(n);
      const unread=watched().filter(c=>!state.read.includes(c.id)).length;
      const bell=$("[data-alerts]");
      bell.setAttribute("aria-label","읽지 않은 변경 "+unread+"건");
      bell.innerHTML=icon("bell")+(unread?"<i></i>":"");
      $("#live").textContent=saved(n)?"관심 사업에 저장했습니다.":"관심 사업에서 해제했습니다.";return;
    }
    if(d.watch){watchStage=d.watch;watch();return;}
    if(d.alertFilter){readFilter=d.alertFilter;watch();return;}
    if(d.read||"readAll" in d){
      state.read=unique([...state.read,...(d.read?[d.read]:watched().map(c=>c.id))]);persist();shell("watch");$("#change-list").scrollIntoView({block:"nearest"});
    }
  });
  document.addEventListener("submit",ev=>{
    if(ev.target.id==="search-form"){ev.preventDefault();resultPage=1;form.text=$("#search").value;results();}
    if(ev.target.id==="profile-form"){
      ev.preventDefault();const data=new FormData(ev.target);
      const company=String(data.get("company")).trim();
      if(!company){ev.target.elements.company.setCustomValidity("기업명을 입력하세요.");ev.target.reportValidity();return;}
      state.profile={company,region:data.get("region"),categories:data.getAll("fields"),keywords:unique(String(data.get("keywords")).split(/[,，]/).map(x=>x.trim()).filter(Boolean))};
      scoreCache.clear();
      resultPage=1;persist();closeDialog();shell(activePage);
    }
  });
  document.addEventListener("change",ev=>{
    const t=ev.target;
    if(t.id==="bza-notice-select" && byId(t.value)){
      detailId=t.value;
      try{history.replaceState(null,"","#assistant/"+detailId);}catch{}
    }
    if(t.dataset.stage){state.saved[t.dataset.stage]=t.value;persist();watch();return;}
    if(["field","region","sort","week","open"].includes(t.id)){
      form[t.id]=t.type==="checkbox"?t.checked:t.value;resultPage=1;results();
    }
  });
  document.addEventListener("input",ev=>{
    if(ev.target.id==="search"){resultPage=1;form.text=ev.target.value;results();}
    if(ev.target.name==="company")ev.target.setCustomValidity("");
  });
  window.addEventListener("hashchange",openRoute);
  openRoute();
})();
