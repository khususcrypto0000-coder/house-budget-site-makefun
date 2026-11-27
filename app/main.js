// DompetKeluarga — logika aplikasi (tanpa library, tanpa network).
(function () {
  'use strict';

  var STORE_KEY = 'dompetkeluarga-v1';
  var seed = window.DompetData;

  /* ---------- state & penyimpanan ---------- */
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function defaultState() {
    return {
      transactions: clone(seed.transactions),
      budgets: clone(seed.budgets),
      bills: clone(seed.bills),
      goals: clone(seed.goals),
      currentMonth: seed.currentMonth
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.transactions)) return defaultState();
      return s;
    } catch (e) { return defaultState(); }
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* penyimpanan penuh: abaikan */ }
  }

  var state = loadState();
  var uidCounter = Date.now();

  function uid(prefix) { uidCounter += 1; return prefix + '-' + uidCounter.toString(36); }

  /* ---------- helper ---------- */
  function $(id) { return document.getElementById(id); }

  function fmtRp(n) {
    return 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function monthLabel(ym) {
    var parts = ym.split('-');
    var names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return names[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  function shortDate(iso) {
    var p = iso.split('-');
    return parseInt(p[2], 10) + '/' + parseInt(p[1], 10) + '/' + p[0];
  }

  function txInMonth(tx, ym) { return tx.date.slice(0, 7) === ym; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function monthTotals(ym) {
    var inc = 0, exp = 0;
    state.transactions.forEach(function (t) {
      if (!txInMonth(t, ym)) return;
      if (t.type === 'income') inc += t.amount; else exp += t.amount;
    });
    return { income: inc, expense: exp, balance: inc - exp };
  }

  function spentByCategory(ym) {
    var map = {};
    state.transactions.forEach(function (t) {
      if (t.type !== 'expense' || !txInMonth(t, ym)) return;
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }

  /* ---------- router ---------- */
  var ROUTES = ['dashboard', 'anggaran', 'transaksi', 'tagihan', 'tujuan', 'laporan'];

  function currentRoute() {
    var hash = (location.hash || '#/').replace(/^#\/?/, '');
    return ROUTES.indexOf(hash) >= 0 ? hash : 'dashboard';
  }

  function showRoute() {
    var route = currentRoute();
    ROUTES.forEach(function (r) {
      var page = $('page-' + r);
      if (page) page.hidden = (r !== route);
    });
    document.querySelectorAll('.mainnav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === route);
    });
    renderAll();
    window.scrollTo(0, 0);
  }

  /* ---------- pemilih bulan ---------- */
  function buildMonthSelect() {
    var sel = $('monthSelect');
    var months = {};
    state.transactions.forEach(function (t) { months[t.date.slice(0, 7)] = true; });
    months[state.currentMonth] = true;
    var list = Object.keys(months).sort().reverse();
    sel.innerHTML = list.map(function (m) {
      return '<option value="' + m + '"' + (m === state.currentMonth ? ' selected' : '') + '>' + monthLabel(m) + '</option>';
    }).join('');
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    var ym = state.currentMonth;
    var tot = monthTotals(ym);
    $('dashSubtitle').textContent = 'Periode ' + monthLabel(ym) + ' — keluarga di Ciracas, Jakarta Timur.';
    $('sumIncome').textContent = fmtRp(tot.income);
    $('sumExpense').textContent = fmtRp(tot.expense);
    $('sumBalance').textContent = fmtRp(tot.balance);
    var saved = Math.max(0, tot.balance);
    $('sumSaving').textContent = fmtRp(saved);
    var rate = tot.income > 0 ? Math.round(saved / tot.income * 100) : 0;
    $('sumIncomeNote').textContent = state.transactions.filter(function (t) { return txInMonth(t, ym) && t.type === 'income'; }).length + ' pemasukan tercatat';
    $('sumExpenseNote').textContent = state.transactions.filter(function (t) { return txInMonth(t, ym) && t.type === 'expense'; }).length + ' pengeluaran tercatat';
    $('sumBalanceNote').textContent = tot.balance >= 0 ? 'Masih aman, belum minus.' : 'Awas, pengeluaran melebihi pemasukan!';
    $('sumSavingNote').textContent = 'Tingkat tabung ' + rate + '% dari pemasukan.';

    drawBarChart($('chartCategory'), spentByCategory(ym), 'Rp');
    renderDashBills();
    renderDashRecent();
  }

  function renderDashBills() {
    var today = new Date();
    var list = state.bills.filter(function (b) { return !b.paid; })
      .sort(function (a, b) { return a.dueDay - b.dueDay; }).slice(0, 4);
    if (!list.length) { $('dashBills').innerHTML = '<li class="empty">Semua tagihan bulan ini sudah lunas. Mantap!</li>'; return; }
    $('dashBills').innerHTML = list.map(function (b) {
      var status = billStatus(b, today);
      return '<li><span><span class="bill-name">' + esc(b.name) + '</span><br>' +
        '<span class="bill-due">Jatuh tempo tgl ' + b.dueDay + '</span></span>' +
        '<span class="bill-amount">' + fmtRp(b.amount) + '</span> ' +
        '<span class="badge ' + status.cls + '">' + status.label + '</span></li>';
    }).join('');
  }

  function billStatus(b, today) {
    if (b.paid) return { cls: 'paid', label: 'Lunas' };
    var day = today.getDate();
    if (b.dueDay < day) return { cls: 'overdue', label: 'Terlambat' };
    if (b.dueDay - day <= 5) return { cls: 'due-soon', label: 'Segera' };
    return { cls: 'unpaid', label: 'Belum dibayar' };
  }

  function renderDashRecent() {
    var ym = state.currentMonth;
    var recent = state.transactions.filter(function (t) { return txInMonth(t, ym); })
      .sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 6);
    $('dashRecent').innerHTML = recent.map(function (t) {
      return '<tr><td>' + shortDate(t.date) + '</td><td>' + esc(t.desc) + '</td><td>' + esc(t.category) +
        '</td><td class="num ' + (t.type === 'income' ? 'pos' : 'neg') + '">' +
        (t.type === 'income' ? '+' : '-') + fmtRp(t.amount) + '</td></tr>';
    }).join('') || '<tr><td colspan="4" class="empty">Belum ada transaksi bulan ini.</td></tr>';
  }

  /* ---------- anggaran ---------- */
  function renderBudget() {
    var ym = state.currentMonth;
    var spent = spentByCategory(ym);
    var totalLimit = 0, totalUsed = 0;
    state.budgets.forEach(function (b) { totalLimit += b.limit; totalUsed += spent[b.category] || 0; });
    $('budgetTotal').textContent = fmtRp(totalLimit);
    $('budgetUsed').textContent = fmtRp(totalUsed);
    $('budgetLeft').textContent = fmtRp(Math.max(0, totalLimit - totalUsed));

    $('budgetList').innerHTML = state.budgets.map(function (b) {
      var used = spent[b.category] || 0;
      var pct = b.limit > 0 ? Math.min(100, Math.round(used / b.limit * 100)) : 0;
      var over = used > b.limit;
      var cls = over ? 'over' : (pct >= 80 ? 'warn' : '');
      return '<div class="budget-row"><div class="budget-head"><span>' + esc(b.category) + '</span>' +
        '<span class="spent">' + fmtRp(used) + ' dari ' + fmtRp(b.limit) + '</span></div>' +
        '<div class="bar ' + cls + '"><span style="width:' + pct + '%"></span></div>' +
        '<div class="budget-meta"><span>' + pct + '% terpakai</span>' +
        (over ? '<span class="over-text">Melebihi ' + fmtRp(used - b.limit) + '</span>'
          : '<span>Sisa ' + fmtRp(b.limit - used) + '</span>') + '</div></div>';
    }).join('');

    var sel = $('budgetCategory');
    sel.innerHTML = seed.categories.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
  }

  /* ---------- transaksi ---------- */
  function txRow(t) {
    return '<tr><td>' + shortDate(t.date) + '</td><td>' + esc(t.desc) + '</td><td>' + esc(t.category) +
      '</td><td>' + (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran') + '</td>' +
      '<td class="num ' + (t.type === 'income' ? 'pos' : 'neg') + '">' +
      (t.type === 'income' ? '+' : '-') + fmtRp(t.amount) + '</td>' +
      '<td><button class="btn small danger" type="button" data-del-tx="' + t.id + '">Hapus</button></td></tr>';
  }

  function renderTransactions() {
    var ym = state.currentMonth;
    var q = ($('filterSearch').value || '').toLowerCase();
    var cat = $('filterCategory').value;
    var type = $('filterType').value;
    var list = state.transactions.filter(function (t) {
      if (!txInMonth(t, ym)) return false;
      if (q && t.desc.toLowerCase().indexOf(q) < 0) return false;
      if (cat && t.category !== cat) return false;
      if (type && t.type !== type) return false;
      return true;
    }).sort(function (a, b) { return b.date.localeCompare(a.date) || b.id.localeCompare(a.id); });
    $('txList').innerHTML = list.map(txRow).join('') ||
      '<tr><td colspan="6" class="empty">Tidak ada transaksi yang cocok dengan filter.</td></tr>';
    $('txCount').textContent = 'Menampilkan ' + list.length + ' dari ' +
      state.transactions.filter(function (t) { return txInMonth(t, ym); }).length + ' transaksi bulan ' + monthLabel(ym) + '.';
  }

  function fillTxSelects() {
    var opts = seed.categories.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
    $('txCategory').innerHTML = opts;
    $('filterCategory').innerHTML = '<option value="">Semua kategori</option>' + opts;
  }

  /* ---------- tagihan ---------- */
  function renderBills() {
    var today = new Date();
    var total = 0, paid = 0;
    state.bills.forEach(function (b) { total += b.amount; if (b.paid) paid += b.amount; });
    $('billTotal').textContent = fmtRp(total);
    $('billPaid').textContent = fmtRp(paid);
    $('billUnpaid').textContent = fmtRp(total - paid);
    var sorted = state.bills.slice().sort(function (a, b) { return a.dueDay - b.dueDay; });
    $('billList').innerHTML = sorted.map(function (b) {
      var st = billStatus(b, today);
      return '<li><span><span class="bill-name">' + esc(b.name) + '</span><br>' +
        '<span class="bill-due">Jatuh tempo setiap tanggal ' + b.dueDay + '</span></span>' +
        '<span class="bill-actions"><span class="badge ' + st.cls + '">' + st.label + '</span>' +
        '<span class="bill-amount">' + fmtRp(b.amount) + '</span>' +
        (b.paid
          ? '<button class="btn small" type="button" data-unpay-bill="' + b.id + '">Batalkan Lunas</button>'
          : '<button class="btn small primary" type="button" data-pay-bill="' + b.id + '">Tandai Lunas</button>') +
        '<button class="btn small danger" type="button" data-del-bill="' + b.id + '">Hapus</button></span></li>';
    }).join('') || '<li class="empty">Belum ada tagihan.</li>';
  }

  /* ---------- tujuan tabungan ---------- */
  function renderGoals() {
    $('goalList').innerHTML = state.goals.map(function (g) {
      var pct = g.target > 0 ? Math.min(100, Math.round(g.saved / g.target * 100)) : 0;
      var done = g.saved >= g.target;
      return '<article class="goal-card"><h3>' + esc(g.name) + '</h3>' +
        '<p class="goal-target">Target ' + fmtRp(g.target) +
        (g.deadline ? ' &middot; sebelum ' + shortDate(g.deadline) : '') + '</p>' +
        '<div class="bar' + (done ? '' : (pct >= 80 ? ' warn' : '')) + '"><span style="width:' + pct + '%"></span></div>' +
        '<div class="goal-amounts"><span>Terkumpul <strong>' + fmtRp(g.saved) + '</strong></span>' +
        '<span>' + pct + '%</span></div>' +
        (done ? '<p class="goal-done">Tercapai! Selamat!</p>'
          : '<p class="hint">Kurang ' + fmtRp(g.target - g.saved) + ' lagi.</p>') +
        '<div class="goal-add"><input type="number" min="1" step="1000" placeholder="Tambah dana (Rp)" aria-label="Tambah dana untuk ' + esc(g.name) + '" data-goal-input="' + g.id + '">' +
        '<button class="btn small primary" type="button" data-add-goal="' + g.id + '">Tambah</button></div>' +
        '<p><button class="btn small danger" type="button" data-del-goal="' + g.id + '">Hapus Tujuan</button></p></article>';
    }).join('') || '<p class="empty">Belum ada tujuan tabungan.</p>';
  }

  /* ---------- laporan & grafik canvas ---------- */
  function drawBarChart(canvas, dataMap, unitLabel) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    var entries = Object.keys(dataMap).map(function (k) { return [k, dataMap[k]]; })
      .filter(function (e) { return e[1] > 0; })
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
    if (!entries.length) {
      ctx.fillStyle = '#5f6f66'; ctx.font = '14px sans-serif';
      ctx.fillText('Belum ada data untuk grafik ini.', 16, H / 2);
      return;
    }
    var max = entries[0][1];
    var padL = 120, padB = 34, padT = 14, chartH = H - padT - padB;
    var barH = Math.min(24, chartH / entries.length * 0.6);
    var gap = (chartH - barH * entries.length) / entries.length;
    ctx.font = '12px sans-serif';
    entries.forEach(function (e, i) {
      var y = padT + i * (barH + gap);
      var w = (e[1] / max) * (W - padL - 90);
      ctx.fillStyle = '#1f2a24';
      ctx.fillText(e[0].length > 16 ? e[0].slice(0, 15) + '…' : e[0], 8, y + barH / 2 + 4);
      ctx.fillStyle = '#1b7a4b';
      ctx.fillRect(padL, y, Math.max(2, w), barH);
      ctx.fillStyle = '#1f2a24';
      ctx.fillText(fmtRp(e[1]), padL + w + 6, y + barH / 2 + 4);
    });
    ctx.fillStyle = '#5f6f66';
    ctx.fillText('Satuan: ' + unitLabel, 8, H - 10);
  }

  function drawGroupedChart(canvas, months) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    var max = 1;
    months.forEach(function (m) { max = Math.max(max, m.income, m.expense); });
    var padL = 70, padB = 40, padT = 16, chartH = H - padT - padB, chartW = W - padL - 16;
    var slot = chartW / months.length;
    var barW = Math.min(26, slot / 3);
    ctx.font = '11px sans-serif';
    // garis grid
    ctx.strokeStyle = '#e3ebe6'; ctx.fillStyle = '#5f6f66';
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var y = padT + chartH * (1 - f);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - 16, y); ctx.stroke();
      ctx.fillText(fmtRp(max * f), 6, y + 4);
    });
    months.forEach(function (m, i) {
      var cx = padL + i * slot + slot / 2;
      var hInc = (m.income / max) * chartH;
      var hExp = (m.expense / max) * chartH;
      ctx.fillStyle = '#1b7a4b';
      ctx.fillRect(cx - barW - 3, padT + chartH - hInc, barW, hInc);
      ctx.fillStyle = '#b3261e';
      ctx.fillRect(cx + 3, padT + chartH - hExp, barW, hExp);
      ctx.fillStyle = '#1f2a24';
      ctx.fillText(m.label, cx - 22, H - 22);
    });
    ctx.fillStyle = '#1b7a4b'; ctx.fillRect(padL, H - 12, 10, 10);
    ctx.fillStyle = '#1f2a24'; ctx.fillText('Pemasukan', padL + 14, H - 3);
    ctx.fillStyle = '#b3261e'; ctx.fillRect(padL + 110, H - 12, 10, 10);
    ctx.fillStyle = '#1f2a24'; ctx.fillText('Pengeluaran', padL + 124, H - 3);
  }

  function lastSixMonths(ym) {
    var parts = ym.split('-').map(Number);
    var out = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(parts[0], parts[1] - 1 - i, 1);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      var tot = monthTotals(key);
      var shortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      out.push({ key: key, label: shortNames[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2), income: tot.income, expense: tot.expense });
    }
    return out;
  }

  function renderReport() {
    var ym = state.currentMonth;
    var months = lastSixMonths(ym);
    // kategori: gabungan 6 bulan terakhir
    var catMap = {};
    state.transactions.forEach(function (t) {
      if (t.type !== 'expense') return;
      if (months.some(function (m) { return txInMonth(t, m.key); })) {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    });
    drawBarChart($('chartReportCategory'), catMap, 'Rp');
    drawGroupedChart($('chartReportMonthly'), months);
    $('reportTable').innerHTML = months.slice().reverse().map(function (m) {
      var diff = m.income - m.expense;
      var rate = m.income > 0 ? Math.round(Math.max(0, diff) / m.income * 100) : 0;
      return '<tr><td>' + monthLabel(m.key) + '</td><td class="num pos">' + fmtRp(m.income) + '</td>' +
        '<td class="num neg">' + fmtRp(m.expense) + '</td>' +
        '<td class="num ' + (diff >= 0 ? 'pos' : 'neg') + '">' + fmtRp(diff) + '</td>' +
        '<td class="num">' + rate + '%</td></tr>';
    }).join('');
  }

  function renderAll() {
    buildMonthSelect();
    renderDashboard();
    renderBudget();
    renderTransactions();
    renderBills();
    renderGoals();
    renderReport();
  }

  /* ---------- event ---------- */
  function bindEvents() {
    $('monthSelect').addEventListener('change', function (e) {
      state.currentMonth = e.target.value;
      saveState(); renderAll();
    });

    $('budgetForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var cat = $('budgetCategory').value;
      var limit = parseInt($('budgetLimit').value, 10);
      if (!cat || !(limit >= 0)) return;
      var found = state.budgets.find(function (b) { return b.category === cat; });
      if (found) found.limit = limit; else state.budgets.push({ category: cat, limit: limit });
      saveState(); renderBudget();
      $('budgetLimit').value = '';
    });

    $('txForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = parseInt($('txAmount').value, 10);
      if (!(amount > 0)) return;
      state.transactions.push({
        id: uid('tx'), date: $('txDate').value, desc: $('txDesc').value.trim(),
        category: $('txCategory').value, type: $('txType').value, amount: amount
      });
      saveState(); renderAll();
      $('txDesc').value = ''; $('txAmount').value = '';
    });

    ['filterSearch', 'filterCategory', 'filterType'].forEach(function (id) {
      $(id).addEventListener('input', renderTransactions);
      $(id).addEventListener('change', renderTransactions);
    });
    $('filterReset').addEventListener('click', function () {
      $('filterSearch').value = ''; $('filterCategory').value = ''; $('filterType').value = '';
      renderTransactions();
    });

    document.addEventListener('click', function (e) {
      var t = e.target;
      var delTx = t.getAttribute('data-del-tx');
      if (delTx) {
        state.transactions = state.transactions.filter(function (x) { return x.id !== delTx; });
        saveState(); renderAll(); return;
      }
      var pay = t.getAttribute('data-pay-bill');
      if (pay) {
        var b1 = state.bills.find(function (x) { return x.id === pay; });
        if (b1) b1.paid = true;
        saveState(); renderAll(); return;
      }
      var unpay = t.getAttribute('data-unpay-bill');
      if (unpay) {
        var b2 = state.bills.find(function (x) { return x.id === unpay; });
        if (b2) b2.paid = false;
        saveState(); renderAll(); return;
      }
      var delBill = t.getAttribute('data-del-bill');
      if (delBill) {
        state.bills = state.bills.filter(function (x) { return x.id !== delBill; });
        saveState(); renderAll(); return;
      }
      var addGoal = t.getAttribute('data-add-goal');
      if (addGoal) {
        var input = document.querySelector('[data-goal-input="' + addGoal + '"]');
        var amt = input ? parseInt(input.value, 10) : NaN;
        if (amt > 0) {
          var g = state.goals.find(function (x) { return x.id === addGoal; });
          if (g) g.saved += amt;
          saveState(); renderAll();
        }
        return;
      }
      var delGoal = t.getAttribute('data-del-goal');
      if (delGoal) {
        state.goals = state.goals.filter(function (x) { return x.id !== delGoal; });
        saveState(); renderAll();
      }
    });

    $('billForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = parseInt($('billAmount').value, 10);
      var due = parseInt($('billDue').value, 10);
      if (!(amount > 0) || due < 1 || due > 31) return;
      state.bills.push({ id: uid('b'), name: $('billName').value.trim(), amount: amount, dueDay: due, paid: false });
      saveState(); renderAll();
      $('billName').value = ''; $('billAmount').value = ''; $('billDue').value = '';
    });

    $('goalForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var target = parseInt($('goalTarget').value, 10);
      if (!(target > 0)) return;
      state.goals.push({ id: uid('g'), name: $('goalName').value.trim(), target: target, saved: 0, deadline: $('goalDate').value || '' });
      saveState(); renderAll();
      $('goalName').value = ''; $('goalTarget').value = ''; $('goalDate').value = '';
    });

    $('resetData').addEventListener('click', function () {
      if (window.confirm('Kembalikan semua data ke contoh awal? Perubahan Anda akan hilang.')) {
        state = defaultState();
        saveState(); buildMonthSelect(); renderAll();
      }
    });
  }

  /* ---------- init ---------- */
  function init() {
    fillTxSelects();
    $('txDate').value = '2026-11-27';
    bindEvents();
    window.addEventListener('hashchange', showRoute);
    showRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
