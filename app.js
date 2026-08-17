/* ============================================================
   «Собери свой идеальный бандл» — Yandex Cloud / Scale 2026
   Логика прототипа. Правила и палитра — см. CLAUDE.md.
   ============================================================ */
'use strict';

/* ============================================================
   ДАННЫЕ — TODO: контент-заглушки, заменить после текстов от Яндекса.
   Структура и тексты задач взяты из слопового прототипа заказчика
   (reference/slop-prototype.html), сервисы приведены к списку из
   CLAUDE.md (MongoDB → StoreDoc, Redis → Valkey).
   ============================================================ */
const DATA = {
  /* Проверка сборки: по совпадению НАБОРА, порядок не учитывается.
     TODO (открытый вопрос к Яндексу): если решат «набор + порядок» —
     переключить флаг. */
  ORDER_MATTERS: false,
  TIMER_SECONDS: 60,

  SERVICES: {
    pg:    {name:'PostgreSQL',  icon:'postgresql'},
    my:    {name:'MySQL',       icon:'mysql'},
    ch:    {name:'ClickHouse',  icon:'clickhouse'},
    sd:    {name:'StoreDoc',    icon:'storedoc'},
    vk:    {name:'Valkey',      icon:'valkey'},
    kafka: {name:'Kafka',       icon:'kafka'},
    gp:    {name:'Greenplum',   icon:'greenplum'},
    os:    {name:'OpenSearch',  icon:'opensearch'},
    af:    {name:'Airflow',     icon:'airflow'},
    sp:    {name:'Spark',       icon:'spark'},
    yt:    {name:'YTsaurus',    icon:'ytsaurus'},
    ydb:   {name:'YDB',         icon:'ydb'},
    dl:    {name:'DataLens',    icon:'datalens'},
  },

  /* Ветка А: собрать самому. roles — подписи слотов капсом (TODO: заглушки). */
  BUILD_TASKS: [
    { id:'rt', type:'Реалтайм-аналитика',
      title:'Аналитика продуктовых событий в реальном времени',
      desc:'Поток кликов и событий пользователей нужно принимать, надёжно буферизировать, складывать в быструю аналитическую БД и строить по ней дашборды.',
      roles:['Поток','Аналитика','Дашборд'],
      correct:['kafka','ch','dl'] },
    { id:'oltp', type:'Highload OLTP',
      title:'Транзакционное ядро для финтех-приложения',
      desc:'Нужна распределённая транзакционная база с горизонтальным масштабированием и строгой консистентностью, плюс быстрый кэш для горячих данных.',
      roles:['База','Кэш'],
      correct:['ydb','vk'] },
    { id:'lake', type:'Big Data / Data Lake',
      title:'Хранилище и пакетная обработка больших данных',
      desc:'Хранить петабайты сырых данных, гонять тяжёлые распределённые вычисления над ними и оркестрировать регулярные пайплайны обработки.',
      roles:['Хранилище','Вычисления','Оркестратор'],
      correct:['yt','sp','af'] },
    { id:'shop', type:'Веб-приложение',
      title:'Каталог и корзина интернет-магазина',
      desc:'Классический бэкенд онлайн-магазина: хранить товары и заказы в надёжной реляционной базе и быстро отдавать горячие данные (корзина, сессии) из кэша.',
      roles:['База','Кэш'],
      correct:['pg','vk'] },
    { id:'search', type:'Поиск',
      title:'Полнотекстовый поиск по каталогу товаров',
      desc:'Основные данные лежат в транзакционной базе, а пользователям нужен быстрый и умный полнотекстовый поиск с фильтрами и подсказками.',
      roles:['База','Поиск'],
      correct:['pg','os'] },
    { id:'etl', type:'ETL / Отчётность',
      title:'Регулярный ETL и витрины для отчётности',
      desc:'Нужно по расписанию собирать данные из источников, трансформировать их и складывать в аналитическое хранилище для регулярных отчётов.',
      roles:['Оркестратор','DWH'],
      correct:['af','gp'] },
    { id:'iot', type:'Стриминг / IoT',
      title:'Приём и обработка потока IoT-телеметрии',
      desc:'Устройства шлют непрерывный поток телеметрии. Его нужно надёжно принять через шину, обработать распределённо и сложить в аналитическую БД.',
      roles:['Поток','Обработка','Аналитика'],
      correct:['kafka','sp','ch'] },
    { id:'docs', type:'Документное хранилище',
      title:'Хранилище пользовательских документов с гибкой схемой',
      desc:'Данные слабоструктурированы и схема часто меняется. Нужна документная база и быстрый кэш для часто читаемых объектов.',
      roles:['База','Кэш'],
      correct:['sd','vk'] },
    { id:'logs', type:'Логи / Наблюдаемость',
      title:'Сбор и анализ логов большого сервиса',
      desc:'Поток логов нужно надёжно собирать через шину, быстро искать по нему и строить оперативные дашборды для дежурной команды.',
      roles:['Поток','Поиск','Дашборд'],
      correct:['kafka','os','dl'] },
    { id:'ml', type:'Big Data / ML',
      title:'Подготовка больших данных для обучения ML-моделей',
      desc:'Датасеты огромны. Их нужно хранить в озере данных и прогонять тяжёлые распределённые преобразования для подготовки признаков.',
      roles:['Озеро данных','Вычисления'],
      correct:['yt','sp'] },
  ],

  /* Ветка Б: выбрать готовый бандл. tier: best / partial / wrong. */
  READY_TASKS: [
    { id:'dwh', type:'DWH / Отчётность',
      title:'Аналитическое хранилище для корпоративной отчётности',
      desc:'Компании нужно собрать данные из десятков источников в единое хранилище, регулярно их обновлять и давать аналитикам строить отчёты и дашборды.',
      bundles:[
        { services:['gp','af','dl'], tier:'best',
          desc:'MPP-хранилище Greenplum держит большие объёмы аналитических данных, Airflow оркестрирует регулярные загрузки (ETL), DataLens закрывает отчётность и дашборды. Классический и сбалансированный DWH-стек.' },
        { services:['pg','dl'], tier:'partial',
          desc:'PostgreSQL — отличная OLTP-база, и на старте связка заработает, но на объёмах корпоративной аналитики упрётся в производительность, а без оркестрации загрузки придётся делать вручную. Рабочий, но не масштабируемый вариант.' },
        { services:['sd','os'], tier:'wrong',
          desc:'Документная БД и поисковый движок — это про хранение документов и полнотекстовый поиск, а не про структурированную аналитику и регулярную отчётность. Для DWH не подходит.' },
      ]},
    { id:'logs', type:'Логи / Наблюдаемость',
      title:'Сбор и анализ логов большого сервиса',
      desc:'Сервис генерирует огромный поток логов. Нужно надёжно их собирать, быстро искать по ним и строить оперативные дашборды для дежурной команды.',
      bundles:[
        { services:['kafka','os','dl'], tier:'best',
          desc:'Kafka принимает и сглаживает пиковый поток логов, OpenSearch даёт полнотекстовый поиск и агрегации, DataLens — дашборды для дежурных. Надёжный конвейер наблюдаемости.' },
        { services:['ch','dl'], tier:'partial',
          desc:'ClickHouse отлично считает метрики, и такой стек рабочий для аналитики логов, но без шины (Kafka) пиковый ingest рискован, а полнотекстовый поиск по сырым логам слабее, чем в OpenSearch. Почти, но не оптимально.' },
        { services:['pg','vk'], tier:'wrong',
          desc:'Реляционная БД с кэшем не рассчитана на потоковый ingest логов и полнотекстовый поиск — на пиках захлебнётся, а поиск по тексту будет медленным. Задачу не решает.' },
      ]},
    { id:'rtdash', type:'Реалтайм-дашборд',
      title:'Онлайн-дашборд для маркетинга в реальном времени',
      desc:'Маркетингу нужно видеть поведение пользователей и эффект кампаний почти без задержки: принимать поток событий и обновлять дашборды в реальном времени.',
      bundles:[
        { services:['kafka','ch','dl'], tier:'best',
          desc:'Kafka принимает поток событий, ClickHouse мгновенно агрегирует их на больших объёмах, DataLens строит живые дашборды. Эталонный реалтайм-аналитический стек.' },
        { services:['pg','dl'], tier:'partial',
          desc:'PostgreSQL + DataLens дадут дашборды, но без шины событий и колоночной БД реальный «реалтайм» на потоке не вытянуть — обновления будут отставать. Рабочее, но компромиссное решение.' },
        { services:['sd','vk'], tier:'wrong',
          desc:'Документная БД и кэш не про аналитику и не про построение дашбордов. Для реалтайм-аналитики стек не подходит.' },
      ]},
    { id:'oltpscale', type:'Highload-бэкенд',
      title:'Бэкенд для быстрорастущего сервиса с пиковыми нагрузками',
      desc:'Сервис быстро растёт, нагрузка непредсказуема и с резкими пиками. Нужна транзакционная база, которая масштабируется горизонтально без боли, плюс кэш.',
      bundles:[
        { services:['ydb','vk'], tier:'best',
          desc:'YDB — распределённая транзакционная БД, которая масштабируется горизонтально и держит строгую консистентность под пиками, Valkey снимает нагрузку кэшем. Оптимально для непредсказуемого роста.' },
        { services:['pg','vk'], tier:'partial',
          desc:'PostgreSQL + кэш отлично работают до определённого масштаба, но при резком горизонтальном росте придётся вручную шардировать и усложнять эксплуатацию. Хороший старт, но не для больших пиков.' },
        { services:['gp','dl'], tier:'wrong',
          desc:'Это аналитический стек (MPP-хранилище + BI). Для транзакционной нагрузки веб-сервиса он не предназначен. Задачу не решает.' },
      ]},
    { id:'bigml', type:'Big Data / ML',
      title:'Платформа для обработки больших данных и ML',
      desc:'Нужно хранить очень большие датасеты, гонять по ним тяжёлые распределённые преобразования и регулярно готовить данные для обучения моделей.',
      bundles:[
        { services:['yt','sp','af'], tier:'best',
          desc:'YTsaurus хранит петабайты данных, Spark выполняет распределённые вычисления, Airflow оркестрирует регулярные пайплайны подготовки. Полноценная платформа больших данных.' },
        { services:['ch','af'], tier:'partial',
          desc:'ClickHouse + Airflow потянут аналитику и расписания, но для хранения сырых петабайтов и тяжёлых ML-преобразований этого мало — не хватает озера данных и распределённых вычислений. Частичное решение.' },
        { services:['my','vk'], tier:'wrong',
          desc:'Реляционная БД с кэшем не про большие данные и распределённую обработку. Для ML-платформы на больших объёмах не подходит.' },
      ]},
    { id:'searchcat', type:'Поиск',
      title:'Поиск по большому каталогу товаров',
      desc:'Магазину нужен быстрый и релевантный поиск по большому каталогу — с фильтрами, опечатками и подсказками, при этом сами товары и заказы лежат в надёжной базе.',
      bundles:[
        { services:['pg','os'], tier:'best',
          desc:'PostgreSQL хранит товары и заказы как источник истины, OpenSearch обеспечивает быстрый полнотекстовый поиск, фильтры и подсказки. Классическая и надёжная связка «БД + поиск».' },
        { services:['sd','os'], tier:'partial',
          desc:'OpenSearch даст поиск, а StoreDoc — хранение, но для товаров и заказов с транзакциями реляционная база обычно предпочтительнее документной. Рабочий, но не лучший выбор основы.' },
        { services:['ch','dl'], tier:'wrong',
          desc:'Аналитическая БД и BI — это про отчёты и дашборды, а не про пользовательский полнотекстовый поиск по каталогу. Задачу не решает.' },
      ]},
  ],

};
const S = DATA.SERVICES;
const FPS_STEP = 1000 / 12; /* фирменный «лоу ФПС»: дискретные шаги ~12 к/с */

