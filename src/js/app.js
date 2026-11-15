// app.js - Master Application Controller for FIELD SHIFT

import { translations } from './translations.js';
import { 
  cropsData, 
  nasaClimateData, 
  rotationPlansData, 
  climateAlertsData, 
  calendarStagesData, 
  sampleLocations 
} from './data.js';
import { appState } from './state.js';
import { SpeechManager } from './speech.js';

class FieldShiftApp {
  constructor() {
    this.speechManager = new SpeechManager(
      () => appState.get(),
      (status) => this.handleSpeechStatus(status)
    );

    this.initElements();
    this.bindEvents();
    this.render();

    // Auto-advance splash screen after 2.2 seconds if first load
    const state = appState.get();
    if (state.currentScreen === 'splash') {
      setTimeout(() => {
        if (state.isSetupComplete) {
          this.navigateTo('home');
        } else {
          this.navigateTo('language');
        }
      }, 2200);
    }
  }

  initElements() {
    this.container = document.querySelector('.app-screen-container');
    this.bottomNav = document.getElementById('bottom-nav');
    this.floatingMic = document.getElementById('floating-voice-btn');
    this.modalBackdrop = document.getElementById('app-modal-backdrop');
    this.modalContent = document.getElementById('modal-dynamic-content');
    this.toastEl = document.getElementById('farmer-toast');
    this.toastText = document.getElementById('toast-message-text');
  }

  t(key) {
    const lang = appState.get().language || 'en';
    const dict = translations[lang] || translations.en;
    return dict[key] || translations.en[key] || key;
  }

