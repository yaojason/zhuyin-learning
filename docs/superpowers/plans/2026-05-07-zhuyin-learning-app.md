# 注音學習網站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-HTML kindergarten Zhuyin learning app with flashcards, pinyin practice, listening quiz, diary, and parent dashboard.

**Architecture:** Single `index.html` with embedded CSS and JS. All data stored in localStorage. TTS via Web Speech API (with Edge TTS pre-recorded mp3 upgrade path). No server required.

**Tech Stack:** Vanilla HTML/CSS/JS, Canvas API (handwriting), Web Speech API (TTS + recognition), localStorage.

---

## File Structure

```
zhuyin/
├── index.html              # The entire app (HTML + CSS + JS)
├── audio/                  # Pre-recorded pronunciation mp3s (future)
│   ├── singles/            # 37 individual zhuyin sounds
│   └── combos/             # Common pinyin combinations
└── docs/
    └── superpowers/
        ├── specs/          # Design spec
        └── plans/          # This plan
```

Since this is a single HTML file, the plan builds it in layers: scaffold → data → flashcard → pinyin → listening → diary → parent → polish.

---

### Task 1: HTML Scaffold + Tab Navigation + CSS Foundation

**Files:**
- Create: `/Users/jason/Claude_env/zhuyin/index.html`

