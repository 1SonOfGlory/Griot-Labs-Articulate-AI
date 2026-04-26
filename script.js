const STORAGE_KEY = "articulate_ai_state_v4";

const QUOTES = [
  { text: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { text: "The single biggest problem in communication is the illusion that it has taken place.", author: "George Bernard Shaw" },
  { text: "Speak clearly, if you speak at all.", author: "Oliver Wendell Holmes Sr." },
  { text: "Words are, of course, the most powerful drug used by mankind.", author: "Rudyard Kipling" },
  { text: "Courage is what it takes to stand up and speak.", author: "Winston Churchill" },
];

const PERSONA_PRESETS = {
  executive: "Executive Mentor: calm, concise, investor-grade communication coach.",
  friendly: "Supportive Friend: encouraging tone, confidence-building feedback style.",
  direct: "Direct Drill Coach: strict and performance-focused with crisp correction.",
  story: "Storytelling Guide: helps with hooks, emotion, and memorable message arcs.",
  ghanaian: "Ghanaian Coach: conversational, context-aware, grounded in Ghanaian communication style."
};

const GLOSSARY = {
  clarity: {
    definition: "Making your message easy to understand from the first sentence.",
    synonyms: ["clear thinking", "precision", "focus"],
    example: "I will start with one clear idea, then support it with one proof."
  },
  confidence: {
    definition: "Speaking with calm conviction so listeners trust your message.",
    synonyms: ["assurance", "composure", "belief"],
    example: "I can explain this clearly because I know the value we bring."
  },
  resonance: {
    definition: "Connecting your words to what your audience truly cares about.",
    synonyms: ["connection", "fit", "relevance"],
    example: "For your team, this saves time and protects your budget."
  },
  traction: {
    definition: "Real progress that proves your idea is already working.",
    synonyms: ["momentum", "growth", "adoption"],
    example: "In three months, we doubled active users with no ad spend."
  },
  narrative: {
    definition: "A story structure that makes your message memorable.",
    synonyms: ["story arc", "thread", "flow"],
    example: "Pain, proof, plan: that is the narrative I will use."
  }
};

const IPA_MAP = {
  clarity: "/KLAIR-uh-tee/",
  confidence: "/KON-fi-dense/",
  resonance: "/REZ-uh-nense/",
  traction: "/TRAK-shun/",
  narrative: "/NAR-uh-tiv/",
  momentum: "/moh-MEN-tum/",
  presence: "/PREZ-uhns/",
  connection: "/kuh-NEK-shun/",
  purpose: "/PUR-puhs/",
  impact: "/IM-pakt/",
  conviction: "/kun-VIK-shun/",
  composure: "/kum-POH-zher/",
  empathy: "/EM-puh-thee/",
  structure: "/STRUK-cher/",
  focus: "/FOH-kus/",
  energy: "/EN-er-jee/",
  credibility: "/kred-uh-BIL-uh-tee/",
  intro: "/IN-troh/",
  pacing: "/PAY-sing/",
  flow: "/floh/",
  finish: "/FIN-ish/",
  storytelling: "/STOR-ee-tel-ing/"
};

const STOPWORDS = new Set([
  "the", "and", "for", "that", "with", "this", "from", "have", "your", "you", "are", "was", "were", "into", "about", "their", "there", "they", "them", "our", "ours", "will", "would", "could", "should", "can", "been", "being", "what", "when", "where", "which", "while", "through", "before", "after", "onto", "also", "than", "then", "just", "some", "more", "most", "very", "much", "many", "such", "each", "both", "only", "because", "within", "without", "between", "under", "over", "across", "here", "these", "those", "past", "yourself"
]);

const ROLE_SEEDS = {
  Student: ["clarity", "confidence", "resonance", "narrative"],
  "Startup Founder": ["traction", "clarity", "confidence", "narrative"],
  Manager: ["clarity", "confidence", "resonance"],
  Executive: ["clarity", "confidence", "resonance", "traction"],
  Coach: ["clarity", "confidence", "resonance"]
};

const ENCOURAGING_TERMS = [
  "momentum", "presence", "clarity", "confidence", "connection", "purpose", "impact", "credibility",
  "conviction", "composure", "empathy", "structure", "focus", "energy", "resonance", "narrative"
];

const SOCIAL_SEED_PROFILES = [
  { id: "learner-ama", name: "Ama Owusu", handle: "@ama_speaks", bio: "Pitching fintech ideas with clarity.", focus: "Pitching", level: "Rising", online: true },
  { id: "learner-kojo", name: "Kojo Mensah", handle: "@kojo_present", bio: "Product demos and executive updates.", focus: "Executive Presence", level: "Advanced", online: true },
  { id: "learner-nana", name: "Nana Asare", handle: "@nana_story", bio: "Storytelling for nonprofit impact.", focus: "Storytelling", level: "Rising", online: false },
  { id: "learner-akosua", name: "Akosua Boateng", handle: "@akosua_voice", bio: "Interview and scholarship prep.", focus: "Interview Skills", level: "Starter", online: true }
];

const defaultState = {
  auth: { currentUser: null, users: [] },
  profile: {
    learnerName: "",
    learnerRole: "",
    aiPersona: "executive",
    customPersona: "",
    goalText: "",
    audienceText: "",
    focusAreas: [],
    sourceText: "",
    additionalNotes: "",
    uploadedFiles: []
  },
  strategicWords: [],
  wordCursor: 0,
  practice: { wordGatePassed: false, lastWordScore: 0 },
  game: { xp: 0, streakDays: 1, badges: [], sprintBest: 0, lastActiveDate: null },
  sessions: [],
  coachVault: [],
  forwardedReports: [],
  assignedTests: [],
  cohort: [
    { name: "Ama", xp: 220, points: 91 },
    { name: "Kojo", xp: 180, points: 84 },
    { name: "Nana", xp: 156, points: 79 },
    { name: "Akosua", xp: 140, points: 76 }
  ],
  social: {
    profiles: SOCIAL_SEED_PROFILES,
    invites: [],
    connections: [],
    journeys: [],
    chats: {}
  },
  ui: {
    glassFx: true,
    theme: "dark"
  },
  savedAt: null
};

let state = loadState();
let quoteIndex = 0;
let quoteTimer = null;
let recognition = null;
let liveTimer = null;
let liveSession = {
  active: false,
  remaining: 0,
  duration: 0,
  transcript: [],
  userTurns: [],
  turnTimes: [],
  startedAt: 0,
  targets: [],
  usedWords: [],
  roundXp: 0,
  wordStreak: 0
};
let mediaRecorder = null;
let mediaChunks = [];
let isRecording = false;
const VIEW_WHITELIST = new Set(["overview", "setup", "wordlab", "practiceground", "community", "report", "coachvault", "coach"]);

const dom = {
  appLoader: document.getElementById("appLoader"),
  authGate: document.getElementById("authGate"),
  authCard: document.querySelector(".auth-card"),
  authHeadline: document.getElementById("authHeadline"),
  authModeToggle: document.getElementById("authModeToggle"),
  authModeBtns: document.querySelectorAll(".auth-mode-btn"),
  signupNameWrap: document.getElementById("signupNameWrap"),
  signupName: document.getElementById("signupName"),
  appRoot: document.getElementById("appRoot"),
  quoteText: document.getElementById("quoteText"),
  quoteAuthor: document.getElementById("quoteAuthor"),
  loaderQuoteText: document.getElementById("loaderQuoteText"),
  loaderQuoteAuthor: document.getElementById("loaderQuoteAuthor"),
  appQuoteText: document.getElementById("appQuoteText"),
  appQuoteAuthor: document.getElementById("appQuoteAuthor"),
  loginForm: document.getElementById("loginForm"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  loginRole: document.getElementById("loginRole"),
  roleLabel: document.getElementById("roleLabel"),
  logoutBtn: document.getElementById("logoutBtn"),
  glassFxToggle: document.getElementById("glassFxToggle"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  quickMenuToggle: document.getElementById("quickMenuToggle"),
  quickMenu: document.getElementById("quickMenu"),

  navBtns: document.querySelectorAll(".nav-btn"),
  panels: document.querySelectorAll(".panel"),
  saveStateBtn: document.getElementById("saveStateBtn"),
  resetStateBtn: document.getElementById("resetStateBtn"),
  overviewTitle: document.getElementById("overviewTitle"),
  overviewLead: document.getElementById("overviewLead"),
  sideNote: document.querySelector(".side-note"),

  xpTotal: document.getElementById("xpTotal"),
  streakTotal: document.getElementById("streakTotal"),
  badgeTotal: document.getElementById("badgeTotal"),
  sprintBest: document.getElementById("sprintBest"),
  kpiSessions: document.getElementById("kpiSessions"),
  kpiMastery: document.getElementById("kpiMastery"),
  kpiOverall: document.getElementById("kpiOverall"),
  kpiLevel: document.getElementById("kpiLevel"),
  studentLeaderboard: document.getElementById("studentLeaderboard"),
  pairPracticeBtn: document.getElementById("pairPracticeBtn"),
  pairPracticeResult: document.getElementById("pairPracticeResult"),
  communityDirectory: document.getElementById("communityDirectory"),
  incomingInvites: document.getElementById("incomingInvites"),
  connectionsList: document.getElementById("connectionsList"),
  journeyForm: document.getElementById("journeyForm"),
  journeyName: document.getElementById("journeyName"),
  journeyGoal: document.getElementById("journeyGoal"),
  journeyMembers: document.getElementById("journeyMembers"),
  journeyList: document.getElementById("journeyList"),
  chatRoomSelect: document.getElementById("chatRoomSelect"),
  chatMessages: document.getElementById("chatMessages"),
  chatInput: document.getElementById("chatInput"),
  sendChatBtn: document.getElementById("sendChatBtn"),

  setupForm: document.getElementById("setupForm"),
  learnerName: document.getElementById("learnerName"),
  learnerRole: document.getElementById("learnerRole"),
  aiPersonaSelect: document.getElementById("aiPersonaSelect"),
  customPersonaInput: document.getElementById("customPersonaInput"),
  goalText: document.getElementById("goalText"),
  audienceText: document.getElementById("audienceText"),
  focusAreaChecks: document.querySelectorAll("input[name='focusAreas']"),
  sourceText: document.getElementById("sourceText"),
  sourceFile: document.getElementById("sourceFile"),
  fileList: document.getElementById("fileList"),
  additionalNotes: document.getElementById("additionalNotes"),
  dictateNotesBtn: document.getElementById("dictateNotesBtn"),
  recordNotesBtn: document.getElementById("recordNotesBtn"),
  recordStatus: document.getElementById("recordStatus"),
  notesPlayback: document.getElementById("notesPlayback"),
  generateWordsBtn: document.getElementById("generateWordsBtn"),

  wordCards: document.getElementById("wordCards"),
  wordLabSummary: document.getElementById("wordLabSummary"),
  focusWordCard: document.getElementById("focusWordCard"),
  wordQueue: document.getElementById("wordQueue"),
  prevWordBtn: document.getElementById("prevWordBtn"),
  nextWordBtn: document.getElementById("nextWordBtn"),
  startWordPracticeBtn: document.getElementById("startWordPracticeBtn"),
  ignitePracticeBtn: document.getElementById("ignitePracticeBtn"),
  durationCards: document.querySelectorAll(".duration-card"),

  difficultySelect: document.getElementById("difficultySelect"),
  simulationDuration: document.getElementById("simulationDuration"),
  startScenarioBtn: document.getElementById("startScenarioBtn"),
  scenarioPrompt: document.getElementById("scenarioPrompt"),
  personaCards: document.querySelectorAll(".persona-card"),
  startLiveBtn: document.getElementById("startLiveBtn"),
  stopLiveBtn: document.getElementById("stopLiveBtn"),
  liveDot: document.getElementById("liveDot"),
  liveStateText: document.getElementById("liveStateText"),
  timerBox: document.getElementById("timerBox"),
  timerFill: document.getElementById("timerFill"),
  wordBubbleWrap: document.getElementById("wordBubbleWrap"),
  practiceTargetCount: document.getElementById("practiceTargetCount"),
  practicePoppedCount: document.getElementById("practicePoppedCount"),
  practiceRoundXp: document.getElementById("practiceRoundXp"),
  practiceWordStreak: document.getElementById("practiceWordStreak"),
  liveTranscript: document.getElementById("liveTranscript"),
  feedbackBox: document.getElementById("feedbackBox"),

  metricBars: document.getElementById("metricBars"),
  historyTableWrap: document.getElementById("historyTableWrap"),
  reportMeta: document.getElementById("reportMeta"),
  exportReportBtn: document.getElementById("exportReportBtn"),

  frameworkForm: document.getElementById("frameworkForm"),
  frameworkName: document.getElementById("frameworkName"),
  frameworkType: document.getElementById("frameworkType"),
  frameworkSummary: document.getElementById("frameworkSummary"),
  frameworkFiles: document.getElementById("frameworkFiles"),
  frameworkList: document.getElementById("frameworkList"),

  coachLearner: document.getElementById("coachLearner"),
  coachFriction: document.getElementById("coachFriction"),
  coachDrill: document.getElementById("coachDrill"),
  interventionList: document.getElementById("interventionList"),
  forwardedReports: document.getElementById("forwardedReports"),
  assignStudent: document.getElementById("assignStudent"),
  assignDifficulty: document.getElementById("assignDifficulty"),
  assignBrief: document.getElementById("assignBrief"),
  assignTestBtn: document.getElementById("assignTestBtn"),
  cohortLeaderboard: document.getElementById("cohortLeaderboard"),
  year: document.getElementById("year"),
};

init();

function init() {
  runBootLoader();
  attachEvents();
  startQuoteRotation();
  setAuthMode("login");
  hydrateUI();
  applyGlassFx();
  applyTheme();
  activatePointerSlide();
  stageArenaSetupAnimation();
  revealAnimations();
  runTypewriter(dom.authHeadline, "Communication Without Drift.");
  initPracticeFold();
  dom.year.textContent = String(new Date().getFullYear());
}

function attachEvents() {
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.logoutBtn.addEventListener("click", handleLogout);
  dom.authModeBtns.forEach((btn) => btn.addEventListener("click", () => setAuthMode(btn.dataset.authMode)));
  dom.glassFxToggle.addEventListener("click", toggleGlassFx);
  dom.themeToggleBtn.addEventListener("click", toggleTheme);
  dom.quickMenuToggle.addEventListener("click", toggleQuickMenu);
  dom.quickMenu.addEventListener("click", handleQuickMenuNavigation);
  window.addEventListener("click", (event) => {
    if (dom.quickMenu.classList.contains("hidden")) return;
    if (event.target.closest(".quick-menu-wrap")) return;
    dom.quickMenu.classList.add("hidden");
    dom.quickMenuToggle.classList.remove("is-open");
    dom.quickMenuToggle.setAttribute("aria-expanded", "false");
  });

  dom.navBtns.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));
  dom.saveStateBtn.addEventListener("click", () => { saveProfileFromForm(); saveState(); });
  dom.resetStateBtn.addEventListener("click", onResetState);
  dom.pairPracticeBtn.addEventListener("click", () => setView("community"));

  dom.setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfileFromForm();
    addXp(10);
    saveState();
    renderAll();
  });
  dom.sourceFile.addEventListener("change", handleSourceUpload);
  dom.generateWordsBtn.addEventListener("click", onGenerateWords);
  dom.dictateNotesBtn.addEventListener("click", dictateNotes);
  dom.recordNotesBtn.addEventListener("click", toggleRecording);

  if (dom.startWordPracticeBtn) dom.startWordPracticeBtn.addEventListener("click", () => setView("practiceground"));
  if (dom.ignitePracticeBtn) dom.ignitePracticeBtn.addEventListener("click", startLiveAudioSession);
  dom.durationCards.forEach((card) => {
    card.addEventListener("click", () => {
      dom.durationCards.forEach((x) => x.classList.remove("is-active"));
      card.classList.add("is-active");
      const selected = Number(card.dataset.duration || 180);
      dom.simulationDuration.value = String(selected);
      liveSession.duration = selected;
      liveSession.remaining = selected;
      updateTimerDisplay();
    });
  });
  dom.prevWordBtn.addEventListener("click", () => moveWordCursor(-1));
  dom.nextWordBtn.addEventListener("click", () => moveWordCursor(1));

  dom.startScenarioBtn.addEventListener("click", async () => {
    await withButtonLoading(dom.startScenarioBtn, "Generating...");
    saveProfileFromForm();
    dom.scenarioPrompt.textContent = buildScenarioPrompt();
  });
  dom.startLiveBtn.addEventListener("click", startLiveAudioSession);
  dom.stopLiveBtn.addEventListener("click", stopLiveAudioSession);
  dom.personaCards.forEach((card) => {
    card.addEventListener("click", () => {
      dom.personaCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      state.profile.aiPersona = card.dataset.persona;
      saveState();
    });
  });

  dom.exportReportBtn.addEventListener("click", exportLatestReport);
  dom.frameworkForm.addEventListener("submit", saveFramework);
  dom.assignTestBtn.addEventListener("click", assignCoachTest);
  dom.feedbackBox.addEventListener("click", handlePracticeActions);
  dom.journeyForm.addEventListener("submit", createGroupJourney);
  dom.sendChatBtn.addEventListener("click", sendCommunityMessage);
  dom.chatRoomSelect.addEventListener("change", renderChatMessages);
  dom.communityDirectory.addEventListener("click", handleCommunityAction);
  dom.incomingInvites.addEventListener("click", handleCommunityAction);
  dom.connectionsList.addEventListener("click", handleCommunityAction);
  dom.journeyList.addEventListener("click", handleCommunityAction);
  window.addEventListener("hashchange", handleHashRoute);
  window.addEventListener("scroll", updatePracticeFold, { passive: true });
  window.addEventListener("resize", updatePracticeFold);
  document.addEventListener("click", (event) => {
    const insideWordCard = event.target.closest(".word-card-compact");
    if (insideWordCard) return;
    dom.wordCards?.querySelectorAll(".word-card-compact.is-open").forEach((node) => node.classList.remove("is-open"));
  });
}