/* ============================================================
   УТИЛИТЫ / СЦЕНА
   ============================================================ */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const stage = $('#stage');
let SCALE = 1;

function fitStage(){
  SCALE = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(${(innerWidth-1920*SCALE)/2}px,${(innerHeight-1080*SCALE)/2}px) scale(${SCALE})`;
}
addEventListener('resize', fitStage);
fitStage();
/* страховка: программный скролл (например, от браузера) не должен сдвигать сцену */
addEventListener('scroll', ()=>scrollTo(0,0));

/* client-координаты → координаты сцены 1920×1080 */
function toStage(e){
  const r = stage.getBoundingClientRect();
  return { x:(e.clientX - r.left)/SCALE, y:(e.clientY - r.top)/SCALE };
}
function stageRect(el){
  const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
  return { x:(r.left-s.left)/SCALE, y:(r.top-s.top)/SCALE, w:r.width/SCALE, h:r.height/SCALE };
}

/* пословное появление катами */
function words(el, text, done){
  el.innerHTML = text.split(' ').map(w=>`<span class="w">${w}</span>`).join('');
  el.classList.add('words');
  const ws = el.querySelectorAll('.w');
  ws.forEach((w,i)=>setTimeout(()=>{
    w.classList.add('on');
    if(done && i===ws.length-1) done();
  }, 120 + i*150));
}

/* ============================================================
   СОСТОЯНИЕ И НАВИГАЦИЯ
   ============================================================ */
const state = {
  mode:null,          /* 'build' | 'ready' */
  task:null,
  slots:[],
  selectedBundle:-1,
  locked:false,
  timerId:null,
  timeLeft:0,
  signalId:null,
};

function go(id){
  stopTimer(); stopSignal(); hideVerdict();
  $$('.screen').forEach(s=>s.classList.remove('active'));
  const scr = $('#'+id);
  scr.classList.add('active');
  document.body.classList.toggle('on-blue', id==='s-attract');
  /* единый таймер переезжает в шапку активного игрового экрана */
  const timer = $('#timer');
  const isGame = id==='s-build' || id==='s-ready';
  timer.classList.toggle('show', isGame);
  if(isGame){
    const tr = scr.querySelector('.top-right');
    if(tr && timer.parentElement!==tr) tr.prepend(timer);
  }
  /* перезапуск катов появления */
  $$('#'+id+' .cut').forEach(el=>{el.style.animation='none';void el.offsetWidth;el.style.animation='';});
}

/* ============================================================
   ATTRACT: фиксированная композиция фирменных деталей
   (assets/details/ — базовые детали и коннекторы из брендбука;
   статично, движется только лента тегов и CTA)
   ============================================================ */
/* тема attract: светлая по умолчанию, ?attract=blue — синий «маяк»
   для стойки. На светлой детали идут в родном синем исполнении,
   на синей — перекрашенные (белый/бежевый корпус; брендбук разрешает
   перекрас линейных деталей). */
const ATTRACT_BLUE = /[?&]attract=blue/.test(location.search);
const ATTRACT_DECO = [
  {src:'capsule-3',  blue:'capsule-3--b',   x:150,  y:158,  w:150},
  {src:'arc',        blue:'arc--w',         x:1290, y:96,   w:150},
  {src:'disc-rays',  blue:'disc-rays',      x:1612, y:150,  w:168},
  {src:'flange',     blue:'flange',         x:104,  y:406,  w:140},
  {src:'cross',      blue:'cross--w',       x:1746, y:352,  w:116},
  {src:'plate-dots', blue:'plate-dots--w',  x:224,  y:588,  w:130},
  {src:'capsule',    blue:'capsule--w',     x:1682, y:512,  w:160},
  {src:'plate-holes',blue:'plate-holes--b', x:96,   y:730,  w:148},
  {src:'trapeze',    blue:'trapeze--w',     x:1622, y:716,  w:170},
  {src:'quarter',    blue:'quarter--b',     x:308,  y:846,  w:126},
];
const ATTRACT_PRIMS = [
  /* мелочь: бежевый/чб + шашка; цвет зависит от темы */
  {t:'dot',    x:520,  y:132, s:22, c:'var(--beige)'},
  {t:'ring',   x:1188, y:920, s:32},
  {t:'checker',x:668,  y:948, s:40},
  {t:'dot',    x:1520, y:892, s:18, c:'var(--black)'},
  {t:'dot',    x:404,  y:250, s:14, c:ATTRACT_BLUE?'var(--white)':'var(--grey)'},
];
function buildAttract(){
  if(ATTRACT_BLUE){
    document.body.classList.add('attract-blue');
    $('#s-attract .logo').src = 'assets/logo/logo_full-mono_white.svg';
  }
  const box = $('#attract-deco'); box.innerHTML='';
  ATTRACT_DECO.forEach(d=>{
    const img = document.createElement('img');
    img.src = 'assets/details/'+(ATTRACT_BLUE ? d.blue : d.src)+'.svg';
    img.style.left = d.x+'px'; img.style.top = d.y+'px'; img.style.width = d.w+'px';
    box.appendChild(img);
  });
  ATTRACT_PRIMS.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'prim '+(p.t==='checker'?'checker':p.t);
    el.style.left=p.x+'px'; el.style.top=p.y+'px';
    el.style.width=el.style.height=p.s+'px';
    if(p.c) el.style.background=p.c;
    if(p.t==='checker') el.innerHTML='<i></i><i></i><i></i><i></i>';
    box.appendChild(el);
  });
  /* лента тегов-сервисов (контент — из слопового прототипа);
     ряд дублируется для бесшовного цикла */
  const chips = Object.keys(S).map(id=>
    `<span class="tag-chip"><img src="assets/icons/${S[id].icon}.svg" alt="">${S[id].name}</span>`).join('');
  $('#tag-strip .row').innerHTML = chips + chips;
}

$('#s-attract').addEventListener('pointerup', ()=>go('s-mode'));

/* ============================================================
   ИКОНКИ: автоподхват из assets/icons/ (см. README в папке).
   Пока файлов нет — плитки текстовые (фолбэк по CLAUDE.md).
   ============================================================ */
const ICONS = {}; /* id -> true, когда файл существует */
Object.entries(S).forEach(([id,s])=>{
  const img = new Image();
  img.onload = ()=>{ ICONS[id]=true; };
  img.src = 'assets/icons/'+s.icon+'.svg';
});
function iconImg(id, cls){
  return ICONS[id] ? `<img class="${cls||''}" src="assets/icons/${S[id].icon}.svg" alt="">` : '';
}

/* ============================================================
   ЭКРАН 2: РЕЖИМ
   ============================================================ */
$$('#mode-cards .detail').forEach(card=>{
  card.addEventListener('click', ()=>{
    state.mode = card.dataset.mode;
    renderTasks();
    go('s-tasks');
  });
});

/* ============================================================
   ЭКРАН 3: ЗАДАЧИ (общий для обеих веток)
   ============================================================ */
function renderTasks(){
  const build = state.mode==='build';
  const tasks = build ? DATA.BUILD_TASKS : DATA.READY_TASKS;
  const grid = $('#task-grid');
  grid.className = build ? 'cols5 cut d1' : 'cols3 cut d1';
  grid.innerHTML = tasks.map((t,i)=>`
    <div class="detail" data-i="${i}">
      <span class="hole h1"></span><span class="hole h2"></span>
      <div class="t-type">${t.type}</div>
      <h3>${t.title}</h3>
      <p>${t.desc}</p>
    </div>`).join('');
  grid.querySelectorAll('.detail').forEach(card=>{
    card.addEventListener('click', ()=>openTask(+card.dataset.i, card));
  });
  $('#task-random').style.display = build ? '' : 'none';
  $('#tasks-hint').textContent = build
    ? 'Каждую задачу нужно решить, собрав связку сервисов платформы данных.'
    : 'Мы подготовили несколько готовых бандлов на каждую задачу — выбери лучший.';
}
$('#task-random').addEventListener('click', ()=>{
  const n = DATA.BUILD_TASKS.length;
  const i = Math.random()*n|0;
  const card = $(`#task-grid .detail[data-i="${i}"]`);
  openTask(i, card);
});

