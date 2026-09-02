/* LIFE browser prototype — local-first, dependency-free, and intentionally small. */
const STORE = "life-local-first-v1";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const localISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const todayISO = () => localISO(new Date());
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const THEMES = [
  { id: "ran", label: "Warring Banners", colors: ["#0a0d0b", "#e2483a", "#e8c15a", "#5194cf"] },
  { id: "night", label: "Moonlit", colors: ["#16181c", "#b8d8ff", "#f0c36e", "#9fb4ff"] },
  { id: "light", label: "Paper", colors: ["#f5f5f0", "#b33f35", "#a56b10", "#316da8"] },
  { id: "blossom", label: "Blossom", colors: ["#fff6f7", "#b43d65", "#ad7a23", "#8b538f"] },
  { id: "desert", label: "Desert Dusk", colors: ["#17130e", "#ed9a4e", "#ebc569", "#8ab0c7"] },
  { id: "verdant", label: "Verdant", colors: ["#102019", "#e1a542", "#8dcc9a", "#87b8c7"] },
  { id: "violet", label: "Violet Hour", colors: ["#171321", "#d99ced", "#edc86d", "#9ebdff"] },
];

const ACHIEVEMENTS = [
  { id: "first-log", title: "First Light", description: "Record your first moment.", icon: "✦", xp: 25, color: "#e2483a", test: s => s.activities.length >= 1 },
  { id: "first-page", title: "The First Page", description: "Log a reading session. The beginning of a long shelf.", icon: "▤", xp: 50, color: "#e8c15a", test: s => s.activities.some(a => a.type === "book") },
  { id: "focus-five", title: "In the Room", description: "Complete five study sessions.", icon: "◷", xp: 75, color: "#7fb3e8", test: s => s.activities.filter(a => a.type === "study").length >= 5 },
  { id: "reflect", title: "Clear Mirror", description: "Save a reflection with one honest note.", icon: "✎", xp: 60, color: "#b06698", test: s => Object.values(s.journals).some(j => j.did || j.wrong || j.improve) },
  { id: "film-five", title: "Five Frames", description: "Log five films in your diary.", icon: "◫", xp: 50, color: "#e2483a", test: s => s.activities.filter(a => a.type === "film").length >= 5 },
  { id: "course-part", title: "Step By Step", description: "Complete a course part.", icon: "✓", xp: 40, color: "#7fcb9a", test: s => s.courses.some(c => c.parts.some(p => p.done)) },
  { id: "ten-tasks", title: "Done Is Real", description: "Finish ten tiny tasks.", icon: "✓", xp: 100, color: "#e8c15a", test: s => s.goals.flatMap(g => g.tasks).filter(t => t.done).length >= 10 },
  { id: "century", title: "A Hundred Hours", description: "Accumulate 100 study hours.", icon: "⌁", xp: 300, color: "#7fb3e8", test: s => s.activities.filter(a => a.type === "study").reduce((n,a) => n + (a.minutes || 0), 0) >= 6000 },
];

function isoOffset(days) {
  const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() - days); return localISO(date);
}

function seedState() {
  const now = Date.now();
  return {
    profile: { name: "You", xp: 1240, streak: 6, longestRhythm: 14, graceDays: 2, graceDates:[], theme: "ran", memoryEnabled: true },
    ui: { library: "films", libraryFilter:"all", dashboardRange:7 },
    provider: { type: "none", endpoint: "", model: "", key: "" },
    activities: [
      { id: "seed-1", type: "study", title: "Linear algebra", detail: "45m focused session · #matrices", minutes:45, xp:60, date: todayISO(), createdAt: now - 50 * 60000, icon:"◷" },
      { id: "seed-2", type: "book", title: "Piranesi", detail: "Read to page 120 of 272", minutes:25, xp:12, date: todayISO(), createdAt: now - 130 * 60000, icon:"▤", progress:44 },
      { id: "seed-3", type: "task", title: "Sent the project outline", detail: "Small step, finished", xp:10, date:todayISO(), createdAt:now - 220 * 60000, icon:"✓" },
      { id: "seed-4", type: "film", title: "Perfect Days", detail: "Watched · ★ 4.5", rating:4.5, xp:25, date:isoOffset(1), createdAt:now - 86400000, icon:"◫" },
      { id: "seed-5", type: "study", title: "Organic chemistry", detail: "50m focused session · #exam", minutes:50, xp:65, date:isoOffset(1), createdAt:now - 86400000 - 5000, icon:"◷" },
      { id: "seed-6", type: "study", title: "Linear algebra", detail: "35m focused session", minutes:35, xp:50, date:isoOffset(2), createdAt:now - 2*86400000, icon:"◷" },
      { id: "seed-7", type: "book", title: "Piranesi", detail: "Read 24 pages", minutes:30, xp:18, date:isoOffset(3), createdAt:now - 3*86400000, icon:"▤" },
      { id: "seed-8", type: "study", title: "Linear algebra", detail: "1h 15m focused session", minutes:75, xp:90, date:isoOffset(4), createdAt:now - 4*86400000, icon:"◷" },
      { id: "seed-9", type: "film", title: "The Holdovers", detail: "Watched · ★ 4", rating:4, xp:25, date:isoOffset(5), createdAt:now - 5*86400000, icon:"◫" },
      { id: "seed-10", type: "study", title: "Organic chemistry", detail: "40m focused session", minutes:40, xp:55, date:isoOffset(6), createdAt:now - 6*86400000, icon:"◷" },
    ],
    library: [
      { id:"film-perfect", kind:"film", title:"Perfect Days", year:2023, rating:4.5, color:"#cf553f", accent:"#e6b95c", kicker:"A WIM WENDERS FILM" },
      { id:"film-holdovers", kind:"film", title:"The Holdovers", year:2023, rating:4, color:"#5a7f69", accent:"#dfc586", kicker:"ALEXANDER PAYNE" },
      { id:"film-past", kind:"film", title:"Past Lives", year:2023, rating:4.5, color:"#223f62", accent:"#dc846f", kicker:"CELINE SONG" },
      { id:"film-spirited", kind:"film", title:"Spirited Away", year:2001, rating:5, color:"#5a8d8e", accent:"#f4d276", kicker:"STUDIO GHIBLI" },
      { id:"film-ran", kind:"film", title:"Ran", year:1985, rating:4.5, color:"#a93731", accent:"#edbc56", kicker:"AKIRA KUROSAWA" },
      { id:"film-dune", kind:"film", title:"Dune: Part Two", year:2024, rating:4, color:"#8f5d35", accent:"#f2d092", kicker:"DENIS VILLENEUVE" },
      { id:"book-piranesi", kind:"book", title:"Piranesi", year:2020, rating:null, progress:44, color:"#27707a", accent:"#f0cf6b", kicker:"SUSANNA CLARKE" },
      { id:"book-dune", kind:"book", title:"Dune", year:1965, rating:5, progress:100, color:"#a45935", accent:"#f1cf8b", kicker:"FRANK HERBERT" },
      { id:"book-braiding", kind:"book", title:"Braiding Sweetgrass", year:2013, rating:4.5, progress:100, color:"#386a51", accent:"#d9ba70", kicker:"ROBIN WALL KIMMERER" },
      { id:"game-hades", kind:"game", title:"Hades", year:2020, rating:4.5, hours:32, color:"#9b3436", accent:"#e9bd61", kicker:"SUPERGIANT GAMES" },
      { id:"game-outer", kind:"game", title:"Outer Wilds", year:2019, rating:5, hours:18, color:"#263e68", accent:"#e6b860", kicker:"MOBIUS DIGITAL" },
      { id:"series-bear", kind:"series", title:"The Bear", year:2022, rating:4.5, color:"#ba572f", accent:"#e6c077", kicker:"CHRISTOPHER STORER", episodes:[{season:1,episode:1,title:"System",watched:true,rating:4},{season:1,episode:2,title:"Hands",watched:true,rating:4.5},{season:1,episode:3,title:"Brigade",watched:false,rating:null}] },
      { id:"series-bluey", kind:"series", title:"Blue Eye Samurai", year:2023, rating:null, color:"#294e6d", accent:"#d89b61", kicker:"AMBER NOIZUMI", episodes:[{season:1,episode:1,title:"Hammerscale",watched:true,rating:4.5},{season:1,episode:2,title:"An Unexpected Element",watched:false,rating:null}] },
      { id:"watch-substance", kind:"watchlist", media:"film", title:"The Substance", year:2024, color:"#bd3c62", accent:"#fff0c8", kicker:"CORALIE FARGEAT" },
      { id:"watch-pachinko", kind:"watchlist", media:"book", title:"Pachinko", year:2017, color:"#31556d", accent:"#e8c872", kicker:"MIN JIN LEE" },
    ],
    mediaLists: [
      { id:"list-soft-evening", title:"For a soft evening", description:"Stories to keep nearby when you want something human-scale.", source:"LIFE", entries:[{title:"Perfect Days",year:2023},{title:"Piranesi",year:2020},{title:"A Short Hike",year:2019}] },
    ],
    courses: [
      { id:"course-math", title:"Essence of Linear Algebra", source:"3Blue1Brown · video course", color:"#7fb3e8", parts:[{title:"Vectors, what even are they?",done:true},{title:"Linear combinations & span",done:true},{title:"Linear transformations",done:false},{title:"Matrix multiplication",done:false},{title:"The determinant",done:false}] },
      { id:"course-react", title:"React: From the Inside Out", source:"Personal learning path", color:"#e8c15a", parts:[{title:"Rendering and state",done:true},{title:"Effects and events",done:false},{title:"Data fetching",done:false},{title:"Patterns you can reuse",done:false}] },
      { id:"course-chem", title:"Organic Chemistry I", source:"Textbook + practice", color:"#b06698", parts:[{title:"Bonding and structure",done:true},{title:"Acids and bases",done:false},{title:"Stereochemistry",done:false},{title:"Substitution reactions",done:false},{title:"Elimination reactions",done:false}] },
    ],
    goals: [
      { id:"goal-learn", title:"Build a stronger math foundation", description:"Make room for concepts to settle.", color:"#7fb3e8", tasks:[{id:"task-matrix",title:"Finish the transformations lesson",done:false,xp:10},{id:"task-problem",title:"Work through 3 matrix problems",done:false,xp:10},{id:"task-notes",title:"Write a one-page summary",done:true,xp:10}] },
      { id:"goal-read", title:"Read with more presence", description:"One page at a time is still a world.", color:"#e8c15a", tasks:[{id:"task-read",title:"Read Piranesi for 25 minutes",done:true,xp:10},{id:"task-note",title:"Save one line that stays with you",done:false,xp:10}] },
      { id:"goal-care", title:"Keep a softer weekly rhythm", description:"Systems that care for the person using them.", color:"#7fcb9a", tasks:[{id:"task-walk",title:"Take a phone-free walk",done:false,xp:10},{id:"task-journal",title:"Write a three-line reflection",done:false,xp:10}] },
    ],
    skills: [
      { id:"skill-writing", name:"Writing", category:"Creative practice", level:"growing", xp:280, minutes:230, color:"#e8c15a", lastPracticed:todayISO() },
      { id:"skill-code", name:"Frontend craft", category:"Programming", level:"in motion", xp:430, minutes:390, color:"#7fb3e8", lastPracticed:isoOffset(1) },
      { id:"skill-language", name:"Japanese", category:"Language", level:"starting", xp:120, minutes:110, color:"#b06698", lastPracticed:isoOffset(3) },
    ],
    rituals: [
      { id:"ritual-move", title:"Move a little", description:"A walk, stretch, or anything that reconnects you.", icon:"↗", xp:8, color:"#7fcb9a", current:4, longest:11, dates:[todayISO(),isoOffset(1),isoOffset(2),isoOffset(3)] },
      { id:"ritual-read", title:"Read one page", description:"A tiny doorway into a larger world.", icon:"▤", xp:8, color:"#e8c15a", current:6, longest:14, dates:[todayISO(),isoOffset(1),isoOffset(2),isoOffset(3),isoOffset(4),isoOffset(5)] },
      { id:"ritual-close", title:"Close the day kindly", description:"Three lines of reflection are plenty.", icon:"✎", xp:8, color:"#b06698", current:2, longest:8, dates:[isoOffset(1),isoOffset(2)] },
    ],
    events: [
      { id:"event-path", title:"Started a new learning path", description:"Broke a vague curiosity into a first course.", type:"milestone", emoji:"✦", date:isoOffset(2) },
      { id:"event-quiet", title:"A quiet afternoon walk", description:"No productivity attached—just noticed the light.", type:"memory", emoji:"◌", date:isoOffset(5) },
      { id:"event-note", title:"A line worth keeping", description:"Small systems can be acts of care.", type:"note", emoji:"✎", date:isoOffset(8) },
    ],
    resolutions: [
      { id:"resolution-learn", title:"Learn enough math to build with confidence", year:new Date().getFullYear(), done:false, xp:150 },
      { id:"resolution-rest", title:"Make rest part of the plan", year:new Date().getFullYear(), done:false, xp:120 },
      { id:"resolution-create", title:"Finish and share one small creative project", year:new Date().getFullYear(), done:true, xp:180 },
    ],
    breathworkLogs: [],
    journals: {},
    achievements: ["first-log", "first-page", "focus-five", "course-part"],
  };
}