- [ ] **Step 1: Create base HTML with tab structure**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>注音小天地</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: #FF6B6B;
      --secondary: #4ECDC4;
      --accent: #FFE66D;
      --bg: #FFF9F0;
      --text: #2D3436;
      --card: #FFFFFF;
      --success: #6BCB77;
      --shadow: 0 4px 15px rgba(0,0,0,0.1);
      --radius: 20px;
    }
    body {
      font-family: -apple-system, 'Noto Sans TC', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }
    .app-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 500px;
      margin: 0 auto;
      width: 100%;
      height: 100vh;
    }
    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: none;
    }
    .tab-content.active { display: flex; flex-direction: column; align-items: center; }
    .tab-bar {
      display: flex;
      justify-content: space-around;
      background: var(--card);
      padding: 10px 0 env(safe-area-inset-bottom, 10px);
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
      position: relative;
      z-index: 10;
    }
    .tab-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      font-size: 28px;
      padding: 8px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    .tab-btn.active { background: var(--accent); transform: scale(1.1); }
    .tab-btn span { font-size: 11px; }
    .settings-btn {
      position: fixed;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(0,0,0,0.05);
      border: none;
      font-size: 18px;
      cursor: pointer;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Card styles */
    .card {
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 30px;
      text-align: center;
      width: 100%;
      max-width: 350px;
    }
    /* Big button */
    .btn-big {
      min-height: 60px;
      min-width: 60px;
      border: none;
      border-radius: 16px;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      padding: 16px 32px;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn-big:active { transform: scale(0.95); }
    .btn-success { background: var(--success); color: white; }
    .btn-danger { background: var(--primary); color: white; }
    .btn-primary { background: var(--secondary); color: white; }
    /* Star counter */
    .star-counter {
      position: fixed;
      top: 12px;
      left: 12px;
      background: var(--accent);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 16px;
      font-weight: bold;
      z-index: 20;
      box-shadow: var(--shadow);
    }
    /* Animations */
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    @keyframes starPop {
      0% { transform: scale(0) rotate(0deg); opacity: 0; }
      50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
      100% { transform: scale(1) rotate(360deg); opacity: 1; }
    }
    .bounce { animation: bounce 0.4s ease; }
    .star-pop { animation: starPop 0.6s ease; }
    /* Hide scrollbar */
    .tab-content::-webkit-scrollbar { display: none; }
    .tab-content { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body>
  <div class="app-container">
    <div class="star-counter" id="starCounter">⭐ 0</div>
    <button class="settings-btn" id="settingsBtn">⚙️</button>

    <!-- Tab: Flashcard -->
    <div class="tab-content active" id="tab-flashcard"></div>
    <!-- Tab: Pinyin -->
    <div class="tab-content" id="tab-pinyin"></div>
    <!-- Tab: Listening -->
    <div class="tab-content" id="tab-listening"></div>
    <!-- Tab: Diary -->
    <div class="tab-content" id="tab-diary"></div>
    <!-- Tab: Parent -->
    <div class="tab-content" id="tab-parent"></div>

    <nav class="tab-bar">
      <button class="tab-btn active" data-tab="flashcard">🃏<span>閃卡</span></button>
      <button class="tab-btn" data-tab="pinyin">🧩<span>拼音</span></button>
      <button class="tab-btn" data-tab="listening">👂<span>聽音</span></button>
      <button class="tab-btn" data-tab="diary">📔<span>日記</span></button>
    </nav>
  </div>

  <script>
  // === APP STATE ===
  const APP = {
    currentTab: 'flashcard',
    data: null,
  };

  // === TAB NAVIGATION ===
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(`tab-${tab}`).classList.add('active');
      btn.classList.add('active');
      APP.currentTab = tab;
    });
  });

  // === PARENT UNLOCK (long press 3s) ===
  let settingsTimer = null;
  const settingsBtn = document.getElementById('settingsBtn');
  settingsBtn.addEventListener('touchstart', () => {
    settingsTimer = setTimeout(() => {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-parent').classList.add('active');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    }, 3000);
  });
  settingsBtn.addEventListener('touchend', () => clearTimeout(settingsTimer));
  settingsBtn.addEventListener('mousedown', () => {
    settingsTimer = setTimeout(() => {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-parent').classList.add('active');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    }, 3000);
  });
  settingsBtn.addEventListener('mouseup', () => clearTimeout(settingsTimer));
  </script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Run: `open /Users/jason/Claude_env/zhuyin/index.html`
Expected: See 4 tabs at bottom, star counter top-left, gear icon top-right. Tabs switch on click. Long-press gear 3s shows parent tab.

- [ ] **Step 3: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git init && git add index.html && git commit -m "feat: scaffold with tab navigation and CSS foundation"
```

---

### Task 2: Data Layer (localStorage + Zhuyin Data)

**Files:**
- Modify: `/Users/jason/Claude_env/zhuyin/index.html` (add JS before closing `</script>`)

- [ ] **Step 1: Add zhuyin data constants and localStorage manager**

Insert before the closing `</script>` tag:

```javascript
// === ZHUYIN DATA ===
const INITIALS = ['ㄅ','ㄆ','ㄇ','ㄈ','ㄉ','ㄊ','ㄋ','ㄌ','ㄍ','ㄎ','ㄏ','ㄐ','ㄑ','ㄒ','ㄓ','ㄔ','ㄕ','ㄖ','ㄗ','ㄘ','ㄙ'];
const FINALS = ['ㄚ','ㄛ','ㄜ','ㄝ','ㄞ','ㄟ','ㄠ','ㄡ','ㄢ','ㄣ','ㄤ','ㄥ','ㄦ','ㄧ','ㄨ','ㄩ'];
const ALL_ZHUYIN = [...INITIALS, ...FINALS];
const TONES = ['ˉ','ˊ','ˇ','ˋ','˙'];
const TONE_NAMES = ['一聲','二聲','三聲','四聲','輕聲'];

// Common pinyin combos: [zhuyin, character, tone_index]
const PINYIN_WORDS = [
  ['ㄅㄚ','爸',3], ['ㄇㄚ','媽',0], ['ㄍㄜ','哥',0], ['ㄐㄧㄝ','姐',2],
  ['ㄉㄧ','弟',3], ['ㄇㄟ','妹',3], ['ㄍㄡ','狗',2], ['ㄇㄠ','貓',0],
  ['ㄕㄨ','書',0], ['ㄅㄠ','包',0], ['ㄔㄜ','車',0], ['ㄏㄨㄚ','花',0],
  ['ㄕㄨㄟ','水',2], ['ㄩ','魚',1], ['ㄋㄧㄠ','鳥',2], ['ㄊㄧㄢ','天',0],
  ['ㄉㄧ','地',3], ['ㄖㄣ','人',1], ['ㄉㄚ','大',3], ['ㄒㄧㄠ','小',2],
  ['ㄏㄠ','好',2], ['ㄔ','吃',0], ['ㄏㄜ','喝',0], ['ㄨㄢ','玩',1],
  ['ㄆㄠ','跑',2], ['ㄊㄧㄠ','跳',3], ['ㄎㄨ','哭',0], ['ㄒㄧㄠ','笑',3],
  ['ㄎㄢ','看',3], ['ㄊㄧㄥ','聽',0], ['ㄕㄨㄛ','說',0], ['ㄉㄨ','讀',1],
  ['ㄒㄧㄝ','寫',2], ['ㄏㄨㄚ','畫',3], ['ㄔㄤ','唱',3], ['ㄊㄧㄠ','跳',3],
  ['ㄈㄢ','飯',3], ['ㄘㄞ','菜',3], ['ㄍㄨㄛ','果',2], ['ㄋㄞ','奶',2],
];

// Diary prompts (image descriptions)
const DIARY_PROMPTS = [
  '今天吃了什麼好吃的？🍎',
  '今天看到什麼動物？🐱',
  '今天跟誰一起玩？👫',
  '今天天氣怎麼樣？☀️',
  '今天最開心的事？😊',
  '今天學了什麼新東西？📚',
  '今天去了哪裡？🏠',
];

// === STORAGE MANAGER ===
const Storage = {
  KEY: 'zhuyin_app_data',

  getDefault() {
    return {
      progress: {
        flashcard: {},
        pinyin: { level: 1, score: 0 },
        listening: { correct: 0, total: 0 },
      },
      weakItems: [],
      diary: [],
      stars: 0,
      streak: 0,
      lastActive: null,
      settings: {
        dailyGoal: 20,
        speechRate: 0.6,
        voice: 'zh-TW-YunJheNeural',
      },
      todayStats: { date: null, questions: 0, correct: 0, minutes: 0 },
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.getDefault();
      const data = JSON.parse(raw);
      return { ...this.getDefault(), ...data };
    } catch { return this.getDefault(); }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  addStar(data) {
    data.stars += 1;
    document.getElementById('starCounter').textContent = `⭐ ${data.stars}`;
    this.save(data);
  },

  recordAnswer(data, correct) {
    const today = new Date().toISOString().slice(0, 10);
    if (data.todayStats.date !== today) {
      data.todayStats = { date: today, questions: 0, correct: 0, minutes: 0 };
    }
    data.todayStats.questions += 1;
    if (correct) data.todayStats.correct += 1;
    if (data.todayStats.correct % 5 === 0 && correct) this.addStar(data);
    this.save(data);
  },

  updateStreak(data) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (data.lastActive === today) return;
    if (data.lastActive === yesterday) {
      data.streak += 1;
    } else if (data.lastActive !== today) {
      data.streak = 1;
    }
    data.lastActive = today;
    this.save(data);
  },

  addWeakItem(data, symbol) {
    if (!data.weakItems.includes(symbol)) {
      data.weakItems.push(symbol);
      this.save(data);
    }
  },

  removeWeakItem(data, symbol) {
    data.weakItems = data.weakItems.filter(s => s !== symbol);
    this.save(data);
  },
};

// === TTS (Web Speech API) ===
const TTS = {
  speak(text, rate = 0.6) {
    return new Promise(resolve => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-TW';
      utter.rate = rate;
      utter.onend = resolve;
      utter.onerror = resolve;
      speechSynthesis.speak(utter);
    });
  },

  async speakTwice(text, rate = 0.6) {
    await this.speak(text, rate);
    await new Promise(r => setTimeout(r, 500));
    await this.speak(text, rate);
  },
};

// === INIT ===
APP.data = Storage.load();
Storage.updateStreak(APP.data);
document.getElementById('starCounter').textContent = `⭐ ${APP.data.stars}`;
```

- [ ] **Step 2: Open in browser, open console, verify data loads**

Run: `open /Users/jason/Claude_env/zhuyin/index.html`
In console type: `APP.data` — should show default data structure.
Type: `TTS.speak('ㄅ')` — should hear pronunciation.

- [ ] **Step 3: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git add -A && git commit -m "feat: add zhuyin data constants, storage manager, and TTS"
```

---

### Task 3: Flashcard Feature

**Files:**
- Modify: `/Users/jason/Claude_env/zhuyin/index.html` (flashcard tab content + JS)

- [ ] **Step 1: Add flashcard HTML inside `tab-flashcard` div**

Replace the empty `<div class="tab-content active" id="tab-flashcard"></div>` with:

```html
<div class="tab-content active" id="tab-flashcard">
  <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
    <button class="mode-btn active" data-mode="all">全部</button>
    <button class="mode-btn" data-mode="initials">聲母</button>
    <button class="mode-btn" data-mode="finals">韻母</button>
    <button class="mode-btn" data-mode="weak">弱項</button>
  </div>
  <div class="card" id="flashcard" style="margin:20px 0;min-height:250px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
    <span id="flashcardSymbol" style="font-size:120px;font-weight:bold;"></span>
  </div>
  <div style="display:flex;gap:20px;margin-top:20px;">
    <button class="btn-big btn-success" id="fcKnow">✅ 認得</button>
    <button class="btn-big btn-danger" id="fcDontKnow">❌ 不確定</button>
  </div>
</div>
```

- [ ] **Step 2: Add mode button CSS**

Add to `<style>`:

```css
.mode-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid var(--secondary);
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-btn.active {
  background: var(--secondary);
  color: white;
}
```

- [ ] **Step 3: Add flashcard JS logic**

Insert before `// === INIT ===`:

```javascript
// === FLASHCARD ===
const Flashcard = {
  deck: [],
  current: null,
  mode: 'all',

  init() {
    this.setMode('all');
    document.getElementById('flashcard').addEventListener('click', () => this.playSound());
    document.getElementById('fcKnow').addEventListener('click', () => this.answer(true));
    document.getElementById('fcDontKnow').addEventListener('click', () => this.answer(false));
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });
  },

  setMode(mode) {
    this.mode = mode;
    switch (mode) {
      case 'all': this.deck = [...ALL_ZHUYIN]; break;
      case 'initials': this.deck = [...INITIALS]; break;
      case 'finals': this.deck = [...FINALS]; break;
      case 'weak': this.deck = APP.data.weakItems.length > 0 ? [...APP.data.weakItems] : [...ALL_ZHUYIN]; break;
    }
    this.shuffle();
    this.next();
  },

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  },

  next() {
    if (this.deck.length === 0) this.setMode(this.mode);
    this.current = this.deck.pop();
    const el = document.getElementById('flashcardSymbol');
    el.textContent = this.current;
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
  },

  async playSound() {
    const el = document.getElementById('flashcardSymbol');
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
    await TTS.speakTwice(this.current, APP.data.settings.speechRate);
  },

  answer(known) {
    const symbol = this.current;
    if (!APP.data.progress.flashcard[symbol]) {
      APP.data.progress.flashcard[symbol] = { correct: 0, wrong: 0, lastSeen: null };
    }
    const record = APP.data.progress.flashcard[symbol];
    record.lastSeen = new Date().toISOString().slice(0, 10);

    if (known) {
      record.correct += 1;
      Storage.removeWeakItem(APP.data, symbol);
    } else {
      record.wrong += 1;
      Storage.addWeakItem(APP.data, symbol);
      this.deck.unshift(symbol); // will see it again sooner
    }

    Storage.recordAnswer(APP.data, known);
    this.next();
  },
};
```

- [ ] **Step 4: Call `Flashcard.init()` in INIT section**

Add after `document.getElementById('starCounter').textContent = ...`:

```javascript
Flashcard.init();
```

- [ ] **Step 5: Test in browser**

Open page. Should see a big zhuyin symbol. Click card → hear pronunciation. Click ✅/❌ → next card. Switch modes.

- [ ] **Step 6: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git add -A && git commit -m "feat: flashcard with modes and spaced repetition"
```

---

### Task 4: Pinyin Practice Feature

**Files:**
- Modify: `/Users/jason/Claude_env/zhuyin/index.html`

- [ ] **Step 1: Add pinyin tab HTML**

Replace `<div class="tab-content" id="tab-pinyin"></div>` with:

```html
<div class="tab-content" id="tab-pinyin">
  <div class="card" id="pinyinCard" style="margin:20px 0;min-height:200px;">
    <div id="pinyinTarget" style="font-size:60px;margin-bottom:10px;"></div>
    <div id="pinyinZhuyin" style="font-size:28px;color:#888;margin-bottom:20px;"></div>
    <div id="pinyinStep" style="font-size:18px;color:var(--secondary);margin-bottom:16px;"></div>
    <div id="pinyinOptions" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;"></div>
  </div>
  <div id="pinyinFeedback" style="font-size:24px;min-height:40px;margin-top:12px;"></div>
  <div style="font-size:14px;color:#888;margin-top:8px;">
    Level: <span id="pinyinLevel">1</span>
  </div>
</div>
```

- [ ] **Step 2: Add pinyin JS logic**

```javascript
// === PINYIN PRACTICE ===
const Pinyin = {
  currentWord: null,
  step: 0, // 0=initial, 1=final, 2=tone
  level: 1,

  init() {
    this.level = APP.data.progress.pinyin.level;
    document.getElementById('pinyinLevel').textContent = this.level;
    this.nextWord();
  },

  nextWord() {
    this.currentWord = PINYIN_WORDS[Math.floor(Math.random() * PINYIN_WORDS.length)];
    this.step = 0;
    this.render();
  },

  render() {
    const [zhuyin, char, tone] = this.currentWord;
    const target = document.getElementById('pinyinTarget');
    const zhuyinEl = document.getElementById('pinyinZhuyin');
    const stepEl = document.getElementById('pinyinStep');
    const optionsEl = document.getElementById('pinyinOptions');
    const feedback = document.getElementById('pinyinFeedback');
    feedback.textContent = '';

    if (this.level < 3) {
      target.textContent = char;
      zhuyinEl.textContent = zhuyin + TONES[tone];
    } else {
      target.textContent = '🔊';
      zhuyinEl.textContent = '聽音拼字';
      TTS.speak(char, APP.data.settings.speechRate);
    }

    const initial = this.getInitial(zhuyin);
    const final = this.getFinal(zhuyin);
    const numOptions = this.level === 1 ? 2 : 4;

    if (this.step === 0) {
      stepEl.textContent = '選聲母';
      const options = this.makeOptions(initial, INITIALS, numOptions);
      this.renderOptions(optionsEl, options, initial);
    } else if (this.step === 1) {
      stepEl.textContent = '選韻母';
      const options = this.makeOptions(final, FINALS, numOptions);
      this.renderOptions(optionsEl, options, final);
    } else {
      stepEl.textContent = '選聲調';
      this.renderOptions(optionsEl, TONE_NAMES, TONE_NAMES[tone]);
    }
  },

  getInitial(zhuyin) {
    for (const i of INITIALS) {
      if (zhuyin.startsWith(i)) return i;
    }
    return '';
  },

  getFinal(zhuyin) {
    const initial = this.getInitial(zhuyin);
    return zhuyin.slice(initial.length) || zhuyin;
  },

  makeOptions(correct, pool, count) {
    const options = [correct];
    const filtered = pool.filter(x => x !== correct);
    while (options.length < count && filtered.length > 0) {
      const idx = Math.floor(Math.random() * filtered.length);
      options.push(filtered.splice(idx, 1)[0]);
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  },

  renderOptions(container, options, correct) {
    container.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-big btn-primary';
      btn.style.fontSize = '28px';
      btn.style.minWidth = '70px';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.checkAnswer(opt, correct, btn, container));
      container.appendChild(btn);
    });
  },

  checkAnswer(selected, correct, btn, container) {
    const feedback = document.getElementById('pinyinFeedback');
    if (selected === correct) {
      feedback.textContent = '👍';
      this.step++;
      if (this.step > 2) {
        feedback.textContent = '⭐ 好棒！';
        Storage.recordAnswer(APP.data, true);
        const [,char] = this.currentWord;
        TTS.speak(char, APP.data.settings.speechRate);
        setTimeout(() => this.nextWord(), 1200);
      } else {
        setTimeout(() => this.render(), 400);
      }
    } else {
      feedback.textContent = '再試一次！';
      btn.style.opacity = '0.3';
      btn.disabled = true;
      Storage.recordAnswer(APP.data, false);
      // Highlight correct
      container.querySelectorAll('button').forEach(b => {
        if (b.textContent === correct) b.style.background = 'var(--accent)';
      });
    }
  },
};
```

- [ ] **Step 3: Call `Pinyin.init()` in INIT section**

```javascript
Pinyin.init();
```

- [ ] **Step 4: Test in browser**

Switch to 拼音 tab. See a character, pick initial → final → tone. Correct shows star. Wrong dims button and highlights answer.

- [ ] **Step 5: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git add -A && git commit -m "feat: pinyin three-step practice with levels"
```

---

### Task 5: Listening Quiz Feature

**Files:**
- Modify: `/Users/jason/Claude_env/zhuyin/index.html`

- [ ] **Step 1: Add listening tab HTML**

Replace `<div class="tab-content" id="tab-listening"></div>` with:

```html
<div class="tab-content" id="tab-listening">
  <button class="btn-big" id="listenPlayBtn" style="font-size:60px;width:120px;height:120px;border-radius:50%;background:var(--accent);margin:20px 0;">
    🔊
  </button>
  <div id="listenPrompt" style="font-size:18px;color:#888;margin-bottom:20px;">點喇叭聽發音</div>
  <div id="listenOptions" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:350px;"></div>
  <div id="listenFeedback" style="font-size:24px;min-height:40px;margin-top:16px;"></div>
  <div style="margin-top:12px;font-size:14px;color:#888;">
    <span id="listenScore">0</span> / <span id="listenTotal">0</span> 答對
  </div>
</div>
```

- [ ] **Step 2: Add listening JS logic**

```javascript
// === LISTENING QUIZ ===
const Listening = {
  currentWord: null,
  options: [],
  correct: '',

  init() {
    document.getElementById('listenPlayBtn').addEventListener('click', () => this.playSound());
    this.nextQuestion();
  },

  nextQuestion() {
    this.currentWord = PINYIN_WORDS[Math.floor(Math.random() * PINYIN_WORDS.length)];
    const [zhuyin, , tone] = this.currentWord;
    this.correct = zhuyin + TONES[tone];

    // Generate 3 wrong options
    const wrongs = [];
    while (wrongs.length < 3) {
      const w = PINYIN_WORDS[Math.floor(Math.random() * PINYIN_WORDS.length)];
      const label = w[0] + TONES[w[2]];
      if (label !== this.correct && !wrongs.includes(label)) wrongs.push(label);
    }

    this.options = [this.correct, ...wrongs];
    for (let i = this.options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.options[i], this.options[j]] = [this.options[j], this.options[i]];
    }

    this.renderOptions();
    document.getElementById('listenFeedback').textContent = '';
    document.getElementById('listenPrompt').textContent = '點喇叭聽發音';
    this.updateScore();
  },

  async playSound() {
    const btn = document.getElementById('listenPlayBtn');
    btn.classList.add('bounce');
    setTimeout(() => btn.classList.remove('bounce'), 400);
    const [, char] = this.currentWord;
    await TTS.speakTwice(char, APP.data.settings.speechRate);
  },

  renderOptions() {
    const container = document.getElementById('listenOptions');
    container.innerHTML = '';
    this.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-big btn-primary';
      btn.style.fontSize = '22px';
      btn.style.minWidth = '140px';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.checkAnswer(opt, btn, container));
      container.appendChild(btn);
    });
  },

  checkAnswer(selected, btn, container) {
    const feedback = document.getElementById('listenFeedback');
    if (selected === this.correct) {
      feedback.textContent = '⭐ 太厲害了！';
      APP.data.progress.listening.correct += 1;
      APP.data.progress.listening.total += 1;
      Storage.recordAnswer(APP.data, true);
      setTimeout(() => this.nextQuestion(), 1000);
    } else {
      feedback.textContent = '再聽一次！';
      btn.style.opacity = '0.3';
      btn.disabled = true;
      APP.data.progress.listening.total += 1;
      Storage.recordAnswer(APP.data, false);
      container.querySelectorAll('button').forEach(b => {
        if (b.textContent === this.correct) b.style.boxShadow = '0 0 0 3px var(--accent)';
      });
      this.playSound();
    }
  },

  updateScore() {
    document.getElementById('listenScore').textContent = APP.data.progress.listening.correct;
    document.getElementById('listenTotal').textContent = APP.data.progress.listening.total;
  },
};
```

- [ ] **Step 3: Call `Listening.init()` in INIT section**

```javascript
Listening.init();
```

- [ ] **Step 4: Test in browser**

Switch to 聽音 tab. Click speaker → hear a word → pick the matching zhuyin combo. Correct shows star, wrong dims and replays.

- [ ] **Step 5: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git add -A && git commit -m "feat: listening quiz with pinyin mode"
```

---

### Task 6: Diary Feature (Speech Input + Handwriting Canvas)

**Files:**
- Modify: `/Users/jason/Claude_env/zhuyin/index.html`

- [ ] **Step 1: Add diary tab HTML**

Replace `<div class="tab-content" id="tab-diary"></div>` with:

```html
<div class="tab-content" id="tab-diary">
  <!-- Prompt -->
  <div id="diaryPrompt" style="font-size:22px;text-align:center;margin-bottom:16px;"></div>

  <!-- Speech input -->
  <button class="btn-big btn-primary" id="diaryMicBtn" style="font-size:36px;width:80px;height:80px;border-radius:50;">
    🎤
  </button>
  <div id="diaryMicStatus" style="font-size:14px;color:#888;margin:8px 0;">按住說話</div>

  <!-- Recognized text display -->
  <div id="diaryText" style="font-size:28px;min-height:60px;margin:16px 0;padding:12px;background:white;border-radius:12px;width:100%;max-width:350px;text-align:center;box-shadow:var(--shadow);"></div>

  <!-- Handwriting canvas -->
  <div style="position:relative;width:100%;max-width:350px;">
    <canvas id="diaryCanvas" width="350" height="200" style="border:2px dashed #ddd;border-radius:12px;background:white;touch-action:none;width:100%;"></canvas>
    <div style="display:flex;gap:8px;margin-top:8px;justify-content:center;">
      <button class="btn-big" id="diaryUndo" style="font-size:18px;padding:10px 16px;background:#eee;">↩️</button>
      <button class="btn-big" id="diaryClear" style="font-size:18px;padding:10px 16px;background:#eee;">🗑️</button>
      <button class="btn-big btn-success" id="diarySave" style="font-size:18px;padding:10px 16px;">💾 存</button>
      <button class="btn-big" id="diaryReadBack" style="font-size:18px;padding:10px 16px;background:var(--accent);">🔊</button>
    </div>
  </div>

  <!-- Saved diary entries indicator -->
  <div id="diaryStreak" style="margin-top:16px;font-size:16px;"></div>
</div>
```

- [ ] **Step 2: Add diary JS**

```javascript
// === DIARY ===
const Diary = {
  isRecording: false,
  recognition: null,
  strokes: [],
  currentStroke: [],
  ctx: null,

  init() {
    // Prompt
    const prompt = DIARY_PROMPTS[Math.floor(Math.random() * DIARY_PROMPTS.length)];
    document.getElementById('diaryPrompt').textContent = prompt;

    // Streak display
    this.updateStreak();

    // Speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SR();
      this.recognition.lang = 'zh-TW';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join('');
        document.getElementById('diaryText').textContent = text;
      };
      this.recognition.onerror = () => {
        document.getElementById('diaryMicStatus').textContent = '再說一次試試看 🎤';
      };
      this.recognition.onend = () => {
        this.isRecording = false;
        document.getElementById('diaryMicBtn').style.background = '';
        document.getElementById('diaryMicStatus').textContent = '按住說話';
      };
    }

    // Mic button
    const micBtn = document.getElementById('diaryMicBtn');
    micBtn.addEventListener('mousedown', () => this.startRecording());
    micBtn.addEventListener('mouseup', () => this.stopRecording());
    micBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.startRecording(); });
    micBtn.addEventListener('touchend', () => this.stopRecording());

    // Canvas
    const canvas = document.getElementById('diaryCanvas');
    this.ctx = canvas.getContext('2d');
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#2D3436';

    canvas.addEventListener('pointerdown', (e) => this.startDraw(e));
    canvas.addEventListener('pointermove', (e) => this.draw(e));
    canvas.addEventListener('pointerup', () => this.endDraw());
    canvas.addEventListener('pointerleave', () => this.endDraw());

    // Buttons
    document.getElementById('diaryUndo').addEventListener('click', () => this.undo());
    document.getElementById('diaryClear').addEventListener('click', () => this.clear());
    document.getElementById('diarySave').addEventListener('click', () => this.saveDiary());
    document.getElementById('diaryReadBack').addEventListener('click', () => this.readBack());
  },

  startRecording() {
    if (!this.recognition) return;
    this.isRecording = true;
    document.getElementById('diaryMicBtn').style.background = 'var(--primary)';
    document.getElementById('diaryMicStatus').textContent = '正在聽...';
    this.recognition.start();
  },

  stopRecording() {
    if (!this.recognition || !this.isRecording) return;
    this.recognition.stop();
  },

  startDraw(e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.currentStroke = [{ x, y }];
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  },

  draw(e) {
    if (this.currentStroke.length === 0) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.currentStroke.push({ x, y });
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  },

  endDraw() {
    if (this.currentStroke.length > 0) {
      this.strokes.push([...this.currentStroke]);
      this.currentStroke = [];
    }
  },

  undo() {
    this.strokes.pop();
    this.redraw();
  },

  clear() {
    this.strokes = [];
    this.ctx.clearRect(0, 0, 350, 200);
  },

  redraw() {
    this.ctx.clearRect(0, 0, 350, 200);
    this.strokes.forEach(stroke => {
      if (stroke.length === 0) return;
      this.ctx.beginPath();
      this.ctx.moveTo(stroke[0].x, stroke[0].y);
      stroke.forEach(p => this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
    });
  },

  saveDiary() {
    const text = document.getElementById('diaryText').textContent;
    const canvas = document.getElementById('diaryCanvas');
    const drawing = canvas.toDataURL('image/png');
    const today = new Date().toISOString().slice(0, 10);

    const entry = { date: today, text: text || '', drawing };

    // Replace today's entry or push new
    const idx = APP.data.diary.findIndex(d => d.date === today);
    if (idx >= 0) APP.data.diary[idx] = entry;
    else APP.data.diary.push(entry);

    Storage.save(APP.data);
    document.getElementById('diaryStreak').textContent = `💾 已儲存！📔 共 ${APP.data.diary.length} 篇日記`;
  },

  async readBack() {
    const text = document.getElementById('diaryText').textContent;
    if (text) {
      await TTS.speak(text, APP.data.settings.speechRate);
    }
  },

  updateStreak() {
    const streak = APP.data.streak;
    const total = APP.data.diary.length;
    let msg = `📔 ${total} 篇日記`;
    if (streak > 1) msg += ` | 🔥 連續 ${streak} 天！`;
    document.getElementById('diaryStreak').textContent = msg;
  },
};
```

- [ ] **Step 3: Call `Diary.init()` in INIT section**

```javascript
Diary.init();
```

- [ ] **Step 4: Test in browser**

Switch to 日記 tab. See prompt, hold mic → speak → text appears. Draw on canvas. Save. Click 🔊 → hear text read back.

- [ ] **Step 5: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git add -A && git commit -m "feat: diary with speech input, handwriting canvas, and read-back"
```