function startQuoteRotation() {
  renderQuote(0);
  clearInterval(quoteTimer);
  quoteTimer = setInterval(() => {
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    renderQuote(quoteIndex);
  }, 15000);
}

function renderQuote(idx) {
  const q = QUOTES[idx];
  [dom.quoteText, dom.quoteAuthor, dom.loaderQuoteText, dom.loaderQuoteAuthor, dom.appQuoteText, dom.appQuoteAuthor]
    .filter(Boolean)
    .forEach((node) => { node.style.opacity = "0.15"; });
  setTimeout(() => {
    dom.quoteText.textContent = `"${q.text}"`;
    dom.quoteAuthor.textContent = q.author;
    if (dom.loaderQuoteText) dom.loaderQuoteText.textContent = `"${q.text}"`;
    if (dom.loaderQuoteAuthor) dom.loaderQuoteAuthor.textContent = q.author;
    if (dom.appQuoteText) dom.appQuoteText.textContent = `"${q.text}"`;
    if (dom.appQuoteAuthor) dom.appQuoteAuthor.textContent = q.author;
    [dom.quoteText, dom.quoteAuthor, dom.loaderQuoteText, dom.loaderQuoteAuthor, dom.appQuoteText, dom.appQuoteAuthor]
      .filter(Boolean)
      .forEach((node) => { node.style.opacity = "1"; });
  }, 180);
}

async function handleLogin(event) {
  event.preventDefault();
  const mode = dom.authModeToggle.dataset.mode || "login";
  const fullName = dom.signupName.value.trim();
  const email = dom.loginEmail.value.trim();
  const password = dom.loginPassword.value.trim();
  if (!email || !password) return;
  if (mode === "signup") {
    if (!fullName) {
      alert("Please enter your full name.");
      return;
    }
    const exists = (state.auth.users || []).find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      alert("This email is already registered. Switch to Log In.");
      return;
    }
    state.auth.users.push({ id: cryptoRandomId(), name: fullName, email, password, role: dom.loginRole.value });
  }
  const account = (state.auth.users || []).find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (account && account.password !== password) {
    alert("Incorrect password.");
    return;
  }
  state.auth.currentUser = {
    email,
    role: account?.role || dom.loginRole.value,
    name: account?.name || fullName || state.profile.learnerName || ""
  };
  if (state.auth.currentUser.name && !state.profile.learnerName) state.profile.learnerName = state.auth.currentUser.name;
  ensureSocialBootstrap();
  hydrateStreak();
  await withButtonLoading(dom.loginForm.querySelector("button[type='submit']"), mode === "signup" ? "Creating..." : "Entering...", 640);
  saveState();
  hydrateUI();
}

function handleLogout() {
  state.auth.currentUser = null;
  stopLiveAudioSession();
  saveState();
  setAuthMode("login");
  hydrateUI();
}

function hydrateUI() {
  const user = state.auth.currentUser;
  if (!user) {
    dom.authGate.classList.remove("hidden");
    dom.appRoot.classList.add("hidden");
    return;
  }
  dom.authGate.classList.add("hidden");
  dom.appRoot.classList.remove("hidden");
  dom.roleLabel.textContent = user.role === "coach" ? "Coach Console" : "Student Arena";
  applyRoleView(user.role);
  const routedView = getViewFromHash();
  if (routedView && isViewAllowedForRole(routedView, user.role)) setViewInternal(routedView, false);
  hydrateSetupForm();
  renderAll();
}