/* match cut: клон карточки перелетает в шапку нового экрана
   (движение только по H/V — манхэттен-путь, дискретные шаги) */
function openTask(i, cardEl){
  const build = state.mode==='build';
  state.task = build ? DATA.BUILD_TASKS[i] : DATA.READY_TASKS[i];
  const from = cardEl ? stageRect(cardEl) : null;

  if(build) renderBuild(); else renderReady();
  go(build ? 's-build' : 's-ready');

  const strip = $(build ? '#s-build .task-strip' : '#s-ready .task-strip');
  if(!from){ return; }
  const to = stageRect(strip);
  const mc = $('#matchcut');
  mc.textContent = state.task.title;
  mc.style.display='flex';
  strip.style.visibility='hidden';
  let x = from.x, y = from.y;
  const tx = to.x + to.w/2 - mc.offsetWidth/2, ty = to.y;
  mc.style.left=x+'px'; mc.style.top=y+'px';
  /* фаза 1: по вертикали, фаза 2: по горизонтали; шаги ~12fps */
  const steps1 = 4, steps2 = 3;
  let n = 0;
  const iv = setInterval(()=>{
    n++;
    if(n<=steps1){ y += (ty-from.y)/steps1; }
    else if(n<=steps1+steps2){ x += (tx-from.x)/steps2; }
    mc.style.left=x+'px'; mc.style.top=y+'px';
    if(n>=steps1+steps2){
      clearInterval(iv);
      mc.style.display='none';
      strip.style.visibility='';
      /* кат появления шапки */
      strip.style.animation='none'; void strip.offsetWidth; strip.style.animation='';
      strip.classList.add('cut');
    }
  }, FPS_STEP);
}

