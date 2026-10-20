// PassFortress - Password Strength & Digital Hygiene Auditor
// Developed for Campus Outreach & Rural Student Education

let currentLang = 'en';

const wordBank = [
  "mango", "tiger", "river", "falcon", "galaxy", "forest", "rocket", "shadow", 
  "ocean", "amber", "crystal", "shield", "silver", "bridge", "garden", "lotus",
  "thunder", "peacock", "mountain", "nebula", "village", "breeze", "beacon", 
  "comet", "desert", "echo", "flame", "horizon", "island", "jungle", "karma",
  "legend", "meadow", "oasis", "planet", "quest", "radiant", "summit", "timber",
  "valley", "zenith", "aurora", "banyan", "citadel", "delta", "ember", "glacier"
];

const weakPatterns = [
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234",
  "111111", "admin", "welcome", "iloveyou", "india", "india123", "pass@123",
  "abc123", "secret", "google", "login", "testing"
];

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupPasswordEvaluator();
  setupPassphraseGenerator();
  setupPrivacyChecklist();
  setupLanguageToggle();
  
  // Initial demo evaluation
  const passInput = document.getElementById('main-password-input');
  evaluatePassword(passInput.value);
});

// Setup Tabs
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Password Evaluation Engine
function setupPasswordEvaluator() {
  const input = document.getElementById('main-password-input');
  const toggleBtn = document.getElementById('toggle-pass-visibility');
  
  input.addEventListener('input', () => {
    evaluatePassword(input.value);
  });
  
  toggleBtn.addEventListener('click', () => {
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    toggleBtn.innerHTML = isPass 
      ? '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>'
      : '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>';
  });
}

function evaluatePassword(pwd) {
  const len = pwd.length;
  let poolSize = 0;
  
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSpecial) poolSize += 33;
  
  // Update Rules checklist
  updateRuleItem('rule-len', len >= 12);
  updateRuleItem('rule-upper', hasUpper);
  updateRuleItem('rule-lower', hasLower);
  updateRuleItem('rule-number', hasDigit);
  updateRuleItem('rule-symbol', hasSpecial);
  
  if (len === 0) {
    resetMeters();
    return;
  }
  
  // Calculate raw entropy: E = L * log2(R)
  let entropy = poolSize > 0 ? len * (Math.log(poolSize) / Math.log(2)) : 0;
  
  // Check weak common patterns
  const lowerPwd = pwd.toLowerCase();
  let isCommonWeak = false;
  for (let weak of weakPatterns) {
    if (lowerPwd.includes(weak)) {
      isCommonWeak = true;
      entropy = Math.min(entropy, 20); // Severely degrade entropy
      break;
    }
  }
  
  // Check repetitive characters like aaaaa or 1111
  if (/^(.)\1+$/.test(pwd)) {
    entropy = Math.min(entropy, 15);
  }
  
  // Round entropy
  const displayEntropy = Math.round(entropy);
  document.getElementById('stat-entropy').innerText = `${displayEntropy} bits`;
  document.getElementById('stat-length').innerText = `${len} chars`;
  document.getElementById('stat-pool').innerText = `${poolSize} chars`;
  
  // Determine Strength Category
  const meterFill = document.getElementById('meter-fill');
  const strengthLabel = document.getElementById('strength-label');
  
  let labelText = '';
  let color = '';
  let pct = 0;
  
  if (entropy < 28 || isCommonWeak) {
    labelText = currentLang === 'hi' ? 'अत्यंत कमजोर (तुरंत क्रैक)' : 'Very Weak (Instant)';
    color = 'var(--accent-rose)';
    pct = 20;
  } else if (entropy < 45) {
    labelText = currentLang === 'hi' ? 'कमजोर (कुछ सेकंड में क्रैक)' : 'Weak (Vulnerable)';
    color = 'var(--accent-amber)';
    pct = 40;
  } else if (entropy < 65) {
    labelText = currentLang === 'hi' ? 'मध्यम (साधारण सुरक्षा)' : 'Fair / Moderate';
    color = '#eab308';
    pct = 65;
  } else if (entropy < 85) {
    labelText = currentLang === 'hi' ? 'मजबूत (विश्वसनीय)' : 'Strong (Safe)';
    color = 'var(--accent-emerald)';
    pct = 85;
  } else {
    labelText = currentLang === 'hi' ? 'अभेद्य / किला (सर्वोत्तम)' : 'Fortified / Military Grade';
    color = 'var(--accent-indigo)';
    pct = 100;
  }
  
  meterFill.style.width = `${pct}%`;
  meterFill.style.backgroundColor = color;
  strengthLabel.innerText = labelText;
  strengthLabel.style.color = color;
  
  // Calculate Adversary Cracking Speeds
  calculateCrackTimes(len, poolSize, isCommonWeak);
}