---

### Task 7: Parent Dashboard

**Files:**
- Modify: `/Users/jason/Claude_env/zhuyin/index.html`

- [ ] **Step 1: Add parent tab HTML**

Replace `<div class="tab-content" id="tab-parent"></div>` with:

```html
<div class="tab-content" id="tab-parent">
  <h2 style="font-size:22px;margin-bottom:16px;">👨‍👩‍👧 家長後台</h2>

  <!-- Today stats -->
  <div class="card" style="margin-bottom:16px;padding:20px;">
    <h3 style="margin-bottom:12px;">今日統計</h3>
    <div style="display:flex;justify-content:space-around;text-align:center;">
      <div><div style="font-size:28px;font-weight:bold;" id="parentQuestions">0</div><div style="font-size:12px;color:#888;">題數</div></div>
      <div><div style="font-size:28px;font-weight:bold;" id="parentAccuracy">0%</div><div style="font-size:12px;color:#888;">正確率</div></div>
      <div><div style="font-size:28px;font-weight:bold;" id="parentStreak">0</div><div style="font-size:12px;color:#888;">連續天數</div></div>
    </div>
  </div>

  <!-- Weak items -->
  <div class="card" style="margin-bottom:16px;padding:20px;">
    <h3 style="margin-bottom:12px;">弱項 Top 5</h3>
    <div id="parentWeak" style="font-size:32px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"></div>
  </div>

  <!-- Diary list -->
  <div class="card" style="margin-bottom:16px;padding:20px;">
    <h3 style="margin-bottom:12px;">日記回顧</h3>
    <div id="parentDiary" style="max-height:200px;overflow-y:auto;text-align:left;"></div>
  </div>

  <!-- Settings -->
  <div class="card" style="padding:20px;">
    <h3 style="margin-bottom:12px;">設定</h3>
    <div style="display:flex;flex-direction:column;gap:12px;text-align:left;">
      <label>每日目標：<input type="number" id="settingGoal" min="5" max="100" style="width:60px;font-size:16px;padding:4px;"> 題</label>
      <label>發音速度：<select id="settingRate" style="font-size:16px;padding:4px;"><option value="0.5">慢</option><option value="0.7">正常</option><option value="1">快</option></select></label>
      <button class="btn-big btn-danger" id="settingReset" style="font-size:16px;padding:10px;">重置所有進度</button>
    </div>
  </div>

  <!-- Back button -->
  <button class="btn-big btn-primary" id="parentBack" style="margin-top:16px;font-size:18px;">返回</button>
</div>
```