/* ============================================================
   ТАЙМЕР (счётчик из слопового прототипа)
   ============================================================ */
function startTimer(onEnd){
  stopTimer();
  state.timeLeft = DATA.TIMER_SECONDS;
  drawTimer();
  state.timerId = setInterval(()=>{
    state.timeLeft--;
    drawTimer();
    if(state.timeLeft<=0){ stopTimer(); onEnd(); }
  },1000);
}
function stopTimer(){ if(state.timerId){ clearInterval(state.timerId); state.timerId=null; } }
function drawTimer(){
  const t = $('#timer');
  const m = String(Math.floor(state.timeLeft/60)).padStart(2,'0');
  const s = String(state.timeLeft%60).padStart(2,'0');
  t.querySelector('.t-num').textContent = `${m}:${s}`;
  const cells = t.querySelectorAll('.t-cells i');
  const on = Math.ceil(state.timeLeft / DATA.TIMER_SECONDS * cells.length);
  cells.forEach((c,i)=>c.classList.toggle('off', i>=on));
  t.classList.toggle('low', state.timeLeft<=10);
}

/* ============================================================
   ЭКРАН 4A: СБОРКА
   ============================================================ */
function renderBuild(){
  const t = state.task;
  state.slots = new Array(t.correct.length).fill(null);
  state.locked = false;
  const strip = $('#s-build .task-strip');
  strip.querySelector('.ts-type').textContent = t.type;
  strip.querySelector('.ts-name').textContent = t.title;
  strip.querySelector('.ts-desc').textContent = t.desc;

  const chain = $('#chain'); chain.innerHTML='';
  t.correct.forEach((_,i)=>{
    const slot = document.createElement('div');
    slot.className='slot'; slot.dataset.idx=i;
    slot.innerHTML = `
      <span class="corner c1"></span><span class="corner c2"></span>
      <span class="corner c3"></span><span class="corner c4"></span>
      <span class="role">${t.roles[i]||''}</span>`;
    slot.addEventListener('click', ()=>{ if(!state.locked) unplace(i); });
    chain.appendChild(slot);
    const link = document.createElement('div'); link.className='link';
    chain.appendChild(link);
  });
  const lamp = document.createElement('div'); lamp.className='lamp'; lamp.id='lamp';
  chain.appendChild(lamp);
  const pulse = document.createElement('div'); pulse.id='pulse';
  chain.appendChild(pulse);

  const pal = $('#palette'); pal.innerHTML='';
  Object.keys(S).forEach(id=>{
    const tile = document.createElement('div');
    tile.className='tile'+(ICONS[id]?' has-icon':'');
    tile.dataset.sid=id;
    tile.innerHTML = `<span class="pin"></span>${iconImg(id)}<span>${S[id].name}</span>`;
    attachTile(tile);
    pal.appendChild(tile);
  });
  updateCheckBtn();
  startTimer(timeoutBuild);
}