function normalizeProvider(provider, { includeKey = true } = {}) {
  const source = provider && typeof provider === "object" && !Array.isArray(provider) ? provider : {};
  return {
    type: typeof source.type === "string" ? source.type : "none",
    endpoint: typeof source.endpoint === "string" ? source.endpoint : "",
    model: typeof source.model === "string" ? source.model : "",
    key: includeKey && typeof source.key === "string" ? source.key : "",
  };
}

function upgradeState(saved, { includeProviderKey = true } = {}) {
  const fresh=seedState(); if(!saved || !saved.profile) return fresh;
  const merged={...fresh,...saved,profile:{...fresh.profile,...saved.profile},ui:{...fresh.ui,...saved.ui},provider:normalizeProvider(saved.provider,{includeKey:includeProviderKey})};
  ["activities","library","mediaLists","courses","goals","skills","rituals","events","resolutions","breathworkLogs","achievements"].forEach(key=>{merged[key]=Array.isArray(saved[key])?saved[key]:[];});
  merged.journals=saved.journals&&typeof saved.journals==="object"&&!Array.isArray(saved.journals)?saved.journals:{};
  return merged;
}
function createPortableBackup(source) {
  const archive=JSON.parse(JSON.stringify(source));
  archive.version=2;
  archive.provider=normalizeProvider(archive.provider,{includeKey:false});
  return archive;
}
function restoreBackupState(backup) { return upgradeState(backup,{includeProviderKey:false}); }
function loadState() {
  try { const saved = JSON.parse(localStorage.getItem(STORE)); return upgradeState(saved); }
  catch { return seedState(); }
}
let state = loadState();
let timer = { running:false, seconds:1500, interval:null, chosen:25 };
let breathwork = { technique:"box", running:false, elapsed:0, interval:null };
let soundscape = { context:null, source:null, gain:null };
const BREATH_TECHNIQUES = {
  box: { title:"Box breathing", description:"Four easy counts in, hold, out, and rest. A steady place to begin.", phases:["INHALE","HOLD","EXHALE","REST"] },
  calm: { title:"Long exhale", description:"A soft inhale followed by a longer exhale. No holding needed.", phases:["INHALE","EXHALE"] },
  reset: { title:"Reset breath", description:"A simple three-count in and out for an uncluttered pause.", phases:["INHALE","EXHALE"] },
};

