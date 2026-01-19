/**
 * AX86 Internationalization (i18n) System
 * Comprehensive multi-language support with JSON translation files
 * Version 2.0 - Enhanced coverage
 */

let currentTranslations = {};
let currentLang = localStorage.getItem('ax86-language') || 'es';

/**
 * Load translations from JSON file
 * Uses XMLHttpRequest for file:// protocol compatibility (local files)
 */
async function loadTranslations(lang) {
    try {
        // Try fetch first (for http/https)
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            const response = await fetch(`translations/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            currentTranslations = await response.json();
            console.log(`[i18n] Loaded translations for: ${lang}`);
            return true;
        }
        
        // Use XMLHttpRequest for file:// protocol (local files)
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `translations/${lang}.json`, true);
            xhr.overrideMimeType('application/json');
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        try {
                            currentTranslations = JSON.parse(xhr.responseText);
                            console.log(`[i18n] Loaded translations for: ${lang}`);
                            resolve(true);
                        } catch (parseError) {
                            console.error(`[i18n] Error parsing translations:`, parseError);
                            reject(parseError);
                        }
                    } else {
                        console.error(`[i18n] Failed to load ${lang}.json: Status ${xhr.status}`);
                        reject(new Error(`Failed to load ${lang}.json`));
                    }
                }
            };
            
            xhr.onerror = function() {
                console.error(`[i18n] Network error loading translations`);
                reject(new Error('Network error'));
            };
            
            xhr.send(null);
        });
    } catch (error) {
        console.error(`[i18n] Error loading translations:`, error);
        return false;
    }
}

/**
 * Get nested translation value by key path
 */
function t(keyPath) {
    const keys = keyPath.split('.');
    let value = currentTranslations;
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return null;
        }
    }
    return value;
}

/**
 * Main language change function - Updates ALL texts on the page
 */
// Language flag and name mapping
const langFlags = {
    'en': { flag: '🇺🇸', name: 'EN', fullName: 'English' },
    'es': { flag: '🇪🇸', name: 'ES', fullName: 'Español' },
    'zh': { flag: '🇨🇳', name: 'ZH', fullName: '中文' },
    'fr': { flag: '🇫🇷', name: 'FR', fullName: 'Français' }
};

function updateLanguageButton(lang) {
    const langData = langFlags[lang] || langFlags['en'];
    
    // Update desktop button
    const desktopFlag = document.getElementById('current-flag-desktop');
    const desktopLang = document.getElementById('current-lang-desktop');
    if (desktopFlag) desktopFlag.textContent = langData.flag;
    if (desktopLang) desktopLang.textContent = langData.name;
    
    // Update mobile button
    const mobileFlag = document.getElementById('current-flag-mobile');
    const mobileLang = document.getElementById('current-lang-mobile');
    if (mobileFlag) mobileFlag.textContent = langData.flag;
    if (mobileLang) mobileLang.textContent = langData.fullName;
    
    console.log(`[i18n] Language button updated to: ${langData.flag} ${langData.name}`);
}

async function changeLanguage(lang) {
    console.log(`[i18n] Changing language to: ${lang}`);
    
    // Preload the new language file
    preloadTranslationFile(lang);
    
    const loaded = await loadTranslations(lang);
    if (!loaded) {
        console.error(`[i18n] Failed to load translations for ${lang}`);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('ax86-language', lang);
    document.documentElement.lang = lang;
    
    // Update the language button display
    updateLanguageButton(lang);
    
    // Update all texts
    updateAllTexts();
    
    console.log(`[i18n] Language changed to: ${lang}`);
}

/**
 * Comprehensive text update function
 */
function updateAllTexts() {
    const tr = currentTranslations;
    if (!tr) return;

    // ===== META =====
    updateMeta(tr);
    
    // ===== NAVIGATION =====
    updateNavigation(tr);
    
    // ===== HERO SECTION =====
    updateHero(tr);
    
    // ===== BUILD AGENT SECTION =====
    updateBuildAgent(tr);
    
    // ===== STEPS SECTION =====
    updateSteps(tr);
    
    // ===== BUSINESS RESULTS =====
    updateBusinessResults(tr);
    
    // ===== CTA SECTIONS =====
    updateCtaSections(tr);
    
    // ===== AI SOFTWARE SECTION =====
    updateAiSoftware(tr);
    
    // ===== TECHNOLOGIES SECTION =====
    updateTechnologies(tr);
    
    // ===== USE CASES SECTION =====
    updateUseCases(tr);
    
    // ===== PROCESS SECTION =====
    updateProcess(tr);
    
    // ===== PRICING SECTION =====
    updatePricing(tr);
    
    // ===== AI CREATION SECTION =====
    updateAiCreation(tr);
    
    // ===== CONTACT SECTION =====
    updateContact(tr);
    
    // ===== FOOTER =====
    updateFooter(tr);
    
    // ===== MODALS =====
    updateModals(tr);
    
    // ===== CTA ELEMENTS (Banner, Sticky Bar, Exit Popup) =====
    updateCtaElements(tr);
    
    // ===== PAGE-SPECIFIC CONTENT =====
    detectAndUpdateCurrentPage(tr);

    console.log('[i18n] All texts updated');
}

// ==================== SECTION UPDATE FUNCTIONS ====================

function updateMeta(tr) {
    if (!tr.meta) return;
    document.title = tr.meta.title || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && tr.meta.description) metaDesc.content = tr.meta.description;
}

function updateNavigation(tr) {
    if (!tr.nav) return;
    
    // Desktop navigation links
    safeUpdate('a[href="index.html"]', tr.nav.home);
    safeUpdate('a[href="#home"]', tr.nav.home);
    
    // Solutions dropdown button text
    const solutionsBtn = document.querySelector('.solutions-dropdown > button');
    if (solutionsBtn) {
        const span = solutionsBtn.querySelector('span');
        if (span) span.textContent = tr.nav.solutions;
    }
    
    // Solutions dropdown content
    const dropdownLinks = document.querySelectorAll('.solutions-dropdown-content a');
    dropdownLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const firstDiv = link.querySelector('div:first-child');
        const secondDiv = link.querySelector('div:last-child');
        
        if (href.includes('ai_assistants')) {
            if (firstDiv) firstDiv.textContent = '🤖 ' + tr.nav.aiAssistants;
            if (secondDiv) secondDiv.textContent = tr.nav.aiAssistantsDesc;
        }
        if (href.includes('mcp_information')) {
            if (firstDiv) firstDiv.textContent = '🔧 ' + tr.nav.mcpTools;
            if (secondDiv) secondDiv.textContent = tr.nav.mcpToolsDesc;
        }
        if (href.includes('enterprise')) {
            if (firstDiv) firstDiv.textContent = '🏢 ' + tr.nav.enterprise;
            if (secondDiv) secondDiv.textContent = tr.nav.enterpriseDesc;
        }
    });
    
    // Other nav links
    safeUpdate('a[href="about.html"]', tr.nav.aboutUs);
    safeUpdate('a[href="#process"]', tr.nav.howWeWork);
    safeUpdate('a[href="#pricing"]', tr.nav.pricing);
    safeUpdate('a[href="#contact"]', tr.nav.contact);
    
    // CTA buttons in nav
    document.querySelectorAll('nav button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('book') || text.includes('consult') || text.includes('咨询') || text.includes('consultation')) {
            btn.textContent = tr.nav.bookConsultation;
        }
    });
    
    // Language button
    document.querySelectorAll('.language-dropdown button span').forEach(el => {
        el.textContent = currentLang.toUpperCase();
    });
    
    // Mobile nav links
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href === 'index.html' || href === '#home') link.textContent = tr.nav.home;
            if (href === '#process') link.textContent = tr.nav.howWeWork;
            if (href === '#pricing') link.textContent = tr.nav.pricing;
            if (href === '#contact') link.textContent = tr.nav.contact;
        });
    }
}

function updateHero(tr) {
    if (!tr.hero) return;
    
    const heroTitle = document.querySelector('#home h1');
    if (heroTitle) {
        heroTitle.innerHTML = tr.hero.title + ' <span style="color: #FFD700; text-shadow: 2px 2px 6px rgba(0,0,0,0.7), 0 0 15px rgba(255,215,0,0.5); font-weight: 700;">' + tr.hero.titleHighlight + '</span>';
    }
    
    safeUpdate('#home .hero-subtitle', tr.hero.subtitle);
    safeUpdate('.hero-subtitle', tr.hero.subtitle);
    
    // Hero CTA buttons
    const heroSection = document.getElementById('home');
    if (heroSection) {
        const buttons = heroSection.querySelectorAll('.hero-cta button, .flex.gap-4 > button');
        if (buttons[0]) buttons[0].textContent = tr.hero.cta1;
        if (buttons[1]) buttons[1].textContent = tr.hero.cta2;
    }
    
    // Demo card buttons
    const demoButtons = document.querySelectorAll('#home .space-x-2 button, #home .gap-2 button');
    if (demoButtons.length >= 2) {
        demoButtons[0].textContent = tr.hero.demoBtn1;
        demoButtons[1].textContent = tr.hero.demoBtn2;
    }
}

function updateBuildAgent(tr) {
    if (!tr.buildAgent) return;
    
    const section = document.getElementById('build-agent');
    if (!section) return;
    
    // Main title and subtitle
    const h1 = section.querySelector('h1');
    if (h1) h1.textContent = tr.buildAgent.title;
    
    const subtitle = section.querySelector('h1 + p');
    if (subtitle) subtitle.textContent = tr.buildAgent.subtitle;
    
    // What is AI Agent
    const h2s = section.querySelectorAll('h2');
    h2s.forEach(h2 => {
        if (h2.textContent.includes('What') || h2.textContent.includes('Qué') || h2.textContent.includes('什么')) {
            h2.textContent = tr.buildAgent.whatIsTitle;
        }
    });
    
    // Feature blocks
    const features = section.querySelectorAll('.flex.items-start.gap-4');
    const featureData = [
        { title: tr.buildAgent.feature1Title, desc: tr.buildAgent.feature1Desc },
        { title: tr.buildAgent.feature2Title, desc: tr.buildAgent.feature2Desc },
        { title: tr.buildAgent.feature3Title, desc: tr.buildAgent.feature3Desc }
    ];
    
    features.forEach((feature, i) => {
        if (featureData[i]) {
            const h3 = feature.querySelector('h3');
            const p = feature.querySelector('p');
            if (h3) h3.textContent = featureData[i].title;
            if (p) p.textContent = featureData[i].desc;
        }
    });
    
    // CTA buttons in section
    section.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('consult') || text.includes('free') || text.includes('gratis') || text.includes('咨询')) {
            btn.textContent = tr.buildAgent.cta1;
        }
        if (text.includes('how') || text.includes('work') || text.includes('cómo')) {
            btn.textContent = tr.buildAgent.cta2;
        }
    });
}

function updateSteps(tr) {
    if (!tr.steps) return;
    
    const section = document.getElementById('agent-steps');
    if (!section) return;
    
    // Title and subtitle
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = tr.steps.title;
    
    const subtitle = section.querySelector('h2 + p');
    if (subtitle) subtitle.textContent = tr.steps.subtitle;
    
    // Step cards
    for (let i = 1; i <= 10; i++) {
        const card = section.querySelector(`.step-card[data-step="${i}"]`);
        if (card) {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            // Get the list items and update only the text spans (not bullet spans)
            const listItems = card.querySelectorAll('ul li');
            
            if (h3 && tr.steps[`step${i}Title`]) h3.textContent = tr.steps[`step${i}Title`];
            if (p && tr.steps[`step${i}Desc`]) p.textContent = tr.steps[`step${i}Desc`];
            
            listItems.forEach((li, idx) => {
                // Get the last span in the li (the text content, not the bullet)
                const spans = li.querySelectorAll('span');
                const textSpan = spans[spans.length - 1];
                const key = `step${i}Item${idx + 1}`;
                if (textSpan && tr.steps[key]) {
                    textSpan.textContent = tr.steps[key];
                }
            });
        }
    }
}

function updateBusinessResults(tr) {
    if (!tr.businessResults) return;
    
    // Find section by content
    document.querySelectorAll('h2').forEach(h2 => {
        if (h2.textContent.includes('Business') || h2.textContent.includes('Negocio') || h2.textContent.includes('业务')) {
            h2.textContent = tr.businessResults.title;
            const subtitle = h2.nextElementSibling;
            if (subtitle && subtitle.tagName === 'P') {
                subtitle.textContent = tr.businessResults.subtitle;
            }
        }
    });
}

function updateCtaSections(tr) {
    if (!tr.ctaSection) return;
    
    // Find CTA sections
    document.querySelectorAll('section').forEach(section => {
        const h2 = section.querySelector('h2');
        if (h2 && (h2.textContent.includes('Ready to') || h2.textContent.includes('Listo') || h2.textContent.includes('准备'))) {
            // Only update if it's a CTA section (short, with buttons)
            const buttons = section.querySelectorAll('button');
            if (buttons.length > 0 && section.querySelectorAll('p').length <= 2) {
                h2.textContent = tr.ctaSection.title;
                const subtitle = section.querySelector('p');
                if (subtitle) subtitle.textContent = tr.ctaSection.subtitle;
            }
        }
    });
}

function updateAiSoftware(tr) {
    if (!tr.aiSoftware) return;
    
    const section = document.getElementById('ai-software');
    if (!section) return;
    
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = tr.aiSoftware.title;
    
    const subtitle = section.querySelector('h2 + p');
    if (subtitle) subtitle.textContent = tr.aiSoftware.subtitle;
    
    // Cards
    const cards = section.querySelectorAll('.grid > div');
    if (cards[0]) {
        const h3 = cards[0].querySelector('h3');
        const p = cards[0].querySelector('p');
        if (h3) h3.textContent = tr.aiSoftware.card1Title;
        if (p) p.textContent = tr.aiSoftware.card1Desc;
    }
    if (cards[1]) {
        const h3 = cards[1].querySelector('h3');
        const p = cards[1].querySelector('p');
        if (h3) h3.textContent = tr.aiSoftware.card2Title;
        if (p) p.textContent = tr.aiSoftware.card2Desc;
    }
}

function updateTechnologies(tr) {
    if (!tr.technologies) return;
    
    const section = document.getElementById('technologies');
    if (!section) return;
    
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = tr.technologies.title;
    
    const subtitle = section.querySelector('h2 + p');
    if (subtitle) subtitle.textContent = tr.technologies.subtitle;
}

function updateUseCases(tr) {
    if (!tr.useCases) return;
    
    const section = document.getElementById('use-cases');
    if (!section) return;
    
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = tr.useCases.title;
    
    const subtitle = section.querySelector('h2 + p');
    if (subtitle) subtitle.textContent = tr.useCases.subtitle;
    
    // Filter buttons
    const filters = section.querySelectorAll('.use-case-filter, [data-filter]');
    filters.forEach(btn => {
        const filter = btn.dataset.filter || btn.getAttribute('data-filter');
        if (filter === 'all') btn.textContent = tr.useCases.filterAll;
        if (filter === 'sales') btn.textContent = '💼 ' + tr.useCases.filterSales;
        if (filter === 'operations') btn.textContent = '⚙️ ' + tr.useCases.filterOperations;
        if (filter === 'finance') btn.textContent = '💰 ' + tr.useCases.filterFinance;
        if (filter === 'hr') btn.textContent = '👥 ' + tr.useCases.filterHR;
    });
    
    // Use case cards
    const cards = section.querySelectorAll('.use-case-card');
    const cardKeys = ['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8', 'card9'];
    cards.forEach((card, i) => {
        const key = cardKeys[i];
        if (key && tr.useCases[key + 'Title']) {
            const h3 = card.querySelector('h3');
            const desc = card.querySelector('p.text-gray-600, p.text-sm');
            const stat = card.querySelector('.stat-badge, span.px-3');
            const tech = card.querySelector('.tech-stack, .text-xs.font-medium');
            
            if (h3) h3.textContent = tr.useCases[key + 'Title'];
            if (desc) desc.textContent = tr.useCases[key + 'Desc'];
            if (stat) stat.textContent = tr.useCases[key + 'Stat'];
            if (tech) tech.textContent = tr.useCases[key + 'Tech'];
        }
    });
    
    // Stats in use cases section
    const statsContainer = section.querySelector('.grid, .flex');
    if (statsContainer) {
        const statLabels = statsContainer.querySelectorAll('.text-sm.text-gray-600, .text-gray-700');
        statLabels.forEach(label => {
            const text = label.textContent.trim();
            if (text.includes('Agents Deployed') || text.includes('Agentes') || text.includes('Agents')) {
                label.textContent = tr.useCases.statAgentsDeployed;
            } else if (text.includes('Tasks Automated') || text.includes('Tareas') || text.includes('Tâches')) {
                label.textContent = tr.useCases.statTasksAutomated;
            } else if (text.includes('Average Time Saved') || text.includes('Tiempo Promedio') || text.includes('Temps Moyen')) {
                label.textContent = tr.useCases.statAvgTimeSaved;
            } else if (text.includes('Deployment Time') || text.includes('Despliegue') || text.includes('Déploiement')) {
                label.textContent = tr.useCases.statAvgDeploymentTime;
            }
        });
    }
    
    // CTA in use cases section
    const ctaSection = section.querySelector('.text-center.mt-16, .text-center.pt-12');
    if (ctaSection) {
        const ctaTitle = ctaSection.querySelector('h3');
        const ctaSubtitle = ctaSection.querySelector('p');
        const ctaButtons = ctaSection.querySelectorAll('button');
        
        if (ctaTitle && tr.useCases.ctaTitle) ctaTitle.textContent = tr.useCases.ctaTitle;
        if (ctaSubtitle && tr.useCases.ctaSubtitle) ctaSubtitle.textContent = tr.useCases.ctaSubtitle;
        
        // Update CTA buttons
        ctaButtons.forEach((btn, idx) => {
            const btnText = btn.textContent.toLowerCase();
            if (btnText.includes('consultation') || btnText.includes('consulta') || btnText.includes('consultation')) {
                btn.textContent = '📅 ' + tr.useCases.ctaBtn1;
            } else if (btnText.includes('process') || btnText.includes('proceso') || btnText.includes('processus')) {
                btn.textContent = tr.useCases.ctaBtn2Process + ' →';
            } else if (btnText.includes('pricing') || btnText.includes('precio') || btnText.includes('tarif')) {
                btn.textContent = tr.useCases.ctaBtn2;
            }
        });
    }
}

function updateProcess(tr) {
    if (!tr.process) return;
    
    const section = document.getElementById('process');
    if (!section) return;
    
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = tr.process.title;
    
    safeUpdate('#process .process-subtitle', tr.process.subtitle);
    safeUpdate('#process h2 + p', tr.process.subtitle);
    
    // Process steps
    const steps = section.querySelectorAll('.process-step');
    for (let i = 0; i < steps.length && i < 5; i++) {
        const step = steps[i];
        const num = i + 1;
        
        const h3 = step.querySelector('h3');
        const timeline = step.querySelector('.timeline, span.text-sm');
        const desc = step.querySelector('p.text-gray-600, p');
        
        if (h3 && tr.process[`step${num}Title`]) h3.textContent = tr.process[`step${num}Title`];
        if (timeline && tr.process[`step${num}Timeline`]) timeline.textContent = tr.process[`step${num}Timeline`];
        if (desc && tr.process[`step${num}Desc`]) desc.textContent = tr.process[`step${num}Desc`];
        
        // Step items
        const items = step.querySelectorAll('li');
        items.forEach((item, idx) => {
            const key = `step${num}Item${idx + 1}`;
            if (tr.process[key]) item.textContent = tr.process[key];
        });
    }
    
    // CTA section in process
    const ctaSection = section.querySelector('.text-center.mt-16, .text-center.pt-12');
    if (ctaSection && tr.process.ctaTitle) {
        const ctaTitle = ctaSection.querySelector('h3');
        const ctaSubtitle = ctaSection.querySelector('p');
        const ctaButtons = ctaSection.querySelectorAll('button');
        
        if (ctaTitle) ctaTitle.textContent = tr.process.ctaTitle;
        if (ctaSubtitle && tr.process.ctaSubtitle) ctaSubtitle.textContent = tr.process.ctaSubtitle;
        
        // Update CTA buttons
        ctaButtons.forEach((btn) => {
            const btnText = btn.textContent.toLowerCase();
            if (btnText.includes('consultation') || btnText.includes('consulta') || btnText.includes('consultation')) {
                btn.textContent = tr.process.ctaBtn1;
            } else if (btnText.includes('pricing') || btnText.includes('precio') || btnText.includes('tarif')) {
                btn.textContent = tr.process.ctaBtn2;
            }
        });
    }
}

function updatePricing(tr) {
    if (!tr.pricing) return;
    
    const section = document.getElementById('pricing');
    if (!section) return;
    
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = tr.pricing.title;
    
    const subtitle = section.querySelector('h2 + p');
    if (subtitle) subtitle.textContent = tr.pricing.subtitle;
    
    // Pricing cards
    const cards = section.querySelectorAll('.pricing-card');
    const planData = [
        { name: tr.pricing.plan1Name, desc: tr.pricing.plan1Desc, price: tr.pricing.plan1Price, period: tr.pricing.plan1Period, cta: tr.pricing.plan1Cta },
        { name: tr.pricing.plan2Name, desc: tr.pricing.plan2Desc, price: tr.pricing.plan2Price, period: tr.pricing.plan2Period, cta: tr.pricing.plan2Cta, badge: tr.pricing.plan2Badge },
        { name: tr.pricing.plan3Name, desc: tr.pricing.plan3Desc, price: tr.pricing.plan3Price, period: tr.pricing.plan3Period, cta: tr.pricing.plan3Cta }
    ];
    
    cards.forEach((card, i) => {
        if (planData[i]) {
            const h3 = card.querySelector('h3');
            const desc = card.querySelector('p.text-gray-600');
            const price = card.querySelector('.price, .text-4xl, .text-5xl');
            const period = card.querySelector('.period, .text-gray-500');
            const cta = card.querySelector('button');
            const badge = card.querySelector('.badge, span.bg-gradient-to-r');
            
            if (h3) h3.textContent = planData[i].name;
            if (desc) desc.textContent = planData[i].desc;
            if (cta) cta.textContent = planData[i].cta;
            if (badge && planData[i].badge) badge.textContent = planData[i].badge;
        }
    });
    
    // Enterprise section
    const enterprise = section.querySelector('[style*="linear-gradient"], .bg-gradient-to-r.from-sapphire');
    if (enterprise) {
        const h3 = enterprise.querySelector('h3');
        const desc = enterprise.querySelector('p.text-xl, p.text-lg');
        const cta = enterprise.querySelector('button');
        const ctaSubtext = enterprise.querySelector('p.text-sm, .text-white\\/80');
        
        if (h3) h3.textContent = tr.pricing.enterpriseTitle;
        if (desc) desc.textContent = tr.pricing.enterpriseDesc;
        if (cta) cta.innerHTML = '📅 ' + tr.pricing.enterpriseCta;
        if (ctaSubtext) ctaSubtext.textContent = tr.pricing.enterpriseCtaSubtext;
    }
}

function updateAiCreation(tr) {
    if (!tr.aiCreation) return;
    
    // Find the AI creation section
    document.querySelectorAll('section').forEach(section => {
        const h2 = section.querySelector('h2');
        if (h2 && (h2.textContent.includes('Created') || h2.textContent.includes('Creamos') || h2.textContent.includes('创建'))) {
            h2.textContent = tr.aiCreation.title;
            const paragraphs = section.querySelectorAll('p');
            if (paragraphs[0]) paragraphs[0].textContent = tr.aiCreation.desc1;
            if (paragraphs[1]) paragraphs[1].textContent = tr.aiCreation.desc2;
            
            const link = section.querySelector('a');
            if (link) link.textContent = tr.aiCreation.cta;
        }
    });
}

function updateContact(tr) {
    if (!tr.contact) return;
    
    const section = document.getElementById('contact');
    if (!section) return;
    
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = tr.contact.title;
    
    const subtitle = section.querySelector('h2 + p');
    if (subtitle) subtitle.textContent = tr.contact.subtitle;
    
    // CTA button
    const cta = section.querySelector('button');
    if (cta) cta.textContent = tr.contact.cta;
    
    // WhatsApp link
    const whatsappLink = section.querySelector('a[href*="whatsapp"], a[href*="wa.me"]');
    if (whatsappLink && tr.contact.ctaWhatsApp) {
        whatsappLink.textContent = tr.contact.ctaWhatsApp;
    }
    
    // Disclaimer text
    const disclaimer = section.querySelector('p.text-sm, .text-gray-400, .disclaimer');
    if (disclaimer && tr.contact.disclaimer) {
        const disclaimerText = disclaimer.textContent.toLowerCase();
        if (disclaimerText.includes('credit card') || disclaimerText.includes('tarjeta') || disclaimerText.includes('carte')) {
            disclaimer.textContent = tr.contact.disclaimer;
        }
    }
}

function updateFooter(tr) {
    if (!tr.footer) return;
    
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    // Footer tagline/description
    footer.querySelectorAll('p').forEach(p => {
        const text = p.textContent.toLowerCase();
        if (text.includes('enterprise ai software factory') || text.includes('fábrica de software') || text.includes('usine de logiciels')) {
            if (tr.footer.tagline) p.textContent = tr.footer.tagline;
        } else if (text.includes('build ai agents') || text.includes('construimos agentes') || text.includes('construisons des agents') || text.includes('构建ai代理')) {
            if (tr.footer.description) p.textContent = tr.footer.description;
        }
    });
    
    // Footer section titles (h3 or h4)
    const headings = footer.querySelectorAll('h3, h4');
    headings.forEach(h => {
        const text = h.textContent.toLowerCase();
        if (text.includes('solution') || text.includes('soluciones') || text.includes('解决')) {
            h.textContent = tr.footer.solutionsTitle;
        }
        if (text.includes('company') || text.includes('empresa') || text.includes('公司') || text.includes('entreprise')) {
            h.textContent = tr.footer.companyTitle;
        }
        if (text.includes('touch') || text.includes('contact') || text.includes('联系') || text.includes('get in')) {
            h.textContent = tr.footer.contactTitle;
        }
    });
    
    // Footer links
    footer.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = link.textContent.toLowerCase();
        
        if (href === 'index.html' || href === '#home') {
            if (!link.textContent.includes('🤖') && !link.textContent.includes('🔧') && !link.textContent.includes('🏢')) {
                link.textContent = tr.nav?.home || link.textContent;
            }
        }
        if (href === 'about.html') link.textContent = tr.nav?.aboutUs || link.textContent;
        if (href === '#process' || href === 'process.html') link.textContent = tr.footer.howWeWork;
        if (href === '#pricing' || href.includes('pricing')) link.textContent = tr.footer.pricing;
        if (href === '#contact' || href.includes('contact')) link.textContent = tr.footer.contact;
    });
    
    // Copyright
    const copyright = footer.querySelector('p.text-gray-400, .copyright');
    if (copyright) copyright.textContent = tr.footer.copyright;
    
    // Book consultation button in footer
    footer.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('book') || text.includes('consult') || text.includes('咨询') || text.includes('réserver')) {
            btn.innerHTML = '📅 ' + tr.footer.bookConsultation;
        }
    });
}

function updateModals(tr) {
    // Chat modal
    if (tr.chat) {
        safeUpdate('#chat-modal-title', tr.chat.modalTitle);
        const chatWelcome = document.querySelector('#chatModal .welcome-message, #chatModal .bg-gray-100 p');
        if (chatWelcome) chatWelcome.textContent = tr.chat.welcomeMessage;
        
        const chatInput = document.querySelector('#chatModal input[type="text"]');
        if (chatInput) chatInput.placeholder = tr.chat.placeholder;
        
        const sendBtn = document.querySelector('#chatModal button[type="submit"]');
        if (sendBtn) sendBtn.textContent = tr.chat.send;
    }
    
    // Calendly modal
    if (tr.calendly) {
        safeUpdate('#calendly-modal-title', tr.calendly.modalTitle);
        safeUpdate('#calendly-loading p', tr.calendly.loading);
    }
    
    // WhatsApp modal
    if (tr.whatsapp) {
        safeUpdate('#whatsapp-modal-title', tr.whatsapp?.title);
        safeUpdate('#whatsapp-modal-message', tr.whatsapp?.message);
    }
}

// ==================== CTA ELEMENTS (Banner, Sticky Bar, Exit Popup) ====================

function updateCtaElements(tr) {
    // Urgency Banner
    if (tr.urgencyBanner) {
        document.querySelectorAll('[data-i18n="urgencyBanner.offer"]').forEach(el => {
            el.innerHTML = `<strong>${tr.urgencyBanner.offer}</strong>`;
        });
        document.querySelectorAll('[data-i18n="urgencyBanner.remaining"]').forEach(el => {
            el.textContent = tr.urgencyBanner.remaining;
        });
        document.querySelectorAll('[data-i18n="urgencyBanner.cta"]').forEach(el => {
            el.textContent = tr.urgencyBanner.cta;
        });
    }
    
    // Sticky Bar
    if (tr.stickyBar) {
        document.querySelectorAll('[data-i18n="stickyBar.trusted"]').forEach(el => {
            el.textContent = tr.stickyBar.trusted;
        });
        document.querySelectorAll('[data-i18n="stickyBar.headline"]').forEach(el => {
            el.textContent = tr.stickyBar.headline;
        });
        document.querySelectorAll('[data-i18n="stickyBar.subtext"]').forEach(el => {
            el.textContent = tr.stickyBar.subtext;
        });
        document.querySelectorAll('[data-i18n="stickyBar.cta"]').forEach(el => {
            el.textContent = tr.stickyBar.cta;
        });
    }
    
    // Exit Popup
    if (tr.exitPopup) {
        document.querySelectorAll('[data-i18n="exitPopup.title"]').forEach(el => {
            el.textContent = tr.exitPopup.title;
        });
        document.querySelectorAll('[data-i18n="exitPopup.subtitle"]').forEach(el => {
            el.textContent = tr.exitPopup.subtitle;
        });
        document.querySelectorAll('[data-i18n="exitPopup.freeLabel"]').forEach(el => {
            el.textContent = tr.exitPopup.freeLabel;
        });
        document.querySelectorAll('[data-i18n="exitPopup.offerTitle"]').forEach(el => {
            el.textContent = tr.exitPopup.offerTitle;
        });
        document.querySelectorAll('[data-i18n="exitPopup.valueNote"]').forEach(el => {
            el.textContent = tr.exitPopup.valueNote;
        });
        document.querySelectorAll('[data-i18n="exitPopup.benefit1"]').forEach(el => {
            el.textContent = tr.exitPopup.benefit1;
        });
        document.querySelectorAll('[data-i18n="exitPopup.benefit2"]').forEach(el => {
            el.textContent = tr.exitPopup.benefit2;
        });
        document.querySelectorAll('[data-i18n="exitPopup.benefit3"]').forEach(el => {
            el.textContent = tr.exitPopup.benefit3;
        });
        document.querySelectorAll('[data-i18n="exitPopup.cta"]').forEach(el => {
            el.textContent = tr.exitPopup.cta;
        });
        document.querySelectorAll('[data-i18n="exitPopup.disclaimer"]').forEach(el => {
            el.textContent = tr.exitPopup.disclaimer;
        });
    }
    
    // Social Proof
    if (tr.socialProof) {
        document.querySelectorAll('[data-i18n="socialProof.projects"]').forEach(el => {
            el.textContent = tr.socialProof.projects;
        });
        document.querySelectorAll('[data-i18n="socialProof.satisfaction"]').forEach(el => {
            el.textContent = tr.socialProof.satisfaction;
        });
        document.querySelectorAll('[data-i18n="socialProof.guarantee"]').forEach(el => {
            el.textContent = tr.socialProof.guarantee;
        });
    }
}

// ==================== PAGE-SPECIFIC UPDATES ====================

function updateAiAssistantsPage(tr) {
    if (!tr.aiAssistantsPage) return;
    
    const page = tr.aiAssistantsPage;
    
    // Update meta
    if (page.metaTitle) document.title = page.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && page.metaDesc) metaDesc.content = page.metaDesc;
    
    // Hero section
    document.querySelectorAll('h1').forEach(h1 => {
        if (h1.textContent.includes('Intelligent') || h1.textContent.includes('Sales') || 
            h1.textContent.includes('AI Assistants') || h1.textContent.includes('Asistentes')) {
            h1.textContent = page.heroTitle;
        }
    });
    
    // Update subtitles and descriptions
    document.querySelectorAll('p').forEach(p => {
        const text = p.textContent.toLowerCase();
        if (text.includes('boost sales') || text.includes('customer experience')) {
            p.textContent = page.heroSubtitle;
        }
    });
    
    // Update feature titles
    document.querySelectorAll('h3, h4').forEach(h => {
        const text = h.textContent.toLowerCase();
        if (text.includes('multilingual') || text.includes('24/7')) {
            h.textContent = page.feature1Title;
        }
        if (text.includes('acceleration') || text.includes('sales')) {
            h.textContent = page.feature2Title;
        }
        if (text.includes('integration') || text.includes('seamless')) {
            h.textContent = page.feature3Title;
        }
    });
}

function updateMcpToolsPage(tr) {
    if (!tr.mcpToolsPage) return;
    
    const page = tr.mcpToolsPage;
    
    // Update meta
    if (page.metaTitle) document.title = page.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && page.metaDesc) metaDesc.content = page.metaDesc;
    
    // Hero section
    document.querySelectorAll('h1').forEach(h1 => {
        if (h1.textContent.includes('MCP') || h1.textContent.includes('Custom') || 
            h1.textContent.includes('Tools') || h1.textContent.includes('Herramientas')) {
            h1.textContent = page.heroTitle;
        }
    });
    
    // Update subtitles
    document.querySelectorAll('p').forEach(p => {
        const text = p.textContent.toLowerCase();
        if (text.includes('model context protocol') || text.includes('connect ai')) {
            p.textContent = page.heroSubtitle;
        }
    });
}

function updateEnterprisePage(tr) {
    if (!tr.enterprisePage) return;
    
    const page = tr.enterprisePage;
    
    // Update meta
    if (page.metaTitle) document.title = page.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && page.metaDesc) metaDesc.content = page.metaDesc;
    
    // Hero section
    document.querySelectorAll('h1').forEach(h1 => {
        if (h1.textContent.includes('Enterprise') || h1.textContent.includes('Luxury') || 
            h1.textContent.includes('Empresarial')) {
            h1.textContent = page.heroTitle;
        }
    });
    
    // Update subtitles
    document.querySelectorAll('p').forEach(p => {
        const text = p.textContent.toLowerCase();
        if (text.includes('scalable') || text.includes('secure') || text.includes('compliant')) {
            p.textContent = page.heroSubtitle;
        }
    });
    
    // Update use case headings
    document.querySelectorAll('h2, h3').forEach(h => {
        const text = h.textContent.toLowerCase();
        if (text.includes('use case') || text.includes('industry')) {
            h.textContent = page.useCases;
        }
    });
}

function updateAboutPage(tr) {
    if (!tr.aboutPage) return;
    
    const page = tr.aboutPage;
    
    // Update meta
    if (page.metaTitle) document.title = page.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && page.metaDesc) metaDesc.content = page.metaDesc;
    
    // Stats section
    const statCards = document.querySelectorAll('.stat-card');
    const statLabels = [page.stat1, page.stat2, page.stat3, page.stat4];
    statCards.forEach((card, i) => {
        const label = card.querySelector('.text-gray-600');
        if (label && statLabels[i]) label.textContent = statLabels[i];
    });
    
    // CEO section
    document.querySelectorAll('h2').forEach(h2 => {
        if (h2.textContent.includes('CEO') || h2.textContent.includes('Codes') || h2.textContent.includes('Programa')) {
            h2.innerHTML = page.ceoTitle.replace('Codes', '<span class="gradient-text">Codes</span>')
                .replace('Programa', '<span class="gradient-text">Programa</span>')
                .replace('编程', '<span class="gradient-text">编程</span>')
                .replace('Code', '<span class="gradient-text">Code</span>');
        }
        if (h2.textContent.includes('20 Engineers') || h2.textContent.includes('20 Ingenieros') || h2.textContent.includes('20位工程师')) {
            h2.innerHTML = page.teamTitle;
        }
        if (h2.textContent.includes('Core Values') || h2.textContent.includes('Valores') || h2.textContent.includes('价值观')) {
            h2.innerHTML = page.valuesTitle;
        }
        if (h2.textContent.includes('Why Companies') || h2.textContent.includes('Por Qué') || h2.textContent.includes('为什么')) {
            h2.innerHTML = page.whyTitle;
        }
    });
    
    // Team capability cards
    const teamCards = document.querySelectorAll('.team-card');
    const teamData = [
        { title: page.team1Title, desc: page.team1Desc },
        { title: page.team2Title, desc: page.team2Desc },
        { title: page.team3Title, desc: page.team3Desc },
        { title: page.team4Title, desc: page.team4Desc },
        { title: page.team5Title, desc: page.team5Desc },
        { title: page.team6Title, desc: page.team6Desc }
    ];
    teamCards.forEach((card, i) => {
        if (teamData[i]) {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            if (h3) h3.textContent = teamData[i].title;
            if (p) p.textContent = teamData[i].desc;
        }
    });
    
    // Value cards
    const valueCards = document.querySelectorAll('.value-card');
    const valueData = [
        { title: page.value1Title, desc: page.value1Desc },
        { title: page.value2Title, desc: page.value2Desc },
        { title: page.value3Title, desc: page.value3Desc },
        { title: page.value4Title, desc: page.value4Desc }
    ];
    valueCards.forEach((card, i) => {
        if (valueData[i]) {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            if (h3) h3.innerHTML = h3.innerHTML.replace(/[^🎯🔬🤝🚀]+$/, ' ' + valueData[i].title);
            if (p) p.textContent = valueData[i].desc;
        }
    });
}

function updateProcessPage(tr) {
    if (!tr.processPage) return;
    
    const page = tr.processPage;
    
    // Update meta
    if (page.title) {
        const pageTitle = document.querySelector('title');
        if (pageTitle && pageTitle.textContent.includes('Process')) {
            document.title = page.title + ' | AX86 - AI Development Journey';
        }
    }
}

function detectAndUpdateCurrentPage(tr) {
    const path = window.location.pathname;
    
    if (path.includes('ai_assistants')) {
        updateAiAssistantsPage(tr);
    } else if (path.includes('mcp_information')) {
        updateMcpToolsPage(tr);
    } else if (path.includes('enterprise')) {
        updateEnterprisePage(tr);
    } else if (path.includes('about')) {
        updateAboutPage(tr);
    } else if (path.includes('process')) {
        updateProcessPage(tr);
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Safely update element text content
 */
function safeUpdate(selector, text) {
    if (!text) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        if (el) el.textContent = text;
    });
}

/**
 * Update all "Book Consultation" type buttons
 */
function updateConsultationButtons(tr) {
    if (!tr.nav?.bookConsultation) return;
    
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('book') || text.includes('consult') || text.includes('free') || 
            text.includes('gratis') || text.includes('咨询') || text.includes('consultation')) {
            if (!btn.closest('footer')) {
                btn.textContent = tr.nav.bookConsultation;
            }
        }
    });
}

// ==================== BROWSER LANGUAGE DETECTION ====================

/**
 * Detect browser language and return supported language code
 * Defaults to Spanish (es) if browser language is not supported
 */
function detectBrowserLanguage() {
    const browserLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
    const langCode = browserLang.split('-')[0]; // Extract 'en' from 'en-US'
    const supportedLangs = ['en', 'es', 'fr', 'zh'];
    return supportedLangs.includes(langCode) ? langCode : 'es';
}

/**
 * Preload translation file by adding link rel="preload" to head
 */
function preloadTranslationFile(lang) {
    // Remove existing preload link if any
    const existingPreload = document.getElementById('i18n-preload');
    if (existingPreload) {
        existingPreload.remove();
    }
    
    // Create new preload link
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = `translations/${lang}.json`;
    preloadLink.as = 'fetch';
    preloadLink.crossOrigin = 'anonymous';
    preloadLink.id = 'i18n-preload';
    
    // Insert into head
    document.head.appendChild(preloadLink);
    console.log(`[i18n] Preloaded translation file: ${lang}.json`);
}

/**
 * Initialize language system with browser detection
 */
async function initializeLanguage() {
    // Check localStorage first (user preference)
    const savedLang = localStorage.getItem('ax86-language');
    
    // If no saved preference, detect browser language
    const lang = savedLang || detectBrowserLanguage();
    
    // Preload translation file
    preloadTranslationFile(lang);
    
    // Load translations
    const loaded = await loadTranslations(lang);
    if (!loaded) {
        console.error(`[i18n] Failed to load translations for ${lang}, falling back to Spanish`);
        await loadTranslations('es');
        currentLang = 'es';
    } else {
        currentLang = lang;
    }
    
    // Save to localStorage
    localStorage.setItem('ax86-language', currentLang);
    
    // Set HTML lang attribute
    document.documentElement.lang = currentLang;
    
    // Update language button
    updateLanguageButton(currentLang);
    
    // Update all texts
    updateAllTexts();
    
    console.log(`[i18n] Initialized with language: ${currentLang}`);
}

// ==================== INITIALIZATION ====================

// Initialize language as early as possible (before DOMContentLoaded)
// This allows preloading to happen early
if (document.readyState === 'loading') {
    // DOM is still loading, wait for it
    document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
    // DOM is already loaded, initialize immediately
    initializeLanguage();
}

// Export for global access
window.changeLanguage = changeLanguage;
window.t = t;
window.currentLang = currentLang;