function applyRoleView(role) {
  dom.navBtns.forEach((btn) => {
    const allowed = btn.dataset.role;
    const show = allowed === "both" || allowed === role;
    btn.classList.toggle("hidden", !show);
  });
  if (role === "coach") {
    runTypewriter(dom.overviewTitle, "Coach Control Room.");
    dom.overviewLead.textContent = "Upload frameworks, track students, assign targeted simulations, and accelerate cohort outcomes.";
    dom.sideNote.textContent = "Communication training engine.";
    setView("coachvault");
  } else {
    runTypewriter(dom.overviewTitle, "Ready to grow?");
    dom.overviewLead.textContent = "Practice live with an AI persona, build confidence, and rise on your cohort leaderboard.";
    dom.sideNote.textContent = "Communication training engine.";
    setView("practiceground");
  }
}

function onResetState() {
  if (!confirm("Reset local progress?")) return;
  state = structuredClone(defaultState);
  stopLiveAudioSession();
  localStorage.removeItem(STORAGE_KEY);
  hydrateUI();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  state.savedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const last = state.game.lastActiveDate;
  if (!last) {
    state.game.lastActiveDate = today;
    state.game.streakDays = 1;
    return;
  }
  if (last === today) return;
  const delta = Math.round((new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24));
  state.game.streakDays = delta === 1 ? state.game.streakDays + 1 : 1;
  state.game.lastActiveDate = today;
}

function saveProfileFromForm() {
  state.profile.learnerName = dom.learnerName.value.trim();
  state.profile.learnerRole = dom.learnerRole.value;
  state.profile.aiPersona = dom.aiPersonaSelect.value;
  state.profile.customPersona = dom.customPersonaInput.value.trim();
  state.profile.goalText = dom.goalText.value.trim();
  state.profile.audienceText = dom.audienceText.value.trim();
  state.profile.focusAreas = Array.from(dom.focusAreaChecks).filter((item) => item.checked).map((item) => item.value);
  state.profile.sourceText = dom.sourceText.value.trim();
  state.profile.additionalNotes = dom.additionalNotes.value.trim();
}

function hydrateSetupForm() {
  dom.learnerName.value = state.profile.learnerName || "";
  dom.learnerRole.value = state.profile.learnerRole || "";
  dom.aiPersonaSelect.value = state.profile.aiPersona || "executive";
  dom.customPersonaInput.value = state.profile.customPersona || "";
  dom.goalText.value = state.profile.goalText || "";
  dom.audienceText.value = state.profile.audienceText || "";
  dom.sourceText.value = state.profile.sourceText || "";
  dom.additionalNotes.value = state.profile.additionalNotes || "";
  dom.focusAreaChecks.forEach((check) => { check.checked = (state.profile.focusAreas || []).includes(check.value); });
  dom.personaCards.forEach((card) => card.classList.toggle("active", card.dataset.persona === (state.profile.aiPersona || "executive")));
  renderFileList();
}

function handleSourceUpload(event) {
  const files = Array.from(event.target.files || []).slice(0, 10);
  if (!files.length) return;
  state.profile.uploadedFiles = files.map((file) => ({
    name: file.name,
    type: file.type || "unknown",
    sizeKb: Math.max(1, Math.round(file.size / 1024)),
    textExtracted: false
  }));

  const textFiles = files.filter((file) => file.type.includes("text") || /\.(txt|md|csv|json)$/i.test(file.name));
  Promise.all(textFiles.map((file) => readFileAsText(file).catch(() => ""))).then((chunks) => {
    const merged = chunks.filter(Boolean).join("\n\n").slice(0, 10000);
    if (merged) {
      state.profile.sourceText = `${state.profile.sourceText}\n\n${merged}`.trim();
      dom.sourceText.value = state.profile.sourceText;
      state.profile.uploadedFiles = state.profile.uploadedFiles.map((item) => ({ ...item, textExtracted: true }));
    }
    saveState();
    renderFileList();
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function renderFileList() {
  dom.fileList.innerHTML = "";
  const files = state.profile.uploadedFiles || [];
  if (!files.length) {
    dom.fileList.innerHTML = "<li>No files selected yet.</li>";
    return;
  }
  files.forEach((file) => {
    const li = document.createElement("li");
    li.textContent = `${file.name} (${file.sizeKb}KB, ${file.type})${file.textExtracted ? " | text extracted" : " | extraction pending"}`;
    dom.fileList.appendChild(li);
  });
}

function dictateNotes() {
  const SpeechApi = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechApi) {
    alert("Speech dictation is not supported in this browser.");
    return;
  }
  const recog = new SpeechApi();
  recog.lang = "en-US";
  recog.onresult = (event) => {
    const transcript = event.results[0][0].transcript || "";
    dom.additionalNotes.value = `${dom.additionalNotes.value}\n${transcript}`.trim();
    dom.recordStatus.textContent = "Dictation captured.";
    saveProfileFromForm();
    saveState();
  };
  recog.onerror = () => { dom.recordStatus.textContent = "Dictation failed."; };
  dom.recordStatus.textContent = "Listening...";
  recog.start();
}

async function toggleRecording() {
  if (isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    dom.recordNotesBtn.textContent = "Record Instructions";
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    alert("Recording is not supported in this browser.");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) mediaChunks.push(event.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(mediaChunks, { type: "audio/webm" });
      dom.notesPlayback.src = URL.createObjectURL(blob);
      dom.notesPlayback.classList.remove("hidden");
      dom.recordStatus.textContent = "Voice instructions saved.";
      stream.getTracks().forEach((track) => track.stop());
      addXp(10);
      saveState();
      renderAll();
    };
    mediaRecorder.start();
    isRecording = true;
    dom.recordNotesBtn.textContent = "Stop Recording";
    dom.recordStatus.textContent = "Recording...";
  } catch {
    dom.recordStatus.textContent = "Microphone access denied.";
  }
}

async function onGenerateWords() {
  await withButtonLoading(dom.generateWordsBtn, "Building...", 600);
  saveProfileFromForm();
  state.strategicWords = generateStrategicWords(state.profile);
  state.wordCursor = 0;
  addXp(15);
  saveState();
  renderAll();
  setView("wordlab");
}

function generateStrategicWords(profile) {
  const blob = [profile.goalText, profile.audienceText, profile.sourceText, profile.additionalNotes, ...(profile.focusAreas || [])].join(" ").toLowerCase();
  const tokens = blob.match(/[a-z][a-z'-]{2,}/g) || [];
  const freq = new Map();
  tokens.forEach((token) => { if (!STOPWORDS.has(token)) freq.set(token, (freq.get(token) || 0) + 1); });
  const ranked = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => word.length >= 4 && word.length <= 16)
    .filter((word) => /^[a-z'-]+$/.test(word))
    .filter((word) => !["thing", "stuff", "really", "very", "good", "bad", "just"].includes(word));
  const seed = ROLE_SEEDS[profile.learnerRole] || ["clarity", "confidence", "resonance"];
  const focusTerms = (profile.focusAreas || []).flatMap((item) => tokenize(item));
  const merged = unique([...ranked, ...focusTerms, ...seed, ...ENCOURAGING_TERMS]).slice(0, 18);
  return merged.map((word) => {
    const entry = GLOSSARY[word];
    if (entry) {
      return {
        word,
        pronunciation: buildPronunciation(word),
        definition: entry.definition,
        synonyms: ensureThreeSynonyms(entry.synonyms, word),
        example: buildJourneyExample(word, profile, entry.example),
        mastered: false
      };
    }
    return {
      word,
      pronunciation: buildPronunciation(word),
      definition: "A high-impact communication word that helps you sound clear, credible, and audience-aware.",
      synonyms: ensureThreeSynonyms(fallbackSynonyms(word), word),
      example: buildJourneyExample(word, profile),
      mastered: false
    };
  });
}

function ensureThreeSynonyms(list, word) {
  const base = unique([...(list || []), ...fallbackSynonyms(word)]).filter((item) => item && item !== word);
  const filler = ["clarity", "focus", "impact", "intent", "outcome"];
  while (base.length < 3) {
    const next = filler[base.length % filler.length];
    if (!base.includes(next) && next !== word) base.push(next);
  }
  return base.slice(0, 3);
}

function buildPronunciation(word) {
  const key = String(word || "").toLowerCase().trim();
  if (IPA_MAP[key]) return IPA_MAP[key];
  return heuristicIpa(key);
}

function heuristicIpa(word) {
  if (!word) return "/-/";
  let ipa = word
    .replace(/tion/g, "shun")
    .replace(/sion/g, "zhun")
    .replace(/ch/g, "ch")
    .replace(/sh/g, "sh")
    .replace(/th/g, "th")
    .replace(/ph/g, "f")
    .replace(/qu/g, "kw")
    .replace(/oo/g, "oo")
    .replace(/ee/g, "ee")
    .replace(/ea/g, "ee")
    .replace(/ai|ay/g, "ay")
    .replace(/ou/g, "ow")
    .replace(/ow/g, "oh")
    .replace(/igh/g, "eye");
  return `/${ipa}/`;
}

function buildJourneyExample(word, profile, fallback = "") {
  const goal = profile.goalText || "my objective";
  const audience = profile.audienceText || "my audience";
  if (fallback) return `${fallback} (for ${audience}, in this journey: ${goal})`;
  return `In this journey, I use "${word}" to make my message clear for ${audience} while delivering: ${goal}.`;
}

function fallbackSynonyms(word) {
  if (word.endsWith("ion")) return [word.replace(/ion$/, "ive"), "approach", "impact"];
  if (word.endsWith("ing")) return [word.replace(/ing$/, "ed"), "momentum", "method"];
  return ["focus", "purpose", "outcome"];
}

function moveWordCursor(step) {
  if (!state.strategicWords.length) return;
  state.wordCursor = (state.wordCursor + step + state.strategicWords.length) % state.strategicWords.length;
  renderWordLab();
}

function renderWordLab() {
  const words = state.strategicWords;
  words.forEach((item) => { item.pronunciation = buildPronunciation(item.word); });
  dom.wordCards.innerHTML = "";
  dom.wordQueue.innerHTML = "";
  if (!words.length) {
    dom.wordLabSummary.textContent = "No vocabulary generated yet.";
    dom.focusWordCard.innerHTML = "<p class='hint'>Generate strategic words in Arena Setup.</p>";
    return;
  }
  state.wordCursor = clamp(state.wordCursor, 0, words.length - 1);
  const current = words[state.wordCursor];
  const mastered = words.filter((item) => item.mastered).length;
  dom.wordLabSummary.textContent = `${mastered}/${words.length} words mastered.`;
  dom.focusWordCard.innerHTML = `
    <div class="word-title"><h3>${escapeHtml(current.word)}</h3><span class="chip">${current.mastered ? "Mastered" : "Training"}</span></div>
    <button class="btn btn-ghost speak-btn" type="button" data-speak-word="${escapeHtml(current.word)}">Speak Out</button>
    <p class="phonetic">${escapeHtml(current.pronunciation || buildPronunciation(current.word))}</p>
    <p><strong>Meaning:</strong> ${escapeHtml(current.definition)}</p>
    <p><strong>Example Statement:</strong> ${escapeHtml(current.example)}</p>
    <p><strong>3 Synonyms:</strong> ${escapeHtml((current.synonyms || []).slice(0, 3).join(", "))}</p>
  `;
  words.forEach((item, idx) => {
    const q = document.createElement("button");
    q.type = "button";
    q.className = `word-queue-item${idx === state.wordCursor ? " active" : ""}`;
    q.textContent = `${idx + 1}. ${item.word}`;
    q.addEventListener("click", () => { state.wordCursor = idx; renderWordLab(); });
    dom.wordQueue.appendChild(q);
  });
  words.forEach((item, idx) => {
    const card = document.createElement("article");
    card.className = "glass word-card word-card-compact";
    card.tabIndex = 0;
    card.dataset.wordIndex = String(idx);
    card.innerHTML = `
      <div class="word-title"><h3>${escapeHtml(item.word)}</h3><span class="chip">${item.mastered ? "Mastered" : "Training"}</span></div>
      <p class="phonetic">${escapeHtml(item.pronunciation || buildPronunciation(item.word))}</p>
      <p class="hint">Hover or click to view details</p>
      <div class="word-popover">
        <p><strong>Meaning:</strong> ${escapeHtml(item.definition)}</p>
        <p><strong>Example:</strong> ${escapeHtml(item.example)}</p>
        <p><strong>3 Synonyms:</strong> ${escapeHtml((item.synonyms || []).slice(0, 3).join(", "))}</p>
        <div class="actions-row">
          <button class="btn btn-ghost" type="button" data-speak-word="${escapeHtml(item.word)}">Speak Out</button>
          <button class="btn btn-ghost" type="button" data-word-index="${idx}">${item.mastered ? "Mark Unmastered" : "Mark Mastered"}</button>
        </div>
      </div>
    `;
    dom.wordCards.appendChild(card);
  });
  dom.wordCards.querySelectorAll(".word-card-compact").forEach((card) => {
    card.addEventListener("click", () => {
      const open = card.classList.contains("is-open");
      dom.wordCards.querySelectorAll(".word-card-compact").forEach((x) => x.classList.remove("is-open"));
      if (!open) card.classList.add("is-open");
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      card.click();
    });
  });
  dom.wordCards.querySelectorAll("button[data-word-index]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const idx = Number(btn.dataset.wordIndex);
      state.strategicWords[idx].mastered = !state.strategicWords[idx].mastered;
      if (state.strategicWords[idx].mastered) addXp(5);
      saveState();
      renderAll();
    });
  });
  dom.wordCards.querySelectorAll("button[data-speak-word]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      speakWord(btn.dataset.speakWord || "");
    });
  });
  dom.focusWordCard.querySelectorAll("button[data-speak-word]").forEach((btn) => {
    btn.addEventListener("click", () => speakWord(btn.dataset.speakWord || ""));
  });
}