function chipHTML(id){
  return `<div class="chip"><span class="pin"></span>
    ${ICONS[id]?`<span class="chip-ico">${iconImg(id)}</span>`:''}
    <span>${S[id].name}</span></div>`;
}

function place(sid, idx){
  if(state.slots.includes(sid)) return;
  if(state.slots[idx]) unplace(idx);
  state.slots[idx]=sid;
  const slot = $$('#chain .slot')[idx];
  slot.classList.add('filled');
  if(ICONS[sid]) slot.classList.add('has-icon');
  slot.insertAdjacentHTML('beforeend', chipHTML(sid));
  const tile = $(`.tile[data-sid="${sid}"]`); if(tile) tile.classList.add('used');
  updateCheckBtn();
}
function unplace(idx){
  const sid = state.slots[idx]; if(!sid) return;
  state.slots[idx]=null;
  const slot = $$('#chain .slot')[idx];
  slot.classList.remove('filled','bad','has-icon');
  const chip = slot.querySelector('.chip'); if(chip) chip.remove();
  const tile = $(`.tile[data-sid="${sid}"]`); if(tile) tile.classList.remove('used');
  updateCheckBtn();
}
function clearSlots(){
  state.slots.forEach((_,i)=>unplace(i));
}
function firstEmpty(){ return state.slots.findIndex(v=>!v); }
function updateCheckBtn(){
  $('#check-btn').disabled = state.slots.some(v=>!v) || state.locked;
}
$('#clear-btn').addEventListener('click', ()=>{ if(!state.locked) clearSlots(); });