function updateRuleItem(id, passed) {
  const elem = document.getElementById(id);
  if (!elem) return;
  if (passed) {
    elem.classList.add('passed');
    elem.querySelector('.rule-icon').innerText = '✓';
  } else {
    elem.classList.remove('passed');
    elem.querySelector('.rule-icon').innerText = '○';
  }
}

function resetMeters() {
  document.getElementById('meter-fill').style.width = '0%';
  document.getElementById('strength-label').innerText = '-';
  document.getElementById('stat-entropy').innerText = '0 bits';
  document.getElementById('stat-length').innerText = '0 chars';
  document.getElementById('stat-pool').innerText = '0 chars';
  
  document.getElementById('time-laptop').innerText = '-';
  document.getElementById('time-gpu').innerText = '-';
  document.getElementById('time-botnet').innerText = '-';
  document.getElementById('time-super').innerText = '-';
}

function calculateCrackTimes(len, poolSize, isCommonWeak) {
  if (isCommonWeak) {
    const instantText = currentLang === 'hi' ? 'तुरंत (0.01 सेकंड)' : 'Instant (0.01 sec)';
    document.getElementById('time-laptop').innerText = instantText;
    document.getElementById('time-gpu').innerText = instantText;
    document.getElementById('time-botnet').innerText = instantText;
    document.getElementById('time-super').innerText = instantText;
    return;
  }
  
  if (poolSize === 0 || len === 0) return;
  
  // Total search space = poolSize^len
  // Average guesses to find = search space / 2
  // For huge numbers, we use logarithmic math: log10(searchSpace) = len * log10(poolSize)
  const logCombos = len * Math.log10(poolSize);
  
  // Speeds in guesses per second (log10)
  // Laptop: 10^5 (100,000/sec)
  // GPU Rig: 10^10 (10 Billion/sec)
  // Botnet: 10^11 (100 Billion/sec)
  // Supercomputer: 10^13 (10 Trillion/sec)
  
  document.getElementById('time-laptop').innerText = formatSecondsFromLog(logCombos - Math.log10(2) - 5);
  document.getElementById('time-gpu').innerText = formatSecondsFromLog(logCombos - Math.log10(2) - 10);
  document.getElementById('time-botnet').innerText = formatSecondsFromLog(logCombos - Math.log10(2) - 11);
  document.getElementById('time-super').innerText = formatSecondsFromLog(logCombos - Math.log10(2) - 13);
}

function formatSecondsFromLog(logSeconds) {
  const isHi = currentLang === 'hi';
  
  if (logSeconds <= 0) {
    return isHi ? 'तुरंत (कुछ मिलीसेकंड)' : 'Instantly (< 1 sec)';
  }
  
  // log of 60 is 1.778
  if (logSeconds < 1.778) {
    const sec = Math.round(Math.pow(10, logSeconds));
    return isHi ? `${sec} सेकंड` : `${sec} seconds`;
  }
  
  // log of 3600 is 3.556 (1 hour)
  if (logSeconds < 3.556) {
    const mins = Math.round(Math.pow(10, logSeconds) / 60);
    return isHi ? `${mins} मिनट` : `${mins} minutes`;
  }
  
  // log of 86400 is 4.936 (1 day)
  if (logSeconds < 4.936) {
    const hours = Math.round(Math.pow(10, logSeconds) / 3600);
    return isHi ? `${hours} घंटे` : `${hours} hours`;
  }
  
  // log of 31536000 is 7.498 (1 year)
  if (logSeconds < 7.498) {
    const days = Math.round(Math.pow(10, logSeconds) / 86400);
    return isHi ? `${days} दिन` : `${days} days`;
  }
  
  // Years
  const logYears = logSeconds - 7.498;
  if (logYears < 2) {
    const years = Math.round(Math.pow(10, logYears));
    return isHi ? `${years} वर्ष` : `${years} years`;
  } else if (logYears < 4) {
    const centuries = Math.round(Math.pow(10, logYears) / 100);
    return isHi ? `${centuries} शताब्दियां` : `${centuries} centuries`;
  } else if (logYears < 6) {
    const millennia = Math.round(Math.pow(10, logYears) / 1000);
    return isHi ? `${millennia} हज़ार वर्ष` : `${millennia} thousand years`;
  } else if (logYears < 9) {
    const millions = Math.round(Math.pow(10, logYears) / 1000000);
    return isHi ? `${millions} मिलियन वर्ष` : `${millions} million years`;
  } else {
    return isHi ? 'करोड़ों वर्ष (अभेद्य)' : 'Trillions of years (Impenetrable)';
  }
}