function buildScenarioPrompt() {
  const persona = state.profile.customPersona || PERSONA_PRESETS[state.profile.aiPersona] || PERSONA_PRESETS.executive;
  const focus = state.profile.focusAreas.length ? state.profile.focusAreas.join(", ") : "clarity and confidence";
  const phase = state.practice?.wordGatePassed ? "FULL SIMULATION" : "WORD PRACTICE GATE";
  return `Mode: ${phase}\nMission: ${state.profile.goalText || "Present clearly and confidently"}.\nAudience: ${state.profile.audienceText || "mixed stakeholders"}.\nFocus: ${focus}.\nAI Persona: ${persona}`;
}

function startLiveAudioSession() {
  if (liveSession.active) return;
  const SpeechApi = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechApi) {
    alert("Live audio conversation requires Speech Recognition support in your browser.");
    return;
  }
  saveProfileFromForm();
  const selectedDuration = Number(dom.simulationDuration.value || 180);
  const targets = state.strategicWords.slice(0, 8).map((item) => item.word.toLowerCase());
  if (!targets.length) {
    alert("Generate strategic words first in Word Lab before starting audio practice.");
    return;
  }
  liveSession.active = true;
  liveSession.transcript = [];
  liveSession.userTurns = [];
  liveSession.turnTimes = [];
  liveSession.remaining = selectedDuration;
  liveSession.duration = selectedDuration;
  liveSession.startedAt = Date.now();
  liveSession.targets = targets;
  liveSession.usedWords = [];
  liveSession.roundXp = 0;
  liveSession.wordStreak = 0;
  dom.liveTranscript.textContent = "";
  dom.liveDot.classList.add("live");
  dom.liveStateText.textContent = state.practice?.wordGatePassed ? "Live full simulation active" : "Live word-practice active";
  dom.timerBox.classList.remove("warning");
  dom.feedbackBox.classList.add("hidden");
  renderWordBubbles();
  updatePracticeHud();
  updateTimerDisplay();

  recognition = new SpeechApi();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (event) => {
    let partial = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0].transcript;
      partial += text;
      if (event.results[i].isFinal) {
        const cleaned = text.trim();
        liveSession.transcript.push(cleaned);
        liveSession.userTurns.push(cleaned);
        liveSession.turnTimes.push(Date.now());
        appendTranscript("You", cleaned);
        trackWordUsage(cleaned);
      }
    }
    if (partial) dom.liveStateText.textContent = "Listening...";
  };
  recognition.onerror = () => { dom.liveStateText.textContent = "Audio recognition issue. Keep speaking."; };
  recognition.onend = () => {
    if (liveSession.active) {
      try { recognition.start(); } catch {}
    }
  };
  recognition.start();

  liveTimer = setInterval(() => {
    liveSession.remaining -= 1;
    updateTimerDisplay();
    if (liveSession.remaining <= 0) stopLiveAudioSession(true);
  }, 1000);

  addXp(12);
  saveState();
}

function stopLiveAudioSession(autoEnded = false) {
  if (!liveSession.active && !autoEnded) return;
  liveSession.active = false;
  clearInterval(liveTimer);
  liveTimer = null;
  if (recognition) {
    try { recognition.onend = null; recognition.stop(); } catch {}
  }
  dom.liveDot.classList.remove("live");
  dom.timerBox.classList.remove("warning");
  dom.liveStateText.textContent = autoEnded ? "Session complete" : "Session stopped";

  const transcript = liveSession.userTurns.join(" ").trim();
  const result = runEvaluation({
    transcript: transcript || "I am practicing my speech with focused clarity and confidence for this audience.",
    turns: liveSession.userTurns,
    turnTimes: liveSession.turnTimes,
    startedAt: liveSession.startedAt,
    endedAt: Date.now(),
    configuredDuration: liveSession.duration
  }, dom.difficultySelect.value);
  const wordScore = buildWordPracticeScore();
  state.practice.lastWordScore = wordScore.score;
  state.game.sprintBest = Math.max(state.game.sprintBest || 0, wordScore.score || 0);
  if (wordScore.score >= 70) state.practice.wordGatePassed = true;
  if (liveSession.userTurns.length) {
    state.sessions.push(result);
    state.forwardedReports.push({
      learner: state.profile.learnerName || state.auth.currentUser?.email || "Unknown learner",
      overall: result.metrics.overall,
      strengths: result.breakdown.filter((line) => line.includes("strong") || line.includes("steady")),
      weaknesses: result.breakdown.filter((line) => line.includes("tighten") || line.includes("remove") || line.includes("address")),
      date: result.createdAt
    });
    updateCohortRank(result.metrics.overall);
    addXp(24 + liveSession.roundXp);
  }
  saveState();
  renderFeedback(result, wordScore);
  renderAll();
  setView("practiceground");
}

function appendTranscript(speaker, text) {
  if (!text) return;
  const line = document.createElement("p");
  line.className = "transcript-line";
  line.innerHTML = `<strong>${escapeHtml(speaker)}:</strong> ${escapeHtml(text)}`;
  dom.liveTranscript.appendChild(line);
  dom.liveTranscript.scrollTop = dom.liveTranscript.scrollHeight;
  simulateAiReply(text);
}

function simulateAiReply(userText) {
  const persona = state.profile.customPersona || PERSONA_PRESETS[state.profile.aiPersona] || PERSONA_PRESETS.executive;
  const response = buildPersonaResponse(userText, persona);
  setTimeout(() => {
    liveSession.transcript.push(response);
    const line = document.createElement("p");
    line.className = "transcript-line";
    line.innerHTML = `<strong>AI:</strong> ${escapeHtml(response)}`;
    dom.liveTranscript.appendChild(line);
    dom.liveTranscript.scrollTop = dom.liveTranscript.scrollHeight;
  }, 900);
}

function buildPersonaResponse(input, persona) {
  const trimmed = input.split(".")[0] || input;
  if ((state.profile.aiPersona || "").includes("ghanaian")) {
    return `Nice one. Keep it simple and direct: "${trimmed}". Now add one clear reason this matters today.`;
  }
  if ((state.profile.aiPersona || "").includes("friendly")) {
    return `You are doing great. Let us sharpen this: "${trimmed}". Give me one stronger closing line.`;
  }
  if ((state.profile.aiPersona || "").includes("direct")) {
    return `Cut the fluff. Say this in one sentence: "${trimmed}". Then end with a firm ask.`;
  }
  return `Good direction. Tighten this phrase: "${trimmed}". Now lead with your outcome in the first line.`;
}

function updateTimerDisplay() {
  const minutes = Math.floor(Math.max(0, liveSession.remaining) / 60);
  const seconds = Math.max(0, liveSession.remaining) % 60;
  dom.timerBox.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (liveSession.remaining <= 15) dom.timerBox.classList.add("warning");
  const pct = liveSession.duration ? Math.max(0, (liveSession.remaining / liveSession.duration) * 100) : 0;
  dom.timerFill.style.width = `${pct}%`;
  dom.timerFill.classList.toggle("warning", liveSession.remaining <= 15);
}