/* тап по плитке = в первый свободный слот; драг = в конкретный слот */
function attachTile(tile){
  let px=0, py=0, dragging=false, pid=null;
  const ghost = $('#drag-ghost');
  tile.addEventListener('pointerdown', e=>{
    if(state.locked || tile.classList.contains('used')) return;
    pid=e.pointerId; dragging=false;
    const p=toStage(e); px=p.x; py=p.y;
    tile.setPointerCapture(pid);
  });
  tile.addEventListener('pointermove', e=>{
    if(pid===null) return;
    const p=toStage(e);
    if(!dragging && Math.hypot(p.x-px,p.y-py)>12){
      dragging=true;
      tile.classList.add('dragging');
      ghost.innerHTML = `${iconImg(tile.dataset.sid)}<span>${S[tile.dataset.sid].name}</span>`;
      ghost.style.display='flex';
    }
    if(dragging){
      ghost.style.left=(p.x-ghost.offsetWidth/2)+'px';
      ghost.style.top=(p.y-ghost.offsetHeight/2)+'px';
      $$('#chain .slot').forEach(sl=>sl.classList.remove('hover-ok'));
      const slot = slotAt(e);
      if(slot && !slot.classList.contains('filled')) slot.classList.add('hover-ok');
    }
  });
  tile.addEventListener('pointerup', e=>{
    if(pid===null) return;
    const sid = tile.dataset.sid;
    $$('#chain .slot').forEach(sl=>sl.classList.remove('hover-ok'));
    if(dragging){
      ghost.style.display='none';
      tile.classList.remove('dragging');
      const slot = slotAt(e);
      if(slot && !slot.classList.contains('filled')) place(sid, +slot.dataset.idx);
    }else{
      const idx = firstEmpty();
      if(idx>-1) place(sid, idx); /* тап = в первый свободный */
    }
    pid=null; dragging=false;
  });
  tile.addEventListener('pointercancel', ()=>{
    ghost.style.display='none';
    tile.classList.remove('dragging');
    pid=null; dragging=false;
  });
}
function slotAt(e){
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return el ? el.closest('.slot') : null;
}

/* ---------- проверка: сигнал по цепочке, лоу-фпс ---------- */
$('#check-btn').addEventListener('click', ()=>{
  if(state.locked) return;
  state.locked = true; updateCheckBtn();
  stopTimer();
  const refSet = new Set(state.task.correct);
  /* лишние слоты; при ORDER_MATTERS — несовпадение позиции */
  const wrong = state.slots
    .map((sid,i)=> (DATA.ORDER_MATTERS ? state.task.correct[i]!==sid : !refSet.has(sid)) ? i : -1)
    .filter(i=>i>-1);
  runSignal(wrong);
});