- [ ] **Step 2: Add parent JS**

```javascript
// === PARENT DASHBOARD ===
const Parent = {
  init() {
    document.getElementById('parentBack').addEventListener('click', () => {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-flashcard').classList.add('active');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-tab="flashcard"]').classList.add('active');
    });

    document.getElementById('settingReset').addEventListener('click', () => {
      if (confirm('確定要重置所有進度嗎？')) {
        localStorage.removeItem(Storage.KEY);
        location.reload();
      }
    });

    document.getElementById('settingGoal').addEventListener('change', (e) => {
      APP.data.settings.dailyGoal = parseInt(e.target.value) || 20;
      Storage.save(APP.data);
    });

    document.getElementById('settingRate').addEventListener('change', (e) => {
      APP.data.settings.speechRate = parseFloat(e.target.value);
      Storage.save(APP.data);
    });
  },

  refresh() {
    const stats = APP.data.todayStats;
    const today = new Date().toISOString().slice(0, 10);

    document.getElementById('parentQuestions').textContent = stats.date === today ? stats.questions : 0;
    const accuracy = stats.questions > 0 ? Math.round(stats.correct / stats.questions * 100) : 0;
    document.getElementById('parentAccuracy').textContent = `${accuracy}%`;
    document.getElementById('parentStreak').textContent = APP.data.streak;

    // Weak items
    const weakEl = document.getElementById('parentWeak');
    const weaks = APP.data.weakItems.slice(0, 5);
    weakEl.textContent = weaks.length > 0 ? weaks.join(' ') : '沒有弱項 👍';

    // Diary
    const diaryEl = document.getElementById('parentDiary');
    const entries = [...APP.data.diary].reverse().slice(0, 10);
    if (entries.length === 0) {
      diaryEl.textContent = '還沒有日記';
    } else {
      diaryEl.innerHTML = entries.map(e =>
        `<div style="padding:8px 0;border-bottom:1px solid #eee;"><strong>${e.date}</strong>：${e.text || '(手寫)'}</div>`
      ).join('');
    }

    // Settings
    document.getElementById('settingGoal').value = APP.data.settings.dailyGoal;
    document.getElementById('settingRate').value = APP.data.settings.speechRate >= 0.9 ? '1' : APP.data.settings.speechRate >= 0.6 ? '0.7' : '0.5';
  },
};
```