  showToast(message, icon = "✅") {
    if (!this.toastEl) return;
    this.toastText.textContent = `${icon} ${message}`;
    this.toastEl.classList.add('show');
    setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2800);
  }

  handleSpeechStatus(status) {
    const listenButtons = document.querySelectorAll('.btn-speaker-listen');
    const voiceMic = document.getElementById('giant-voice-mic');
    const floatMic = document.getElementById('floating-voice-btn');

    if (status.type === 'speaking') {
      listenButtons.forEach(btn => {
        if (status.active) {
          btn.classList.add('speaking');
        } else {
          btn.classList.remove('speaking');
        }
      });
    } else if (status.type === 'listening') {
      if (status.active) {
        if (voiceMic) voiceMic.classList.add('listening');
        if (floatMic) floatMic.classList.add('listening');
      } else {
        if (voiceMic) voiceMic.classList.remove('listening');
        if (floatMic) floatMic.classList.remove('listening');
      }
    } else if (status.type === 'recognized') {
      this.handleFarmerVoiceQuery(status.transcript);
    }
  }

  navigateTo(screenName, skipHistory = false) {
    this.speechManager.stop();
    const current = appState.get().currentScreen;
    if (!skipHistory) {
      appState.set({ previousScreen: current, currentScreen: screenName });
    } else {
      appState.set({ currentScreen: screenName });
    }

    // Scroll container to top
    if (this.container) {
      this.container.scrollTop = 0;
    }

    this.render();

    // Auto speak if enabled
    const state = appState.get();
    if (state.autoSpeak && ['home', 'weather', 'crops', 'alerts'].includes(screenName)) {
      setTimeout(() => {
        const listenBtn = document.querySelector('.screen-view.active .btn-speaker-listen');
        if (listenBtn) listenBtn.click();
      }, 500);
    }
  }

  goBack() {
    const state = appState.get();
    if (state.currentScreen === 'setup') {
      if (state.setupStep > 1) {
        appState.set({ setupStep: state.setupStep - 1 });
        this.render();
        return;
      } else {
        this.navigateTo('welcome');
        return;
      }
    }

    if (state.previousScreen && state.previousScreen !== state.currentScreen) {
      this.navigateTo(state.previousScreen, true);
    } else {
      this.navigateTo('home');
    }
  }

  bindEvents() {
    // Bottom nav tabs
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetScreen = btn.getAttribute('data-screen');
        if (targetScreen) {
          this.navigateTo(targetScreen);
        }
      });
    });

    // Floating mic
    if (this.floatingMic) {
      this.floatingMic.addEventListener('click', () => {
        this.navigateTo('voice');
      });
    }

    // Modal close
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) {
          this.closeModal();
        }
      });
    }

    // Global back button delegation
    document.addEventListener('click', (e) => {
      const backBtn = e.target.closest('.back-btn-header');
      if (backBtn) {
        this.goBack();
      }

      const modalClose = e.target.closest('.modal-close-trigger');
      if (modalClose) {
        this.closeModal();
      }
    });

    // Subscribe to state changes
    appState.subscribe(() => {
      this.updateBottomNavState();
    });
  }

  updateBottomNavState() {
    const state = appState.get();
    const navItems = document.querySelectorAll('.nav-item');
    const showNav = ['home', 'weather', 'crops', 'rotation', 'profile', 'alerts', 'calendar'].includes(state.currentScreen);

    if (this.bottomNav) {
      this.bottomNav.style.display = showNav ? 'flex' : 'none';
    }
    if (this.floatingMic) {
      this.floatingMic.style.display = (showNav && state.currentScreen !== 'voice') ? 'flex' : 'none';
    }

    navItems.forEach(item => {
      const screen = item.getAttribute('data-screen');
      if (screen === state.currentScreen || (screen === 'rotation' && state.currentScreen === 'plans')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  openModal(htmlContent) {
    if (!this.modalBackdrop || !this.modalContent) return;
    this.modalContent.innerHTML = htmlContent;
    this.modalBackdrop.classList.add('open');
  }

  closeModal() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('open');
    }
  }

  /* RENDER PIPELINE */
  render() {
    const state = appState.get();
    const screen = state.currentScreen;

    // Hide all screen views
    const allScreens = document.querySelectorAll('.screen-view');
    allScreens.forEach(el => el.classList.remove('active'));

    // Target screen
    let target = document.getElementById(`screen-${screen}`);
    if (!target) {
      target = document.getElementById('screen-home');
    }
    if (target) {
      target.classList.add('active');
    }

    // Render screen specific content
    switch (screen) {
      case 'splash':
        this.renderSplash();
        break;
      case 'language':
        this.renderLanguageSelection();
        break;
      case 'welcome':
        this.renderWelcome();
        break;
      case 'setup':
        this.renderSetup();
        break;
      case 'home':
        this.renderHome();
        break;
      case 'weather':
        this.renderWeather();
        break;
      case 'crops':
        this.renderCrops();
        break;
      case 'rotation':
        this.renderRotation();
        break;
      case 'alerts':
        this.renderAlerts();
        break;
      case 'calendar':
        this.renderCalendar();
        break;
      case 'voice':
        this.renderVoice();
        break;
      case 'profile':
        this.renderProfile();
        break;
    }

    this.updateBottomNavState();
    this.translateStaticLabels();
  }

  translateStaticLabels() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });
  }

  /* 1. Splash Screen */
  renderSplash() {
    const el = document.getElementById('screen-splash');
    if (!el) return;
    el.innerHTML = `
      <div class="splash-logo-circle">
        <svg class="splash-logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#245C3A" />
          <path d="M25 65C25 65 35 35 65 35C65 35 75 65 25 65Z" fill="#8DBF74" />
          <path d="M50 35V65" stroke="#F8F8F0" stroke-width="4" stroke-linecap="round" />
          <path d="M38 52L50 45L62 52" stroke="#F8F8F0" stroke-width="3" stroke-linecap="round" />
          <circle cx="70" cy="28" r="8" fill="#FBBF24" />
        </svg>
      </div>
      <h1 class="splash-title">FIELD SHIFT</h1>
      <p class="splash-tagline">${this.t('tagline')}</p>
      <div class="splash-loader">
        <div class="splash-dot"></div>
        <div class="splash-dot"></div>
        <div class="splash-dot"></div>
      </div>
    `;
  }

  /* 2. Language Selection Screen */
  renderLanguageSelection() {
    const el = document.getElementById('screen-language');
    if (!el) return;

    const langs = [
      { code: 'kn', native: 'ಕನ್ನಡ', name: 'Kannada', sampleVoice: 'ನಮಸ್ಕಾರ, ಫೀಲ್ಡ್ ಶಿಫ್ಟ್ ಸ್ವಾಗತ!' },
      { code: 'te', native: 'తెలుగు', name: 'Telugu', sampleVoice: 'నమస్కారం, ఫీల్డ్ షిఫ్ట్‌కు స్వాగతం!' },
      { code: 'ta', native: 'தமிழ்', name: 'Tamil', sampleVoice: 'வணக்கம், ஃபீல்ட் ஷிப்ட்டிற்கு நல்வரவு!' },
      { code: 'hi', native: 'हिन्दी', name: 'Hindi', sampleVoice: 'नमस्ते, फील्ड शिफ्ट में आपका स्वागत है!' },
      { code: 'en', native: 'English', name: 'English', sampleVoice: 'Welcome to Field Shift!' }
    ];

    const currentLang = appState.get().language;

    el.innerHTML = `
      <div class="lang-screen-content">
        <div class="screen-header-block" style="margin-top: 20px;">
          <div style="font-size: 38px; margin-bottom: 8px;">🌐</div>
          <h2 class="screen-big-heading">Choose Your Language</h2>
          <p class="screen-sub-heading">ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ / अपनी भाषा चुनें</p>
        </div>

        <div class="language-grid">
          ${langs.map(l => `
            <div class="lang-card-button ${currentLang === l.code ? 'selected' : ''}" data-lang="${l.code}">
              <div class="lang-info">
                <span class="lang-native-name">${l.native}</span>
                <span class="lang-english-name">${l.name}</span>
              </div>
              <button class="lang-audio-trigger" data-sample="${l.sampleVoice}" data-lcode="${l.code}" title="Listen">
                🔊
              </button>
            </div>
          `).join('')}
        </div>

        <button id="btn-lang-continue" class="btn-primary-big" style="margin-top: auto;">
          <span>${this.t('continueBtn')}</span> ➔
        </button>
      </div>
    `;

    // Bind lang selection
    el.querySelectorAll('.lang-card-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.lang-audio-trigger')) return;
        const selected = btn.getAttribute('data-lang');
        appState.set({ language: selected });
        this.renderLanguageSelection();
      });
    });

    // Bind audio sample
    el.querySelectorAll('.lang-audio-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sample = btn.getAttribute('data-sample');
        const lcode = btn.getAttribute('data-lcode');
        appState.set({ language: lcode });
        this.speechManager.speak(sample);
      });
    });

    // Continue button
    const contBtn = el.querySelector('#btn-lang-continue');
    if (contBtn) {
      contBtn.addEventListener('click', () => {
        this.navigateTo('welcome');
      });
    }
  }

  /* 3. Welcome Screen */
  renderWelcome() {
    const el = document.getElementById('screen-welcome');
    if (!el) return;

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('appName')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="welcome-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div style="padding: 20px 18px; display: flex; flex-direction: column; flex: 1;">
        <div class="welcome-hero-card">
          <div class="farmer-illustration-art">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <circle cx="50" cy="50" r="45" fill="#E8F5E9" />
              <!-- Farmer with turban & crop -->
              <circle cx="50" cy="42" r="16" fill="#D97706" />
              <path d="M34 32C34 24 66 24 66 32C66 40 34 40 34 32Z" fill="#245C3A" />
              <circle cx="50" cy="30" r="6" fill="#FBBF24" />
              <path d="M26 80C26 62 74 62 74 80" fill="#245C3A" />
              <path d="M68 55L78 40M78 40L72 38M78 40L82 45" stroke="#15803D" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
          <h2 class="screen-big-heading">${this.t('welcomeTitle')}</h2>
          <p class="screen-sub-heading" style="margin-top: 6px;">${this.t('welcomeSubtitle')}</p>
        </div>

        <div class="welcome-features-list">
          <div class="welcome-feature-item">
            <div class="feature-item-icon">🌾</div>
            <div>
              <strong style="color: var(--color-primary-dark); font-size: 14px;">${this.t('cardNextSeason')}</strong>
              <div style="font-size: 12px; color: var(--color-text-muted);">${this.t('cardNextSeasonSub')}</div>
            </div>
          </div>

          <div class="welcome-feature-item">
            <div class="feature-item-icon">🛰️</div>
            <div>
              <strong style="color: var(--color-primary-dark); font-size: 14px;">NASA Climate Observations</strong>
              <div style="font-size: 12px; color: var(--color-text-muted);">${this.t('cardWeatherSub')}</div>
            </div>
          </div>

          <div class="welcome-feature-item">
            <div class="feature-item-icon">🔄</div>
            <div>
              <strong style="color: var(--color-primary-dark); font-size: 14px;">${this.t('cardCropRotation')}</strong>
              <div style="font-size: 12px; color: var(--color-text-muted);">${this.t('cardCropRotationSub')}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: auto; padding-top: 10px;">
          <button id="welcome-start-btn" class="btn-primary-big">
            <span>${this.t('startBtn')}</span> ➔
          </button>
        </div>
      </div>
    `;

    // Listen button reads welcome aloud
    const listenBtn = el.querySelector('#welcome-listen-btn');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        const text = `${this.t('welcomeTitle')} ${this.t('welcomeSubtitle')}`;
        this.speechManager.speak(text);
      });
    }

    const startBtn = el.querySelector('#welcome-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        appState.set({ setupStep: 1 });
        this.navigateTo('setup');
      });
    }
  }

  /* 4. Guided Setup Wizard (7 Steps, 1 per view) */
  renderSetup() {
    const el = document.getElementById('screen-setup');
    if (!el) return;

    const state = appState.get();
    const step = state.setupStep || 1;
    const totalSteps = 7;
    const progressPercent = (step / totalSteps) * 100;

    let stepHtml = '';
    let stepTitle = '';
    let stepSubtitle = '';

    switch (step) {
      case 1: // Farmer Name
        stepTitle = this.t('q1Title');
        stepSubtitle = this.t('q1Sub');
        stepHtml = `
          <div style="margin: 24px 0;">
            <input type="text" id="setup-farmer-name" value="${state.farmer.name || ''}" 
                   placeholder="${this.t('q1Placeholder')}" 
                   style="width: 100%; padding: 16px 18px; border: 2px solid var(--color-border); border-radius: var(--radius-md); font-size: 17px; font-weight: 600; outline: none; background: #FFF;" />
            <button id="setup-skip-name" style="background: none; border: none; color: var(--color-text-muted); font-size: 13px; text-decoration: underline; margin-top: 14px; cursor: pointer;">
              ${this.t('q1Skip')}
            </button>
          </div>
        `;
        break;

      case 2: // Location
        stepTitle = this.t('q2Title');
        stepSubtitle = this.t('q2Sub');
        stepHtml = `
          <div style="margin: 20px 0;">
            <button id="btn-detect-gps" class="btn-primary-big" style="background-color: #0284C7; margin-bottom: 16px;">
              📍 <span>${this.t('gpsLocateBtn')}</span>
            </button>
            <div id="gps-status-box" style="padding: 10px 14px; background: #E0F2FE; color: #0369A1; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; margin-bottom: 16px;">
              ✅ ${this.t('gpsDetected')}
            </div>
            <label style="font-size: 13px; font-weight: 700; color: var(--color-text-muted); margin-bottom: 6px; display: block;">
              ${this.t('orManualVillage')}
            </label>
            <select id="setup-location-select" style="width: 100%; padding: 14px; border: 2px solid var(--color-border); border-radius: var(--radius-md); font-size: 15px; font-weight: 600; background: #FFF;">
              ${sampleLocations.map(loc => `
                <option value="${loc.name}" ${state.farmer.village === loc.name ? 'selected' : ''}>${loc.name}</option>
              `).join('')}
            </select>
          </div>
        `;
        break;

      case 3: // Land Size
        stepTitle = this.t('q3Title');
        stepSubtitle = this.t('q3Sub');
        const sizes = [
          { key: 'sizeOpt1', icon: '🏡', title: this.t('sizeOpt1'), desc: this.t('sizeOpt1Desc') },
          { key: 'sizeOpt2', icon: '🌾', title: this.t('sizeOpt2'), desc: this.t('sizeOpt2Desc') },
          { key: 'sizeOpt3', icon: '🚜', title: this.t('sizeOpt3'), desc: this.t('sizeOpt3Desc') },
          { key: 'sizeOpt4', icon: '🏞️', title: this.t('sizeOpt4'), desc: this.t('sizeOpt4Desc') }
        ];
        stepHtml = `
          <div class="setup-options-grid">
            ${sizes.map(opt => `
              <div class="setup-choice-card ${state.farmer.landSize === opt.key ? 'selected' : ''}" data-choice-key="${opt.key}">
                <div class="choice-icon-wrap">${opt.icon}</div>
                <div>
                  <div class="choice-title">${opt.title}</div>
                  <div class="choice-desc">${opt.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 4: // Soil Type
        stepTitle = this.t('q4Title');
        stepSubtitle = this.t('q4Sub');
        const soils = [
          { key: 'soilRed', icon: '🧱', title: this.t('soilRed'), desc: this.t('soilRedDesc') },
          { key: 'soilBlack', icon: '🌑', title: this.t('soilBlack'), desc: this.t('soilBlackDesc') },
          { key: 'soilSandy', icon: '🏖️', title: this.t('soilSandy'), desc: this.t('soilSandyDesc') },
          { key: 'soilOther', icon: '🪴', title: this.t('soilOther'), desc: this.t('soilOtherDesc') },
          { key: 'soilDontKnow', icon: '❓', title: this.t('soilDontKnow'), desc: this.t('soilDontKnowDesc') }
        ];
        stepHtml = `
          <div class="setup-options-grid">
            ${soils.map(opt => `
              <div class="setup-choice-card ${state.farmer.soilType === opt.key ? 'selected' : ''}" data-choice-key="${opt.key}">
                <div class="choice-icon-wrap">${opt.icon}</div>
                <div>
                  <div class="choice-title">${opt.title}</div>
                  <div class="choice-desc">${opt.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 5: // Water Source
        stepTitle = this.t('q5Title');
        stepSubtitle = this.t('q5Sub');
        const waterSources = [
          { key: 'waterRain', icon: '🌧️', title: this.t('waterRain'), desc: this.t('waterRainDesc') },
          { key: 'waterBorewell', icon: '💧', title: this.t('waterBorewell'), desc: this.t('waterBorewellDesc') },
          { key: 'waterCanal', icon: '🌊', title: this.t('waterCanal'), desc: this.t('waterCanalDesc') },
          { key: 'waterDrip', icon: '🚿', title: this.t('waterDrip'), desc: this.t('waterDripDesc') },
          { key: 'waterOther', icon: '⛲', title: this.t('waterOther'), desc: this.t('waterOtherDesc') }
        ];
        stepHtml = `
          <div class="setup-options-grid">
            ${waterSources.map(opt => `
              <div class="setup-choice-card ${state.farmer.waterSource === opt.key ? 'selected' : ''}" data-choice-key="${opt.key}">
                <div class="choice-icon-wrap">${opt.icon}</div>
                <div>
                  <div class="choice-title">${opt.title}</div>
                  <div class="choice-desc">${opt.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 6: // Previous Crop
        stepTitle = this.t('q6Title');
        stepSubtitle = this.t('q6Sub');
        const prevCrops = [
          { key: 'paddy', name: 'Paddy / Rice (ಭತ್ತ / धान)', icon: '🌾' },
          { key: 'ragi', name: 'Ragi (ರಾಗಿ / रागी)', icon: '🥣' },
          { key: 'maize', name: 'Maize (ಮೆಕ್ಕೆಜೋಳ / मक्का)', icon: '🌽' },
          { key: 'groundnut', name: 'Groundnut (ಶೇಂಗಾ / मूंगफली)', icon: '🥜' },
          { key: 'cotton', name: 'Cotton (ಹತ್ತಿ / कपास)', icon: '☁️' },
          { key: 'pulses', name: 'Pulses / Dal (ದ್ವಿದಳ ಧಾನ್ಯ / दाल)', icon: '🌱' },
          { key: 'tomato', name: 'Tomato / Veg (ಟೊಮೇಟೊ / टमाटर)', icon: '🍅' }
        ];
        stepHtml = `
          <div class="setup-options-grid">
            ${prevCrops.map(opt => `
              <div class="setup-choice-card ${state.farmer.previousCrop === opt.key ? 'selected' : ''}" data-choice-key="${opt.key}">
                <div class="choice-icon-wrap">${opt.icon}</div>
                <div>
                  <div class="choice-title">${opt.name}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 7: // Farmer Preference / Goal
        stepTitle = this.t('q7Title');
        stepSubtitle = this.t('q7Sub');
        const goals = [
          { key: 'goalSoil', icon: '🌱', title: this.t('goalSoil') },
          { key: 'goalWater', icon: '💧', title: this.t('goalWater') },
          { key: 'goalCost', icon: '🪙', title: this.t('goalCost') },
          { key: 'goalDuration', icon: '⏱️', title: this.t('goalDuration') },
          { key: 'goalRisk', icon: '🛡️', title: this.t('goalRisk') }
        ];
        stepHtml = `
          <div class="setup-options-grid">
            ${goals.map(opt => `
              <div class="setup-choice-card ${state.farmer.goal === opt.key ? 'selected' : ''}" data-choice-key="${opt.key}">
                <div class="choice-icon-wrap">${opt.icon}</div>
                <div>
                  <div class="choice-title">${opt.title}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;
    }

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('setupTitle')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="setup-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div class="setup-progress-bar-container">
        <div class="setup-progress-fill" style="width: ${progressPercent}%;"></div>
      </div>

      <div class="setup-step-box">
        <div class="step-indicator-pill">
          ${this.t('step')} ${step} ${this.t('of')} ${totalSteps}
        </div>

        <h3 class="screen-big-heading">${stepTitle}</h3>
        <p class="screen-sub-heading">${stepSubtitle}</p>

        ${stepHtml}

        <div class="setup-action-footer">
          <button id="setup-prev-btn" class="btn-secondary-big">
            ← ${this.t('backBtn')}
          </button>
          <button id="setup-next-btn" class="btn-primary-big">
            ${step === totalSteps ? this.t('finishBtn') : this.t('nextBtn')} ➔
          </button>
        </div>
      </div>
    `;

    // Listen button reads current step title
    const listenBtn = el.querySelector('#setup-listen-btn');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        this.speechManager.speak(`${stepTitle}. ${stepSubtitle}`);
      });
    }

    // Step selection choice cards
    el.querySelectorAll('.setup-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-choice-key');
        const farmer = { ...state.farmer };
        if (step === 3) farmer.landSize = key;
        if (step === 4) farmer.soilType = key;
        if (step === 5) farmer.waterSource = key;
        if (step === 6) farmer.previousCrop = key;
        if (step === 7) farmer.goal = key;

        appState.set({ farmer });
        el.querySelectorAll('.setup-choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    // Step 1 input
    const nameInput = el.querySelector('#setup-farmer-name');
    const skipName = el.querySelector('#setup-skip-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        const farmer = { ...state.farmer, name: e.target.value };
        appState.set({ farmer });
      });
    }
    if (skipName) {
      skipName.addEventListener('click', () => {
        appState.set({ setupStep: step + 1 });
        this.renderSetup();
      });
    }

    // Step 2 GPS
    const gpsBtn = el.querySelector('#btn-detect-gps');
    const locSelect = el.querySelector('#setup-location-select');
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        this.speechManager.speak(this.t('gpsDetected'));
        this.showToast(this.t('gpsDetected'), "📍");
      });
    }
    if (locSelect) {
      locSelect.addEventListener('change', (e) => {
        const farmer = { ...state.farmer, village: e.target.value };
        appState.set({ farmer });
      });
    }

    // Navigation buttons
    const prevBtn = el.querySelector('#setup-prev-btn');
    const nextBtn = el.querySelector('#setup-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.goBack();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (step < totalSteps) {
          appState.set({ setupStep: step + 1 });
          this.renderSetup();
        } else {
          appState.set({ isSetupComplete: true });
          this.showToast("Farm setup completed!", "🌾");
          this.navigateTo('home');
        }
      });
    }
  }

  /* 5. Home Dashboard */
  renderHome() {
    const el = document.getElementById('screen-home');
    if (!el) return;

    const state = appState.get();
    const farmer = state.farmer;

    el.innerHTML = `
      <div class="home-header-welcome">
        <div class="home-user-row">
          <div>
            <div style="font-size: 13px; opacity: 0.85;">${this.t('greeting')}</div>
            <div class="home-greeting-text">${farmer.name || 'Farmer Friend'}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="icon-btn-header" id="home-help-btn" title="Help">❓</button>
            <button class="btn-speaker-listen" id="home-listen-btn" style="background: rgba(255,255,255,0.2); color: #FFF; border-color: rgba(255,255,255,0.4);">
              🔊 ${this.t('listenBtn')}
            </button>
          </div>
        </div>

        <div class="home-weather-pill">
          <div class="home-village-badge">
            📍 ${farmer.village || 'Mandya, Karnataka'}
          </div>
          <div style="font-size: 13px; font-weight: 700;">
            ${this.t('weatherSummaryPill')}
          </div>
        </div>
      </div>

      <!-- Urgent Alert Card -->
      <div class="alert-banner-card alert-banner-warning interactive" id="home-alert-trigger">
        <div style="font-size: 26px;">⚠️</div>
        <div style="flex: 1;">
          <div style="font-weight: 800; font-size: 14px;">${this.t('urgentAlertTitle')}</div>
          <div style="font-size: 12px; margin-top: 2px;">${this.t('urgentAlertText')}</div>
        </div>
        <div style="font-weight: 700; font-size: 16px;">➔</div>
      </div>

      <!-- Main Section: 4 Big Feature Cards -->
      <div class="four-cards-grid">
        <div class="big-dashboard-card" id="card-action-crops">
          <div class="card-top-icon card-icon-green">🌱</div>
          <div>
            <div class="dashboard-card-title">${this.t('cardMyCrops')}</div>
            <div class="dashboard-card-sub">${this.t('cardMyCropsSub')}</div>
          </div>
        </div>

        <div class="big-dashboard-card" id="card-action-weather">
          <div class="card-top-icon card-icon-blue">🌦️</div>
          <div>
            <div class="dashboard-card-title">${this.t('cardWeather')}</div>
            <div class="dashboard-card-sub">${this.t('cardWeatherSub')}</div>
          </div>
        </div>

        <div class="big-dashboard-card" id="card-action-nextseason">
          <div class="card-top-icon card-icon-orange">🌾</div>
          <div>
            <div class="dashboard-card-title">${this.t('cardNextSeason')}</div>
            <div class="dashboard-card-sub">${this.t('cardNextSeasonSub')}</div>
          </div>
        </div>

        <div class="big-dashboard-card" id="card-action-rotation">
          <div class="card-top-icon card-icon-purple">🔄</div>
          <div>
            <div class="dashboard-card-title">${this.t('cardCropRotation')}</div>
            <div class="dashboard-card-sub">${this.t('cardCropRotationSub')}</div>
          </div>
        </div>
      </div>

      <!-- Quick Access: Saved Crop Plans -->
      <div style="padding: 0 16px; margin-bottom: 20px;">
        <div class="farmer-card interactive" id="home-quick-plan-card" style="border-left: 5px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--color-primary);">${this.t('quickPlansTitle')}</span>
            <span style="font-size: 12px; background: #DCFCE7; color: #15803D; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full);">${this.t('activePlan')}</span>
          </div>
          <div style="font-size: 16px; font-weight: 800; color: var(--color-primary-dark);">
            ${rotationPlansData.planA.title[state.language] || rotationPlansData.planA.title.en}
          </div>
          <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">
            ${rotationPlansData.planA.tagline[state.language] || rotationPlansData.planA.tagline.en}
          </div>
        </div>
      </div>
    `;

    // Bind cards
    el.querySelector('#card-action-crops').addEventListener('click', () => this.navigateTo('calendar'));
    el.querySelector('#card-action-weather').addEventListener('click', () => this.navigateTo('weather'));
    el.querySelector('#card-action-nextseason').addEventListener('click', () => this.navigateTo('crops'));
    el.querySelector('#card-action-rotation').addEventListener('click', () => this.navigateTo('rotation'));
    el.querySelector('#home-alert-trigger').addEventListener('click', () => this.navigateTo('alerts'));
    el.querySelector('#home-quick-plan-card').addEventListener('click', () => this.navigateTo('rotation'));

    // Listen audio
    el.querySelector('#home-listen-btn').addEventListener('click', () => {
      const text = `${this.t('greeting')} ${farmer.name || ''}. ${this.t('urgentAlertTitle')}: ${this.t('urgentAlertText')}`;
      this.speechManager.speak(text);
    });

    el.querySelector('#home-help-btn').addEventListener('click', () => {
      this.openModal(`
        <div class="modal-handle-bar"></div>
        <h3 class="screen-big-heading">👨‍🌾 ${this.t('helpBtn')} & Support</h3>
        <p style="font-size: 14px; color: var(--color-text-muted); margin: 8px 0 16px 0;">
          Field Shift is designed to help farmers plan crops safely using NASA satellite data and sustainable crop rotation.
        </p>
        <div style="background: var(--color-secondary-pale); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
          <strong>📞 Kisan Call Center Helpline:</strong>
          <div style="font-size: 18px; font-weight: 800; color: var(--color-primary); margin-top: 4px;">1551 (Toll-Free)</div>
          <div style="font-size: 12px; color: var(--color-text-muted);">Available in Kannada, Telugu, Tamil, Hindi, and English.</div>
        </div>
        <button class="btn-primary-big modal-close-trigger">Close</button>
      `);
    });
  }

  /* 6. Weather & Climate Dashboard */
  renderWeather() {
    const el = document.getElementById('screen-weather');
    if (!el) return;

    const data = nasaClimateData;
    const lang = appState.get().language;

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('cardWeather')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="weather-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div style="padding: 16px;">
        <div class="weather-main-display">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 12px; font-weight: 700; color: #0369A1;">OBSERVED CLIMATE DATA</span>
              <h2 style="font-size: 28px; font-weight: 900; color: var(--color-primary-dark); margin: 2px 0;">
                ${data.currentObserved.tempMax}°C
              </h2>
              <div style="font-size: 13px; color: var(--color-text-muted);">
                Min: ${data.currentObserved.tempMin}°C • Mean: ${data.currentObserved.tempMean}°C
              </div>
            </div>
            <div style="font-size: 54px;">☀️</div>
          </div>

          <div class="weather-metric-grid">
            <div class="weather-metric-item">
              <div class="metric-label">☀️ ${this.t('radiationLabel')}</div>
              <div class="metric-value">${data.currentObserved.dailyRadiation} <span style="font-size: 12px; font-weight: 500;">MJ/m²/d</span></div>
            </div>
            <div class="weather-metric-item">
              <div class="metric-label">💧 ${this.t('soilMoistureLabel')}</div>
              <div class="metric-value">22% <span style="font-size: 11px; font-weight: 600; color: #15803D;">Adequate</span></div>
            </div>
          </div>
          <div style="font-size: 11px; color: #0369A1; margin-top: 8px;">
            ℹ️ ${data.currentObserved.moistureStatus}
          </div>
        </div>

        <!-- Historical Rainfall Trends -->
        <div class="farmer-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 15px; color: var(--color-primary-dark);">${this.t('rainfallTrends')}</strong>
            <span style="font-size: 11px; background: var(--color-secondary-pale); padding: 3px 8px; border-radius: var(--radius-full); font-weight: 700;">10-Year vs Recent</span>
          </div>

          <div class="historical-bar-chart">
            ${data.historicalTrends.map(item => `
              <div class="chart-bar-group">
                <div class="chart-bar-pillar" style="height: ${Math.min(item.rainfall10YrAvg * 0.65, 80)}px;" title="10-Yr Avg: ${item.rainfall10YrAvg}mm"></div>
                <span class="chart-bar-month">${item.month}</span>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: center; gap: 16px; font-size: 11px; color: var(--color-text-muted); margin-top: 6px;">
            <span>■ Blue Bar: 10-Year Satellite Precipitation Normal (NASA GPM)</span>
          </div>
        </div>

        <!-- Seasonal Outlook -->
        <div class="farmer-card" style="border-left: 5px solid var(--color-secondary);">
          <strong style="font-size: 15px; color: var(--color-primary-dark);">${this.t('seasonalOutlook')}</strong>
          <div style="font-size: 13px; margin: 8px 0;">
            <strong>${data.seasonalOutlook.season}:</strong> ${data.seasonalOutlook.rainfallAnomaly}
          </div>
          <div style="font-size: 12px; color: var(--color-text-muted);">
            • ${data.seasonalOutlook.soilMoistureTrend}<br/>
            • ${data.seasonalOutlook.thermalRegime}
          </div>
        </div>

        <!-- Mandatory NASA Source & Disclaimer Box -->
        <div style="background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: var(--radius-md); padding: 14px; margin-top: 10px; font-size: 12px; color: #4B5563;">
          <div style="font-weight: 700; color: #1F2937; margin-bottom: 4px;">📡 ${this.t('dataSourceNotice')}</div>
          <div>• <strong>POWER:</strong> ${data.station.powerSource} (${data.station.retrievalDate})</div>
          <div>• <strong>GPM IMERG:</strong> ${data.station.gpmSource} (${data.station.retrievalDate})</div>
          <p style="margin-top: 8px; font-style: italic; color: #6B7280;">
            ${this.t('nasaDisclaimer')}
          </p>
        </div>
      </div>
    `;

    el.querySelector('#weather-listen-btn').addEventListener('click', () => {
      const summary = `${this.t('weatherTitle')}. Temperature is ${data.currentObserved.tempMax} degrees Celsius. ${data.seasonalOutlook.rainfallAnomaly}. ${this.t('nasaDisclaimer')}`;
      this.speechManager.speak(summary);
    });
  }

  /* 7. AI Crop Recommendations */
  renderCrops() {
    const el = document.getElementById('screen-crops');
    if (!el) return;

    const state = appState.get();
    const lang = state.language;

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('cropRecTitle')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="crops-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div style="padding: 14px 16px 0 16px;">
        <p style="font-size: 13px; color: var(--color-text-muted);">${this.t('cropRecSubtitle')}</p>
        <div style="background: #FEF3C7; color: #92400E; padding: 8px 12px; border-radius: var(--radius-sm); font-size: 11px; margin-top: 8px;">
          ⚖️ ${this.t('noFakePercentNotice')}
        </div>
      </div>

      <div class="crop-card-container">
        ${cropsData.slice(0, 3).map(crop => `
          <div class="crop-card-item">
            <img src="${crop.image}" class="crop-card-photo" alt="${crop.name.en}" loading="lazy" />
            <div class="crop-card-body">
              <div class="crop-title-row">
                <div>
                  <div class="crop-main-name">${crop.name[lang] || crop.name.en}</div>
                  <div style="font-size: 12px; color: var(--color-text-muted); font-style: italic;">${crop.scientificName}</div>
                </div>
                <span class="suitability-badge ${crop.suitability === 'suitabilityHigh' ? 'badge-high' : 'badge-moderate'}">
                  ★ ${this.t(crop.suitability)}
                </span>
              </div>

              <div class="crop-quick-meta">
                <span class="meta-chip">💧 ${this.t(crop.waterReq)}</span>
                <span class="meta-chip">⏱️ ${crop.duration}</span>
                <span class="meta-chip">📅 ${crop.sowingWindow[lang] || crop.sowingWindow.en}</span>
              </div>

              <div style="font-size: 13px; font-weight: 700; color: var(--color-primary-dark); margin-top: 8px;">
                ${this.t('whyRecommended')}
              </div>
              <ul class="crop-card-bullets">
                ${(crop.whyRecommended[lang] || crop.whyRecommended.en).map(b => `<li>${b}</li>`).join('')}
              </ul>

              <div class="crop-risk-box">
                <strong>⚠️ ${this.t('climateRisks')}</strong> ${crop.climateRisks[lang] || crop.climateRisks.en}
              </div>

              <div style="display: flex; gap: 10px; margin-top: 14px;">
                <button class="btn-speaker-listen crop-card-listen-btn" data-crop-id="${crop.id}" style="flex: 1; justify-content: center;">
                  🔊 ${this.t('listenBtn')}
                </button>
                <button class="btn-primary-big crop-view-details-btn" data-crop-id="${crop.id}" style="flex: 2; padding: 10px 14px; font-size: 14px;">
                  ${this.t('viewDetails')} ➔
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Crop Listen Buttons
    el.querySelectorAll('.crop-card-listen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cropId = btn.getAttribute('data-crop-id');
        const crop = cropsData.find(c => c.id === cropId);
        if (crop) {
          const text = `${crop.name[lang] || crop.name.en}. ${this.t(crop.suitability)}. ${crop.whyRecommended[lang] ? crop.whyRecommended[lang][0] : crop.whyRecommended.en[0]}. ${this.t('climateRisks')} ${crop.climateRisks[lang] || crop.climateRisks.en}`;
          this.speechManager.speak(text);
        }
      });
    });

    // View Details Modal
    el.querySelectorAll('.crop-view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cropId = btn.getAttribute('data-crop-id');
        const crop = cropsData.find(c => c.id === cropId);
        if (crop) {
          this.openCropDetailsModal(crop);
        }
      });
    });

    el.querySelector('#crops-listen-btn').addEventListener('click', () => {
      this.speechManager.speak(`${this.t('cropRecTitle')}. Top recommended crops are Finger Millet, Red Gram, and Groundnut.`);
    });
  }

  openCropDetailsModal(crop) {
    const lang = appState.get().language;
    this.openModal(`
      <div class="modal-handle-bar"></div>
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
        <img src="${crop.image}" style="width: 70px; height: 70px; border-radius: var(--radius-md); object-fit: cover;" />
        <div>
          <h3 class="screen-big-heading" style="margin-bottom: 2px;">${crop.name[lang] || crop.name.en}</h3>
          <span style="font-size: 13px; color: var(--color-text-muted); font-style: italic;">${crop.scientificName}</span>
        </div>
      </div>

      <div class="crop-quick-meta" style="margin-bottom: 14px;">
        <span class="meta-chip">💧 ${this.t(crop.waterReq)}</span>
        <span class="meta-chip">⏱️ ${crop.duration}</span>
        <span class="meta-chip">🌾 ${crop.category}</span>
      </div>

      <div style="background: var(--color-secondary-pale); padding: 12px; border-radius: var(--radius-md); margin-bottom: 14px;">
        <strong style="color: var(--color-primary-dark); font-size: 13px;">📅 ${this.t('sowingWindow')}:</strong>
        <div style="font-size: 13px; margin-top: 2px;">${crop.sowingWindow[lang] || crop.sowingWindow.en}</div>
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="color: var(--color-primary-dark); font-size: 14px;">${this.t('whyRecommended')}</strong>
        <ul style="padding-left: 20px; font-size: 13px; margin-top: 6px; line-height: 1.5;">
          ${(crop.whyRecommended[lang] || crop.whyRecommended.en).map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="crop-risk-box" style="margin-bottom: 20px;">
        <strong>⚠️ ${this.t('climateRisks')}</strong>
        <div style="margin-top: 4px;">${crop.climateRisks[lang] || crop.climateRisks.en}</div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn-speaker-listen" id="modal-crop-listen-btn" style="flex: 1; justify-content: center;">
          🔊 ${this.t('listenBtn')}
        </button>
        <button class="btn-primary-big modal-close-trigger" style="flex: 2;">
          Close
        </button>
      </div>
    `);

    const mListenBtn = document.getElementById('modal-crop-listen-btn');
    if (mListenBtn) {
      mListenBtn.addEventListener('click', () => {
        const text = `${crop.name[lang] || crop.name.en}. ${crop.whyRecommended[lang] ? crop.whyRecommended[lang].join('. ') : crop.whyRecommended.en.join('. ')}`;
        this.speechManager.speak(text);
      });
    }
  }

  /* 8. Crop Rotation Planner */
  renderRotation() {
    const el = document.getElementById('screen-rotation');
    if (!el) return;

    const state = appState.get();
    const lang = state.language;
    const activePlanKey = state.activePlanId || 'planA';
    const plan = rotationPlansData[activePlanKey] || rotationPlansData.planA;
    const isPlanSaved = state.savedPlans.includes(activePlanKey);

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('cardCropRotation')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="rotation-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div style="padding: 16px;">
        <h3 class="screen-big-heading">${this.t('rotationTitle')}</h3>
        <p class="screen-sub-heading">${this.t('rotationSubtitle')}</p>

        <!-- Plan Switcher Tabs -->
        <div style="display: flex; gap: 8px; margin: 16px 0;">
          <button class="btn-secondary-big ${activePlanKey === 'planA' ? 'selected-tab' : ''}" id="tab-plan-a" style="${activePlanKey === 'planA' ? 'background: var(--color-primary); color: #FFF; border-color: var(--color-primary);' : ''} flex: 1; padding: 10px 12px; font-size: 13px;">
            Plan A (Legume)
          </button>
          <button class="btn-secondary-big ${activePlanKey === 'planB' ? 'selected-tab' : ''}" id="tab-plan-b" style="${activePlanKey === 'planB' ? 'background: var(--color-primary); color: #FFF; border-color: var(--color-primary);' : ''} flex: 1; padding: 10px 12px; font-size: 13px;">
            Plan B (Millet/Oilseed)
          </button>
        </div>

        <!-- Selected Plan Header Card -->
        <div class="farmer-card" style="border-left: 5px solid var(--color-primary);">
          <div style="font-size: 17px; font-weight: 800; color: var(--color-primary-dark);">
            ${plan.title[lang] || plan.title.en}
          </div>
          <div style="font-size: 13px; color: var(--color-primary); font-weight: 700; margin-top: 4px;">
            ${plan.tagline[lang] || plan.tagline.en}
          </div>
        </div>

        <!-- Multi-Season Visual Timeline -->
        <div class="rotation-timeline">
          ${plan.seasons.map(s => `
            <div class="timeline-step-card">
              <div class="timeline-badge-node">${s.seasonNumber}</div>
              <div class="timeline-info">
                <div class="timeline-season-title">${s.seasonName[lang] || s.seasonName.en} (${s.timing})</div>
                <div class="timeline-crop-name">${s.crop}</div>
                <div class="timeline-benefit">🌱 <strong>Benefit:</strong> ${s.benefit[lang] || s.benefit.en}</div>
                <div style="font-size: 11px; color: #0284C7; margin-top: 2px;">💧 Water: ${s.waterImpact}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Overall Benefits -->
        <div class="farmer-card">
          <strong style="font-size: 14px; color: var(--color-primary-dark);">${this.t('rotationRationale')}</strong>
          <ul style="padding-left: 18px; font-size: 13px; margin-top: 8px; line-height: 1.5;">
            ${(plan.overallBenefits[lang] || plan.overallBenefits.en).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>

        <!-- Action: Save Plan & Compare -->
        <div style="display: flex; gap: 10px; margin-top: 14px;">
          <button id="btn-save-rotation-plan" class="btn-primary-big" style="flex: 1;">
            ${isPlanSaved ? `✅ ${this.t('planSavedStatus')}` : `💾 ${this.t('saveThisPlan')}`}
          </button>
        </div>

        <div style="font-size: 11px; color: var(--color-text-muted); text-align: center; margin-top: 12px; font-style: italic;">
          ${this.t('rotationDisclaimer')}
        </div>
      </div>
    `;

    // Tabs
    el.querySelector('#tab-plan-a').addEventListener('click', () => {
      appState.set({ activePlanId: 'planA' });
      this.renderRotation();
    });
    el.querySelector('#tab-plan-b').addEventListener('click', () => {
      appState.set({ activePlanId: 'planB' });
      this.renderRotation();
    });

    // Save button
    const saveBtn = el.querySelector('#btn-save-rotation-plan');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const saved = [...state.savedPlans];
        if (!saved.includes(activePlanKey)) {
          saved.push(activePlanKey);
        }
        appState.set({ savedPlans: saved });
        this.showToast(this.t('planSaved'), "💾");
        this.renderRotation();
      });
    }

    // Audio button
    el.querySelector('#rotation-listen-btn').addEventListener('click', () => {
      const summary = `${plan.title[lang] || plan.title.en}. ${(plan.overallBenefits[lang] || plan.overallBenefits.en).join('. ')}`;
      this.speechManager.speak(summary);
    });
  }

  /* 9. Climate Alerts */
  renderAlerts() {
    const el = document.getElementById('screen-alerts');
    if (!el) return;

    const lang = appState.get().language;

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('alertsTitle')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="alerts-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div style="padding: 16px;">
        <p style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 14px;">${this.t('alertsSubtitle')}</p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${climateAlertsData.map(alert => `
            <div class="farmer-card" style="border-left: 6px solid ${alert.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; gap: 10px; align-items: center;">
                  <span style="font-size: 26px;">${alert.icon}</span>
                  <div>
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${alert.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'};">
                      ${this.t(alert.severity === 'danger' ? 'severityDanger' : 'severityWarning')}
                    </span>
                    <h4 style="font-size: 16px; font-weight: 800; color: var(--color-primary-dark); margin-top: 2px;">
                      ${alert.title[lang] || alert.title.en}
                    </h4>
                  </div>
                </div>
                <button class="btn-speaker-listen alert-card-listen-btn" data-alert-id="${alert.id}">
                  🔊
                </button>
              </div>

              <div style="font-size: 13px; color: var(--color-text-main); margin: 10px 0; line-height: 1.4;">
                ${alert.explanation[lang] || alert.explanation.en}
              </div>

              <div style="background: ${alert.severity === 'danger' ? '#FEE2E2' : '#FEF3C7'}; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 12px; color: ${alert.severity === 'danger' ? '#991B1B' : '#92400E'};">
                <strong>👉 ${this.t('suggestedAction')}</strong>
                <div style="margin-top: 2px;">${alert.suggestedAction[lang] || alert.suggestedAction.en}</div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--color-text-muted); margin-top: 10px; border-top: 1px solid var(--color-border); padding-top: 8px;">
                <span>🕒 <strong>${this.t('validityPeriod')}</strong> ${alert.validity}</span>
              </div>
              <div style="font-size: 10px; color: #6B7280; margin-top: 2px;">
                📡 ${alert.source}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Listen audio
    el.querySelectorAll('.alert-card-listen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const aId = btn.getAttribute('data-alert-id');
        const alert = climateAlertsData.find(a => a.id === aId);
        if (alert) {
          const text = `${alert.title[lang] || alert.title.en}. ${alert.suggestedAction[lang] || alert.suggestedAction.en}`;
          this.speechManager.speak(text);
        }
      });
    });

    el.querySelector('#alerts-listen-btn').addEventListener('click', () => {
      const summary = climateAlertsData.map(a => `${a.title[lang] || a.title.en}`).join('. ');
      this.speechManager.speak(`${this.t('alertsTitle')}. ${summary}`);
    });
  }

  /* 10. Crop Calendar */
  renderCalendar() {
    const el = document.getElementById('screen-calendar');
    if (!el) return;

    const lang = appState.get().language;
    const remindersOn = appState.get().remindersEnabled;

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('calendarTitle')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="calendar-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div style="padding: 16px 16px 6px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <h3 class="screen-big-heading" style="font-size: 17px; margin-bottom: 2px;">Finger Millet (Ragi) Calendar</h3>
            <p style="font-size: 12px; color: var(--color-text-muted);">${this.t('calendarSubtitle')}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-top: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--color-primary-dark);">🔔 ${this.t('remindersToggle')}</span>
          <input type="checkbox" id="cal-reminders-checkbox" ${remindersOn ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-primary);" />
        </div>
      </div>

      <div class="calendar-stage-list">
        ${calendarStagesData.map(stage => `
          <div class="calendar-stage-card">
            <div class="stage-card-header">
              <span class="stage-title">
                <span>${stage.icon}</span> ${this.t(stage.titleKey)}
              </span>
              <span class="stage-days-tag">${stage.durationLabel}</span>
            </div>
            <ul style="padding-left: 18px; font-size: 13px; color: var(--color-text-main); line-height: 1.4;">
              ${(stage.activities[lang] || stage.activities.en).map(act => `<li>${act}</li>`).join('')}
            </ul>
            <div style="margin-top: 8px; text-align: right;">
              <button class="btn-speaker-listen stage-audio-btn" data-step="${stage.step}" style="font-size: 11px; padding: 4px 10px;">
                🔊 ${this.t('listenBtn')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    el.querySelector('#cal-reminders-checkbox').addEventListener('change', (e) => {
      appState.set({ remindersEnabled: e.target.checked });
      this.showToast(e.target.checked ? "Reminders active" : "Reminders paused", "🔔");
    });

    el.querySelectorAll('.stage-audio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.getAttribute('data-step'), 10);
        const stage = calendarStagesData.find(s => s.step === stepNum);
        if (stage) {
          const text = `${this.t(stage.titleKey)}. ${(stage.activities[lang] || stage.activities.en).join('. ')}`;
          this.speechManager.speak(text);
        }
      });
    });

    el.querySelector('#calendar-listen-btn').addEventListener('click', () => {
      this.speechManager.speak(`${this.t('calendarTitle')}. Finger Millet roadmap from land preparation to harvest.`);
    });
  }

  /* 11. Voice Assistant Screen */
  renderVoice() {
    const el = document.getElementById('screen-voice');
    if (!el) return;

    const state = appState.get();
    const lang = state.language;
    const history = state.voiceChat || [];

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('voiceTitle')}</div>
        </div>
        <div class="header-actions">
          <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 700;">
            🗣️ ${lang.toUpperCase()}
          </div>
        </div>
      </div>

      <div class="voice-assistant-viewport">
        <!-- Conversation area -->
        <div class="voice-chat-history" id="voice-chat-history-box">
          ${history.map(msg => `
            <div class="chat-bubble ${msg.sender === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-farmer'}">
              ${typeof msg.text === 'object' ? (msg.text[lang] || msg.text.en) : msg.text}
            </div>
          `).join('')}
        </div>

        <!-- Suggested Questions -->
        <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark); margin-bottom: 6px;">
          ${this.t('suggestedQueries')}
        </div>
        <div class="suggested-chips-container">
          <button class="suggested-query-chip" data-query-key="sq1">
            🌾 ${this.t('sq1')}
          </button>
          <button class="suggested-query-chip" data-query-key="sq2">
            💧 ${this.t('sq2')}
          </button>
          <button class="suggested-query-chip" data-query-key="sq3">
            🔄 ${this.t('sq3')}
          </button>
          <button class="suggested-query-chip" data-query-key="sq4">
            🌱 ${this.t('sq4')}
          </button>
          <button class="suggested-query-chip" data-query-key="sq5">
            ☀️ ${this.t('sq5')}
          </button>
        </div>

        <!-- Giant Mic & Audio Center -->
        <div class="voice-mic-hero-area">
          <button class="giant-mic-button" id="giant-voice-mic" title="Tap to speak">
            🎙️
          </button>
          <div style="font-size: 14px; font-weight: 800; color: var(--color-primary-dark);" id="voice-mic-status-label">
            ${this.t('tapToSpeak')}
          </div>
          <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 2px;">
            Supports Kannada, Telugu, Tamil, Hindi, English
          </div>

          <!-- Optional Text Input Fallback -->
          <div style="display: flex; gap: 8px; width: 100%; margin-top: 14px;">
            <input type="text" id="voice-text-input" placeholder="${this.t('voicePlaceholder')}" 
                   style="flex: 1; padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 13px; outline: none;" />
            <button id="voice-text-send-btn" class="btn-primary-big" style="width: auto; padding: 10px 16px; font-size: 14px;">
              Send
            </button>
          </div>
        </div>
      </div>
    `;

    // Auto scroll chat to bottom
    const chatBox = el.querySelector('#voice-chat-history-box');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

    // Mic Button
    const giantMic = el.querySelector('#giant-voice-mic');
    const statusLabel = el.querySelector('#voice-mic-status-label');
    if (giantMic) {
      giantMic.addEventListener('click', () => {
        if (this.speechManager.isListening) {
          this.speechManager.stopListening();
          statusLabel.textContent = this.t('tapToSpeak');
        } else {
          statusLabel.textContent = this.t('listeningState');
          const started = this.speechManager.startListening((transcript) => {
            this.handleFarmerVoiceQuery(transcript);
          });
          if (!started) {
            statusLabel.textContent = "Tap a suggested question below";
          }
        }
      });
    }

    // Suggested Queries
    el.querySelectorAll('.suggested-query-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const qKey = chip.getAttribute('data-query-key');
        const questionText = this.t(qKey);
        this.handleFarmerVoiceQuery(questionText);
      });
    });

    // Text input
    const textInput = el.querySelector('#voice-text-input');
    const sendBtn = el.querySelector('#voice-text-send-btn');
    const handleSend = () => {
      const q = textInput.value.trim();
      if (q) {
        textInput.value = '';
        this.handleFarmerVoiceQuery(q);
      }
    };
    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (textInput) {
      textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }
  }

  handleFarmerVoiceQuery(farmerText) {
    const state = appState.get();
    const lang = state.language;

    // Add farmer message
    const updatedChat = [...(state.voiceChat || []), { sender: 'farmer', text: farmerText }];
    appState.set({ voiceChat: updatedChat });
    this.renderVoice();

    // Determine answer
    let answerObj = {
      en: "Finger Millet (Ragi) and Red Gram are the best crops for your farm based on red soil and rainwater conditions.",
      kn: "ನಿಮ್ಮ ಕೆಂಪು ಮಣ್ಣು ಮತ್ತು ಮಳೆ ಆಶ್ರಯಕ್ಕೆ ರಾಗಿ ಮತ್ತು ತೊಗರಿ ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆಗಳು.",
      te: "మీ ఎర్ర నేల మరియు వర్షాధార పరిస్థితులకు రాగులు మరియు కందులు చాలా అనుకూలమైన పంటలు.",
      ta: "உங்கள் செம்மண் மற்றும் மானாவாரி நிலத்திற்கு கேழ்வரகு மற்றும் துவரை மிகவும் உகந்த பயிர்கள்.",
      hi: "आपकी लाल मिट्टी और बारिश पर निर्भरता के अनुसार रागी और अरहर सबसे उत्तम फसलें हैं।"
    };

    const q = farmerText.toLowerCase();

    if (q.includes('water') || q.includes('ನೀರು') || q.includes('నీరు') || q.includes('நீர்') || q.includes('पानी')) {
      answerObj = {
        en: "Finger Millet needs only 300-350 mm water throughout its 110-day lifecycle, which is 60% less than paddy.",
        kn: "ರಾಗಿ ಬೆಳೆಗೆ 110 ದಿನಗಳ ಅವಧಿಗೆ ಕೇವಲ 300-350 ಮಿಮೀ ನೀರು ಸಾಕು, ಇದು ಭತ್ತಕ್ಕಿಂತ ಶೇಕಡಾ 60 ರಷ್ಟು ಕಡಿಮೆ.",
        te: "రాగుల పంటకు 110 రోజులలో కేవలం 300-350 మి.మీ నీరు మాత్రమే అవసరం, ఇది వరి కంటే 60% తక్కువ.",
        ta: "கேழ்வரகுக்கு 110 நாட்களில் 300-350 மிமீ நீரே போதுமானது, இது நெல்லை விட 60% குறைவு.",
        hi: "रागी को 110 दिनों में केवल 300-350 मिमी पानी की आवश्यकता होती है, जो धान से 60% कम है।"
      };
    } else if (q.includes('drought') || q.includes('warning') || q.includes('ಬರ') || q.includes('ಎಚ್ಚರಿಕೆ') || q.includes('కరువు') || q.includes('வறட்சி') || q.includes('सूखा')) {
      answerObj = {
        en: "NASA satellite estimates indicate a moderate dry spell for next 10 days. Mulch topsoil to prevent evaporation.",
        kn: "ನಾಸಾ ಉಪಗ್ರಹ ಮಾಹಿತಿಯ ಪ್ರಕಾರ ಮುಂದಿನ 10 ದಿನ ಮಳೆ ಕೊರತೆ ಇರಲಿದೆ. ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉಳಿಸಲು ಒಣ ಎಲೆಗಳ ಹೊದಿಕೆ ಹಾಕಿ.",
        te: "నాసా ఉపగ్రహ సమాచారం ప్రకారం వచ్చే 10 రోజులు వర్షం తక్కువగా ఉంటుంది. తేమ కాపాడేందుకు ఆకుల కవచం వేయండి.",
        ta: "நாசா கணிப்பின்படி அடுத்த 10 நாட்களுக்கு மழை பற்றாக்குறை இருக்கும். ஈரப்பதம் காக்க மூடாக்கு இடவும்.",
        hi: "नासा उपग्रह के अनुसार अगले 10 दिन बारिश कम होगी। नमी बचाने के लिए सूखी पत्तियों की मल्चिंग करें।"
      };
    } else if (q.includes('after paddy') || q.includes('rotation') || q.includes('ಪರಿವರ್ತನೆ') || q.includes('మార్పిడి') || q.includes('சுழற்சி') || q.includes('चक्र')) {
      answerObj = {
        en: "After cereal crops like paddy, grow pulses like Red Gram or Chickpea to naturally rebuild soil nitrogen.",
        kn: "ಭತ್ತದಂತಹ ಧಾನ್ಯದ ನಂತರ ತೊಗರಿ ಅಥವಾ ಕಡಲೆಯಂತಹ ದ್ವಿದಳ ಧಾನ್ಯ ಬೆಳೆದರೆ ಮಣ್ಣಿಗೆ ಸಾರಜನಕ ಪುನಃ ದೊರೆಯುತ್ತದೆ.",
        te: "వరి తర్వాత కందులు లేదా శనగలు వేస్తే నేలలో నత్రజని పెరిగి ఎరువుల ఖర్చు తగ్గుతుంది.",
        ta: "நெல்லுக்குப் பின் துவரை அல்லது கொண்டைக்கடலை பயிரிட்டால் மண்ணில் தழைச்சத்து அதிகரிக்கும்.",
        hi: "धान के बाद अरहर या चना जैसी दालें लगाने से मिट्टी में प्राकृतिक नाइट्रोजन बढ़ती है।"
      };
    }

    setTimeout(() => {
      const chatWithBot = [...updatedChat, { sender: 'bot', text: answerObj }];
      appState.set({ voiceChat: chatWithBot });
      this.renderVoice();

      // Read bot answer aloud
      const textToSpeak = answerObj[lang] || answerObj.en;
      this.speechManager.speak(textToSpeak);
    }, 600);
  }

  /* 12. Profile and Settings */
  renderProfile() {
    const el = document.getElementById('screen-profile');
    if (!el) return;

    const state = appState.get();
    const farmer = state.farmer;
    const lang = state.language;

    el.innerHTML = `
      <div class="app-top-header">
        <div class="header-left">
          <button class="back-btn-header" title="Back">←</button>
          <div class="header-title">${this.t('profileTitle')}</div>
        </div>
        <div class="header-actions">
          <button class="btn-speaker-listen" id="profile-listen-btn">
            🔊 ${this.t('listenBtn')}
          </button>
        </div>
      </div>

      <div style="padding: 16px;">
        <!-- Farmer Info Card -->
        <div class="farmer-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 15px; color: var(--color-primary-dark);">${this.t('farmerInfo')}</strong>
            <button id="profile-edit-farm-btn" style="background: none; border: none; color: var(--color-primary); font-size: 13px; font-weight: 700; cursor: pointer;">
              ✏️ Edit
            </button>
          </div>
          <div style="font-size: 18px; font-weight: 800;">${farmer.name || 'Ramesh Gowda'}</div>
          <div style="font-size: 13px; color: var(--color-text-muted);">📍 ${farmer.village}</div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; border-top: 1px solid var(--color-border); padding-top: 10px;">
            <div>
              <div style="font-size: 11px; color: var(--color-text-muted);">Land Size:</div>
              <div style="font-size: 13px; font-weight: 700;">${this.t(farmer.landSize)}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--color-text-muted);">Soil Type:</div>
              <div style="font-size: 13px; font-weight: 700;">${this.t(farmer.soilType)}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--color-text-muted);">Water Source:</div>
              <div style="font-size: 13px; font-weight: 700;">${this.t(farmer.waterSource)}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--color-text-muted);">Previous Crop:</div>
              <div style="font-size: 13px; font-weight: 700;">${farmer.previousCrop.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <!-- Saved Plans -->
        <div class="farmer-card">
          <strong style="font-size: 15px; color: var(--color-primary-dark);">${this.t('savedPlansSection')}</strong>
          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
            ${state.savedPlans.map(pid => {
              const p = rotationPlansData[pid];
              return `
                <div style="background: var(--color-secondary-pale); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-secondary);">
                  <div style="font-size: 14px; font-weight: 800; color: var(--color-primary-dark);">${p.title[lang] || p.title.en}</div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">${p.tagline[lang] || p.tagline.en}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Audio & Accessibility Settings -->
        <div class="farmer-card">
          <strong style="font-size: 15px; color: var(--color-primary-dark);">${this.t('audioSettingsSection')}</strong>
          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 600;">${this.t('ttsSpeed')}:</span>
            <select id="profile-speed-select" style="padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 13px; font-weight: 600;">
              <option value="normal" ${state.ttsSpeed === 'normal' ? 'selected' : ''}>${this.t('ttsNormal')}</option>
              <option value="slow" ${state.ttsSpeed === 'slow' ? 'selected' : ''}>${this.t('ttsSlow')}</option>
            </select>
          </div>

          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 600;">${this.t('autoSpeak')}:</span>
            <input type="checkbox" id="profile-autospeak-toggle" ${state.autoSpeak ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-primary);" />
          </div>
        </div>

        <!-- Language Button -->
        <button id="profile-change-lang-btn" class="btn-secondary-big" style="margin-bottom: 12px;">
          🌐 <span>${this.t('changeLang')}</span>
        </button>

        <!-- Helpline -->
        <div style="background: #E8F5E9; border: 1px solid #C8E6C9; padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 14px; text-align: center;">
          <strong style="color: #2E7D32; font-size: 13px;">📞 ${this.t('callKisanHelpline')}</strong>
          <div style="font-size: 12px; color: #388E3C; margin-top: 2px;">Toll-free agricultural support for farmers</div>
        </div>

        <!-- Reset Button -->
        <button id="profile-reset-btn" class="btn-secondary-big" style="color: var(--color-danger); border-color: #FCA5A5; margin-bottom: 24px;">
          ⚠️ ${this.t('logout')}
        </button>
      </div>
    `;

    el.querySelector('#profile-edit-farm-btn').addEventListener('click', () => {
      appState.set({ setupStep: 1 });
      this.navigateTo('setup');
    });

    el.querySelector('#profile-change-lang-btn').addEventListener('click', () => {
      this.navigateTo('language');
    });

    el.querySelector('#profile-speed-select').addEventListener('change', (e) => {
      appState.set({ ttsSpeed: e.target.value });
      this.speechManager.speak("Audio speed adjusted");
    });

    el.querySelector('#profile-autospeak-toggle').addEventListener('change', (e) => {
      appState.set({ autoSpeak: e.target.checked });
      this.showToast(e.target.checked ? "Auto-speak enabled" : "Auto-speak disabled", "🔊");
    });

    el.querySelector('#profile-reset-btn').addEventListener('click', () => {
      if (confirm("Reset all farm details and restart onboarding?")) {
        appState.reset();
        this.navigateTo('language');
      }
    });

    el.querySelector('#profile-listen-btn').addEventListener('click', () => {
      const summary = `Farmer Profile: ${farmer.name}, ${farmer.village}. Land size: ${this.t(farmer.landSize)}. Soil: ${this.t(farmer.soilType)}.`;
      this.speechManager.speak(summary);
    });
  }
}

// Instantiate app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.fieldShiftApp = new FieldShiftApp();

  // Handle device frame toggle button
  const toggleBtn = document.getElementById('btn-toggle-device-mode');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('fullscreen-mode');
      const isFull = document.body.classList.contains('fullscreen-mode');
      toggleBtn.textContent = isFull ? "📱 Switch to Phone Frame" : "🖥️ Full Screen Mode";
    });
  }
});