function centerXY(el){
  const r = stageRect(el), c = stageRect($('#chain'));
  return { x:r.x - c.x + r.w/2, y:r.y - c.y + r.h/2 };
}
function stopSignal(){ if(state.signalId){ clearInterval(state.signalId); state.signalId=null; } }
function runSignal(wrongIdx){
  const pulse = $('#pulse'), lamp = $('#lamp');
  const slots = $$('#chain .slot');
  const stopAt = wrongIdx.length ? Math.min(...wrongIdx) : -1;
  const targetEl = stopAt===-1 ? lamp : slots[stopAt];
  const start = centerXY(slots[0]);
  const end = centerXY(targetEl);
  let x = start.x;
  const y = start.y;
  pulse.style.display='block';
  pulse.style.left=(x-11)+'px'; pulse.style.top=(y-11)+'px';
  const dist = Math.max(1, end.x - start.x);
  const stepPx = Math.max(20, dist/24);
  state.signalId = setInterval(()=>{
    x += stepPx;
    if(x>=end.x){
      x=end.x;
      pulse.style.left=(x-11)+'px';
      stopSignal();
      finishSignal(wrongIdx, stopAt);
      return;
    }
    pulse.style.left=(x-11)+'px';
  }, FPS_STEP);
}
function finishSignal(wrongIdx, stopAt){
  const pulse = $('#pulse'), lamp = $('#lamp');
  if(wrongIdx.length){
    /* сигнал застрял на первой лишней детали */
    wrongIdx.forEach(i=>$$('#chain .slot')[i].classList.add('bad'));
    showVerdict({
      title:'Почти!',
      sub:'Сигнал застрял: лишние детали подсвечены. Замени их — и проверь ещё раз.',
      actions:[
        {label:'Исправить', cls:'', fn:fixBuild},
        {label:'В начало', cls:'secondary', fn:()=>go('s-attract')},
      ],
    });
  }else{
    setTimeout(()=>{
      pulse.style.display='none';
      lamp.classList.add('on'); /* лампа #BFFF00 */
      setTimeout(()=>showResultBuildOk(), 700);
    }, FPS_STEP);
  }
}
function fixBuild(){
  hideVerdict();
  state.locked=false;
  $$('#chain .slot.bad').forEach(s=>s.classList.remove('bad'));
  $('#pulse').style.display='none';
  updateCheckBtn();
  startTimer(timeoutBuild);
}
function timeoutBuild(){
  state.locked=true; updateCheckBtn();
  showResult({
    title:'Время вышло!',
    sub:'Ничего страшного — вот связка, которая решает эту задачу.',
    chain:state.task.correct, lampOn:true, coin:false,
    actions:[
      {label:'Ещё задачу', cls:'secondary', fn:()=>{ renderTasks(); go('s-tasks'); }},
      {label:'В начало', cls:'', fn:()=>go('s-attract')},
    ],
  });
}
function showResultBuildOk(){
  showResult({
    title:'В точку!',
    sub:'Ты собрал рабочую связку — именно так эту задачу решают на платформе данных.',
    chain:state.task.correct, lampOn:true, coin:false,
    cta:'Хочешь монету для конкурса? Пройди режим «Выбрать готовый бандл» — за него дают наклейку для розыгрыша.',
    actions:[
      {label:'Выбрать готовый бандл', cls:'', fn:()=>{ state.mode='ready'; renderTasks(); go('s-tasks'); }},
      {label:'В начало', cls:'secondary', fn:()=>go('s-attract')},
    ],
  });
}

/* ============================================================
   ЭКРАН 4B: ГОТОВЫЕ БАНДЛЫ
   ============================================================ */