function runEvaluation(payload, difficultyKey) {
  const transcript = typeof payload === "string" ? payload : (payload?.transcript || "");
  const turns = Array.isArray(payload?.turns) && payload.turns.length
    ? payload.turns
    : transcript.split(/[.!?]/).map((x) => x.trim()).filter(Boolean);
  const turnTimes = Array.isArray(payload?.turnTimes) ? payload.turnTimes : [];
  const startedAt = Number(payload?.startedAt || Date.now());
  const endedAt = Number(payload?.endedAt || Date.now());

  const difficultyPenalty = { easy: 0, standard: -3, hard: -7, expert: -10 }[difficultyKey] || 0;
  const words = tokenize(transcript);
  const wordsPerTurn = turns.map((t) => tokenize(t).length);
  const isolatedTurns = wordsPerTurn.filter((c) => c <= 2).length;
  const isolatedRatio = turns.length ? isolatedTurns / turns.length : 0;
  const sentenceVerbPattern = /\b(is|are|am|was|were|be|have|has|had|do|does|did|can|will|should|must|need|want|make|made|go|goes|went|build|solve|create|improve|help|drive|deliver|support|reduce|increase)\b/i;
  const completeTurns = turns.filter((t) => tokenize(t).length >= 5 && sentenceVerbPattern.test(t)).length;
  const completeRatio = turns.length ? completeTurns / turns.length : 0;

  const fillerPatterns = ["um", "uh", "erm", "ah", "like", "you know", "i mean", "basically", "actually", "ok", "okay"];
  const fillerCount = fillerPatterns.reduce((acc, pattern) => acc + ((transcript.toLowerCase().match(new RegExp(`\\b${escapeRegExp(pattern)}\\b`, "g")) || []).length), 0);
  const hedgeCount = ["maybe", "sort of", "kind of", "i think", "perhaps"].reduce((acc, pattern) => acc + ((transcript.toLowerCase().match(new RegExp(`\\b${escapeRegExp(pattern)}\\b`, "g")) || []).length), 0);

  const pauseGaps = [];
  for (let i = 1; i < turnTimes.length; i += 1) pauseGaps.push((turnTimes[i] - turnTimes[i - 1]) / 1000);
  const longPauses = pauseGaps.filter((sec) => sec >= 2.5).length;
  const veryLongPauses = pauseGaps.filter((sec) => sec >= 4).length;

  const durationMin = Math.max(0.5, (endedAt - startedAt) / 60000);
  const wpm = Math.round(words.length / durationMin);
  const lexicalDiversity = words.length ? unique(words).length / words.length : 0;
  const questionCount = (transcript.match(/\?/g) || []).length;
  const emphasisCount = (transcript.match(/!/g) || []).length;
  const avgWordsPerTurn = turns.length ? avg(wordsPerTurn) : 0;

  const pacingBase = 80 - Math.abs(145 - wpm) * 0.35 - longPauses * 2 - veryLongPauses * 3 + difficultyPenalty;
  const clarityBase = 82 - isolatedRatio * 34 - (1 - completeRatio) * 18 - Math.max(0, 8 - avgWordsPerTurn) * 2 - fillerCount * 2.5 + difficultyPenalty;
  const confidenceBase = 80 - fillerCount * 3.5 - hedgeCount * 4 - veryLongPauses * 2 + (questionCount > 0 ? 1 : 0) + difficultyPenalty;
  const connectionBase = 72 + countMatches(transcript.toLowerCase(), ["you", "your", "we", "our", "together", "because this matters"]) * 2 - isolatedRatio * 16 + difficultyPenalty;
  const dictionBase = 70 + lexicalDiversity * 38 - fillerCount * 2 - isolatedRatio * 12 + difficultyPenalty;

  const clarity = clamp(Math.round(clarityBase), 20, 98);
  const confidence = clamp(Math.round(confidenceBase), 20, 98);
  const connection = clamp(Math.round(connectionBase), 20, 98);
  const pacing = clamp(Math.round(pacingBase), 20, 98);
  const diction = clamp(Math.round(dictionBase), 20, 98);
  const overall = Math.round(clarity * 0.28 + confidence * 0.24 + connection * 0.2 + pacing * 0.15 + diction * 0.13);

  const isolatedSpeechFlag = isolatedRatio >= 0.45 || avgWordsPerTurn < 3 || completeRatio < 0.35;
  const pulse = isolatedSpeechFlag
    ? "Low message integrity: you mostly named words instead of building complete audience-ready sentences."
    : (overall >= 82
      ? "Strong impact: your message is structured, clear, and persuasive under pressure."
      : "Solid base: your communication is improving, but sentence-level precision still needs tightening.");

  const breakdown = [
    isolatedSpeechFlag
      ? "Critical friction: you delivered isolated words/short fragments; convert each idea into a full sentence with subject, action, and audience impact."
      : "Clarity strength: you are moving ideas in complete sentences with stronger structure.",
    fillerCount > 3
      ? `Confidence friction: filler load is high (${fillerCount}); remove fillers and land statements with conviction.`
      : `Confidence strength: filler control is stable (${fillerCount} detected).`,
    longPauses > 2
      ? `Pacing friction: ${longPauses} long pauses were detected; reduce dead air and keep rhythmic flow.`
      : "Pacing strength: tempo and pause control are mostly balanced.",
    connection < 72
      ? "Connection friction: name the audience stake earlier and tie your message to their immediate concern."
      : "Connection strength: audience relevance is visible in your phrasing."
  ];

  const challenge = isolatedSpeechFlag
    ? "Challenge: deliver 5 full sentences in your next round. Each sentence must include one idea + one reason it matters."
    : (fillerCount > 3
      ? "Challenge: run a 90-second round with fewer than 3 filler words."
      : "Challenge: open your next round with one audience concern and one clear promise in 20 seconds.");

  return {
    createdAt: new Date().toISOString(),
    difficulty: difficultyKey,
    metrics: { clarity, confidence, connection, pacing, diction, overall },
    pulse,
    breakdown,
    challenge,
    diagnostics: {
      turnCount: turns.length,
      isolatedTurns,
      isolatedRatio: Math.round(isolatedRatio * 100),
      completeRatio: Math.round(completeRatio * 100),
      fillerCount,
      hedgeCount,
      longPauses,
      wpm,
      lexicalDiversity: Math.round(lexicalDiversity * 100),
      vocalCues: { questions: questionCount, emphasis: emphasisCount }
    },
    refinement: {
      before: (turns[0] || transcript.split(/[.!?]/)[0] || transcript).trim(),
      after: `For ${state.profile.audienceText || "this audience"}, the key message is: ${state.profile.goalText || "we can solve this now with clear next steps"}, and this matters because the cost of delay is immediate.`
    }
  };
}

function renderFeedback(result, wordPractice = null) {
  dom.feedbackBox.classList.remove("hidden");
  dom.feedbackBox.innerHTML = `
    <h3>Pulse Check</h3>
    <p>${escapeHtml(result.pulse)}</p>
    <h3>The Breakdown</h3>
    <ul>${result.breakdown.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
    <h3>Speech Diagnostics</h3>
    <ul>
      <li>Turns: ${result.diagnostics?.turnCount ?? 0}</li>
      <li>Isolated Turns: ${result.diagnostics?.isolatedTurns ?? 0} (${result.diagnostics?.isolatedRatio ?? 0}%)</li>
      <li>Complete Sentences: ${result.diagnostics?.completeRatio ?? 0}%</li>
      <li>Filler Words: ${result.diagnostics?.fillerCount ?? 0}</li>
      <li>Long Pauses: ${result.diagnostics?.longPauses ?? 0}</li>
      <li>Pace: ${result.diagnostics?.wpm ?? 0} WPM</li>
      <li>Vocal Cues: ${result.diagnostics?.vocalCues?.questions ?? 0} questions, ${result.diagnostics?.vocalCues?.emphasis ?? 0} emphasis cues</li>
    </ul>
    <h3>The Refinement</h3>
    <p><strong>Before:</strong> ${escapeHtml(result.refinement.before)}</p>
    <p><strong>After:</strong> ${escapeHtml(result.refinement.after)}</p>
    <h3>The Challenge</h3>
    <p>${escapeHtml(result.challenge)}</p>
    ${wordPractice ? `<h3>Word Practice Score</h3><p>${wordPractice.summary}</p><div class="actions-row"><button class="btn btn-primary" data-action="proceed-real-sim" type="button">Progress to Real Simulation</button><button class="btn btn-ghost" data-action="retake-word-practice" type="button">Retake Word Practice</button></div>` : ""}
  `;
}

function renderWordBubbles() {
  const targets = liveSession.targets || [];
  dom.wordBubbleWrap.innerHTML = "";
  if (!targets.length) {
    dom.wordBubbleWrap.innerHTML = "<span class='hint'>Generate strategic words to see live practice bubbles.</span>";
    return;
  }
  targets.forEach((word) => {
    const bubble = document.createElement("span");
    bubble.className = "word-bubble";
    bubble.dataset.word = word;
    bubble.textContent = word;
    dom.wordBubbleWrap.appendChild(bubble);
  });
}

function updatePracticeHud() {
  if (!dom.practiceTargetCount) return;
  dom.practiceTargetCount.textContent = String(liveSession.targets.length || 0);
  dom.practicePoppedCount.textContent = String(liveSession.usedWords.length || 0);
  dom.practiceRoundXp.textContent = String(liveSession.roundXp || 0);
  dom.practiceWordStreak.textContent = String(liveSession.wordStreak || 0);
}

function trackWordUsage(text) {
  if (!text) return;
  const lower = ` ${text.toLowerCase()} `;
  const hits = [];
  state.strategicWords.forEach((item) => {
    const key = item.word.toLowerCase();
    const matched = new RegExp(`\\b${escapeRegExp(key)}\\b`, "i").test(lower)
      || (item.synonyms || []).some((syn) => new RegExp(`\\b${escapeRegExp(String(syn).toLowerCase())}\\b`, "i").test(lower));
    if (matched) hits.push(key);
  });
  const freshHits = unique(hits).filter((word) => !liveSession.usedWords.includes(word) && liveSession.targets.includes(word));
  if (!freshHits.length) {
    liveSession.wordStreak = 0;
    updatePracticeHud();
  }
  freshHits.forEach((word) => {
    liveSession.usedWords.push(word);
    liveSession.wordStreak += 1;
    liveSession.roundXp += 10;
    popWordBubble(word);
    updatePracticeHud();
  });
}

function popWordBubble(word) {
  const node = Array.from(dom.wordBubbleWrap.querySelectorAll(".word-bubble")).find((item) => item.dataset.word === word);
  if (!node) return;
  node.classList.add("popped");
  launchConfetti(node);
  setTimeout(() => node.remove(), 350);
}

function launchConfetti(anchor) {
  const rect = anchor.getBoundingClientRect();
  const colors = ["#8dd7ff", "#8bf0d3", "#ffd27a", "#ff95b0", "#b4a8ff"];
  for (let i = 0; i < 14; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${rect.left + rect.width / 2 + (Math.random() * 40 - 20)}px`;
    piece.style.top = `${rect.top + 6}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 800);
  }
}

function buildWordPracticeScore() {
  const target = liveSession.targets.length;
  const used = liveSession.usedWords.length;
  const score = target ? Math.round((used / target) * 100) : 0;
  return {
    score,
    summary: `${used}/${target} target words used correctly (${score}%). ${score >= 70 ? "PASS: full simulation unlocked." : "NOT YET: retake word practice to lock in stronger diction."}`
  };
}

function handlePracticeActions(event) {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "proceed-real-sim") {
    state.practice.wordGatePassed = true;
    saveState();
    setView("practiceground");
    dom.feedbackBox.classList.add("hidden");
    dom.scenarioPrompt.textContent = "Full simulation unlocked. Start a fresh live session and deliver your complete conversation.";
    return;
  }
  if (action === "retake-word-practice") {
    state.practice.wordGatePassed = false;
    saveState();
    setView("practiceground");
    dom.scenarioPrompt.textContent = "Word practice reset. Start a new audio round and pop all target bubbles.";
  }
}

