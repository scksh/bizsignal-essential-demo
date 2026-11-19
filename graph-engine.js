(function engine(){
  'use strict';
  const graphVersionPrefix='biz-graph-v3';
  const edgeLabels={ISSUED_BY:'공고기관',REQUESTED_BY:'수요기관',HAS_DOCUMENT:'첨부',HAS_PASSAGE:'근거 구절',STATES:'명시',HAS_FACT:'공고 정보',HAS_CHANGE:'차수 간 변경',SIMILAR_TASK:'과업 유사',SIGNED_WITH:'계약업체',CONTRACT_BUYER:'계약의 수요기관',ORIGINATES_FROM:'공식 발주계획 키',RESULTS_IN_NOTICE:'계획이 연결된 공고',CITES:'출처',HAS_CONTRACT:'공고 키 일치'};
  const topics=[
    ['plan',/발주\s*(계획|예정)|선행\s*계획/],
    ['award',/낙찰\s*(자|결과|업체|됐|되었|금액)|낙찰받/],
    ['method',/낙찰\s*(방식|방법)|계약\s*(방식|방법)/],
    ['outcome',/이\s*공고의?\s*계약\s*(결과|금액)|계약.{0,8}체결|실제\s*(수주|계약\s*금액)|이\s*사업의?\s*(계약\s*업체|계약\s*금액)/],
    ['contract',/유사|비교|계약\s*(사례|분포|범위)|과거\s*계약|최저|최고|가장\s*(작|크|비싸|싸)/],
    ['eligibility',/참가|자격|업종|증명|면허|자격증|공동\s*수급|직접\s*생산|중소기업|지역\s*제한/],
    ['schedule',/일정|마감|언제|기한|접수\s*일|몇\s*시/],
    ['assessment',/평가|배점|점수|수행\s*요건|제출\s*순서|제출\s*요건/],
    ['change',/정정|변경\s*(전|후|내역|사항)|바뀌|바뀐|달라/],
    ['budget',/배정\s*예산|예산액?|기초\s*금액|추정\s*가격/],
    ['org',/기관|발주처|누가\s*발주/],
    ['task',/과업|사업\s*(개요|목적|범위)|업무\s*내용|어떤\s*사업|무슨\s*사업|요약|사업소개/],
    ['supplier',/계약\s*(업체|상대)|조달\s*업체|그\s*업체|계약사|공급사|누가\s*계약/]
  ];
  function hash(value) {
    let a=0x811c9dc5, b=0x9e3779b9;
    for(const c of String(value)){const n=c.codePointAt(0);a=Math.imul(a^n,0x01000193);b=Math.imul(b^(n+a),0x85ebca6b);}
    return (a>>>0).toString(36)+'-'+(b>>>0).toString(36);
  }
  function sha256(text) {
    const constants = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const state = Uint32Array.from([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
    const bytes = new TextEncoder().encode(text);
    const padded = new Uint8Array(Math.ceil((bytes.length+9)/64)*64);
    padded.set(bytes); padded[bytes.length]=0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length-8,Math.floor(bytes.length/0x20000000));
    view.setUint32(padded.length-4,bytes.length*8);
    const rotate=(n,b)=>(n>>>b)|(n<<(32-b));
    const words=new Uint32Array(64);
    for(let start=0;start<padded.length;start+=64){
      for(let i=0;i<16;i++) words[i]=view.getUint32(start+4*i);
      for(let i=16;i<64;i++){
        const x=words[i-15],y=words[i-2];
        words[i]=words[i-16]+(rotate(x,7)^rotate(x,18)^(x>>>3))+words[i-7]+(rotate(y,17)^rotate(y,19)^(y>>>10));
      }
      let [a,b,c,d,e,f,g,h]=state;
      for(let i=0;i<64;i++){
        const t1=(h+(rotate(e,6)^rotate(e,11)^rotate(e,25))+((e&f)^(~e&g))+constants[i]+words[i])>>>0;
        const t2=((rotate(a,2)^rotate(a,13)^rotate(a,22))+((a&b)^(a&c)^(b&c)))>>>0;
        h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
      }
      const block=[a,b,c,d,e,f,g,h];
      for(let i=0;i<8;i++)state[i]+=block[i];
    }
    return [...state].map(n=>n.toString(16).padStart(8,'0')).join('');
  }
  function url(value){try {const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:'';} catch{return '';}}
  function tokens(input) {
    const parts=String(input||'').normalize('NFKC').toLowerCase().match(/[가-힣]+|[a-z0-9]+/g)||[];
    const out=[];
    for (const word of parts) {
      if (word.length<2 || /^(무엇|어떻게|주세요|어떤|그럼|그중|인가요|알려주세요|있나요)$/.test(word)) continue;
      out.push(word);
      if (/[가-힣]/.test(word) && word.length>=3) for(let i=0;i<word.length-1;i++)out.push(word.slice(i,i+2));
    }
    return out;
  }
  function formatWon(value){return Number.isFinite(value)?value.toLocaleString('ko-KR')+'원':'금액 미확인';}
  function dateLabel(value) {
    const s=String(value||'');
    if(!/^\d{4}-\d\d-\d\dT/.test(s))return s;
    const t=Date.parse(s); if(!Number.isFinite(t)) return s;
    return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(t)+' KST';
  }
  function build(sample, market, passages=typeof window!=='undefined' ? (window.BIZ_PASSAGES||[]) : []) {
    const nodes=new Map(), edges=new Map(), sources=new Map(), roots=Object.create(null);
    function ref(rawUrl, where, label) {
      const href=url(rawUrl); if(!href)return [];
      const id='src:'+hash(href+'|'+where);
      if(!sources.has(id)) sources.set(id,{id,url:href,where:where||'공식 자료',label:label||where||'공식 자료'});
      return [id];
    }
    function node(id,type,label,text,scope,refs,attrs={}) {
      if(!nodes.has(id)) nodes.set(id,{id,type,label,text:text||'',scope,sourceIds:[...new Set(refs)],url:'',locator:'',...attrs});
      const target=nodes.get(id);
      for(const r of refs) if(!target.sourceIds.includes(r))target.sourceIds.push(r);
      if(target.sourceIds.length&&!target.url){const first=sources.get(target.sourceIds[0]);target.url=first.url;target.locator=first.where;}
      return target;
    }
    function edge(source,type,target,scope,refs,status='official-source') {
      const id='rel:'+hash([source,type,target,scope].join('|'));
      if(!edges.has(id))edges.set(id,{id,source,target,type,status,scope,sourceIds:[...new Set(refs)]});
      else for(const r of refs) if(!edges.get(id).sourceIds.includes(r))edges.get(id).sourceIds.push(r);
    }
    const keyedMarket=new Map();
    const explorationKeys=new Set((sample.notices||[]).map(n=>n.number+'-'+n.order));
    for(const contract of market?.contracts||[]) {
      if(!contract.url || !contract.id || (contract.signed||'')>String(sample.asOf).slice(0,10))continue;
      const refs=ref(contract.url,'계약 상세 · 총계약금액 및 체결일',contract.title), id='contract:'+contract.id;
      if(!refs.length)continue;
      const knownAmount=Number.isFinite(contract.amount) && contract.amount>0;
      const amountNote=knownAmount?'총계약금액 '+formatWon(contract.amount):'총계약금액 미확인'+(contract.termAmount>0?' · 금차계약금액 '+formatWon(contract.termAmount):'');
      node(id,'Contract',contract.title,`${contract.signed} 체결 · ${contract.org} · ${amountNote}`,'',refs,
        {topic:'contract',amount:knownAmount?contract.amount:null,termAmount:contract.termAmount,signed:contract.signed,contractNo:contract.id,amountBasis:'총계약금액',currency:'KRW'});
      if(contract.supplier){const sid='supplier-observation:'+hash(contract.id+'|'+contract.supplier);
        node(sid,'Supplier',contract.supplier,`${contract.title}의 계약업체는 ${contract.supplier}입니다.`, '',refs,{topic:'supplier'});edge(id,'SIGNED_WITH',sid,'',refs);}
      if(contract.org){const oid='contract-org:'+hash(contract.id+'|'+contract.org);
        node(oid,'Organization',contract.org,`${contract.title}의 수요기관.`, '',refs);edge(id,'CONTRACT_BUYER',oid,'',refs);}
      if(contract.notice?.order && contract.noticeNo && contract.notice.url) {
        const key=contract.noticeNo+'-'+contract.notice.order;
        if(!keyedMarket.has(key))keyedMarket.set(key,[]);
        keyedMarket.get(key).push(contract);
        if(!explorationKeys.has(key)){
          const scope='historic:'+key, origin=ref(contract.notice.url,'확인된 원공고 '+key,contract.notice.title);
          const notice='notice:'+key;
          node(notice,'Notice',contract.notice.title,key,scope,origin,{noticeNo:contract.noticeNo,order:contract.notice.order});
          edge(notice,'HAS_CONTRACT',id,scope,[...origin,...refs]);
        }
      }
    }
    const plans = new Map();
    for (const plan of sample.plans||[]) {
      const refs=ref(plan.source,'발주계획통합번호 '+plan.id,plan.title);
      if(!plan.id || !refs.length)continue;
      const id='plan:'+plan.id;
      node(id,'OrderPlan',plan.title,`${plan.org} · ${plan.month} 발주 예정 · 예정금액 ${formatWon(plan.amount)}`,'',refs,
        {topic:'plan',planNo:plan.id,amount:plan.amount,amountBasis:'발주 예정금액',currency:'KRW'});
      plans.set(plan.id,id);
    }
    for(const n of sample.notices||[]) {
      const scope=String(n.id);
      const key=n.number+'-'+n.order;
      const root='notice:'+key;
      roots[scope]=root;
      const base=ref(n.source,'나라장터 공고 '+key,n.title);
      node(root,'Notice',n.title,key,scope,base,{noticeNo:n.number,order:n.order});
      function fact(group,type,label,text,refs,parent=root,relation='HAS_FACT',attrs={}) {
        if(!label||!text||!refs.length)return;
        const id=type.toLowerCase()+':'+hash([root,label,text,refs.join('|')].join('|'));
        node(id,type,label,String(text),scope,refs,{topic:group,...attrs});
        edge(parent,relation,id,scope,refs);
        return id;
      }
      const planId=plans.get(n.planId);
      if(planId){
        const refs=[...base,...nodes.get(planId).sourceIds];
        edge(root,'ORIGINATES_FROM',planId,scope,refs);
        edge(planId,'RESULTS_IN_NOTICE',root,scope,refs);
      }
      if(n.method)fact('method','Method','계약 방식',n.method,base);
      if(n.awardMethod)fact('method','Method','낙찰 방법',n.awardMethod,base);
      if(n.org)fact('org','Organization',n.org,'수요기관 · '+n.org,base,root,'REQUESTED_BY');
      if(n.publisher)fact('org','Organization',n.publisher,'공고기관 · '+n.publisher,base,root,'ISSUED_BY');
      if(n.budget!=null)fact('budget','Amount','배정예산',formatWon(n.budget),base,root,'HAS_FACT',{amount:n.budget,amountBasis:'배정예산',currency:'KRW'});
      const docByUrl=new Map();
      function documentId(raw,title) {
        const href=url(raw).split('#')[0];
        if(!href||href===url(n.source).split('#')[0])return root;
        const id='document:'+hash(root+'|'+href), refs=ref(href,'첨부 원문',title);
        if(!docByUrl.has(href)){
          docByUrl.set(href,id);
          node(id,'Document',title||'공고 첨부문서',title||'공고 첨부문서',scope,refs,{topic:'documents'});
          edge(root,'HAS_DOCUMENT',id,scope,refs);
        }
        return id;
      }
      for(const doc of n.docs||[])documentId(doc.url,doc.title);
      function sourcedFact(group,type,label,body,source,where) {
        const refs=ref(source,where,label);
        if(!refs.length||!body)return;
        const parent=documentId(source,where), passage='passage:'+hash([root,source,where,body].join('|'));
        node(passage,'Passage',where,body,scope,refs);
        edge(parent,'HAS_PASSAGE',passage,scope,refs);
        fact(group,type,label,body,refs,passage,'STATES');
      }
      const taskSource=n.taskSource||{};
      if (taskSource.url && n.task && !/^(세부 과업 미확인|원문 확인 필요)/.test(n.task)) sourcedFact('task','Task','주요 과업',n.task,taskSource.url,taskSource.title||'과업 근거');
      for (const chunk of passages.filter(p=>p.noticeId===n.id && String(p.order)===String(n.order))) {
        if (!chunk.text?.trim() || !chunk.url || !chunk.locator)continue;
        const parent=documentId(chunk.url,chunk.title), refs=ref(chunk.url,chunk.locator,chunk.title);
        if (!refs.length)continue;
        const id='chunk:'+hash([root,chunk.id,chunk.url,chunk.locator,chunk.text].join('|'));
        node(id,'Passage',chunk.title+' · '+chunk.locator,chunk.text,scope,refs,{topic:'text'});
        edge(parent,'HAS_PASSAGE',id,scope,refs);
      }
      for(const c of n.checks||[]) {
        const assessment=/평가|수행[· ]|제출 순서/.test(c.name);
        sourcedFact(assessment?'assessment':'eligibility',assessment?'Review':'Requirement',c.name,c.text,c.url,c.where);
      }
      const dates=n.dates||[];
      for(const d of dates) {
        fact('schedule','Deadline',d.label,dateLabel(d.time),ref(d.url||n.source,d.where||d.label,d.label),root,'HAS_FACT',{semantic:d.label,time:String(d.time||'')});
      }
      if(n.deadline && !dates.some(d=>/입찰.*마감|마감.*입찰/.test(d.label)&&dateLabel(d.time)===dateLabel(n.deadline))) {
        fact('schedule','Deadline','입찰 마감',dateLabel(n.deadline),base,root,'HAS_FACT',{semantic:'입찰 마감',time:n.deadline});
      }
      for(const change of (sample.changes||[]).filter(c=>c.noticeId===n.id)){
        const refs=[...ref(change.previousSource,'이전 '+change.fromOrder+'차 공고',change.field),...ref(change.source,'정정 '+change.toOrder+'차 공고',change.field)];
        fact('change','Change',change.field,`${change.before} → ${change.after} (${dateLabel(change.at)})`,refs,root,'HAS_CHANGE');
      }
      for(const c of market?.comparables?.(n,sample.asOf)||[]){
        const cid='contract:'+c.id;
        if(nodes.has(cid) && !(keyedMarket.get(key)||[]).some(own=>own.id===c.id))edge(root,'SIMILAR_TASK',cid,scope,[...base,...nodes.get(cid).sourceIds],'candidate');
      }
      for(const c of keyedMarket.get(key)||[]){
        const cid='contract:'+c.id;
        edge(root,'HAS_CONTRACT',cid,scope,[...ref(c.notice.url,'확인된 원공고 차수',c.notice.title),...nodes.get(cid).sourceIds]);
      }
    }
    const material=JSON.stringify([sample.asOf,[...nodes.values()],[...edges.values()],[...sources.values()]]);
    const version=graphVersionPrefix+':'+sha256(material);
    const graph={version,asOf:sample.asOf,nodes:[...nodes.values()],edges:[...edges.values()],sources:[...sources.values()],roots};
    const byId=new Map(graph.nodes.map(n=>[n.id,n])), sourceMap=new Map(graph.sources.map(s=>[s.id,s])), adj=new Map();
    for(const e of graph.edges){if(!adj.has(e.source))adj.set(e.source,[]);adj.get(e.source).push(e);}
    const docs=new Map(), df=new Map(); let allWords=0;
    for(const n of graph.nodes.filter(n=>n.topic)) {
      const words=tokens(n.label+' '+n.label+' '+n.text);
      const frequency=new Map();
      for(const t of words)frequency.set(t,(frequency.get(t)||0)+1);
      docs.set(n.id,{frequency,length:words.length});allWords+=words.length;
      for(const t of frequency.keys())df.set(t,(df.get(t)||0)+1);
    }
    Object.defineProperty(graph,'index',{value:{byId,sourceMap,adj,docs,df,avg:allWords/(docs.size||1)}});
    return graph;
  }
  function walk(graph,noticeId,options={}) {
    const root=graph.roots[noticeId]; if(!root)throw new Error('공고 식별자를 확인해 주세요.');
    const paths=new Map([[root,{nodeIds:[root],edgeIds:[],relations:[],sourceIds:[]}]]);
    const frontier=[root],edgeMap=new Map();
    for(let cursor=0;cursor<frontier.length;cursor++) {
      const id=frontier[cursor], path=paths.get(id);
      if(path.edgeIds.length===4)continue;
      const list=options.outgoing?options.outgoing(id,noticeId):(graph.index.adj.get(id)||[]);
      for(const e of list) {
        if(e.scope && e.scope!==noticeId)continue;
        edgeMap.set(e.id,e);
        if(paths.has(e.target))continue;
        paths.set(e.target,{nodeIds:[...path.nodeIds,e.target],edgeIds:[...path.edgeIds,e.id],relations:[...path.relations,e.type],
          sourceIds:[...new Set([...path.sourceIds,...e.sourceIds])]});
        frontier.push(e.target);
      }
    }
    return {root,paths,edgeMap};
  }
  function sparse(graph,id,terms) {
    const m=graph.index, d=m.docs.get(id);
    if(!d)return 0;
    let score=0;
    for(const t of terms){
      const tf=d.frequency.get(t)||0; if(!tf)continue;
      const idf=Math.log(1+(m.docs.size-(m.df.get(t)||0)+0.5)/((m.df.get(t)||0)+0.5));
      score+=idf*tf*2.2/(tf+1.2*(0.25+0.75*d.length/(m.avg||1)));
    }
    return score;
  }
  function ask(graph, request, options={}) {
    const noticeId=String(request.noticeId||''), question=String(request.question||'').trim();
    if (!question || question.length>600)throw new Error('질문은 1~600자로 입력해 주세요.');
    const walkResult=walk(graph,noticeId,options), {paths,root}=walkResult;
    const prev=(request.history||[]).slice(-8).reverse().find(t=>t.noticeId===noticeId && t.version===graph.version && Array.isArray(t.claimIds));
    const ordinal=[/첫\s*번째|첫째|1\s*번째/,/두\s*번째|둘째|2\s*번째/,/세\s*번째|셋째|3\s*번째/,/네\s*번째|4\s*번째/].findIndex(re=>re.test(question));
    const pointer=ordinal>=0||/그\s*(근거|자료|업체|사례|계약|공고|중)|그것|그게|거기|위\s*(답|사례)|방금|좀\s*더|더\s*자세|원문|출처/.test(question);
    const narrowMoney=/기초\s*금액/.test(question)?'기초금액':/추정\s*가격/.test(question)?'추정가격':'';
    let intents=topics.filter(([,p])=>p.test(question)).map(([topic])=>topic);
    const stageComparison=intents.includes('plan') && /계약.*(?:금액|총액)|실제\s*계약|연결.*계약/.test(question);
    if(stageComparison)intents=[...new Set([...intents.filter(t=>t!=='contract'&&t!=='budget'),'outcome'])];
    if(narrowMoney)intents=intents.map(t=>t==='budget'?'priceText':t);
    if(intents.includes('contract') && !/이\s*(사업|공고)의?\s*(낙찰|계약결과)/.test(question))intents=intents.filter(x=>x!=='outcome');
    if(intents.includes('supplier') && !intents.includes('contract') && !pointer)intents.push('outcome');
    const priorIds=(prev?.claimIds||[]).filter(id=>paths.has(id));
    const focusedId=paths.has(request.focusNodeId)?request.focusNodeId:null;
    const pickOrdinal=ordinal>=0 && ordinal<priorIds.length ? priorIds[ordinal]:null;
    const follow=Boolean(pointer&&prev);
    if(!intents.length && pointer && prev)intents=prev.intents||[];
    if(!intents.length && /첨부|문서|원문|출처/.test(question))intents=['documents'];
    const selectedIds=new Set(focusedId?[focusedId]:pickOrdinal?[pickOrdinal]:follow?priorIds:[]);
    const unsupported=/낙찰\s*(확률|가능성)|낙찰될|승률|예측|추천.*입찰가|수익률|가격을?\s*맞/.test(question);
    const terms=[...new Set(tokens(question))];
    const clauseCode=question.match(/\b[A-Z]{2,7}[-_]\d{1,4}/i)?.[0].toUpperCase();
    const anchors=(question.toLowerCase().match(/[가-힣a-z0-9]+/g)||[])
      .map(t=>t.replace(/(에서는|인가요|입니까|에는|에서|으로|에게|하고|에는|의|을|를|은|는|이|가|도)$/,''))
      .filter(t=>(t.length>=3 || ['연계','대상','모듈','근속','수당','급여'].includes(t)) && !/^(참가자격|참가조건|참가자|공고문|사업자|문서에서|입찰마감|가격입찰|전자입찰|입찰일|제안서|제출해야|제출할|발급해야|언제까지|제출하는|내야|해줘|경우|마감일|계약금액|총계약금액|추정가격|기초금액|질문|자료|근거|기간|알려|과거|유사|비교|얼마|변경|정정|사업개요|검토|기능개선|입찰서|어떻|대해서|찾아|제출기한|여부|해주세요)/.test(t));
    const specific=anchors.filter(t=>[...paths.keys()].some(id=>{
      const n=graph.index.byId.get(id);return n.topic && (n.text+' '+n.label).toLowerCase().includes(t);
    }));
    const useSpecific=specific.length>0 && !focusedId && !follow && !intents.some(t=>['contract','outcome','supplier','plan','award','change','budget','priceText','org'].includes(t));
    const candidates=[];
    for(const [id,path] of paths){
      const n=graph.index.byId.get(id);
      if(!n||!n.sourceIds.length)continue;
      const selected=selectedIds.has(id);
      if(clauseCode && !(n.label+' '+n.text).toUpperCase().includes(clauseCode)) continue;
      if(unsupported || (focusedId && !selected))continue;
      if(!n.topic && !selected)continue;
      const lexical=sparse(graph,id,terms);
      const anchored=specific.filter(t=>(n.text+' '+n.label).toLowerCase().includes(t)).length;
      if(useSpecific && !anchored)continue;
      const isOutcome=path.relations.includes('HAS_CONTRACT');
      let topic=n.topic;
      if(narrowMoney && (n.type!=='Passage' || !n.text.replace(/\s+/g,'').includes(narrowMoney)))continue;
      if(n.topic==='text'){
        if(lexical<3 && !selected)continue;
        if(intents.includes('schedule') && !useSpecific && !selected)continue;
        if(narrowMoney)topic='priceText';
        else if(intents.length && !intents.some(t=>['plan','award','contract','supplier','outcome'].includes(t))){
          const strong=String(question).normalize('NFKC').toLowerCase().match(/[가-힣a-z0-9]{3,}/g)||[];
          if(!strong.some(t=>n.text.toLowerCase().includes(t)) && !selected)continue;
          topic=intents[0];
        }
      }
      if(n.type==='Contract'&&isOutcome)topic='outcome';
      if(n.type==='Supplier' && !isOutcome && !(intents.includes('contract')||follow))continue;
      if(intents.includes('outcome')&&!isOutcome&&!selected&&!(intents.includes('plan')&&topic==='plan'))continue;
      const supplierFollow=topic==='supplier' && path.nodeIds.some(key=>selectedIds.has(key)) && intents.includes('supplier');
      if(follow && intents.includes('supplier') && !supplierFollow && !focusedId)continue;
      if(ordinal>=0 && !selected && !supplierFollow)continue;
      if(follow && !intents.some(x=>!(prev.intents||[]).includes(x)) && !selected && !supplierFollow)continue;
      if(!selected&&!supplierFollow && !(useSpecific && anchored && n.topic && lexical>3) && (intents.length?!intents.includes(topic):lexical<2.6))continue;
      if(!intents.length&&!selected&&!useSpecific && !terms.some(t=>t.length>=3&&(n.label+' '+n.text).toLowerCase().includes(t)))continue;
      const primaryDeadline=n.type==='Deadline' && !useSpecific && /제출|가격입찰/.test(question) && /^(입찰 마감|제안서.*접수)/.test(n.label) ? 12 : 0;
      candidates.push({n,path,topic,score:lexical+anchored*8+primaryDeadline+(selected?14:0)+(supplierFollow?32:0)+(intents.includes(topic)?8:0)-path.edgeIds.length*.2-(n.topic==='text'&&intents.length?3:0)});
    }
    if(intents.includes('contract') && /최저|최소|가장\s*(작|싸)/.test(question)) candidates.sort((a,b)=>(a.n.amount??Infinity)-(b.n.amount??Infinity));
    else if(intents.includes('contract') && /최고|최대|가장\s*(크|비싸)/.test(question))candidates.sort((a,b)=>(b.n.amount??-1)-(a.n.amount??-1));
    else candidates.sort((a,b)=>b.score-a.score||a.n.id.localeCompare(b.n.id));
    const single=/가장|최저|최고/.test(question)&&!/(범위|~|최저.*최고|최고.*최저)/.test(question);
    const chosen=candidates.slice(0,single?1:8);
    const conflicts=[];
    const values=new Map();
    for(const c of candidates.filter(c=>c.n.type==='Deadline' && c.n.semantic)) {
      const id=c.n.semantic.replace(/\s/g,''), seen=values.get(id);
      if(seen && dateLabel(c.n.time)!==dateLabel(seen.n.time))conflicts.push(id);
      values.set(id,c);
    }
    const sourceIds=new Set(), claims=[];
    for(const c of chosen) {
      const cited=[...new Set([...c.n.sourceIds,...c.path.sourceIds])].filter(s=>graph.index.sourceMap.has(s));
      cited.forEach(s=>sourceIds.add(s));
      claims.push({id:c.n.id,label:c.n.label,text:c.n.text,kind:c.topic,status:c.path.relations.includes('SIMILAR_TASK')?'candidate':'supported',
        sourceIds:cited,path:c.path,score:+c.score.toFixed(2)});
    }
    const missed=intents.filter(t=>!candidates.some(c=>c.topic===t));
    const status=conflicts.length?'needs-review':claims.length?(missed.length?'partial':'supported'):'missing';
    const amounts=candidates.filter(c=>c.n.type==='Contract'&&c.topic==='contract'&&Number.isFinite(c.n.amount)).map(c=>c.n.amount);
    let summary='';
    if(conflicts.length)summary='동일 일정 항목에서 다른 시각을 찾았습니다. 아래 출처의 차수와 조항을 대조해 주세요.';
    else if(!claims.length)summary=unsupported?'제공한 공고·계약 자료로 향후 결과를 예측할 근거가 없습니다.':intents.includes('outcome')?'이 공고번호와 차수에 직접 연결된 계약 결과를 표본에서 확인하지 못했습니다.':'선택한 공고의 자료에서 질문에 답할 근거를 찾지 못했습니다.';
    else if(stageComparison && claims.some(c=>c.kind==='plan') && claims.some(c=>c.kind==='outcome')){
      const p=graph.index.byId.get(claims.find(c=>c.kind==='plan').id), c=graph.index.byId.get(claims.find(c=>c.kind==='outcome').id);
      summary=`공식 키로 연결된 발주계획의 예정금액은 ${formatWon(p.amount)}, 체결된 계약은 ${c.amount>0?'총계약금액 '+formatWon(c.amount):'총계약금액 미확인'+(c.termAmount>0?'(금차계약금액 '+formatWon(c.termAmount)+')':'')}입니다.`;
    }
    else if(amounts.length&&!single)summary=`같은 과업의 비교 계약 ${amounts.length}건에서 ${amounts.length>1?'총계약금액 범위 '+formatWon(Math.min(...amounts))+' ~ '+formatWon(Math.max(...amounts)):'총계약금액 '+formatWon(amounts[0])}을 확인했습니다.`;
    else if(/연계\s*대상/.test(question) && claims.some(c=>c.label.includes('연계 대상')))summary=claims.filter(c=>c.label.includes('연계 대상')).slice(0,4).map(c=>c.text).join(' · ');
    else if(claims.length===1 || useSpecific || narrowMoney)summary=claims[0].text;
    else if(intents.includes('eligibility'))summary=`이 공고에서 확인할 참가조건은 ${claims.slice(0,3).map(c=>c.label).join(', ')}${claims.length>3?' 등':''}입니다.`;
    else if(intents.includes('schedule')) {
      const dated=claims.filter(c=>c.kind==='schedule' && graph.index.byId.get(c.id).type==='Deadline');
      summary=(dated.length?dated:claims).slice(0,4).map(c=>c.label+' '+c.text).join(' · ');
    }
    else if(intents.includes('change'))summary=claims.slice(0,3).map(c=>c.label+' '+c.text).join(' · ');
    else summary=claims.slice(0,2).map(c=>c.text).join(' ');
    const missingLabels={plan:'연결된 발주계획',award:'낙찰 결과',method:'계약·낙찰 방법',outcome:'현재 공고의 계약 결과',contract:'같은 과업의 과거 계약',eligibility:'참가자격',schedule:'일정',assessment:'평가·수행 요건',task:'과업',supplier:'계약업체',change:'정정 근거',budget:'예산',org:'기관',documents:'첨부 원문',priceText:'요청한 금액 기준의 원문'};
    if(status==='partial')summary+=` ${missed.map(t=>missingLabels[t]).join('·')} 근거는 확인되지 않았습니다.`;
    return {version:graph.version,noticeId,question,summary,status,intents,followup:follow,claims,
      citations:[...sourceIds].map(id=>graph.index.sourceMap.get(id)),total:candidates.length,
      context:{noticeId,version:graph.version,intents,claimIds:claims.map(c=>c.id)},
      retrieval:{method:'BM25 + scoped directed BFS',reachableNodes:paths.size,depth:4,shown:claims.length}};
  }
  const api={build,ask,walk,edgeLabels};
  if(typeof window!=='undefined')window.BizGraph=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