function renderReady(){
  const t = state.task;
  state.selectedBundle = -1;
  const strip = $('#s-ready .task-strip');
  strip.querySelector('.ts-type').textContent = t.type;
  strip.querySelector('.ts-name').textContent = t.title;
  strip.querySelector('.ts-desc').textContent = t.desc;

  const list = $('#bundle-list'); list.innerHTML='';
  t.bundles.forEach((b,i)=>{
    const el = document.createElement('div');
    el.className='bundle'; el.dataset.i=i;
    el.innerHTML = `
      <span class="b-letter">${String.fromCharCode(65+i)}</span>
      <div class="b-chain">${b.services.map(id=>`<span>${S[id].name}</span>`).join('<span class="arrow"></span>')}</div>
      <p>${b.desc}</p>`;
    el.addEventListener('click', ()=>{
      state.selectedBundle=i;
      $$('#bundle-list .bundle').forEach(x=>x.classList.toggle('selected', x===el));
      $('#confirm-btn').disabled=false;
    });
    list.appendChild(el);
  });
  $('#confirm-btn').disabled=true;
  startTimer(timeoutReady);
}
$('#confirm-btn').addEventListener('click', ()=>{
  if(state.selectedBundle<0) return;
  stopTimer();
  const b = state.task.bundles[state.selectedBundle];
  const best = state.task.bundles.find(x=>x.tier==='best');
  if(b.tier==='best'){
    showResult({
      title:'В точку!',
      sub:'Это самый подходящий бандл для задачи.',
      chain:best.services, lampOn:true, coin:true,
      actions:[{label:'Завершить', cls:'', fn:()=>go('s-attract')}],
    });
  }else if(b.tier==='partial'){
    showResult({
      title:'Сойдёт',
      sub:'Твой выбор рабочий, но эту задачу лучше решил бы другой бандл:',
      chain:best.services, lampOn:false, coin:true,
      actions:[{label:'Завершить', cls:'', fn:()=>go('s-attract')}],
    });
  }else{
    showResult({
      title:'Мимо',
      sub:'Этот бандл не решает задачу — за него монета не засчитывается. Вот бандл, который подходит:',
      chain:best.services, lampOn:false, coin:false,
      actions:[
        {label:'Ещё задачу', cls:'secondary', fn:()=>{ renderTasks(); go('s-tasks'); }},
        {label:'Завершить', cls:'', fn:()=>go('s-attract')},
      ],
    });
  }
});
function timeoutReady(){
  const best = state.task.bundles.find(x=>x.tier==='best');
  showResult({
    title:'Время вышло!',
    sub:'Вот бандл, который лучше всего решает эту задачу:',
    chain:best.services, lampOn:false, coin:true,
    actions:[{label:'Завершить', cls:'', fn:()=>go('s-attract')}],
  });
}

/* ============================================================
   ВЕРДИКТ-ПАНЕЛЬ (поверх сборки) И ЭКРАН РЕЗУЛЬТАТА
   ============================================================ */
function showVerdict({title, sub, actions}){
  const v = $('#verdict-bar');
  v.classList.add('show');
  words(v.querySelector('.vb-title'), title);
  v.querySelector('.vb-sub').textContent = sub;
  const box = v.querySelector('.vb-actions'); box.innerHTML='';
  actions.forEach(a=>{
    const b = document.createElement('button');
    b.className='btn '+a.cls; b.textContent=a.label;
    b.addEventListener('click', a.fn);
    box.appendChild(b);
  });
}
function hideVerdict(){ $('#verdict-bar').classList.remove('show'); }

function showResult({title, sub, chain, lampOn, coin, cta, actions}){
  go('s-result');
  words($('#result-title'), title);
  $('#result-title').classList.toggle('miss', title==='Мимо');
  $('#result-sub').textContent = sub;

  /* эталонная связка: чипы + линии (+ лампа) */
  const rc = $('#result-chain'); rc.innerHTML='';
  chain.forEach((sid,i)=>{
    const holder = document.createElement('div');
    holder.className='slot filled'+(ICONS[sid]?' has-icon':'');
    holder.innerHTML = `
      <span class="corner c1"></span><span class="corner c2"></span>
      <span class="corner c3"></span><span class="corner c4"></span>`+chipHTML(sid);
    rc.appendChild(holder);
    if(i<chain.length-1){
      const link=document.createElement('div'); link.className='link'; rc.appendChild(link);
    }
  });
  if(lampOn!==undefined){
    const link=document.createElement('div'); link.className='link'; rc.appendChild(link);
    const lamp=document.createElement('div'); lamp.className='lamp'+(lampOn?' on':''); rc.appendChild(lamp);
  }

  const rcoin = $('#result-coin');
  rcoin.classList.toggle('show', !!coin || !!cta);
  if(coin){
    rcoin.innerHTML = `<span class="coin"></span><div class="rc-txt"><b>Ты заработал монету!</b>
      Скажи об этом стендисту, чтобы получить наклейку для розыгрыша в общем конкурсе.</div>`;
  }else if(cta){
    rcoin.innerHTML = `<span class="coin"></span><div class="rc-txt">${cta}</div>`;
  }

  const box = $('#result-actions'); box.innerHTML='';
  actions.forEach(a=>{
    const b=document.createElement('button');
    b.className='btn '+a.cls; b.textContent=a.label;
    b.addEventListener('click', a.fn);
    box.appendChild(b);
  });
}

/* ============================================================
   ПРОЧЕЕ
   ============================================================ */
$$('[data-go]').forEach(b=>b.addEventListener('click', ()=>go(b.dataset.go)));
$$('.js-home').forEach(b=>b.addEventListener('click', ()=>go('s-attract')));

/* киоск-режим: ?kiosk — скрыть курсор (на стойке; в демо мышкой не включать) */
if(location.search.includes('kiosk')) document.body.classList.add('kiosk');

buildAttract();
go('s-attract');