function speakWord(word) {
  if (!word) return;
  if (!("speechSynthesis" in window)) {
    alert("Speech output is not supported in this browser.");
    return;
  }
  const utter = new SpeechSynthesisUtterance(word);
  utter.rate = 0.9;
  utter.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function escapeRegExp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderReport() {
  const latest = state.sessions[state.sessions.length - 1];
  if (!latest) {
    dom.metricBars.innerHTML = "<p>No metrics yet.</p>";
    dom.historyTableWrap.innerHTML = "<p>No session history yet.</p>";
    dom.reportMeta.textContent = "No session evaluated yet.";
    return;
  }
  dom.metricBars.innerHTML = [
    metricRow("Clarity", latest.metrics.clarity),
    metricRow("Confidence", latest.metrics.confidence),
    metricRow("Connection", latest.metrics.connection),
    metricRow("Pacing", latest.metrics.pacing || 0),
    metricRow("Diction", latest.metrics.diction || 0),
    metricRow("Overall", latest.metrics.overall)
  ].join("");
  dom.reportMeta.textContent = `Latest: ${formatDate(latest.createdAt)} | Difficulty: ${latest.difficulty} | Overall: ${latest.metrics.overall} | Fillers: ${latest.diagnostics?.fillerCount ?? 0} | Long pauses: ${latest.diagnostics?.longPauses ?? 0}`;
  const rows = state.sessions.slice().reverse().map((session, idx) => `
    <tr><td>${idx + 1}</td><td>${escapeHtml(formatDate(session.createdAt))}</td><td>${escapeHtml(session.difficulty)}</td><td>${session.metrics.overall}</td><td>${session.metrics.clarity}</td><td>${session.metrics.confidence}</td><td>${session.metrics.connection}</td><td>${session.metrics.pacing || 0}</td><td>${session.metrics.diction || 0}</td><td>${session.diagnostics?.fillerCount ?? 0}</td><td>${session.diagnostics?.longPauses ?? 0}</td></tr>
  `).join("");
  dom.historyTableWrap.innerHTML = `<table><thead><tr><th>#</th><th>Date</th><th>Difficulty</th><th>Overall</th><th>Clarity</th><th>Confidence</th><th>Connection</th><th>Pacing</th><th>Diction</th><th>Fillers</th><th>Long Pauses</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function metricRow(name, value) {
  return `<div class="metric-row"><div class="metric-head"><span>${name}</span><span>${value}</span></div><div class="track"><div class="fill" style="width:${value}%"></div></div></div>`;
}

function saveFramework(event) {
  event.preventDefault();
  const name = dom.frameworkName.value.trim();
  const summary = dom.frameworkSummary.value.trim();
  if (!name || !summary) return;
  const files = Array.from(dom.frameworkFiles.files || []).slice(0, 10).map((file) => `${file.name} (${Math.max(1, Math.round(file.size / 1024))}KB)`);
  state.coachVault.push({
    id: cryptoRandomId(),
    name,
    type: dom.frameworkType.value,
    summary,
    files,
    createdAt: new Date().toISOString()
  });
  addXp(20);
  dom.frameworkForm.reset();
  saveState();
  renderCoachVault();
}

function renderCoachVault() {
  dom.frameworkList.innerHTML = "";
  if (!state.coachVault.length) {
    dom.frameworkList.innerHTML = "<p>No frameworks saved yet. Upload your methods to build the private RAG vault for your students.</p>";
    return;
  }
  state.coachVault.slice().reverse().forEach((item) => {
    const block = document.createElement("article");
    block.className = "glass word-card";
    block.innerHTML = `
      <div class="word-title"><h3>${escapeHtml(item.name)}</h3><span class="chip">${escapeHtml(item.type)}</span></div>
      <p>${escapeHtml(item.summary)}</p>
      <p><strong>Files:</strong> ${escapeHtml(item.files.length ? item.files.join(", ") : "None uploaded")}</p>
      <p><strong>Saved:</strong> ${escapeHtml(formatDate(item.createdAt))}</p>
    `;
    dom.frameworkList.appendChild(block);
  });
}

function renderCoachInsights() {
  const latest = state.sessions[state.sessions.length - 1];
  const focus = state.profile.focusAreas.length ? state.profile.focusAreas.join(", ") : "None";
  dom.coachLearner.textContent = state.profile.learnerName
    ? `${state.profile.learnerName} (${state.profile.learnerRole || "role unset"}) | Focus: ${focus}`
    : "No learner profile saved.";
  if (!latest) {
    dom.coachFriction.textContent = "Run at least one simulation.";
    dom.coachDrill.textContent = "No drill recommendation yet.";
    dom.interventionList.innerHTML = "<li>Assign one live simulation and one audio word-practice round this week.</li>";
  } else {
    const ranked = [["Clarity", latest.metrics.clarity], ["Confidence", latest.metrics.confidence], ["Connection", latest.metrics.connection]].sort((a, b) => a[1] - b[1]);
    dom.coachFriction.textContent = `${ranked[0][0]} is the main friction point at ${ranked[0][1]}.`;
    dom.coachDrill.textContent = latest.challenge;
    dom.interventionList.innerHTML = `
      <li>Assign a focused drill on ${ranked[0][0].toLowerCase()}.</li>
      <li>Require one timed replay with zero filler words.</li>
      <li>Review improvement on the next coach dashboard update.</li>
    `;
  }
  renderForwardedReports();
  renderAssignedTests();
  renderCohortLeaderboard();
}

function renderForwardedReports() {
  dom.forwardedReports.innerHTML = "";
  if (!state.forwardedReports.length) {
    dom.forwardedReports.innerHTML = "<p>No forwarded reports yet.</p>";
    return;
  }
  state.forwardedReports.slice().reverse().slice(0, 8).forEach((report) => {
    const card = document.createElement("article");
    card.className = "glass word-card";
    card.innerHTML = `
      <h3>${escapeHtml(report.learner)}</h3>
      <p><strong>Overall:</strong> ${report.overall}</p>
      <p><strong>Strengths:</strong> ${escapeHtml((report.strengths || []).join(" | ") || "Building momentum")}</p>
      <p><strong>Weaknesses:</strong> ${escapeHtml((report.weaknesses || []).join(" | ") || "No major weaknesses")}</p>
      <p><strong>Date:</strong> ${escapeHtml(formatDate(report.date))}</p>
    `;
    dom.forwardedReports.appendChild(card);
  });
}

function assignCoachTest() {
  const student = dom.assignStudent.value.trim();
  const brief = dom.assignBrief.value.trim();
  if (!student || !brief) return alert("Please provide target student and test instructions.");
  state.assignedTests.push({
    student,
    difficulty: dom.assignDifficulty.value,
    brief,
    assignedAt: new Date().toISOString()
  });
  dom.assignStudent.value = "";
  dom.assignBrief.value = "";
  saveState();
  renderAssignedTests();
}

function renderAssignedTests() {
  if (!state.assignedTests.length) {
    dom.cohortLeaderboard.innerHTML = "<p>No assigned tests yet.</p>";
    return;
  }
  const list = state.assignedTests.slice().reverse().slice(0, 6).map((item, idx) => `
    <tr><td>${idx + 1}</td><td>${escapeHtml(item.student)}</td><td>${escapeHtml(item.difficulty)}</td><td>${escapeHtml(item.brief)}</td><td>${escapeHtml(formatDate(item.assignedAt))}</td></tr>
  `).join("");
  dom.cohortLeaderboard.innerHTML = `<table><thead><tr><th>#</th><th>Student</th><th>Difficulty</th><th>Brief</th><th>Assigned</th></tr></thead><tbody>${list}</tbody></table>`;
}

function ensureSocialBootstrap() {
  if (!state.social || typeof state.social !== "object") {
    state.social = { profiles: [...SOCIAL_SEED_PROFILES], invites: [], connections: [], journeys: [], chats: {} };
  }
  state.social.profiles = Array.isArray(state.social.profiles) ? state.social.profiles : [...SOCIAL_SEED_PROFILES];
  state.social.invites = Array.isArray(state.social.invites) ? state.social.invites : [];
  state.social.connections = Array.isArray(state.social.connections) ? state.social.connections : [];
  state.social.journeys = Array.isArray(state.social.journeys) ? state.social.journeys : [];
  state.social.chats = state.social.chats && typeof state.social.chats === "object" ? state.social.chats : {};
  if (!state.social.profiles.length) state.social.profiles = [...SOCIAL_SEED_PROFILES];
  ensureCurrentLearnerProfile();
}

function currentUserId() {
  return state.auth.currentUser?.email?.toLowerCase() || "guest";
}

function ensureCurrentLearnerProfile() {
  const id = currentUserId();
  const email = state.auth.currentUser?.email || "";
  if (!id || id === "guest") return null;
  let profile = state.social.profiles.find((item) => item.id === id);
  const displayName = state.profile.learnerName || email.split("@")[0] || "Learner";
  if (!profile) {
    profile = {
      id,
      name: displayName,
      handle: `@${displayName.toLowerCase().replace(/\s+/g, "_")}`,
      bio: "Focused on becoming a high-impact communicator.",
      focus: state.profile.focusAreas[0] || "Public Speaking",
      level: "Starter",
      online: true
    };
    state.social.profiles.unshift(profile);
  } else {
    profile.name = displayName;
    profile.focus = state.profile.focusAreas[0] || profile.focus || "Public Speaking";
    profile.online = true;
  }
  return profile;
}

function getProfileById(id) {
  return state.social.profiles.find((item) => item.id === id);
}

function getConnectedIds(meId) {
  return state.social.connections
    .filter((c) => c.members.includes(meId))
    .map((c) => c.members.find((m) => m !== meId))
    .filter(Boolean);
}

function connectionRoomId(a, b) {
  return `conn:${[a, b].sort().join("|")}`;
}

function handleCommunityAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const target = button.dataset.target;
  if (action === "invite") sendInvite(target);
  if (action === "accept") respondInvite(target, "accepted");
  if (action === "decline") respondInvite(target, "declined");
  if (action === "chat") openChatRoom(target);
  if (action === "join-journey") joinJourney(target);
}

function sendInvite(targetId) {
  const me = currentUserId();
  if (!me || me === "guest" || me === targetId) return;
  const exists = state.social.invites.find((item) => item.fromId === me && item.toId === targetId && item.status === "pending");
  if (exists) return;
  const alreadyConnected = state.social.connections.some((item) => item.members.includes(me) && item.members.includes(targetId));
  if (alreadyConnected) return;
  state.social.invites.push({
    id: cryptoRandomId(),
    fromId: me,
    toId: targetId,
    status: "pending",
    createdAt: new Date().toISOString()
  });
  saveState();
  renderCommunityHub();
}

