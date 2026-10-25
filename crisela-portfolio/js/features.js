/* Crisela M. Valerio - Portfolio (v2)
   features.js: quick menu, planner, typing challenge, draggable note, easter eggs.
   Needs main.js to load first (it provides the shared window.CV helpers). */
(function () {
  'use strict';

  var CV = window.CV;
  var $ = CV.$, $$ = CV.$$, reduce = CV.reduce;

  function scrollToEl(el, focusEl) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (focusEl) setTimeout(function () { focusEl.focus({ preventScroll: true }); }, reduce ? 0 : 700);
  }

  /* ============================================================
     Quick menu (Ctrl or Cmd + K)
  ============================================================ */
  var palette = $('#palette'), pInput = $('#palette-input'), pList = $('#palette-list');
  var commands = [
    { label: 'Go to About', hint: 'Section', run: function () { scrollToEl($('#about')); } },
    { label: 'Go to Education', hint: 'Section', run: function () { scrollToEl($('#education')); } },
    { label: 'Go to Skills', hint: 'Section', run: function () { scrollToEl($('#skills')); } },
    { label: 'Go to Try my desk', hint: 'Section', run: function () { scrollToEl($('#desk')); } },
    { label: 'Go to Contact', hint: 'Section', run: function () { scrollToEl($('#contact')); } },
    { label: 'Switch light or dark mode', hint: 'Action', run: function () { CV.toggleTheme(); } },
    { label: 'Flip my ID badge', hint: 'Action', run: function () { scrollToEl($('#hero')); setTimeout(CV.flipBadge, reduce ? 0 : 500); } },
    { label: 'Start the typing challenge', hint: 'Action', run: function () { scrollToEl($('#typing'), $('#type-input')); } },
    { label: 'Open my planner', hint: 'Action', run: function () { scrollToEl($('#planner'), $('#task-input')); } },
    { label: 'Copy my email address', hint: 'Action', run: function () { CV.copyEmail(); } },
    { label: 'Celebrate', hint: 'Fun', run: function () { CV.confetti(); CV.toast('Congratulations! (For what? Does not matter.)'); } },
    { label: 'Take a coffee break', hint: 'Fun', run: function () { CV.toast('Coffee break: 5 minutes. Kidding, I am already back at my desk.'); } }
  ];
  var shown = [], sel = 0, lastFocus = null;

  function renderList() {
    var q = pInput.value.trim().toLowerCase();
    shown = commands.filter(function (c) { return c.label.toLowerCase().indexOf(q) !== -1; });
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    pList.innerHTML = '';
    if (!shown.length) {
      var empty = document.createElement('li');
      empty.textContent = 'No match. Try "skills" or "dark".';
      empty.style.cursor = 'default';
      pList.appendChild(empty);
      return;
    }
    shown.forEach(function (c, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === sel));
      li.innerHTML = '<span></span><small></small>';
      li.firstChild.textContent = c.label;
      li.lastChild.textContent = c.hint;
      li.addEventListener('mousemove', function () { setSel(i); });
      li.addEventListener('click', function () { runCommand(i); });
      pList.appendChild(li);
    });
  }
  function setSel(i) {
    sel = i;
    $$('li', pList).forEach(function (li, idx) { li.setAttribute('aria-selected', String(idx === sel)); });
    var cur = pList.children[sel];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }
  function openPalette() {
    lastFocus = document.activeElement;
    palette.hidden = false;
    pInput.value = ''; sel = 0; renderList();
    pInput.focus();
  }
  function closePalette() {
    if (palette.hidden) return;
    palette.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function runCommand(i) {
    var cmd = shown[i];
    if (!cmd) return;
    closePalette();
    setTimeout(cmd.run, 80);
  }

  $('#palette-open').addEventListener('click', openPalette);
  palette.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closePalette(); });
  pInput.addEventListener('input', function () { sel = 0; renderList(); });
  pInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (shown.length) setSel((sel + 1) % shown.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) setSel((sel - 1 + shown.length) % shown.length); }
    else if (e.key === 'Enter') { e.preventDefault(); runCommand(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
    } else if (e.key === 'Escape') { closePalette(); }
  });

  /* ============================================================
     Planner
  ============================================================ */
  var tasksEl = $('#tasks'), plCount = $('#pl-count'), plMeter = $('#pl-meter');
  var plMsg = $('#pl-msg'), taskForm = $('#task-add'), taskInput = $('#task-input');
  var starter = [
    { t: '8:00', text: 'Check emails and the day\'s calendar' },
    { t: '9:30', text: 'Prepare notes for the team meeting' },
    { t: '11:00', text: 'File and label incoming documents' },
    { t: '1:00', text: 'Update the daily expense log' },
    { t: '3:30', text: 'Send the end-of-day summary' }
  ];
  var celebrated = false;

  var dateEl = $('#pl-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function addTask(text, time, custom) {
    var li = document.createElement('li');
    var label = document.createElement('label');
    label.className = 'task-label';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    var box = document.createElement('span'); box.className = 'box';
    var txt = document.createElement('span'); txt.className = 'task-text'; txt.textContent = text;
    label.appendChild(cb); label.appendChild(box); label.appendChild(txt);
    if (time) {
      var tm = document.createElement('span'); tm.className = 'task-time'; tm.textContent = time;
      label.appendChild(tm);
    }
    li.appendChild(label);
    if (custom) {
      var del = document.createElement('button');
      del.type = 'button'; del.className = 'task-del'; del.setAttribute('aria-label', 'Remove task: ' + text);
      del.innerHTML = '&times;';
      del.addEventListener('click', function () { li.remove(); celebrated = false; updatePlanner(); });
      li.appendChild(del);
    }
    cb.addEventListener('change', function () { updatePlanner(true); });
    tasksEl.appendChild(li);
  }

  function updatePlanner(fromCheck) {
    var boxes = $$('input[type="checkbox"]', tasksEl);
    var done = boxes.filter(function (b) { return b.checked; }).length;
    var total = boxes.length;
    plMeter.parentNode.style.setProperty('--done', total ? done / total : 0);
    plMeter.style.setProperty('--done', total ? done / total : 0);
    plCount.textContent = done + ' of ' + total + ' done';
    if (total && done === total) {
      plMsg.textContent = 'Everything is done. That is how I like my days.';
      if (fromCheck && !celebrated) { celebrated = true; CV.confetti(); }
    } else {
      plMsg.textContent = '';
      if (done < total) celebrated = false;
    }
  }
  function resetPlanner() {
    tasksEl.innerHTML = '';
    starter.forEach(function (s) { addTask(s.text, s.t, false); });
    celebrated = false;
    updatePlanner();
  }
  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = taskInput.value.trim();
    if (!v) { plMsg.textContent = 'Type a task first.'; return; }
    addTask(v, '', true);
    taskInput.value = '';
    celebrated = false;
    updatePlanner();
  });
  $('#pl-reset').addEventListener('click', resetPlanner);
  resetPlanner();

  /* ============================================================
     Typing challenge
  ============================================================ */
  var sentences = [
    'Please find attached the minutes of today\'s meeting for your review.',
    'Good records today save hours of searching tomorrow.',
    'The quarterly report is due on Friday, so please send your figures by Wednesday.',
    'A tidy desk and a clear schedule make every busy day easier.',
    'Thank you for calling. How may I help you this morning?',
    'Every entry in the ledger must be accurate, dated and properly filed.'
  ];
  var typeText = $('#type-text'), typeInput = $('#type-input');
  var stWpm = $('#st-wpm'), stAcc = $('#st-acc'), stTime = $('#st-time');
  var typeMsg = $('#type-msg'), typeBest = $('#type-best');
  var target = '', spans = [], startTime = 0, timer = null, finished = false, lastIdx = -1, bestWpm = 0;

  function loadSentence(forceNew) {
    var next;
    do { next = (Math.random() * sentences.length) | 0; } while (forceNew && next === lastIdx && sentences.length > 1);
    if (forceNew || lastIdx < 0) lastIdx = next;
    target = sentences[lastIdx];
    typeText.innerHTML = '';
    spans = target.split('').map(function (ch) {
      var s = document.createElement('span'); s.className = 'c'; s.textContent = ch;
      typeText.appendChild(s); return s;
    });
    typeInput.value = ''; typeInput.disabled = false; typeInput.maxLength = target.length;
    clearInterval(timer); timer = null; startTime = 0; finished = false;
    stWpm.textContent = '0'; stAcc.textContent = '100%'; stTime.textContent = '0.0s';
    typeMsg.textContent = '';
    paint('');
  }
  function paint(val) {
    var correct = 0;
    spans.forEach(function (s, i) {
      s.className = 'c';
      if (i < val.length) {
        if (val[i] === target[i]) { s.className = 'c ok'; correct++; } else { s.className = 'c bad'; }
      } else if (i === val.length && !finished) { s.className = 'c cur'; }
    });
    return correct;
  }
  function stats(val) {
    var correct = 0;
    for (var i = 0; i < val.length; i++) if (val[i] === target[i]) correct++;
    var mins = (Date.now() - startTime) / 60000;
    return {
      correct: correct,
      wpm: mins > 0 ? Math.round((correct / 5) / mins) : 0,
      acc: val.length ? Math.round((correct / val.length) * 100) : 100,
      secs: (Date.now() - startTime) / 1000
    };
  }
  function liveStats() {
    if (!startTime || finished) return;
    var s = stats(typeInput.value);
    stWpm.textContent = String(s.wpm); stAcc.textContent = s.acc + '%'; stTime.textContent = s.secs.toFixed(1) + 's';
  }
  typeInput.addEventListener('input', function () {
    var val = typeInput.value;
    if (!startTime && val.length) { startTime = Date.now(); timer = setInterval(liveStats, 150); }
    paint(val);
    if (val.length >= target.length) finish(val);
  });
  typeInput.addEventListener('paste', function (e) { e.preventDefault(); typeMsg.textContent = 'Nice try. Pasting is not allowed.'; });

  function finish(val) {
    finished = true; clearInterval(timer);
    typeInput.disabled = true;
    paint(val);
    var s = stats(val);
    var wpmFinal = Math.round(((target.length * (s.acc / 100)) / 5) / (Math.max(s.secs, 1) / 60));
    stWpm.textContent = String(wpmFinal); stAcc.textContent = s.acc + '%'; stTime.textContent = s.secs.toFixed(1) + 's';
    var msg;
    if (wpmFinal >= 65) msg = 'Executive assistant speed!';
    else if (wpmFinal >= 45) msg = 'Fast and neat. Hired!';
    else if (wpmFinal >= 25) msg = 'A solid office pace.';
    else msg = 'A steady start. Try another sentence.';
    if (s.acc < 90) msg += ' Accuracy matters most in an office, so slow down a little.';
    typeMsg.textContent = msg;
    if (wpmFinal > bestWpm && s.acc >= 90) { bestWpm = wpmFinal; typeBest.textContent = 'Your best this visit: ' + bestWpm + ' WPM'; }
    if (wpmFinal >= 45 && s.acc >= 90) CV.confetti();
  }
  $('#type-new').addEventListener('click', function () { loadSentence(true); typeInput.focus(); });
  $('#type-restart').addEventListener('click', function () { loadSentence(false); typeInput.focus(); });
  loadSentence(true);

  /* ============================================================
     Draggable sticky note
  ============================================================ */
  var note = $('#sticky');
  if (note) {
    var dx = 0, dy = 0, sx = 0, sy = 0, dragging = false, tilt = 5;
    note.addEventListener('pointerdown', function (e) {
      dragging = true; sx = e.clientX - dx; sy = e.clientY - dy;
      note.classList.add('is-drag');
      note.setPointerCapture(e.pointerId);
    });
    note.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var nx = e.clientX - sx, ny = e.clientY - sy;
      tilt = Math.max(-14, Math.min(14, (nx - dx) * 0.6 + tilt * 0.6));
      dx = nx; dy = ny;
      note.style.setProperty('--dx', dx + 'px');
      note.style.setProperty('--dy', dy + 'px');
      note.style.setProperty('--rot', tilt + 'deg');
    });
    function drop() {
      if (!dragging) return;
      dragging = false; note.classList.remove('is-drag');
      note.style.setProperty('--rot', '5deg'); tilt = 5;
    }
    note.addEventListener('pointerup', drop);
    note.addEventListener('pointercancel', drop);
  }

  /* ============================================================
     Easter eggs
  ============================================================ */
  // 1) Click the CV logo five times
  var brand = $('#brand'), brandMark = $('.brand-mark'), clicks = 0, clickTimer;
  brand.addEventListener('click', function () {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(function () { clicks = 0; }, 1500);
    if (clicks >= 5) {
      clicks = 0;
      brandMark.classList.remove('is-spin'); void brandMark.offsetWidth; brandMark.classList.add('is-spin');
      CV.toast('Secret found: attention to detail confirmed.');
      CV.confetti();
    }
  });

  // 2) Konami code toggles "Executive Assistant mode"
  var code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') { pos = 0; return; }
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === code[pos]) {
      pos++;
      if (pos === code.length) { pos = 0; toggleExec(); }
    } else { pos = key === code[0] ? 1 : 0; }
  });
  function toggleExec() {
    var root = document.documentElement;
    var on = root.classList.toggle('exec');
    if (on) {
      CV.roles.unshift('an Executive Assistant in training');
      CV.toast('Promotion unlocked: Executive Assistant mode. Corner office not included.');
      CV.confetti(window.innerWidth * 0.25); setTimeout(function () { CV.confetti(window.innerWidth * 0.75); }, 250);
    } else {
      var i = CV.roles.indexOf('an Executive Assistant in training');
      if (i > -1) CV.roles.splice(i, 1);
      CV.toast('Back to student mode. Study hard!');
    }
  }
})();