- [ ] **Step 3: Wire up parent refresh when tab opens**

In the settings button long-press handler, add `Parent.refresh();` after showing the tab:

```javascript
// Update both long-press handlers to call Parent.refresh()
settingsBtn.addEventListener('touchstart', () => {
  settingsTimer = setTimeout(() => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-parent').classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    Parent.refresh();
  }, 3000);
});
settingsBtn.addEventListener('mousedown', () => {
  settingsTimer = setTimeout(() => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-parent').classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    Parent.refresh();
  }, 3000);
});
```

- [ ] **Step 4: Call `Parent.init()` in INIT section**

```javascript
Parent.init();
```

- [ ] **Step 5: Test in browser**

Long-press gear 3s → parent panel shows. See stats, weak items, diary list. Change settings. Reset works.

- [ ] **Step 6: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git add -A && git commit -m "feat: parent dashboard with stats, diary review, and settings"
```

---

### Task 8: Polish — Animations, Feedback, and Final Integration

**Files:**
- Modify: `/Users/jason/Claude_env/zhuyin/index.html`

- [ ] **Step 1: Add star animation overlay**

Add to HTML (after `star-counter`, before tab contents):

```html
<div id="starOverlay" style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:100;"></div>
```

- [ ] **Step 2: Add star burst function**

```javascript
// === ANIMATIONS ===
function showStarBurst() {
  const overlay = document.getElementById('starOverlay');
  const star = document.createElement('div');
  star.textContent = '⭐';
  star.style.cssText = `position:absolute;top:50%;left:50%;font-size:60px;transform:translate(-50%,-50%);`;
  star.classList.add('star-pop');
  overlay.appendChild(star);
  setTimeout(() => star.remove(), 700);
}