function respondInvite(inviteId, status) {
  const me = currentUserId();
  const invite = state.social.invites.find((item) => item.id === inviteId && item.toId === me);
  if (!invite || invite.status !== "pending") return;
  invite.status = status;
  invite.respondedAt = new Date().toISOString();
  if (status === "accepted") {
    const exists = state.social.connections.some((item) => item.members.includes(invite.fromId) && item.members.includes(invite.toId));
    if (!exists) {
      state.social.connections.push({
        id: cryptoRandomId(),
        members: [invite.fromId, invite.toId],
        createdAt: new Date().toISOString()
      });
    }
  }
  saveState();
  renderCommunityHub();
}

function createGroupJourney(event) {
  event.preventDefault();
  const me = currentUserId();
  const name = dom.journeyName.value.trim();
  const goal = dom.journeyGoal.value.trim();
  const checked = Array.from(dom.journeyMembers.querySelectorAll("input[type='checkbox']:checked")).map((item) => item.value);
  const members = unique([me, ...checked]);
  if (!name || !goal) return alert("Please provide journey name and objective.");
  if (members.length < 2) return alert("Select at least one connected learner so your journey has 2+ members.");
  state.social.journeys.push({
    id: cryptoRandomId(),
    name,
    goal,
    members,
    scoreboard: members.map((id, idx) => ({ id, points: Math.max(40, 82 - idx * 7), streak: Math.max(1, 4 - idx) })),
    createdAt: new Date().toISOString(),
    onlineMode: true
  });
  dom.journeyName.value = "";
  dom.journeyGoal.value = "";
  saveState();
  renderCommunityHub();
}

function joinJourney(journeyId) {
  const me = currentUserId();
  const journey = state.social.journeys.find((item) => item.id === journeyId);
  if (!journey) return;
  if (!journey.members.includes(me)) {
    journey.members.push(me);
    journey.scoreboard.push({ id: me, points: 55, streak: 1 });
  }
  saveState();
  renderCommunityHub();
}

function openChatRoom(roomId) {
  if (!roomId) return;
  dom.chatRoomSelect.value = roomId;
  renderChatMessages();
}

function sendCommunityMessage() {
  const room = dom.chatRoomSelect.value;
  const text = dom.chatInput.value.trim();
  if (!room || !text) return;
  const me = currentUserId();
  if (!state.social.chats[room]) state.social.chats[room] = [];
  state.social.chats[room].push({
    id: cryptoRandomId(),
    fromId: me,
    text,
    at: new Date().toISOString()
  });
  dom.chatInput.value = "";
  saveState();
  renderChatMessages();
}

function renderCommunityHub() {
  ensureSocialBootstrap();
  renderCommunityDirectory();
  renderIncomingInvites();
  renderConnections();
  renderJourneyMemberPicker();
  renderJourneys();
  renderChatRooms();
  renderChatMessages();
}

function miniProfileCard(profile, actionsHtml = "") {
  return `
    <article class="mini-profile">
      <strong>${escapeHtml(profile.name)}</strong>
      <p>${escapeHtml(profile.bio || "Learner profile")}</p>
      <div class="mini-meta">
        <span class="mini-badge">${escapeHtml(profile.handle || "@learner")}</span>
        <span class="mini-badge">${escapeHtml(profile.focus || "Public Speaking")}</span>
        <span class="mini-badge">${escapeHtml(profile.level || "Rising")}</span>
        <span class="${profile.online ? "status-online" : "status-offline"}">${profile.online ? "Online" : "Offline"}</span>
      </div>
      <div class="actions-row">${actionsHtml}</div>
    </article>
  `;
}

function renderCommunityDirectory() {
  const me = currentUserId();
  const connected = new Set(getConnectedIds(me));
  const pending = new Set(state.social.invites.filter((item) => item.fromId === me && item.status === "pending").map((item) => item.toId));
  const peers = state.social.profiles.filter((item) => item.id !== me);
  if (!peers.length) {
    dom.communityDirectory.innerHTML = "<p>No learners available yet.</p>";
    return;
  }
  dom.communityDirectory.innerHTML = peers.map((profile) => {
    let action = `<button class="btn btn-ghost" type="button" data-action="invite" data-target="${profile.id}">Send Invite</button>`;
    if (connected.has(profile.id)) action = `<button class="btn btn-ghost" type="button" data-action="chat" data-target="${connectionRoomId(me, profile.id)}">Open Chat</button>`;
    if (pending.has(profile.id)) action = `<span class="hint">Invite pending</span>`;
    return miniProfileCard(profile, action);
  }).join("");
}

function renderIncomingInvites() {
  const me = currentUserId();
  const incoming = state.social.invites.filter((item) => item.toId === me && item.status === "pending");
  if (!incoming.length) {
    dom.incomingInvites.innerHTML = "<p>No pending invites.</p>";
    return;
  }
  dom.incomingInvites.innerHTML = incoming.map((invite) => {
    const sender = getProfileById(invite.fromId);
    if (!sender) return "";
    const actions = `
      <button class="btn btn-primary" type="button" data-action="accept" data-target="${invite.id}">Accept</button>
      <button class="btn btn-danger" type="button" data-action="decline" data-target="${invite.id}">Decline</button>
    `;
    return miniProfileCard(sender, actions);
  }).join("");
}

function renderConnections() {
  const me = currentUserId();
  const ids = getConnectedIds(me);
  if (!ids.length) {
    dom.connectionsList.innerHTML = "<p>No connections yet. Send your first invite.</p>";
    return;
  }
  dom.connectionsList.innerHTML = ids.map((id) => {
    const profile = getProfileById(id);
    if (!profile) return "";
    const actions = `<button class="btn btn-ghost" type="button" data-action="chat" data-target="${connectionRoomId(me, id)}">Chat</button>`;
    return miniProfileCard(profile, actions);
  }).join("");
}

function renderJourneyMemberPicker() {
  const me = currentUserId();
  const ids = getConnectedIds(me);
  if (!ids.length) {
    dom.journeyMembers.innerHTML = "<p class='hint'>Connect with learners first to create a group journey.</p>";
    return;
  }
  dom.journeyMembers.innerHTML = ids.map((id) => {
    const profile = getProfileById(id);
    if (!profile) return "";
    return `<label class="focus-chip"><input type="checkbox" value="${id}" />${escapeHtml(profile.name)} (${escapeHtml(profile.handle)})</label>`;
  }).join("");
}

function renderJourneys() {
  const me = currentUserId();
  const mine = state.social.journeys.filter((item) => item.members.includes(me));
  if (!mine.length) {
    dom.journeyList.innerHTML = "<p>No group journeys yet. Create one with 2+ members.</p>";
    return;
  }
  dom.journeyList.innerHTML = mine.map((journey) => {
    const rows = journey.scoreboard
      .slice()
      .sort((a, b) => b.points - a.points)
      .map((row, idx) => {
        const p = getProfileById(row.id);
        return `<tr><td>${idx + 1}</td><td>${escapeHtml(p?.name || row.id)}</td><td>${row.points}</td><td>${row.streak}</td></tr>`;
      }).join("");
    return `
      <article class="journey-card">
        <h4>${escapeHtml(journey.name)}</h4>
        <p>${escapeHtml(journey.goal)}</p>
        <p class="hint">Mode: ${journey.onlineMode ? "Online group practice enabled" : "Offline"} | Members: ${journey.members.length}</p>
        <div class="actions-row">
          <button class="btn btn-ghost" type="button" data-action="chat" data-target="journey:${journey.id}">Open Group Chat</button>
          <button class="btn btn-ghost" type="button" data-action="join-journey" data-target="${journey.id}">Join Practice Room</button>
        </div>
        <table><thead><tr><th>Rank</th><th>Learner</th><th>Points</th><th>Streak</th></tr></thead><tbody>${rows}</tbody></table>
      </article>
    `;
  }).join("");
}

function renderChatRooms() {
  const me = currentUserId();
  const connectionRooms = getConnectedIds(me).map((id) => {
    const profile = getProfileById(id);
    return { id: connectionRoomId(me, id), label: `Direct: ${profile?.name || id}` };
  });
  const groupRooms = state.social.journeys
    .filter((journey) => journey.members.includes(me))
    .map((journey) => ({ id: `journey:${journey.id}`, label: `Group: ${journey.name}` }));
  const rooms = [...connectionRooms, ...groupRooms];
  if (!rooms.length) {
    dom.chatRoomSelect.innerHTML = "<option value=''>No chat rooms yet</option>";
    return;
  }
  const selected = dom.chatRoomSelect.value;
  dom.chatRoomSelect.innerHTML = rooms.map((room) => `<option value="${room.id}">${escapeHtml(room.label)}</option>`).join("");
  if (rooms.some((room) => room.id === selected)) dom.chatRoomSelect.value = selected;
}