function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
function escapeHTML(value = "") { return String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch])); }
function formatNumber(value) { return new Intl.NumberFormat("en-US").format(Math.round(value || 0)); }
function formatDate(date = new Date()) { return new Intl.DateTimeFormat("en-US", { weekday:"long", month:"long", day:"numeric" }).format(date); }
function formatShortDay(iso) { return new Intl.DateTimeFormat("en-US", { weekday:"short" }).format(new Date(`${iso}T12:00:00`)); }
function formatDuration(minutes = 0) { const h = Math.floor(minutes / 60); const m = minutes % 60; return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`; }
function typeIcon(type) { return ({film:"◫",book:"▤",game:"⌁",series:"▣",study:"◷",course:"▤",task:"✓",habit:"●",watchlist:"＋",journal:"✎",skill:"◇",breathwork:"◌",event:"✦",generic:"·"})[type] || "·"; }
function levelInfo(xp) { let level = 1, at = 0, next = 60; while (xp >= at + next) { at += next; level += 1; next = Math.round(60 * Math.pow(level, 1.45)); } return { level, at, next, into:xp-at, percent:Math.min(100, ((xp-at)/next)*100) }; }
function datesLastWeek() { return Array.from({length:7}, (_,index) => isoOffset(6-index)); }
function localMemoryItems() { return state.activities.length + Object.values(state.journals).filter(j=>j.did||j.wrong||j.improve).length; }
function dayBefore(iso){const date=new Date(`${iso}T12:00:00`);date.setDate(date.getDate()-1);return localISO(date);}
function currentRhythm(){const days=new Set([...state.activities.map(activity=>activity.date),...state.rituals.flatMap(ritual=>ritual.dates||[]),...(state.profile.graceDates||[])]);let date=todayISO(),count=0;while(days.has(date)){count++;date=dayBefore(date);}return count;}
function refreshRhythm(){const rhythm=currentRhythm();state.profile.streak=rhythm;state.profile.longestRhythm=Math.max(Number(state.profile.longestRhythm)||0,rhythm);return rhythm;}

function applyTheme() {
  document.documentElement.dataset.theme = state.profile.theme;
  const theme = THEMES.find(t => t.id === state.profile.theme) || THEMES[0];
  $("#currentThemeLabel").textContent = theme.label;
}

function renderHeader() {
  const d = new Date();
  $("#todayDate").textContent = formatDate(d);
  $("#greeting").textContent = formatDate(d).toUpperCase();
  $("#journalDate").textContent = formatDate(d).toUpperCase();
  const hour = d.getHours();
  const message = hour < 12 ? "The day is still opening." : hour < 17 ? "There is room for one good thing." : "You made it through the day.";
  $("#dailyLine").textContent = message;
  $("#profileName").textContent = state.profile.name || "You";
  $("#profileInitial").textContent = (state.profile.name || "You").trim().charAt(0).toUpperCase() || "Y";
}

function renderXp() {
  const info = levelInfo(state.profile.xp);
  $("#levelNumber").textContent = info.level;
  $("#sideLevel").textContent = info.level;
  $("#characterLevel").textContent = info.level;
  $("#characterXp").textContent = formatNumber(state.profile.xp);
  $("#xpToNext").textContent = `${formatNumber(info.next - info.into)} XP`;
  $("#xpTotal").textContent = formatNumber(state.profile.xp);
  $("#xpFill").style.width = `${Math.max(3, info.percent)}%`;
  $("#xpOrb").style.left = `${Math.max(3, info.percent)}%`;
  const rhythm=refreshRhythm(),tier=info.level>=10?"radiant":info.level>=6?"steady":info.level>=3?"spark":"seed",growth={seed:"taking first steps",spark:"finding a rhythm",steady:"growing stronger",radiant:"bright with your progress"}[tier];$("#sideStreak").textContent = rhythm;
  $("#characterStreak").textContent = `${rhythm} days`;$("#characterGrowth").textContent=growth;$$(".character-wrap").forEach(wrap=>wrap.dataset.tier=tier);
}

function activeBook() { return state.library.find(x => x.kind === "book" && x.progress > 0 && x.progress < 100) || state.library.find(x => x.kind === "book"); }
function renderToday() {
  const book = activeBook(); const game = state.library.find(x => x.kind === "game"); const course = state.courses[0];
  const courseDone = course.parts.filter(p=>p.done).length; const coursePercent = Math.round(courseDone/course.parts.length*100);
  $("#nowGrid").innerHTML = `
    <article class="now-card primary"><p class="eyebrow">CURRENT READ</p><h3>${escapeHTML(book?.title || "Add a book")}</h3><p>${book?.progress || 0}% through · ${book?.kicker || "A small shelf begins"}</p><div class="progress-ring" style="--progress:${book?.progress || 0}"><span>${book?.progress || 0}%</span></div><div class="card-meta">▤ ${book?.progress ? "Continue gently" : "Choose a book"}</div><button class="card-action" data-view="library" type="button">→</button></article>
    <article class="now-card"><p class="eyebrow">NEXT UP</p><h3>${escapeHTML(course.title)}</h3><p>${escapeHTML(course.parts.find(p=>!p.done)?.title || "Path complete")}</p><div class="progress-ring" style="--progress:${coursePercent}"><span>${coursePercent}%</span></div><div class="card-meta">▤ Lesson ${courseDone + 1}</div><button class="card-action course-next-button" data-course="${course.id}" type="button">→</button></article>
    <article class="now-card"><p class="eyebrow">PLAY SPACE</p><h3>${escapeHTML(game?.title || "Add a game")}</h3><p>${game?.hours || 0} hours of a very good time</p><div class="card-meta">⌁ Pick up where you left off</div><button class="card-action" data-view="library" type="button">→</button></article>`;
  renderTimeline();
}

function renderTimeline() {
  const today = state.activities.filter(item => item.date === todayISO()).sort((a,b)=>b.createdAt-a.createdAt);
  $("#timeline").innerHTML = today.length ? today.map(a => {
    const time = new Intl.DateTimeFormat("en-US", {hour:"numeric",minute:"2-digit"}).format(new Date(a.createdAt));
    return `<div class="timeline-entry"><span class="timeline-icon">${a.icon || typeIcon(a.type)}</span><div><div class="timeline-title">${escapeHTML(a.title)}</div><div class="timeline-detail">${escapeHTML(a.detail || "Logged a moment")}</div></div><div class="timeline-xp">+${a.xp || 0} XP <span class="timeline-time">${time}</span></div></div>`;
  }).join("") : `<div class="empty-timeline">Nothing has been logged today yet. A small thing is plenty.</div>`;
}

function currentLibrary() { return state.ui.library || "films"; }
function libraryItemsFor(tab) {
  const kinds = { films: "film", books: "book", series: "series", games: "game" };
  if(tab === "watchlist") return state.library.filter(item => item.kind === "watchlist" || item.watchlisted);
  return state.library.filter(item => item.kind === kinds[tab]);
}
function renderMediaLists(search) {
  const lists=(state.mediaLists||[]).filter(list=>!search||`${list.title} ${list.description||""} ${(list.entries||[]).map(entry=>entry.title).join(" ")}`.toLowerCase().includes(search));
  return lists.length ? lists.map(list=>`<button class="list-card" type="button" data-media-list="${list.id}"><span class="list-card-icon">☷</span><span class="list-card-count">${list.entries?.length||0} stories</span><strong>${escapeHTML(list.title)}</strong><small>${escapeHTML(list.description||"A personal collection.")}</small><em>${escapeHTML(list.source||"LIFE")}</em></button>`).join("") : `<div class="empty-timeline">No lists here yet. Import a Letterboxd list or make one from what matters to you.</div>`;
}
function renderLibrary() {
  const tab = currentLibrary(),filter=state.ui.libraryFilter||"all",search = $("#librarySearch").value.trim().toLowerCase(); let items = libraryItemsFor(tab).filter(x => !search || `${x.title} ${(x.tags||[]).join(" ")} ${x.notes||""}`.toLowerCase().includes(search));if(filter==="recent")items=items.slice().sort((a,b)=>String(b.lastLoggedDate||b.year||"").localeCompare(String(a.lastLoggedDate||a.year||"")));if(filter==="rated")items=items.slice().sort((a,b)=>(b.rating||-1)-(a.rating||-1));
  const labels = { films:"Films you made time for.", books:"Books that lived with you.", series:"Series, one episode at a time.", games:"Games in your own time.", watchlist:"A shelf for later.", lists:"Collections with a point of view." };
  $("#libraryDescription").textContent = labels[tab];
  $("#filmCount").textContent = state.library.filter(x=>x.kind==="film").length;
  $("#bookCount").textContent = state.library.filter(x=>x.kind==="book").length;
  $("#seriesCount").textContent = state.library.filter(x=>x.kind==="series").length;
  $("#gameCount").textContent = state.library.filter(x=>x.kind==="game").length;
  $("#watchCount").textContent = state.library.filter(x=>x.kind==="watchlist"||x.watchlisted).length;
  $("#listCount").textContent = (state.mediaLists||[]).length;
  $$(".library-tab").forEach(button => button.classList.toggle("active", button.dataset.library === tab));
  $$("[data-library-filter]").forEach(button=>button.classList.toggle("active",button.dataset.libraryFilter===filter));
  $("#mediaGrid").innerHTML = tab === "lists" ? renderMediaLists(search) : items.length ? items.map((item, index) => posterMarkup(item, index)).join("") : `<div class="empty-timeline">No ${tab} here yet. Capture one in a line.</div>`;
}

function posterMarkup(item, index) {
  const subtitle = item.kind === "book" ? (item.progress ? `${item.progress}% read` : `${item.year || ""}`) : item.kind === "game" ? `${item.hours || 0}h played` : item.kind === "series" ? `${item.episodes?.filter(e=>e.watched).length || 0}/${item.episodes?.length || 0} episodes` : item.year || "Someday";
  const score = item.rating ? `★ ${item.rating}${item.favorite?" ♥":""}` : (item.kind === "watchlist" || item.watchlisted) ? "＋ saved" : item.progress ? `${item.progress}%` : item.favorite ? "♥ loved" : "unrated";
  const angle = index % 3 === 0 ? "-22deg" : index % 3 === 1 ? "16deg" : "-7deg";
  return `<button class="media-card" type="button" data-media="${item.id}" aria-label="Open ${escapeHTML(item.title)}"><div class="media-poster"><div class="poster-art" style="background:linear-gradient(145deg, ${item.color}, ${item.accent || item.color});"><i class="poster-pattern" style="transform:rotate(${angle})"></i><span class="poster-kicker">${escapeHTML(item.kicker || "LIFE LIBRARY")}</span><strong class="poster-title">${escapeHTML(item.title)}</strong><span class="poster-rating">${score}</span></div></div><div class="media-info"><span class="media-title">${escapeHTML(item.title)}</span><span class="media-meta"><span>${subtitle}</span><b>${item.rating ? `★ ${item.rating}` : ""}</b></span></div></button>`;
}

function studyMinutesFor(iso) { return state.activities.filter(a=>a.type==="study" && a.date===iso).reduce((sum,a)=>sum+(a.minutes||0),0); }
function renderStudy() {
  const dates = datesLastWeek(); const minutes = dates.reduce((sum,date)=>sum+studyMinutesFor(date),0); const sessions = state.activities.filter(a=>a.type==="study" && dates.includes(a.date)).length;
  $("#studyWeek").textContent = formatDuration(minutes);
  $("#studySessions").textContent = sessions;
  $("#weekBars").innerHTML = dates.map(date => { const min=studyMinutesFor(date), height=Math.max(7, Math.min(100, min/1.1)); return `<div class="week-bar ${date===todayISO()?"active":""}" style="height:${height}%"><span>${formatShortDay(date).slice(0,1)}</span></div>`; }).join("");
  const topics = [
    {name:"Linear algebra", time: state.activities.filter(a=>a.title.toLowerCase().includes("linear")).reduce((n,a)=>n+(a.minutes||0),0), progress:62, color:"#7fb3e8", copy:"Vectors, transformations, matrices"},
    {name:"Organic chemistry", time: state.activities.filter(a=>a.title.toLowerCase().includes("organic")).reduce((n,a)=>n+(a.minutes||0),0), progress:37, color:"#b06698", copy:"Acids, bases, and structure"},
    {name:"Frontend craft", time: 120, progress:25, color:"#e8c15a", copy:"Components with a point of view"}
  ];
  $("#topicGrid").innerHTML = topics.map(topic => `<article class="topic-card" style="--topic-color:${topic.color}"><span class="eyebrow">IN MOTION</span><span class="topic-time">${formatDuration(topic.time)}</span><h3>${topic.name}</h3><p>${topic.copy}</p><div class="topic-progress"><i style="width:${topic.progress}%"></i></div></article>`).join("");
  const maxSkill=Math.max(1,...state.skills.map(skill=>skill.xp||0));
  $("#skillStrip").innerHTML=state.skills.map(skill=>`<article class="skill-mini" style="--skill-color:${skill.color}"><span>${escapeHTML(skill.category || "Practice")}</span><b>${escapeHTML(skill.name)}</b><span>${formatDuration(skill.minutes || 0)} practiced · ${skill.level || "growing"}</span><i style="width:${Math.min(100,(skill.xp||0)/maxSkill*100)}%"></i></article>`).join("");
}

function renderCourses() {
  $("#courseGrid").innerHTML = state.courses.map(course => {
    const completed = course.parts.filter(p=>p.done).length, percent = Math.round(completed/course.parts.length*100), next = course.parts.find(p=>!p.done);
    return `<article class="course-card" style="--course-color:${course.color}"><div class="course-art"></div><p class="eyebrow">${completed === course.parts.length ? "PATH COMPLETE" : "IN PROGRESS"}</p><h3>${escapeHTML(course.title)}</h3><p>${escapeHTML(course.source)}</p><div class="course-progress-copy"><span>${completed}/${course.parts.length} parts</span><b>${percent}%</b></div><div class="course-progress"><i style="width:${percent}%"></i></div><button class="course-next" type="button" data-course="${course.id}">${next ? `Continue: ${escapeHTML(next.title)} →` : "Celebrate completion ✦"}</button></article>`;
  }).join("");
}

function renderJournal() {
  const current = state.journals[todayISO()] || { did:"", wrong:"", improve:"", freeform:"", mood:3 };
  $("#journalDid").value = current.did || ""; $("#journalWrong").value = current.wrong || ""; $("#journalImprove").value = current.improve || ""; $("#journalFreeform").value = current.freeform || "";
  $$("#moodChoices button").forEach(button=>button.classList.toggle("active", Number(button.dataset.mood) === (current.mood || 3)));
  $("#journalSavedState").textContent = current.did || current.wrong || current.improve || current.freeform ? "Saved locally — yours only" : "Not saved yet";
}

function renderGoals() {
  $("#goalsList").innerHTML = state.goals.map(goal => {
    const complete = goal.tasks.filter(t=>t.done).length, percent=Math.round(complete/goal.tasks.length*100);
    return `<article class="goal-card" style="--goal-color:${goal.color}"><div class="goal-head"><span class="goal-color"></span><div><h3>${escapeHTML(goal.title)}</h3><p>${escapeHTML(goal.description)}</p></div><span class="goal-percent">${percent}%</span></div><div class="task-list">${goal.tasks.map(task => `<label class="task-row ${task.done?"done":""}"><input class="task-check" type="checkbox" data-goal="${goal.id}" data-task="${task.id}" ${task.done?"checked":""}/><span>${escapeHTML(task.title)}</span><small>+${task.xp || 10} XP</small></label>`).join("")}</div></article>`;
  }).join("");
}

function renderDashboard() {
  const range=Number(state.ui.dashboardRange)||7,dates=Array.from({length:range},(_,index)=>isoOffset(range-1-index)),bucketCount=range===7?7:range===30?10:12,bucketSize=Math.ceil(range/bucketCount),buckets=Array.from({length:bucketCount},(_,index)=>dates.slice(index*bucketSize,Math.min(dates.length,(index+1)*bucketSize))).filter(bucket=>bucket.length),xpDays=buckets.map(bucket=>state.activities.filter(a=>bucket.includes(a.date)).reduce((sum,a)=>sum+(a.xp||0),0)),inRange=state.activities.filter(activity=>dates.includes(activity.date)),labels=buckets.map(bucket=>range===365?new Intl.DateTimeFormat("en-US",{month:"short"}).format(new Date(`${bucket[0]}T12:00:00`)):formatShortDay(bucket[0])); const hoursByType = [
    ["Study", inRange.filter(a=>a.type==="study").reduce((n,a)=>n+(a.minutes||0),0), "var(--accent)"],
    ["Reading", inRange.filter(a=>a.type==="book").reduce((n,a)=>n+(a.minutes||0),0), "var(--gold)"],
    ["Play", inRange.filter(a=>a.type==="game").reduce((n,a)=>n+(a.minutes||0),0), "var(--blue)"],
    ["Films", inRange.filter(a=>a.type==="film").length*120, "var(--green)"],
    ["Reflection", inRange.filter(a=>a.type==="journal").length*15, "var(--purple)"]
  ]; const totalMinutes=hoursByType.reduce((n,[,m])=>n+m,0);
  const totalXp=xpDays.reduce((a,b)=>a+b,0), studyM=hoursByType[0][1], logs=inRange.length;
  $("#metricGrid").innerHTML = [
    ["XP EARNED", formatNumber(totalXp), `last ${range} days`, "up"], ["FOCUS TIME", formatDuration(studyM), `${inRange.filter(a=>a.type==="study").length} sessions`, "up"], ["MOMENTS LOGGED", logs, "every one counts", ""], ["RHYTHM", `${currentRhythm()} days`, "gentle consistency", "up"]
  ].map(([label,value,copy,status])=>`<article class="metric-card"><span class="metric-label">${label}</span><b>${value}</b><small class="${status}">${status ? "↗ " : ""}${copy}</small></article>`).join("");
  const max=Math.max(...xpDays,50); $("#lineChart").innerHTML=xpDays.map((xp,index)=>`<span class="line-bar" data-value="${xp} XP" style="height:${Math.max(5,xp/max*100)}%;opacity:${Math.min(1,.52+index*.07)}"></span>`).join("");$(".chart-labels").innerHTML=labels.map(label=>`<span>${label}</span>`).join("");$$("[data-dashboard-range]").forEach(button=>button.classList.toggle("active",Number(button.dataset.dashboardRange)===range));
  const usable=hoursByType.filter(([,minutes])=>minutes); $("#donutHours").textContent=formatDuration(totalMinutes); $("#chartLegend").innerHTML=usable.map(([label,minutes,color])=>`<li><i class="legend-dot" style="background:${color}"></i>${label} <span style="margin-left:auto">${formatDuration(minutes)}</span></li>`).join("");
}

function checkAchievements() {
  let awarded=[]; ACHIEVEMENTS.forEach(achievement => { if (!state.achievements.includes(achievement.id) && achievement.test(state)) { state.achievements.push(achievement.id); state.profile.xp += achievement.xp; awarded.push(achievement); } }); return awarded;
}
function renderAchievements() {
  const unlocked=ACHIEVEMENTS.filter(a=>state.achievements.includes(a.id)); const newest=unlocked[unlocked.length-1] || ACHIEVEMENTS[0];
  $("#achievementCount").textContent=unlocked.length; $("#latestAchievement").textContent=newest.title; $("#latestAchievementCopy").textContent=newest.description; $("#latestAchievementXp").textContent=newest.xp;
  $("#achievementGrid").innerHTML=ACHIEVEMENTS.map(a=>{const on=state.achievements.includes(a.id); const progress=on?100: a.id==="focus-five" ? Math.min(100,state.activities.filter(x=>x.type==="study").length/5*100):a.id==="film-five"?Math.min(100,state.activities.filter(x=>x.type==="film").length/5*100):a.id==="century"?Math.min(100,state.activities.filter(x=>x.type==="study").reduce((n,x)=>n+(x.minutes||0),0)/6000*100):0; return `<article class="achievement-card ${on?"":"locked"}" style="--achievement-color:${a.color}"><div class="achievement-symbol">${a.icon}</div><h3>${a.title}</h3><p>${a.description}</p><div class="achievement-progress"><i style="width:${progress}%"></i></div></article>`;}).join("");
}

function renderCharacter() {
  const tracks = [ ["Cinema", state.activities.filter(a=>a.type==="film").reduce((n,a)=>n+(a.xp||0),0), "#e2483a"], ["Literature", state.activities.filter(a=>a.type==="book").reduce((n,a)=>n+(a.xp||0),0), "#e8c15a"], ["Scholarship", state.activities.filter(a=>a.type==="study"||a.type==="course").reduce((n,a)=>n+(a.xp||0),0), "#7fb3e8"], ["Reflection", state.activities.filter(a=>a.type==="journal").reduce((n,a)=>n+(a.xp||0),0), "#b06698"], ["Discipline", state.activities.filter(a=>a.type==="task"||a.type==="habit").reduce((n,a)=>n+(a.xp||0),0), "#7fcb9a"] ];
  const max=Math.max(100,...tracks.map(t=>t[1])); $("#trackGrid").innerHTML=tracks.map(([name,xp,color])=>`<article class="track-card" style="--track-color:${color}"><span>${name.toUpperCase()}</span><b>${formatNumber(xp)} XP</b><div class="track-bar"><i style="width:${Math.min(100,xp/max*100)}%"></i></div></article>`).join("");
}

function renderSettings() {
  const supported=["none","ollama","openai","custom"],providerType=supported.includes(state.provider.type)?state.provider.type:"none"; $("#providerType").value=providerType; $("#providerEndpoint").value=state.provider.endpoint||""; $("#providerModel").value=state.provider.model||""; $("#providerKey").value=state.provider.key||""; $("#memoryEnabled").checked=state.profile.memoryEnabled !== false; $("#memoryCount").textContent=localMemoryItems();
  const status=$("#providerStatus"), connected=providerType !== "none" && state.provider.endpoint; status.textContent=connected?"Configured locally":"Not connected"; status.classList.toggle("connected",!!connected);
  $("#themeSwatches").innerHTML=THEMES.map(theme=>`<button type="button" class="theme-choice ${theme.id===state.profile.theme?"active":""}" data-theme-choice="${theme.id}"><span class="theme-preview" style="background:${theme.colors[0]}">${theme.colors.slice(1).map(color=>`<i style="background:${color}"></i>`).join("")}</span><span>${theme.label}</span></button>`).join("");
}

function renderRituals() {
  const grace=Math.max(0, Number(state.profile.graceDays ?? 2));
  $("#graceDays").textContent=grace;
  $("#longestRhythm").textContent=state.profile.longestRhythm || Math.max(...state.rituals.map(ritual=>ritual.longest||0), 0);
  const rhythm=currentRhythm();$("#ritualCalendar").innerHTML=Array.from({length:9},(_,i)=>`<i class="${i<rhythm?"active":""}"></i>`).join("");
  $("#ritualList").innerHTML=state.rituals.map(ritual=>{const done=ritual.dates?.includes(todayISO());return `<article class="ritual-row" style="--ritual-color:${ritual.color}"><span class="ritual-mark">${ritual.icon||"✦"}</span><div><h3>${escapeHTML(ritual.title)}</h3><p>${escapeHTML(ritual.description||"A tiny promise to yourself.")}</p></div><span class="ritual-run">${ritual.current||0} day rhythm<br />best ${ritual.longest||0}</span><button class="ritual-toggle ${done?"done":""}" data-ritual="${ritual.id}" type="button">${done?"Done today ✓":"Mark done"}</button></article>`;}).join("");
  $("#breathLogCount").textContent=state.breathworkLogs.length;
}

function renderArchive() {
  const days=Array.from({length:84},(_,i)=>isoOffset(83-i));
  $("#archiveCalendar").innerHTML=days.map(date=>{const amount=state.activities.filter(activity=>activity.date===date).reduce((sum,activity)=>sum+(activity.xp||0),0);const level=amount>=100?"level-3":amount>=35?"level-2":amount>0?"level-1":"";return `<i class="${level}" title="${date}: ${amount} XP"></i>`;}).join("");
  const events=[...state.events].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,5);
  $("#memoryList").innerHTML=events.length?events.map(event=>`<article class="memory-item"><span class="memory-icon">${event.emoji||"✦"}</span><div><b>${escapeHTML(event.title)}</b><p>${escapeHTML(event.description||"A moment worth keeping.")}</p></div><time>${formatShortDay(event.date)}</time></article>`).join(""):`<p class="empty-timeline">No memories saved yet. Small moments belong here too.</p>`;
  $("#resolutionList").innerHTML=state.resolutions.filter(resolution=>resolution.year===new Date().getFullYear()).map(resolution=>`<label class="resolution-item ${resolution.done?"done":""}"><input type="checkbox" data-resolution="${resolution.id}" ${resolution.done?"checked":""}/><span>${escapeHTML(resolution.title)}</span></label>`).join("") || `<p class="empty-timeline">No horizons yet. You do not need one to begin.</p>`;
}

function renderAll() { applyTheme(); renderHeader(); renderXp(); renderToday(); renderLibrary(); renderStudy(); renderCourses(); renderJournal(); renderGoals(); renderRituals(); renderArchive(); renderDashboard(); renderAchievements(); renderCharacter(); renderSettings(); }

function toast(message, xp=0, undo=null) {
  const item=document.createElement("div"); item.className="toast"; item.innerHTML=`<span class="toast-icon">✦</span><span>${escapeHTML(message)}</span>${xp?`<b>+${xp} XP</b>`:""}${undo?`<button type="button">Undo</button>`:""}`; $("#toastRegion").append(item); if(undo) $("button",item).onclick=()=>{undo();item.remove();}; setTimeout(()=>item.remove(), 5800);
}

function addActivity(activity, announce=true) {
  const entry={ id:uid(), date:todayISO(), createdAt:Date.now(), xp:0, icon:typeIcon(activity.type), ...activity };
  state.activities.push(entry); state.profile.xp += entry.xp || 0;
  refreshRhythm();const unlocks=checkAchievements(); save(); renderAll();
  if(announce) { toast(`${entry.title} recorded`, entry.xp, () => undoActivity(entry.id)); unlocks.forEach(a=>toast(`Achievement unlocked: ${a.title}`, a.xp)); }
  return entry;
}
function undoActivity(id) { const index=state.activities.findIndex(a=>a.id===id); if(index<0)return; const [removed]=state.activities.splice(index,1); state.profile.xp=Math.max(0,state.profile.xp-(removed.xp||0)); save();renderAll();toast("Entry removed — no harm done."); }

function extractMinutes(text) {
  const hours=Number(text.match(/\b(\d+)\s*(?:h|hr|hrs|hour|hours)\b/i)?.[1]||0), minutes=Number(text.match(/\b(\d+)\s*(?:m|min|mins|minute|minutes)\b/i)?.[1]||0); return hours*60+minutes;
}
function cleanTitle(text) {
  return text.replace(/\*\s?[0-5](?:\.5)?(?:\/5)?\b/g," ").replace(/\b[0-5](?:\.5)?\/5\b/g," ").replace(/\(\d{4}\)/g," ").replace(/\b\d+\s*(?:h|hr|hrs|hour|hours)\s*\d*\s*(?:m|min|mins|minute|minutes)?\b/gi," ").replace(/\b\d+\s*(?:m|min|mins|minute|minutes)\b/gi," ").replace(/\bp\d+(?:\/\d+)?\b/gi," ").replace(/\b\d+%/g," ").replace(/#[\w-]+/g," ").replace(/!(?:rw|re|rp|like|wl|done|dnf|drop)\b/gi," ").replace(/@(?:today|yesterday|y|mon|tue|wed|thu|fri|sat|sun|\d{4}-\d\d-\d\d|\d+\/\d+(?:\/\d{4})?)/gi," ").replace(/\s+/g," ").trim().replace(/^[-–—,:]+|[-–—,:]+$/g,"").replace(/^"|"$/g,"");
}
function titleCase(text) { return text.replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.slice(1)); }
function validISODate(value) { const match=String(value||"").match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!match)return false;const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]),12);return date.getFullYear()===Number(match[1])&&date.getMonth()===Number(match[2])-1&&date.getDate()===Number(match[3]); }
function parseCaptureDate(raw) { const token=raw.match(/@(today|yesterday|y|\d{4}-\d\d-\d\d|\d{1,2}\/\d{1,2}(?:\/\d{4})?)/i)?.[1];if(!token)return "";const lower=token.toLowerCase();if(lower==="today")return todayISO();if(lower==="yesterday"||lower==="y")return isoOffset(1);if(validISODate(token))return token;const parts=token.split("/").map(Number),year=parts[2]||new Date().getFullYear(),value=`${year}-${String(parts[0]).padStart(2,"0")}-${String(parts[1]).padStart(2,"0")}`;return validISODate(value)?value:""; }
function parseOneCapture(raw) {
  let source=raw.trim(); const captureDate=parseCaptureDate(raw); const prefixMatch=source.match(/^([fbgscjthwn])\s+/i); let prefix=prefixMatch?prefixMatch[1].toLowerCase():"n"; if(prefixMatch)source=source.slice(prefixMatch[0].length);
  const ratingMatch=source.match(/(?:\*\s?([0-5](?:\.5)?)|\b([0-5](?:\.5)?)\/5\b)/); const rating=ratingMatch?Number(ratingMatch[1]||ratingMatch[2]):null; const minutes=extractMinutes(source); const done=/!(?:done|dnf|drop)\b/i.test(source); const rewatch=/!(?:rw|re|rp)\b/i.test(source); const progress=source.match(/\bp(\d+)(?:\/(\d+))?\b/i); const page=Number(progress?.[1]||0), totalPages=Number(progress?.[2]||0), percent=source.match(/\b(\d+)%/); const progressValue=totalPages?Math.min(100,Math.round(page/totalPages*100)):percent?Number(percent[1]):page?Math.min(100,page):null; const tags=[...source.matchAll(/#([\w-]+)/g)].map(m=>m[1]); let title=cleanTitle(source) || source;
  if(prefix==="w" && /^[fbg]\s+/i.test(title)) { const inner=title.match(/^([fbg])\s+(.+)$/i); if(inner){ prefix="w"; title=inner[2]; } }
  const coursePartMatch=prefix==="c"?source.match(/\b(?:part|lesson|module)\s*(\d+)\b|\s(\d+)\s*$/i):null; const coursePart=Number(coursePartMatch?.[1]||coursePartMatch?.[2]||0); const courseTitle=prefix==="c"?cleanTitle(source.replace(/\b(?:part|lesson|module)\s*\d+\b|\s\d+\s*$/i,"")):""; const normalized=titleCase(courseTitle||title);
  const config={
    f:{type:"film",verb:rewatch?"Rewatched":"Watched",base:rewatch?12:20}, b:{type:"book",verb:done?"Finished":"Read",base:done?120:Math.max(6, Math.floor((minutes||15)/15)*6)}, g:{type:"game",verb:done?"Completed":"Played",base:done?80:Math.max(10,Math.floor((minutes||30)/30)*10)}, s:{type:"study",verb:"Studied",base:(minutes||25)+((minutes||25)>=25?15:0)}, c:{type:"course",verb:"Completed",base:40}, j:{type:"journal",verb:"Reflected",base:25}, t:{type:"task",verb:"Added task",base:0}, h:{type:"habit",verb:"Showed up for",base:8}, w:{type:"watchlist",verb:"Saved",base:2}, n:{type:"generic",verb:"Logged",base:Math.max(3,minutes?Math.round(minutes/5):5)}
  }[prefix];
  if (prefix === "t") { return { kind:"task", title:normalized, detail:"Added to your next steps", xp:0, raw, tags, date:captureDate }; }
  if(prefix === "j") { return { kind:"journal", title:"Quick reflection", detail:normalized, xp:config.base, raw, tags, date:captureDate, journalText:normalized }; }
  const detailParts=[config.verb]; if(minutes)detailParts.push(formatDuration(minutes)); if(progress)detailParts.push(`page ${page}${totalPages?` of ${totalPages}`:""}`); if(percent&&!totalPages)detailParts.push(`${percent[1]}%`); if(rating)detailParts.push(`★ ${rating}`); if(tags.length)detailParts.push(tags.map(t=>`#${t}`).join(" "));
  return { kind:config.type, title:normalized, detail:detailParts.join(" · "), xp:config.base+(rating&&prefix==="f"?5:0), rating, minutes, progress:progressValue, page, totalPages, coursePart, courseTitle, raw, tags, date:captureDate, watched:prefix==="w", mediaType: prefix==="w" ? "film" : prefix };
}
function ensureLibraryItem(parsed) {
  const kind=parsed.kind; if(!["film","book","game","watchlist"].includes(kind)) return; const searchKind=kind==="watchlist"?"watchlist":kind;
  const existing=state.library.find(item=>item.kind===searchKind && item.title.toLowerCase()===parsed.title.toLowerCase()); if(existing) { if(parsed.rating)existing.rating=parsed.rating; if(parsed.progress&&kind==="book")existing.progress=Math.min(100,parsed.progress); if(parsed.page&&kind==="book")existing.page=parsed.page;if(parsed.totalPages&&kind==="book")existing.totalPages=parsed.totalPages;if(parsed.tags?.length)existing.tags=[...new Set([...(existing.tags||[]),...parsed.tags])];existing.lastLoggedDate=parsed.date||todayISO(); return; }
  const palette={film:["#644b74","#cf9764"],book:["#386e77","#e0b963"],game:["#4b5e88","#d87568"],watchlist:["#754650","#e8bb6d"]}[kind];
  state.library.unshift({id:uid(),kind:searchKind,title:parsed.title,year:new Date().getFullYear(),rating:parsed.rating||null,progress:kind==="book"?(parsed.progress||0):undefined,page:kind==="book"?(parsed.page||0):undefined,totalPages:kind==="book"?(parsed.totalPages||0):undefined,hours:kind==="game"?(parsed.minutes?Math.round(parsed.minutes/60):0):undefined,tags:parsed.tags||[],lastLoggedDate:parsed.date||todayISO(),color:palette[0],accent:palette[1],kicker:"ADDED TO LIFE"});
}
function applyCourseCapture(parsed) { const query=(parsed.courseTitle||parsed.title).trim(),needle=query.toLowerCase();let course=state.courses.find(item=>item.title.toLowerCase().includes(needle)||needle.includes(item.title.toLowerCase())),created=false;if(!course){course={id:uid(),title:query||"A learning path",source:"Quick capture",color:"#7fb3e8",parts:[]};state.courses.unshift(course);created=true;}const index=Math.max(0,(parsed.coursePart||0)-1),part=course.parts[index]||course.parts.find(item=>!item.done)||{title:`Part ${course.parts.length+1}`,done:false};if(!course.parts.includes(part))course.parts.push(part);if(part.done){parsed.title=course.title;parsed.detail=`Revisited: ${part.title}`;parsed.xp=10;return;}part.done=true;parsed.title=course.title;parsed.detail=`Completed: ${part.title}`;parsed.xp=course.parts.every(item=>item.done)&&!created&&course.parts.length>1?290:40;}
function commitCapture() {
  const input=$("#quickCapture"), raw=input.value.trim(); if(!raw)return; const entries=raw.split(";").map(x=>x.trim()).filter(Boolean); let total=0, descriptions=[];
  entries.forEach(line=>{const parsed=parseOneCapture(line); if(parsed.kind==="task"){const goal=state.goals[0];goal.tasks.push({id:uid(),title:parsed.title,done:false,xp:10});descriptions.push(`Task added: ${parsed.title}`);return;} if(parsed.kind==="journal"){const date=parsed.date||todayISO(),j=state.journals[date]||{did:"",wrong:"",improve:"",mood:3};j.did=[j.did,parsed.journalText].filter(Boolean).join(j.did?"\n":"");state.journals[date]=j;}if(parsed.kind==="course")applyCourseCapture(parsed); ensureLibraryItem(parsed); const item={type:parsed.kind,title:parsed.title,detail:parsed.detail,xp:parsed.xp,minutes:parsed.minutes,rating:parsed.rating,icon:typeIcon(parsed.kind)}; state.activities.push({id:uid(),date:parsed.date||todayISO(),createdAt:Date.now(),...item});state.profile.xp+=item.xp;total+=item.xp;descriptions.push(item.title);});
  refreshRhythm();const unlocks=checkAchievements(); save(); input.value="";renderAll();toast(entries.length>1?`${entries.length} moments recorded`: `${descriptions[0]} recorded`, total);unlocks.forEach(a=>toast(`Achievement unlocked: ${a.title}`,a.xp));
}