// Patch Storage.addStar to trigger animation
const origAddStar = Storage.addStar.bind(Storage);
Storage.addStar = function(data) {
  origAddStar(data);
  showStarBurst();
};
```

- [ ] **Step 3: Add feedback messages variety**

```javascript
// === FEEDBACK MESSAGES ===
const PRAISE = ['好棒！','太厲害了！','你好聰明！','繼續加油！','很棒喔！','哇！好厲害！'];
const ENCOURAGE = ['再試一次！','沒關係！','加油！你可以的！','看看這個！'];

function randomPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }
function randomEncourage() { return ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]; }
```

- [ ] **Step 4: Add responsive font sizing for different devices**

Add to CSS:

```css
@media (max-width: 380px) {
  .tab-btn { font-size: 22px; }
  .btn-big { min-height: 50px; font-size: 20px; padding: 12px 24px; }
  #flashcardSymbol { font-size: 90px; }
}
@media (min-width: 768px) {
  .app-container { max-width: 600px; }
}
```

- [ ] **Step 5: Add PWA meta tags for home screen**

Add to `<head>`:

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="注音小天地">
<meta name="theme-color" content="#FFF9F0">
```

- [ ] **Step 6: Full end-to-end test**

Open in browser:
1. Flashcard: flip cards, hear sound, mark ✅/❌, switch modes
2. Pinyin: complete 3-step, hear feedback
3. Listening: play sound, select answer
4. Diary: speak → see text → draw → save → read back
5. Parent: long-press gear → see stats → change settings
6. Stars accumulate across all features
7. Streak shows after using on consecutive days

- [ ] **Step 7: Commit**

```bash
cd /Users/jason/Claude_env/zhuyin && git add -A && git commit -m "feat: polish with animations, PWA meta, and responsive design"
```

---

## Summary

| Task | Feature | Estimated Time |
|------|---------|---------------|
| 1 | Scaffold + tabs + CSS | 5 min |
| 2 | Data layer + TTS | 5 min |
| 3 | Flashcard | 5 min |
| 4 | Pinyin practice | 5 min |
| 5 | Listening quiz | 5 min |
| 6 | Diary | 10 min |
| 7 | Parent dashboard | 5 min |
| 8 | Polish + integration | 5 min |

**Total: ~45 minutes**