function renderChatMessages() {
  const room = dom.chatRoomSelect.value;
  if (!room) {
    dom.chatMessages.innerHTML = "<p class='hint'>No active room selected.</p>";
    return;
  }
  const messages = state.social.chats[room] || [];
  if (!messages.length) {
    dom.chatMessages.innerHTML = "<p class='hint'>No messages yet. Start the conversation.</p>";
    return;
  }
  const me = currentUserId();
  dom.chatMessages.innerHTML = messages.slice(-60).map((msg) => {
    const from = getProfileById(msg.fromId);
    const mine = msg.fromId === me;
    return `<div class="chat-msg${mine ? " mine" : ""}"><strong>${escapeHtml(from?.name || msg.fromId)}</strong><p>${escapeHtml(msg.text)}</p><small>${escapeHtml(formatDate(msg.at))}</small></div>`;
  }).join("");
  dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function renderStudentLeaderboard() {
  ensureSocialBootstrap();
  const userName = state.profile.learnerName || "You";
  const existing = state.cohort.find((row) => row.name.toLowerCase() === userName.toLowerCase());
  if (!existing) {
    state.cohort.push({ name: userName, xp: state.game.xp, points: state.sessions.length ? avg(state.sessions.map((s) => s.metrics.overall)) : 72 });
  } else {
    existing.xp = state.game.xp;
    existing.points = state.sessions.length ? avg(state.sessions.map((s) => s.metrics.overall)) : existing.points;
  }
  const ranked = state.cohort.slice().sort((a, b) => b.xp - a.xp);
  const rows = ranked.map((item, idx) => `
    <tr><td>${idx + 1}</td><td>${escapeHtml(item.name)}</td><td>${Math.round(item.xp)}</td><td>${Math.round(item.points)}</td></tr>
  `).join("");
  dom.studentLeaderboard.innerHTML = `<table><thead><tr><th>Rank</th><th>Learner</th><th>XP</th><th>Avg Score</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function updateCohortRank(overallScore) {
  const userName = state.profile.learnerName || "You";
  const found = state.cohort.find((item) => item.name.toLowerCase() === userName.toLowerCase());
  if (found) {
    found.xp = state.game.xp;
    found.points = Math.round((found.points + overallScore) / 2);
  } else {
    state.cohort.push({ name: userName, xp: state.game.xp, points: overallScore });
  }
}

function renderCohortLeaderboard() {
  const ranked = state.cohort.slice().sort((a, b) => b.points - a.points);
  const rows = ranked.map((item, idx) => `<tr><td>${idx + 1}</td><td>${escapeHtml(item.name)}</td><td>${Math.round(item.points)}</td><td>${Math.round(item.xp)}</td></tr>`).join("");
  dom.cohortLeaderboard.innerHTML = `<table><thead><tr><th>Rank</th><th>Member</th><th>Score</th><th>XP</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderOverview() {
  const sessions = state.sessions;
  const mastery = computeMasteryPct();
  const overall = sessions.length ? Math.round(avg(sessions.map((item) => item.metrics.overall))) : 0;
  dom.kpiSessions.textContent = String(sessions.length);
  dom.kpiMastery.textContent = `${mastery}%`;
  dom.kpiOverall.textContent = String(overall);
  dom.kpiLevel.textContent = deriveLevel(overall, sessions.length);
  dom.xpTotal.textContent = String(state.game.xp);
  dom.streakTotal.textContent = `${state.game.streakDays} day${state.game.streakDays > 1 ? "s" : ""}`;
  dom.badgeTotal.textContent = String(state.game.badges.length);
  dom.sprintBest.textContent = String(state.game.sprintBest);
  renderStudentLeaderboard();
}

function deriveLevel(overall, count) {
  if (count < 2) return "Starter";
  if (overall >= 85) return "Elite";
  if (overall >= 75) return "Advanced";
  if (overall >= 65) return "Developing";
  return "Foundational";
}

function computeMasteryPct() {
  if (!state.strategicWords.length) return 0;
  const mastered = state.strategicWords.filter((item) => item.mastered).length;
  return Math.round((mastered / state.strategicWords.length) * 100);
}

function unlockBadges() {
  const badges = [];
  if (state.game.xp >= 50) badges.push("Momentum");
  if (state.game.xp >= 120) badges.push("Word Warrior");
  if (computeMasteryPct() >= 80) badges.push("Lexicon Master");
  if (state.sessions.length >= 5) badges.push("Consistent Performer");
  state.game.badges = badges;
}

function addXp(points) {
  state.game.xp += points;
}

function renderAll() {
  unlockBadges();
  renderWordLab();
  renderReport();
  renderCoachVault();
  renderCoachInsights();
  renderOverview();
  renderCommunityHub();
  renderSimulationPrep();
}

function renderSimulationPrep() {
  if (!dom.wordBubbleWrap || !dom.timerFill) return;
  if (!liveSession.active) {
    liveSession.targets = state.strategicWords.slice(0, 8).map((item) => item.word.toLowerCase());
    liveSession.usedWords = [];
    liveSession.roundXp = 0;
    liveSession.wordStreak = 0;
    liveSession.duration = Number(dom.simulationDuration.value || 180);
    liveSession.remaining = liveSession.duration;
    renderWordBubbles();
    updatePracticeHud();
    updateTimerDisplay();
    if (!dom.feedbackBox || dom.feedbackBox.classList.contains("hidden")) {
      dom.liveStateText.textContent = state.practice?.wordGatePassed ? "Ready for full simulation" : "Ready for word-practice gate";
    }
  }
}

function exportLatestReport() {
  const latest = state.sessions[state.sessions.length - 1];
  if (!latest) return alert("No report to export yet.");
  const content = `# Articulate AI Calibration Report\n\n- Date: ${formatDate(latest.createdAt)}\n- Difficulty: ${latest.difficulty}\n- Overall: ${latest.metrics.overall}\n\n## Metrics\n- Clarity: ${latest.metrics.clarity}\n- Confidence: ${latest.metrics.confidence}\n- Connection: ${latest.metrics.connection}\n- Pacing: ${latest.metrics.pacing || 0}\n- Diction: ${latest.metrics.diction || 0}\n\n## Diagnostics\n- Isolated turns: ${latest.diagnostics?.isolatedTurns ?? 0}\n- Filler words: ${latest.diagnostics?.fillerCount ?? 0}\n- Long pauses: ${latest.diagnostics?.longPauses ?? 0}\n- Pace: ${latest.diagnostics?.wpm ?? 0} WPM\n\n## Pulse Check\n${latest.pulse}\n\n## Breakdown\n- ${latest.breakdown.join("\n- ")}\n\n## Refinement\n- Before: ${latest.refinement.before}\n- After: ${latest.refinement.after}\n\n## Challenge\n${latest.challenge}\n`;
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `articulate-report-${Date.now()}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setView(viewName) {
  if (!VIEW_WHITELIST.has(viewName)) return;
  setViewInternal(viewName, true);
}

function setViewInternal(viewName, updateHash) {
  dom.navBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.view === viewName));
  dom.panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === viewName));
  if (viewName === "setup") stageArenaSetupAnimation();
  if (viewName === "practiceground") initPracticeFold();
  const activePanel = document.querySelector(`.panel[data-panel="${viewName}"]`);
  if (activePanel) activePanel.classList.add("view-enter");
  setTimeout(() => activePanel?.classList.remove("view-enter"), 380);
  if (updateHash && window.location.hash !== `#${viewName}`) window.location.hash = viewName;
}

function getViewFromHash() {
  const raw = (window.location.hash || "").replace("#", "").trim();
  return VIEW_WHITELIST.has(raw) ? raw : null;
}

function isViewAllowedForRole(viewName, role) {
  const match = Array.from(dom.navBtns).find((btn) => btn.dataset.view === viewName);
  if (!match) return false;
  const allowed = match.dataset.role;
  return allowed === "both" || allowed === role;
}

function handleHashRoute() {
  const user = state.auth.currentUser;
  if (!user) return;
  const view = getViewFromHash();
  if (!view || !isViewAllowedForRole(view, user.role)) return;
  setViewInternal(view, false);
}

function activatePointerSlide() {
  const targets = document.querySelectorAll(".focus-chip, .persona-card, .nav-btn, .word-queue-item, .btn");
  targets.forEach((target) => {
    target.addEventListener("mousemove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      target.style.setProperty("--mx", `${x}px`);
      target.style.setProperty("--my", `${y}px`);
      const rx = ((y / rect.height) - 0.5) * -3;
      const ry = ((x / rect.width) - 0.5) * 4;
      target.style.transform = `translateY(-1px) perspective(450px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    target.addEventListener("mouseleave", () => {
      target.style.transform = "";
    });
  });
}

function stageArenaSetupAnimation() {
  dom.setupForm.classList.remove("is-ready");
  requestAnimationFrame(() => {
    setTimeout(() => dom.setupForm.classList.add("is-ready"), 40);
  });
}

function countMatches(text, dictionary) {
  let count = 0;
  dictionary.forEach((pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    count += (text.match(regex) || []).length;
  });
  return count;
}

function tokenize(text) {
  return text.toLowerCase().match(/[a-z][a-z'-]{1,}/g) || [];
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function avg(list) {
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function cryptoRandomId() {
  return (window.crypto && window.crypto.randomUUID) ? crypto.randomUUID().split("-")[0] : Math.random().toString(36).slice(2, 10);
}

function revealAnimations() {
  const nodes = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  nodes.forEach((node) => observer.observe(node));
}

function initPracticeFold() {
  const panel = document.getElementById("practiceground-panel");
  if (!panel) return;
  const cards = panel.querySelectorAll(".practice-main > .section-card, .practice-output > .section-card");
  cards.forEach((card, index) => {
    card.style.setProperty("--stack-index", String(index));
    card.style.setProperty("--fold", "0");
  });
  updatePracticeFold();
}

function updatePracticeFold() {
  if (window.innerWidth <= 1024) return;
  const panel = document.getElementById("practiceground-panel");
  if (!panel || !panel.classList.contains("is-active")) return;
  const cards = panel.querySelectorAll(".practice-main > .section-card, .practice-output > .section-card");
  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const anchor = 130 + index * 14;
    const fold = clamp((anchor - rect.top) / 240, 0, 1);
    card.style.setProperty("--fold", fold.toFixed(3));
  });
}

function runBootLoader() {
  if (!dom.appLoader) return;
  setTimeout(() => dom.appLoader.classList.add("is-hidden"), 850);
}

function setAuthMode(mode) {
  const nextMode = mode === "signup" ? "signup" : "login";
  dom.authModeToggle.dataset.mode = nextMode;
  dom.authModeBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.authMode === nextMode));
  dom.signupNameWrap.classList.toggle("hidden", nextMode !== "signup");
  dom.authCard.classList.toggle("is-signup", nextMode === "signup");
  const headline = nextMode === "signup" ? "Create Your Speaking Command Center." : "Communication Without Drift.";
  runTypewriter(dom.authHeadline, headline);
}

function runTypewriter(target, text, speed = 28) {
  if (!target) return;
  const token = cryptoRandomId();
  target.dataset.typingToken = token;
  target.textContent = "";
  let index = 0;
  const tick = () => {
    if (target.dataset.typingToken !== token) return;
    target.textContent = text.slice(0, index + 1);
    index += 1;
    if (index < text.length) setTimeout(tick, speed);
  };
  tick();
}

function withButtonLoading(button, loadingText = "Loading...", delayMs = 520) {
  if (!button) return Promise.resolve();
  const original = button.textContent;
  button.classList.add("is-loading");
  button.textContent = loadingText;
  return new Promise((resolve) => {
    setTimeout(() => {
      button.classList.remove("is-loading");
      button.textContent = original;
      resolve();
    }, delayMs);
  });
}

function toggleGlassFx() {
  state.ui.glassFx = !state.ui.glassFx;
  applyGlassFx();
  saveState();
}

function applyGlassFx() {
  const isOn = state.ui?.glassFx !== false;
  document.body.classList.toggle("fx-flat", !isOn);
  if (dom.glassFxToggle) dom.glassFxToggle.textContent = `Glass FX: ${isOn ? "On" : "Off"}`;
}

function toggleTheme() {
  state.ui.theme = state.ui.theme === "light" ? "dark" : "light";
  applyTheme();
  saveState();
}

function applyTheme() {
  const theme = state.ui?.theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  if (dom.themeToggleBtn) dom.themeToggleBtn.textContent = `Theme: ${theme === "light" ? "Light" : "Dark"}`;
}

function toggleQuickMenu() {
  const willOpen = dom.quickMenu.classList.contains("hidden");
  dom.quickMenu.classList.toggle("hidden", !willOpen);
  dom.quickMenuToggle.classList.toggle("is-open", willOpen);
  dom.quickMenuToggle.setAttribute("aria-expanded", String(willOpen));
}

function handleQuickMenuNavigation(event) {
  const btn = event.target.closest("button[data-quick-view]");
  if (!btn) return;
  const view = btn.dataset.quickView;
  const user = state.auth.currentUser;
  if (!user || !isViewAllowedForRole(view, user.role)) return;
  setView(view);
  dom.quickMenu.classList.add("hidden");
  dom.quickMenuToggle.classList.remove("is-open");
  dom.quickMenuToggle.setAttribute("aria-expanded", "false");
}