function openModal(html) { $("#modal").innerHTML=html; $("#modalLayer").classList.add("open"); $("#modalLayer").setAttribute("aria-hidden","false"); const first=$("input,textarea,select,button", $("#modal")); if(first)setTimeout(()=>first.focus(),30); }
function closeModal() { $("#modalLayer").classList.remove("open"); $("#modalLayer").setAttribute("aria-hidden","true"); }
function openSyntax() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">QUICK CAPTURE</p><h2>One line is enough.</h2><p>Everything is saved immediately. The prefixes help LIFE place a moment in the right shelf; no prefix saves it as a general activity.</p><div class="syntax-list"><div><code>f dune (2021) *4.5</code>film, date, rating</div><div><code>b piranesi p120/272 25m</code>reading progress</div><div><code>g hades 90m !done</code>game session / finish</div><div><code>s 45m linear algebra #exam</code>study time</div><div><code>c cs50 3</code>course part</div><div><code>t email advisor</code>a small task</div><div><code>h gym</code>a habit check-in</div><div><code>n cleaned the kitchen 20m</code>anything else</div></div><div class="modal-actions"><button class="btn btn-primary" type="button" data-close-modal>Got it</button></div>`); }
function openAddLibrary() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">ADD TO LIBRARY</p><h2>A new story.</h2><form class="modal-form" id="addMediaForm"><label>Type<select name="kind"><option value="film">Film</option><option value="book">Book</option><option value="series">Series</option><option value="game">Game</option><option value="watchlist">Watchlist</option></select></label><label>Title<input name="title" required placeholder="The title that matters" /></label><label>Year <input name="year" type="number" placeholder="2026" /></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Add it</button></div></form>`); $("#addMediaForm").onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget),kind=d.get("kind"),title=d.get("title").trim(); if(!title)return; const colors={film:["#744e75","#d9a26d"],book:["#376e6b","#e0c366"],series:["#2d5974","#dc9b67"],game:["#534477","#dd8868"],watchlist:["#774550","#e0bd6d"]}[kind];state.library.unshift({id:uid(),kind,title,year:d.get("year")||"",rating:null,episodes:kind==="series"?[]:undefined,color:colors[0],accent:colors[1],kicker:"YOUR LIBRARY"});save();closeModal();renderAll();toast(`${title} added to your shelf`);}; }
function openAddMediaList(){openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">MAKE A LIST</p><h2>Give a collection a point of view.</h2><form class="modal-form" id="mediaListForm"><label>List title<input name="title" required placeholder="e.g. Films for rainy Sunday afternoons" /></label><label>Why this list?<textarea name="description" placeholder="A sentence only you need to understand."></textarea></label><label>Stories, one per line <textarea name="entries" placeholder="Perfect Days (2023)&#10;Piranesi (2020)"></textarea></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Save list</button></div></form>`);$("#mediaListForm").onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget),title=String(data.get("title")||"").trim(),entries=String(data.get("entries")||"").split("\n").map(line=>{const value=line.trim(),year=value.match(/\((\d{4})\)\s*$/)?.[1]||"",entryTitle=value.replace(/\s*\(\d{4}\)\s*$/,"").trim();return entryTitle?{title:entryTitle,year}:null;}).filter(Boolean);if(!title)return;state.mediaLists.unshift({id:uid(),title,description:String(data.get("description")||"").trim(),source:"LIFE",entries});save();closeModal();state.ui.library="lists";renderAll();toast("A personal list is ready.");};}
function addListEntryToWatchlist(listId,index){const entry=state.mediaLists.find(list=>list.id===listId)?.entries?.[Number(index)];if(!entry)return;let item=importedFilmMatch(entry.title,entry.year,entry.uri);if(!item){item={id:uid(),kind:"film",title:entry.title,year:entry.year||"",rating:null,color:"#754650",accent:"#e8bb6d",kicker:"FROM A LIST",watchlisted:true};state.library.unshift(item);}item.watchlisted=true;save();renderAll();toast(`${entry.title} saved for later.`);}
function openMediaList(listId){const list=state.mediaLists.find(item=>item.id===listId);if(!list)return;const rows=(list.entries||[]).map((entry,index)=>`<div class="memory-item"><span class="memory-icon">${index+1}</span><div><b>${escapeHTML(entry.title)}</b><p>${escapeHTML(`${entry.year||""}${entry.description?` · ${entry.description}`:""}`)}</p></div><button class="text-button" type="button" data-list-entry="${index}">Save →</button></div>`).join("")||`<p class="empty-timeline">This collection is empty.</p>`;openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">${escapeHTML(list.source||"LIFE")} LIST · ${(list.entries||[]).length} STORIES</p><h2>${escapeHTML(list.title)}</h2><p>${escapeHTML(list.description||"A personal collection.")}</p><div class="memory-list">${rows}</div><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Close</button></div>`);$$("[data-list-entry]",$("#modal")).forEach(button=>button.onclick=()=>addListEntryToWatchlist(listId,button.dataset.listEntry));}
function openMediaDetail(mediaId) {
  const media=state.library.find(item=>item.id===mediaId); if(!media)return;
  const series=media.kind==="series",pageCopy=media.kind==="book"&&media.page?`Page ${media.page}${media.totalPages?` of ${media.totalPages}`:""}. `:"";
  const episodeRows=(media.episodes||[]).map((episode,index)=>`<div class="memory-item"><span class="memory-icon">${episode.watched?"✓":"○"}</span><div><b>S${episode.season || 1} · E${episode.episode || index+1} — ${escapeHTML(episode.title || "Untitled episode")}</b><p>${episode.watched?`${episode.rating?`★ ${episode.rating} · `:""}logged in your story`:"Ready when you are"}</p></div><button class="text-button" type="button" data-episode-toggle="${media.id}:${index}">${episode.watched?"Logged":"Log"}</button></div>`).join("") || `<p class="empty-timeline">No episodes are mapped yet.</p>`;
  openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">${escapeHTML(media.kind.toUpperCase())} · ${media.year || "YOUR LIBRARY"}</p><h2>${escapeHTML(media.title)}</h2><p>${media.rating?`★ ${media.rating} in your own rating system. `:""}${pageCopy}${media.kind==="game"&&media.hours?`${media.hours} hours played. `:""}Make the record yours.</p><form class="modal-form" id="mediaDetailForm"><label>Your rating <input name="rating" type="number" min="0" max="5" step="0.5" value="${media.rating??""}" placeholder="0–5" /></label><label>Notes or review <textarea name="notes" placeholder="What stayed with you?">${escapeHTML(media.notes||"")}</textarea></label><label>Tags <input name="tags" value="${escapeHTML((media.tags||[]).join(", "))}" placeholder="e.g. quiet, rewatch, favourite" /></label><label>Last enjoyed <input name="lastLoggedDate" type="date" value="${validISODate(media.lastLoggedDate)?media.lastLoggedDate:""}" /></label><label class="modal-checkbox"><input name="favorite" type="checkbox" ${media.favorite?"checked":""} /> A favourite</label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Close</button><button class="btn btn-primary" type="submit">Save details</button></div></form>${series?`<div class="modal-form"><label>EPISODE HISTORY</label><div class="memory-list">${episodeRows}</div><form class="episode-add" id="episodeForm"><input name="season" type="number" min="1" value="1" aria-label="Season" /><input name="episode" type="number" min="1" value="${(media.episodes?.length||0)+1}" aria-label="Episode" /><input name="title" required placeholder="Episode title" aria-label="Episode title" /><button class="btn btn-quiet" type="submit">Add episode</button></form></div>`:""}<div class="modal-actions"><button class="btn btn-primary" type="button" id="markMediaMoment">Log a moment</button></div>`);
  $("#mediaDetailForm").onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget),rating=data.get("rating"),date=String(data.get("lastLoggedDate")||"");media.rating=rating===""?null:Math.max(0,Math.min(5,Number(rating)||0));media.notes=String(data.get("notes")||"").trim();media.tags=String(data.get("tags")||"").split(",").map(tag=>tag.trim()).filter(Boolean);media.favorite=data.get("favorite")==="on";media.lastLoggedDate=validISODate(date)?date:media.lastLoggedDate||"";save();renderAll();closeModal();toast("Library details saved locally.");};
  $$("[data-episode-toggle]", $("#modal")).forEach(button=>button.onclick=()=>{const [id,index]=button.dataset.episodeToggle.split(":");const item=state.library.find(candidate=>candidate.id===id),episode=item?.episodes?.[Number(index)];if(!episode||episode.watched)return;episode.watched=true;episode.rating=episode.rating||4;addActivity({type:"series",title:item.title,detail:`Watched S${episode.season || 1} · E${episode.episode || Number(index)+1}: ${episode.title}`,xp:12,icon:"▣"});openMediaDetail(mediaId);});
  const episodeForm=$("#episodeForm");if(episodeForm)episodeForm.onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget);media.episodes=media.episodes||[];media.episodes.push({season:Number(data.get("season"))||1,episode:Number(data.get("episode"))||media.episodes.length+1,title:String(data.get("title")).trim(),watched:false,rating:null});save();renderAll();openMediaDetail(mediaId);};
  $("#markMediaMoment").onclick=()=>{const types={film:"film",book:"book",series:"series",game:"game",watchlist:"watchlist"},type=types[media.kind]||"generic",prior=state.activities.some(activity=>activity.type===type&&activity.title===media.title),rewatch=media.kind==="film"&&(media.watched||prior);if(media.kind==="film"){media.watched=true;if(rewatch)media.rewatches=(media.rewatches||0)+1;}addActivity({type,title:media.title,detail:`A moment with ${media.title}${rewatch?" · rewatch":""}`,rewatch,xp:media.kind==="film"?20:media.kind==="book"?12:media.kind==="game"?10:12,date:validISODate(media.lastLoggedDate)?media.lastLoggedDate:todayISO(),icon:typeIcon(type)});closeModal();};
}
async function getRecommendation() {
  const button=$("#getRecommendation"), tab=currentLibrary();button.disabled=true;button.textContent="Looking…";
  const fallbacks={films:["In the Mood for Love","If you loved attention to stillness and visual composition, try a focused, atmospheric romance."],books:["A Psalm for the Wild-Built","A small, thoughtful book to meet a season where gentle forward motion matters."],series:["Station Eleven","A human-scale story about art, survival, and choosing what to keep."],games:["A Short Hike","A curious, low-pressure game that respects your time."],watchlist:["Choose the one with the least friction","A watchlist works best when it gives you a soft invitation, not another obligation."],lists:["Open one small list","Lists work best as invitations, not obligations."]};
  try { const useHistory=state.profile.memoryEnabled!==false,history=useHistory?state.library.filter(item=>item.rating>=4).slice(0,12).map(item=>`${item.title} (${item.kind}, ${item.rating}/5)`).join(", "):"No private history was shared.";if(!allowProviderContext("Recommendation",useHistory?"up to 12 highly rated titles":"no private history"))throw new Error("kept local");const answer=await askLLM(`Recommend exactly one ${tab === "films"?"film":tab === "books"?"book":tab === "series"?"series":tab === "games"?"game":"title"} for this person. Context: ${history}. Give a title followed by one concise reason. Do not invent a claim about availability.`);const [title,...why]=answer.split(/\n|—| - /);$("#recommendationTitle").textContent=title.trim()||fallbacks[tab][0];$("#recommendationCopy").textContent=why.join(" ").trim()||fallbacks[tab][1];}catch{$("#recommendationTitle").textContent=fallbacks[tab][0];$("#recommendationCopy").textContent=fallbacks[tab][1];toast("Used a private, offline suggestion.");}finally{button.disabled=false;button.textContent="Suggest another";}
}
function openAddSkill() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">PRACTICE LOG</p><h2>What are you learning?</h2><form class="modal-form" id="skillForm"><label>Skill<input name="name" required placeholder="e.g. Watercolour, Spanish, Guitar" /></label><label>Minutes today<input name="minutes" type="number" min="1" value="25" required /></label><label>What did you practice?<textarea name="note" placeholder="A few honest words are enough."></textarea></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Log practice</button></div></form>`); $("#skillForm").onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget),name=titleCase(data.get("name").trim()),minutes=Number(data.get("minutes"));let skill=state.skills.find(item=>item.name.toLowerCase()===name.toLowerCase());if(!skill){skill={id:uid(),name,category:"Personal practice",level:"starting",xp:0,minutes:0,color:"#7fcb9a",lastPracticed:todayISO()};state.skills.push(skill);}skill.minutes+=minutes;skill.xp+=minutes;skill.lastPracticed=todayISO();addActivity({type:"skill",title:name,detail:`Practiced ${formatDuration(minutes)}${data.get("note")?` · ${data.get("note")}`:""}`,minutes,xp:minutes+(minutes>=25?10:0),icon:"◇"});closeModal();}; }
function openAddRitual() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">SMALL PROMISE</p><h2>Create a ritual.</h2><p>Choose something that makes life a little more yours. You can return after a lapse without losing anything.</p><form class="modal-form" id="ritualForm"><label>Ritual name<input name="title" required placeholder="e.g. Step outside for two minutes" /></label><label>Why it matters<textarea name="description" placeholder="A soft reminder, not a rule."></textarea></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Add ritual</button></div></form>`); $("#ritualForm").onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget);state.rituals.push({id:uid(),title:data.get("title").trim(),description:data.get("description").trim()||"A small promise to yourself.",icon:"✦",xp:8,color:"#7fcb9a",current:0,longest:0,dates:[]});save();closeModal();renderAll();toast("A gentle ritual is ready.");}; }
function toggleRitual(id) { const ritual=state.rituals.find(item=>item.id===id);if(!ritual||ritual.dates.includes(todayISO())){toast("Already counted for today. That is enough.");return;}ritual.dates.push(todayISO());ritual.current=(ritual.current||0)+1;ritual.longest=Math.max(ritual.longest||0,ritual.current);state.profile.longestRhythm=Math.max(state.profile.longestRhythm||0,ritual.longest);addActivity({type:"habit",title:ritual.title,detail:"Kept a small promise",xp:ritual.xp||8,icon:ritual.icon||"●"});}
function openAddMemory() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">SAVE A MEMORY</p><h2>Keep the small things.</h2><form class="modal-form" id="memoryForm"><label>Title<input name="title" required placeholder="A phrase that brings it back" /></label><label>What happened?<textarea name="description" placeholder="This stays in your local archive."></textarea></label><label>Kind<select name="type"><option value="memory">Memory</option><option value="milestone">Milestone</option><option value="note">Note</option></select></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Save memory</button></div></form>`); $("#memoryForm").onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget),type=data.get("type"),emoji={memory:"◌",milestone:"✦",note:"✎"}[type];state.events.unshift({id:uid(),title:data.get("title").trim(),description:data.get("description").trim(),type,emoji,date:todayISO()});save();closeModal();renderAll();toast("Memory saved to your archive.");}; }
function openAddResolution() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">YEARLY HORIZON</p><h2>A direction for the year.</h2><form class="modal-form" id="resolutionForm"><label>What would you like to move toward?<textarea name="title" required placeholder="A long-term intention, not a demand."></textarea></label><label>Celebration XP<input name="xp" type="number" min="10" value="150" /></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Set horizon</button></div></form>`); $("#resolutionForm").onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget);state.resolutions.unshift({id:uid(),title:data.get("title").trim(),year:new Date().getFullYear(),done:false,xp:Number(data.get("xp"))||150});save();closeModal();renderAll();toast("A yearly horizon is waiting, without pressure.");}; }
function openStudyLog() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">LOG STUDY</p><h2>Attention is effort.</h2><form class="modal-form" id="studyLogForm"><label>Topic<input name="topic" required value="${escapeHTML($("#timerTopic").value || "")}" placeholder="What did you study?" /></label><label>Minutes<input name="minutes" type="number" min="1" value="25" required /></label><label>Optional note<textarea name="note" placeholder="What made this session work?"></textarea></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Log focus</button></div></form>`); $("#studyLogForm").onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget),m=Number(d.get("minutes"));addActivity({type:"study",title:titleCase(d.get("topic").trim()),detail:`Studied ${formatDuration(m)}${d.get("note")?` · ${d.get("note")}`:""}`,minutes:m,xp:m+(m>=25?15:0)});closeModal();}; }
function openAddCourse() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">CREATE A PATH</p><h2>Start small.</h2><p>Paste a course URL or write the next few parts. You can always change the structure later.</p><form class="modal-form" id="addCourseForm"><label>Course title<input name="title" required placeholder="e.g. Learn Japanese foundations" /></label><label>Source link or textbook<input name="source" placeholder="https://… or a book title" /></label><label>Parts, one per line<textarea name="parts" required placeholder="Introduction&#10;First lesson&#10;Practice session"></textarea></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Create path</button></div></form>`); $("#addCourseForm").onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget), parts=String(d.get("parts")).split("\n").map(x=>x.trim()).filter(Boolean).map(title=>({title,done:false}));if(!parts.length)return;state.courses.push({id:uid(),title:d.get("title").trim(),source:d.get("source").trim()||"Your learning path",color:["#7fb3e8","#e8c15a","#b06698","#7fcb9a"][state.courses.length%4],parts});save();closeModal();renderAll();toast("A new learning path is ready.");}; }
function completeNextCourse(courseId) { const course=state.courses.find(c=>c.id===courseId); if(!course)return; const part=course.parts.find(p=>!p.done); if(!part){toast("This path is already complete. You did it.");return;} part.done=true; let xp=40; if(course.parts.every(p=>p.done))xp+=250;addActivity({type:"course",title:course.title,detail:`Completed: ${part.title}`,xp,icon:"▤"}); }
function openAddGoal() { openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">A NEW DIRECTION</p><h2>What matters next?</h2><form class="modal-form" id="addGoalForm"><label>Goal<input name="title" required placeholder="Something that would feel meaningful" /></label><label>First task<input name="task" required placeholder="The smallest honest next action" /></label><div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Cancel</button><button class="btn btn-primary" type="submit">Set direction</button></div></form>`); $("#addGoalForm").onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget), title=d.get("title").trim(),task=d.get("task").trim();state.goals.unshift({id:uid(),title,description:"A direction you chose.",color:"#e2483a",tasks:[{id:uid(),title:task,done:false,xp:10}]});save();closeModal();renderAll();toast("Goal added. Start small.");}; }

function saveJournal() { const old=state.journals[todayISO()]||{}; const j={did:$("#journalDid").value.trim(),wrong:$("#journalWrong").value.trim(),improve:$("#journalImprove").value.trim(),freeform:$("#journalFreeform").value.trim(),mood:Number($("#moodChoices .active")?.dataset.mood||3)}; const newReflection=!(old.did||old.wrong||old.improve||old.freeform) && (j.did||j.wrong||j.improve||j.freeform);state.journals[todayISO()]=j;if(newReflection)addActivity({type:"journal",title:"Daily reflection",detail:"Made space to notice the day",xp:25+(j.wrong?10:0)+(j.improve?10:0),icon:"✎"},false);else{save();renderAll();}toast("Reflection saved locally."); }

function timerRender() { const minutes=Math.floor(timer.seconds/60), seconds=timer.seconds%60; $("#timerDisplay").textContent=`${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`; $("#timerStart").textContent=timer.running?"Pause and breathe":"Start a gentle sprint"; }
function toggleTimer(){if(timer.running){clearInterval(timer.interval);timer.running=false;timerRender();return;} timer.running=true;timer.interval=setInterval(()=>{timer.seconds--;timerRender();if(timer.seconds<=0){clearInterval(timer.interval);timer.running=false;const m=timer.chosen;addActivity({type:"study",title:titleCase($("#timerTopic").value.trim()||"Focus session"),detail:`Finished a ${m}m focus sprint`,minutes:m,xp:m+(m>=25?15:0)});timer.seconds=timer.chosen*60;timerRender();toast("Focus sprint complete. Take a breath.");}},1000);timerRender();}
function setBreathTechnique(id) { if(!BREATH_TECHNIQUES[id] || breathwork.running)return;breathwork.technique=id;const technique=BREATH_TECHNIQUES[id];$("#breathTitle").textContent=technique.title;$("#breathDescription").textContent=technique.description;$("#breathPhase").textContent="READY";$$(".breath-option").forEach(button=>button.classList.toggle("active",button.dataset.breath===id)); }
function startBreathwork() { const button=$("#startBreathwork"),orb=$("#breathOrb");if(breathwork.running){clearInterval(breathwork.interval);breathwork.running=false;orb.classList.remove("breathing");button.textContent="Resume 1 minute";$("#breathPhase").textContent="PAUSED";return;}breathwork.running=true;orb.classList.add("breathing");button.textContent="Pause";const technique=BREATH_TECHNIQUES[breathwork.technique];breathwork.interval=setInterval(()=>{breathwork.elapsed+=1;const phase=technique.phases[Math.floor(breathwork.elapsed/4)%technique.phases.length];$("#breathPhase").textContent=phase;if(breathwork.elapsed>=60){clearInterval(breathwork.interval);breathwork.running=false;breathwork.elapsed=0;orb.classList.remove("breathing");button.textContent="Start another minute";$("#breathPhase").textContent="COMPLETE";state.breathworkLogs.push({id:uid(),technique:technique.title,date:todayISO(),minutes:1});addActivity({type:"breathwork",title:technique.title,detail:"Took a one-minute pause",minutes:1,xp:12,icon:"◌"});toast("A quiet minute recorded. No need to rush on.");}},1000);}
function toggleSoundscape() { const button=$("#soundscapeToggle"); if(soundscape.source){soundscape.source.stop();soundscape.source.disconnect();soundscape.gain?.disconnect();soundscape.source=null;soundscape.gain=null;button.textContent="♪ Soundscape off";toast("Soundscape paused.");return;}try{const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)throw new Error("Audio unavailable");const context=soundscape.context||new AudioCtor();soundscape.context=context;const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.22;const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=.025;source.connect(gain).connect(context.destination);source.start();soundscape.source=source;soundscape.gain=gain;button.textContent="♪ Soundscape on";toast("A quiet soundscape is playing.");}catch{toast("This browser cannot start a soundscape here.");}}