// Passphrase Generator Logic
function setupPassphraseGenerator() {
  const generateBtn = document.getElementById('btn-generate-passphrase');
  const copyBtn = document.getElementById('btn-copy-passphrase');
  const display = document.getElementById('generated-passphrase-text');
  
  generateBtn.addEventListener('click', () => {
    generateNewPassphrase();
  });
  
  copyBtn.addEventListener('click', () => {
    const text = display.innerText;
    if (!text || text.includes('Click')) return;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '✓ Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    });
  });
  
  // Generate first passphrase
  generateNewPassphrase();
}

function generateNewPassphrase() {
  const wordCount = 3;
  const pickedWords = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randWord = wordBank[Math.floor(Math.random() * wordBank.length)];
    // Capitalize first letter
    pickedWords.push(randWord.charAt(0).toUpperCase() + randWord.slice(1));
  }
  
  const randNum = Math.floor(Math.random() * 90) + 10;
  const specialChars = ["!", "@", "#", "$", "%", "*"];
  const randChar = specialChars[Math.floor(Math.random() * specialChars.length)];
  
  const passphrase = `${pickedWords.join('-')}-${randNum}${randChar}`;
  document.getElementById('generated-passphrase-text').innerText = passphrase;
}

// Digital Hygiene Checklist
function setupPrivacyChecklist() {
  const checkboxes = document.querySelectorAll('.audit-checkbox');
  checkboxes.forEach(box => {
    box.addEventListener('change', updateAuditScore);
  });
  updateAuditScore();
}

function updateAuditScore() {
  const checkboxes = document.querySelectorAll('.audit-checkbox');
  let checkedCount = 0;
  
  checkboxes.forEach(box => {
    if (box.checked) checkedCount++;
  });
  
  const total = checkboxes.length;
  const pct = Math.round((checkedCount / total) * 100);
  
  document.getElementById('audit-score-pct').innerText = `${pct}%`;
  document.getElementById('audit-score-ratio').innerText = `${checkedCount} of ${total} security safeguards active`;
  
  const adviceElem = document.getElementById('audit-advice');
  if (pct === 100) {
    adviceElem.innerText = currentLang === 'hi' 
      ? 'उत्कृष्ट! आपका डिजिटल सुरक्षा स्तर शीर्ष श्रेणी का है।' 
      : 'Outstanding! Your social media & digital hygiene profile is fortified against modern exploits.';
    adviceElem.style.color = 'var(--accent-emerald)';
  } else if (pct >= 60) {
    adviceElem.innerText = currentLang === 'hi'
      ? 'अच्छा प्रयास! शेष बचे बॉक्स चेक करके 2FA और प्राइवेसी ऑन करें।'
      : 'Good baseline security. Enable the remaining two-factor settings to prevent account hijacking.';
    adviceElem.style.color = '#eab308';
  } else {
    adviceElem.innerText = currentLang === 'hi'
      ? 'सावधानी! आपके खाते साइबर अपराधियों के निशाने पर आ सकते हैं।'
      : 'Action Needed! Your profile lacks key barriers against SIM-swap and impersonation attacks.';
    adviceElem.style.color = 'var(--accent-rose)';
  }
}

// Bilingual Language Switcher
function setupLanguageToggle() {
  const langBtn = document.getElementById('lang-toggle-btn');
  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    langBtn.innerHTML = currentLang === 'en' ? '🌐 Language: <strong>English</strong>' : '🌐 भाषा: <strong>हिंदी</strong>';
    updateLanguageTexts();
    
    // Re-evaluate current password for translated crack strings
    const passInput = document.getElementById('main-password-input');
    evaluatePassword(passInput.value);
    updateAuditScore();
  });
}

function updateLanguageTexts() {
  const isHi = currentLang === 'hi';
  document.getElementById('hero-title').innerText = isHi 
    ? 'पासवर्ड अभेद्यता विश्लेषक एवं डिजिटल सुरक्षा परीक्षक' 
    : 'Password Entropy, Brute-Force Visualizer & Digital Hygiene Auditor';
    
  document.getElementById('hero-desc').innerText = isHi
    ? 'जानें कि आधुनिक हैकर्स के कंप्यूटर आपके पासवर्ड को कितनी देर में क्रैक कर सकते हैं, और अपने सोशल मीडिया खातों को सुरक्षित बनाएं।'
    : 'Demonstrating how supercomputers and GPU clusters brute-force weak credentials, with actionable privacy audits for everyday platforms.';
    
  document.getElementById('tab-label-eval').innerText = isHi ? 'पासवर्ड मीटर' : 'Strength Meter';
  document.getElementById('tab-label-brute').innerText = isHi ? 'हैकर्स क्रैकिंग स्पीड' : 'Brute-Force Speeds';
  document.getElementById('tab-label-gen').innerText = isHi ? 'स्मार्ट पासफ़्रेज़ जेनरेटर' : 'Passphrase Generator';
  document.getElementById('tab-label-audit').innerText = isHi ? 'सोशल मीडिया ऑडिट' : 'Privacy Checklist';
}
