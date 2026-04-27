/* ============================================
   LinkedIn Headline Audit Tool
   Frontend logic — calls /api/audit on Vercel
   ============================================ */

(() => {
  'use strict';

  // --- Element refs ---
  const headlineInput = document.getElementById('headline');
  const audienceInput = document.getElementById('audience');
  const outcomeInput = document.getElementById('outcome');
  const charNum = document.getElementById('charNum');
  const charCount = document.getElementById('charCount');
  const charNote = document.getElementById('charNote');
  const auditBtn = document.getElementById('auditBtn');
  const resetBtn = document.getElementById('resetBtn');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');
  const formSection = document.getElementById('form-section');
  const errorBox = document.getElementById('error');

  // --- Live character count ---
  headlineInput.addEventListener('input', () => {
    const len = headlineInput.value.length;
    charNum.textContent = len;
    charCount.classList.remove('warn', 'over');

    if (len > 220) {
      charCount.classList.add('over');
      charNote.textContent = `${len - 220} over LinkedIn limit`;
    } else if (len > 180) {
      charCount.classList.add('warn');
      charNote.textContent = `${220 - len} left`;
    } else {
      charNote.textContent = 'LinkedIn limit';
    }
  });

  // --- Helpers ---
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('show');
    setTimeout(() => errorBox.classList.remove('show'), 5000);
  }

  function show(el) { el.hidden = false; }
  function hide(el) { el.hidden = true; }

  // --- Main audit flow ---
  async function runAudit() {
    const headline = headlineInput.value.trim();
    const audience = audienceInput.value.trim();
    const outcome = outcomeInput.value.trim();

    if (!headline) { showError('Paste your current headline first.'); return; }
    if (!audience) { showError("Tell me who your ideal client is."); return; }
    if (!outcome) { showError('Add the outcome you deliver.'); return; }

    hide(formSection);
    show(loading);
    hide(results);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, audience, outcome })
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      renderResults(result);

    } catch (err) {
      console.error('Audit failed:', err);
      hide(loading);
      show(formSection);
      showError('Something went wrong. Try again in a moment.');
    }
  }

  // --- Render results ---
  function renderResults(result) {
    hide(loading);

    document.getElementById('scoreNum').textContent = result.score;
    document.getElementById('scoreVerdict').textContent = result.verdict;

    const winsList = document.getElementById('winsList');
    winsList.innerHTML = '';
    (result.wins || []).forEach(w => {
      const li = document.createElement('li');
      li.textContent = w;
      winsList.appendChild(li);
    });

    const fixesList = document.getElementById('fixesList');
    fixesList.innerHTML = '';
    (result.fixes || []).forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      fixesList.appendChild(li);
    });

    const container = document.getElementById('rewritesContainer');
    container.innerHTML = '';
    (result.rewrites || []).forEach((rw, i) => {
      const div = document.createElement('div');
      div.className = 'rewrite';

      const typeEl = document.createElement('div');
      typeEl.className = 'rewrite-type';
      typeEl.textContent = rw.type;

      const textEl = document.createElement('div');
      textEl.className = 'rewrite-text';
      textEl.textContent = rw.text;

      const actions = document.createElement('div');
      actions.className = 'rewrite-actions';
      actions.innerHTML = `<span>${rw.text.length} chars</span>`;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => copyText(copyBtn, rw.text));

      actions.appendChild(copyBtn);
      div.appendChild(typeEl);
      div.appendChild(textEl);
      div.appendChild(actions);
      container.appendChild(div);
    });

    show(results);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Copy to clipboard ---
  function copyText(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      showError('Could not copy. Try selecting the text manually.');
    });
  }

  // --- Reset ---
  function resetForm() {
    headlineInput.value = '';
    audienceInput.value = '';
    outcomeInput.value = '';
    charNum.textContent = '0';
    charNote.textContent = 'LinkedIn limit';
    charCount.classList.remove('warn', 'over');
    hide(results);
    show(formSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Wire up buttons ---
  auditBtn.addEventListener('click', runAudit);
  resetBtn.addEventListener('click', resetForm);

})();