async function askLLM(prompt) {
  const p=state.provider; if(p.type==="none"||!p.endpoint) throw new Error("No provider is configured."); const endpoint=p.endpoint.replace(/\/$/,"");
  if(p.type==="anthropic")throw new Error("This browser edition supports Ollama and OpenAI-compatible endpoints only.");
  if(p.type==="ollama") { const response=await fetch(`${endpoint}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:p.model||"qwen2.5:7b",messages:[{role:"system",content:"You are a concise, compassionate personal learning coach."},{role:"user",content:prompt}],stream:false})});if(!response.ok)throw new Error(`Ollama returned ${response.status}`);const data=await response.json();return data.message?.content||""; }
  const url=endpoint.endsWith("/chat/completions")?endpoint:`${endpoint.replace(/\/v1$/,"")}/v1/chat/completions`;const headers={"Content-Type":"application/json"};if(p.key)headers.Authorization=`Bearer ${p.key}`;const response=await fetch(url,{method:"POST",headers,body:JSON.stringify({model:p.model||"gpt-4.1-mini",messages:[{role:"system",content:"You are a concise, compassionate personal learning coach."},{role:"user",content:prompt}],max_tokens:220})});if(!response.ok)throw new Error(`Provider returned ${response.status}`);const data=await response.json();return data.choices?.[0]?.message?.content||"";
}
function providerNeedsDisclosure(){const endpoint=String(state.provider.endpoint||"");return state.provider.type!=="ollama"&&!/^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(endpoint);}
function allowProviderContext(feature,context){if(!providerNeedsDisclosure())return true;return confirm(`${feature} will send ${context} to the provider at ${state.provider.endpoint}. LIFE will only use the response as a suggestion and will not write to your archive automatically. Continue?`);}
function fallbackCoachQuestion(){const j=state.journals[todayISO()]||{};if(j.wrong)return "What is the smallest environmental change—not a willpower promise—that could make that moment easier tomorrow?";if(j.did)return "What part of that moment would you like to make easier to return to?";return "What gave you even a tiny bit of energy today?";}
async function coachQuestion(){const button=$("#coachQuestion");button.disabled=true;button.textContent="Thinking…";try{const j=state.journals[todayISO()]||{};if(!allowProviderContext("Reflection companion","today's journal fields")){ $("#coachTitle").textContent="A question for your next small step.";$("#coachText").textContent=fallbackCoachQuestion();toast("Kept today’s journal on this device.");return;}const response=await askLLM(`Ask one gentle, practical reflection question based on this journal. Do not make assumptions or give advice. Journal data: ${JSON.stringify(j)}`);$("#coachTitle").textContent="A question for your next small step.";$("#coachText").textContent=response||fallbackCoachQuestion();}catch{ $("#coachTitle").textContent="A question for your next small step.";$("#coachText").textContent=fallbackCoachQuestion();toast("Using your offline reflection companion.");}finally{button.disabled=false;button.textContent="Ask another";}}

async function buildGoalPlan(){openModal(`<button class="modal-close" type="button" data-close-modal>×</button><p class="eyebrow">GOAL PLANNER</p><h2>Make a kind plan.</h2><p>Write a direction. LIFE will suggest a short, editable starting path; you decide what stays.</p><form class="modal-form" id="planForm"><label>What would you like to work toward?<textarea name="goal" required placeholder="e.g. Learn enough linear algebra to understand graphics programming"></textarea></label><div class="modal-actions"><button class="btn btn-primary" type="submit">Suggest first steps</button></div></form>`); $("#planForm").onsubmit=async e=>{e.preventDefault();const goal=new FormData(e.currentTarget).get("goal").trim();const submit=$("button[type=submit]",e.currentTarget);submit.textContent="Shaping a path…";let answer="";try{if(!allowProviderContext("Goal planning","the goal you just wrote"))throw new Error("kept local");answer=await askLLM(`Turn this goal into exactly 3 small, specific, compassionate tasks. Return one task per line, no introduction. Goal: ${goal}`);}catch{answer="Choose a 25-minute starting lesson\nPractice one small example\nWrite down one thing that clicked";}const tasks=answer.split("\n").map(x=>x.replace(/^[-•\d.\s]+/,"").trim()).filter(Boolean).slice(0,4);$("#modal").innerHTML=`<p class="eyebrow">YOUR STARTING PATH</p><h2>${escapeHTML(goal)}</h2><p>Keep, edit, or discard this suggestion. You are in charge.</p><form class="modal-form" id="acceptPlanForm">${tasks.map((task,index)=>`<label>Step ${index+1}<input name="task" value="${escapeHTML(task)}" /></label>`).join("")}<div class="modal-actions"><button class="btn btn-quiet" type="button" data-close-modal>Discard</button><button class="btn btn-primary" type="submit">Add this plan</button></div></form>`;$("#acceptPlanForm").onsubmit=ev=>{ev.preventDefault();const tasks=[...new FormData(ev.currentTarget).getAll("task")].map(title=>({id:uid(),title:title.trim(),done:false,xp:10})).filter(t=>t.title);state.goals.unshift({id:uid(),title:goal,description:"A plan you can revise anytime.",color:"#e2483a",tasks});save();closeModal();renderAll();toast("Your plan is ready. One step is plenty.");};};}

function providerSave(e){e.preventDefault();state.provider={type:$("#providerType").value,endpoint:$("#providerEndpoint").value.trim(),model:$("#providerModel").value.trim(),key:$("#providerKey").value.trim()};save();renderSettings();toast(state.provider.type==="none"?"LLM disabled. LIFE stays fully capable.":"LLM settings saved locally.");}
async function testProvider(){const button=$("#testProvider");const p={type:$("#providerType").value,endpoint:$("#providerEndpoint").value.trim(),model:$("#providerModel").value.trim(),key:$("#providerKey").value.trim()};if(p.type==="none"||!p.endpoint){toast("Choose a provider and endpoint first.");return;}button.textContent="Testing…";button.disabled=true;const prior=state.provider;state.provider=p;try{if(p.type==="ollama"){const response=await fetch(`${p.endpoint.replace(/\/$/,"")}/api/tags`);if(!response.ok)throw Error();}else await askLLM("Reply only: connected");toast("Connection works. You are in control.");}catch{toast("Couldn’t reach it. Check the URL, model, and browser CORS settings.");}finally{state.provider=prior;button.disabled=false;button.textContent="Test connection";}}

function exportData(){const archive=createPortableBackup(state);const blob=new Blob([JSON.stringify(archive,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`life-backup-${todayISO()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast("Portable backup downloaded. Provider keys stay on this device.");}
function importBackup(file){const reader=new FileReader();reader.onload=()=>{try{const raw=JSON.parse(reader.result);if(!raw||typeof raw!=="object"||!raw.profile||!Array.isArray(raw.activities))throw Error();const restored=restoreBackupState(raw);if(confirm("Replace the current local LIFE data with this backup? Your current browser archive will be replaced.")){state=restored;save();renderAll();toast("Backup restored locally and safely upgraded.");}}catch{toast("That doesn’t look like a valid LIFE backup.");}};reader.readAsText(file);}
function csvRows(text){const rows=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i++){const char=text[i],next=text[i+1];if(char==='"'&&quoted&&next==='"'){cell+='"';i++;}else if(char==='"'){quoted=!quoted;}else if(char===','&&!quoted){row.push(cell);cell="";}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&next==='\n')i++;row.push(cell);if(row.some(value=>value.trim()))rows.push(row);row=[];cell="";}else cell+=char;}if(cell||row.length){row.push(cell);rows.push(row);}return rows;}
function csvHeader(value){return String(value||"").replace(/^\uFEFF/,"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
function parseCSV(text){const rows=csvRows(text);const headerIndex=rows.findIndex(row=>{const headers=row.map(csvHeader);return headers.includes("name")&&(headers.includes("year")||headers.includes("position")||headers.includes("letterboxd uri")||headers.includes("url"));});if(headerIndex<0)return {headers:[],rows:[],preamble:rows};const headers=rows[headerIndex].map(csvHeader);return {headers,rows:rows.slice(headerIndex+1).map(row=>Object.fromEntries(headers.map((header,index)=>[header,row[index]?.trim()||""]))),preamble:rows.slice(0,headerIndex)};}
function csvValue(row,...keys){for(const key of keys){const value=row[csvHeader(key)];if(value!==undefined&&value!=="")return value.trim();}return "";}
function canonicalFilm(title,year=""){return `${String(title||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}|${String(year||"").trim()}`;}
function importedFilmMatch(title,year,uri){const key=canonicalFilm(title,year);return state.library.find(item=>(uri&&item.letterboxdUri===uri)||canonicalFilm(item.title,item.year)===key||(!year&&canonicalFilm(item.title,"").split("|")[0]===key.split("|")[0]));}
function letterboxdFileType(file,parsed){const name=`${file.webkitRelativePath||""}/${file.name}`.toLowerCase(),headers=parsed.headers;if(headers.includes("position"))return "list";if(name.includes("watchlist"))return "watchlist";if(name.includes("diary")||headers.includes("rewatch")||headers.includes("watched date"))return "diary";if(name.includes("ratings"))return "ratings";if(name.includes("watched"))return "watched";if(name.includes("like")||name.includes("/likes/")||file.name.toLowerCase()==="films.csv")return "likes";return "catalog";}
function importDate(row){const value=csvValue(row,"watched date","date");return validISODate(value)?value:"";}
function upsertImportedFilm(row,flags={}){const title=csvValue(row,"name","title","film name");if(!title)return null;const year=csvValue(row,"year"),uri=csvValue(row,"letterboxd uri","url"),rating=Number(csvValue(row,"rating"));let item=importedFilmMatch(title,year,uri);if(!item){item={id:uid(),kind:"film",title:title.trim(),year:year||"",rating:null,color:"#536274",accent:"#d7a968",kicker:"LETTERBOXD IMPORT",importedFrom:"letterboxd",letterboxdUri:uri||"",watchlisted:false,watched:false,liked:false,rewatches:0,tags:[]};state.library.push(item);}if(item.kind==="watchlist"&&(flags.watched||Number.isFinite(rating)))item.kind="film";if(year)item.year=year;if(uri)item.letterboxdUri=uri;if(Number.isFinite(rating)&&rating>=0&&rating<=5)item.rating=rating;if(flags.watched){item.watched=true;const date=importDate(row);if(date)item.lastLoggedDate=date;}if(flags.watchlisted)item.watchlisted=true;if(flags.liked)item.liked=true;return item;}
function importDiaryRow(row,counters){const item=upsertImportedFilm(row,{watched:true});if(!item)return;const date=importDate(row),rewatch=/^(yes|true|1)$/i.test(csvValue(row,"rewatch")),tags=csvValue(row,"tags").split(/[,;]/).map(tag=>tag.trim()).filter(Boolean),key=`${item.letterboxdUri||canonicalFilm(item.title,item.year)}|${date||"undated"}|${rewatch?"rewatch":"watch"}`;if(state.activities.some(activity=>activity.importKey===key))return;if(tags.length)item.tags=[...new Set([...(item.tags||[]),...tags])];state.activities.push({id:uid(),type:"film",title:item.title,detail:`Imported from Letterboxd${item.rating?` · ★ ${item.rating}`:""}${rewatch?" · rewatch":""}${tags.length?` · ${tags.map(tag=>`#${tag}`).join(" ")}`:""}`,rating:item.rating||null,rewatch,tags,xp:0,date:date||todayISO(),createdAt:Date.now()-counters.diary,icon:"◫",importKey:key,source:"letterboxd",sourceUri:item.letterboxdUri||""});if(rewatch)item.rewatches=(item.rewatches||0)+1;counters.diary++;}
function listTitleFromFile(file){const name=file.name.replace(/\.csv$/i,"").replace(/[-_]+/g," ").replace(/\s+/g," ").trim();return titleCase(name||"Imported list");}
function importList(file,parsed,counters){const entries=parsed.rows.map(row=>{const item=upsertImportedFilm(row);if(!item)return null;return {title:item.title,year:item.year,uri:item.letterboxdUri||"",description:csvValue(row,"description")};}).filter(Boolean);if(!entries.length)return;const signature=`${file.webkitRelativePath||file.name}|${entries.map(entry=>`${entry.title}|${entry.year}`).join(";")}`,existing=state.mediaLists.find(list=>list.importKey===signature),list={id:existing?.id||uid(),title:listTitleFromFile(file),description:`Imported collection · ${entries.length} titles`,source:"LETTERBOXD",entries,importKey:signature};if(existing)Object.assign(existing,list);else state.mediaLists.push(list);counters.lists+=entries.length;}
async function importCsv(files){const selected=[...files].filter(file=>/\.csv$/i.test(file.name));if(!selected.length){toast("Choose one or more CSV files first.");return;}let sources=[];try{sources=await Promise.all(selected.map(async file=>({file,parsed:parseCSV(await file.text())})));}catch{toast("One of those files could not be read.");return;}const counters={titles:0,diary:0,lists:0,skipped:0};for(const {file,parsed} of sources){if(!parsed.rows.length){counters.skipped++;continue;}const type=letterboxdFileType(file,parsed);if(type==="list"){importList(file,parsed,counters);continue;}for(const row of parsed.rows){const flags={watched:type==="watched"||type==="diary",watchlisted:type==="watchlist",liked:type==="likes"};const before=state.library.length;const item=upsertImportedFilm(row,flags);if(!item)continue;if(state.library.length>before)counters.titles++;if(type==="diary")importDiaryRow(row,counters);}}save();renderAll();const details=[counters.titles?`${counters.titles} new titles`:"",counters.diary?`${counters.diary} diary entries`:"",counters.lists?`${counters.lists} list entries`:""].filter(Boolean).join(" · ");toast(details?`Letterboxd import complete: ${details}.`:"No compatible Letterboxd rows were found.");}

function showView(name){const valid=$("#view-"+name)?name:"today";$$(".view").forEach(view=>view.classList.toggle("active",view.id===`view-${valid}`));$$(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.view===valid));$("#breadcrumb").innerHTML=`${valid === "today" ? "Today" : valid.charAt(0).toUpperCase()+valid.slice(1)} <span>·</span> <span>${valid==="today"?formatDate():"LIFE"}</span>`;$("#appShell").classList.remove("menu-open");window.scrollTo({top:0,behavior:"smooth"});}

function wireEvents(){
  document.addEventListener("click", e=>{const view=e.target.closest("[data-view]");if(view){showView(view.dataset.view);return;}if(e.target.closest("[data-close-modal]")){closeModal();return;}const course=e.target.closest("[data-course]");if(course){completeNextCourse(course.dataset.course);return;}const ritual=e.target.closest("[data-ritual]");if(ritual){toggleRitual(ritual.dataset.ritual);return;}const hint=e.target.closest("[data-capture]");if(hint){$("#quickCapture").value=hint.dataset.capture;$("#quickCapture").focus();}const choice=e.target.closest("[data-theme-choice]");if(choice){state.profile.theme=choice.dataset.themeChoice;save();renderAll();}const list=e.target.closest("[data-media-list]");if(list){openMediaList(list.dataset.mediaList);return;}const media=e.target.closest("[data-media]");if(media){openMediaDetail(media.dataset.media);}});
  document.addEventListener("change", e=>{const resolution=e.target.closest("[data-resolution]");if(!resolution)return;const item=state.resolutions.find(candidate=>candidate.id===resolution.dataset.resolution);if(!item)return;item.done=resolution.checked;if(item.done){addActivity({type:"task",title:item.title,detail:"Completed a yearly horizon",xp:item.xp||150,icon:"✦"});}else{save();renderAll();toast("Horizon reopened. It can change with you.");}});
  $$(".nav-item").forEach(button=>button.addEventListener("click",()=>showView(button.dataset.view)));
  $("#openCapture").onclick=$("#heroLog").onclick=()=>{showView("today");setTimeout(()=>$("#quickCapture").focus(),50);};$("#heroReflect").onclick=()=>showView("journal");$("#captureSend").onclick=commitCapture;$("#quickCapture").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();commitCapture();}});$("#syntaxHelp").onclick=openSyntax;
  $("#librarySearch").addEventListener("input",renderLibrary);$$(".library-tab").forEach(button=>button.onclick=()=>{state.ui.library=button.dataset.library;save();renderLibrary();});$$('[data-library-filter]').forEach(button=>button.onclick=()=>{state.ui.libraryFilter=button.dataset.libraryFilter;save();renderLibrary();});$("#addLibraryItem").onclick=openAddLibrary;$("#addMediaList").onclick=openAddMediaList;$("#getRecommendation").onclick=getRecommendation;$("#csvImport").onchange=e=>importCsv(e.target.files);
  $("#timerStart").onclick=toggleTimer;$("#timerReset").onclick=()=>{clearInterval(timer.interval);timer.running=false;timer.seconds=timer.chosen*60;timerRender();};$$(".timer-mode").forEach(button=>button.onclick=()=>{if(timer.running)return;timer.chosen=Number(button.dataset.minutes);timer.seconds=timer.chosen*60;$$(".timer-mode").forEach(b=>b.classList.toggle("active",b===button));timerRender();});$("#openStudyLog").onclick=openStudyLog;$("#addSkill").onclick=openAddSkill;$("#askStudyCoach").onclick=()=>{showView("journal");setTimeout(coachQuestion,150);};
  $("#addCourse").onclick=openAddCourse;$("#coursePlan").onclick=openAddCourse;$("#journalForm").addEventListener("submit",e=>{e.preventDefault();saveJournal();});$$("#moodChoices button").forEach(button=>button.onclick=()=>{$$("#moodChoices button").forEach(b=>b.classList.toggle("active",b===button));});$("#coachQuestion").onclick=coachQuestion;
  $("#addGoal").onclick=openAddGoal;$("#goalPlanner").onclick=buildGoalPlan;$("#goalsList").addEventListener("change",e=>{const check=e.target.closest(".task-check");if(!check)return;const goal=state.goals.find(g=>g.id===check.dataset.goal),task=goal?.tasks.find(t=>t.id===check.dataset.task);if(!task)return;task.done=check.checked;if(task.done)addActivity({type:"task",title:task.title,detail:"Completed a next step",xp:task.xp||10,icon:"✓"});else{save();renderAll();toast("Task reopened. It can wait.");}});
  $("#addRitual").onclick=openAddRitual;$("#useGraceDay").onclick=()=>{if((state.profile.graceDays||0)<=0){toast("No grace days are waiting right now. You can return tomorrow.");return;}if(currentRhythm()>0){toast("No grace day is needed today. You are already in your rhythm.");return;}state.profile.graceDates=[...(state.profile.graceDates||[]),todayISO()];state.profile.graceDays-=1;refreshRhythm();save();renderAll();toast("A grace day is holding today without calling it a failure.");};$$(".breath-option").forEach(button=>button.onclick=()=>setBreathTechnique(button.dataset.breath));$("#startBreathwork").onclick=startBreathwork;$("#soundscapeToggle").onclick=toggleSoundscape;
  $("#addMemory").onclick=openAddMemory;$("#addMemorySecondary").onclick=openAddMemory;$("#addResolution").onclick=openAddResolution;
  $$('[data-dashboard-range]').forEach(button=>button.onclick=()=>{state.ui.dashboardRange=Number(button.dataset.dashboardRange);save();renderDashboard();});
  $("#renameCharacter").onclick=()=>{const next=prompt("Give your companion a name (this prototype displays it in future builds):",state.profile.name);if(next?.trim()){state.profile.name=next.trim();save();toast("Your companion has a new name.");}};
  $("#providerForm").addEventListener("submit",providerSave);$("#testProvider").onclick=testProvider;$("#memoryEnabled").onchange=e=>{state.profile.memoryEnabled=e.target.checked;save();toast(e.target.checked?"Recommendations may use your local rating history.":"Recommendations will not use your private history.");};$("#exportData").onclick=exportData;$("#backupImport").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]);$("#resetData").onclick=()=>{if(confirm("Reset this browser’s LIFE data to the built-in demo? Export first if you want to keep it.")){state=seedState();save();renderAll();toast("Demo data restored.");}};
  $("#clearToday").onclick=()=>{const entries=state.activities.filter(a=>a.date===todayISO());if(!entries.length)return;state.activities=state.activities.filter(a=>a.date!==todayISO());state.profile.xp=Math.max(0,state.profile.xp-entries.reduce((n,a)=>n+(a.xp||0),0));save();renderAll();toast("Today’s demo entries were cleared.");};
  $("#themeCycle").onclick=()=>{const index=THEMES.findIndex(t=>t.id===state.profile.theme);state.profile.theme=THEMES[(index+1)%THEMES.length].id;save();renderAll();toast(`Theme: ${THEMES.find(t=>t.id===state.profile.theme).label}`);};$("#searchBtn").onclick=()=>{showView("library");setTimeout(()=>$("#librarySearch").focus(),100);};$("#focusMode").onclick=()=>{showView("study");};$("#mobileMenu").onclick=()=>$("#appShell").classList.toggle("menu-open");
  $("#modalLayer").onclick=e=>{if(e.target===$("#modalLayer"))closeModal();};document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();const tag=document.activeElement?.tagName;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();showView("today");setTimeout(()=>$("#quickCapture").focus(),50);}else if(e.key==="?"&&tag!=="INPUT"&&tag!=="TEXTAREA"){openSyntax();}else if(e.key.toLowerCase()==="c"&&tag!=="INPUT"&&tag!=="TEXTAREA"&& !$("#modalLayer").classList.contains("open")){showView("today");setTimeout(()=>$("#quickCapture").focus(),50);}else if(e.key==="/"&&tag!=="INPUT"&&tag!=="TEXTAREA"){e.preventDefault();showView("library");setTimeout(()=>$("#librarySearch").focus(),50);}});
}

renderAll(); timerRender(); wireEvents();
