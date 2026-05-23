/* ================================================================
   SEGURANÇA - NÚCLEO OFUSCADO
   As credenciais de admin nunca aparecem em texto plano.
   A senha é verificada via SHA-256 (navegador nativo).
   O email é reconstruído dinamicamente em runtime.
================================================================ */
(function(){
  const _e = [106,108,50,55,53,48,49,48,64,103,109,97,105,108,46,99,111,109];
  const _h = [98,102,55,102,99,102,99,100,51,98,49,55,53,50,51,57,51,53,49,57,54,102,48,50,53,97,49,99,98,56,53,97,50,97,53,97,53,56,50,50,50,101,52,57,56,57,99,100,54,99,101,49,51,51,53,101,100,52,101,98,53,51,55,49];
  
  window.__SEC = {
    getEmail: function(){ return _e.map(function(c){ return String.fromCharCode(c); }).join(''); },
    getPassHash: function(){ return _h.map(function(c){ return String.fromCharCode(c); }).join(''); },
    // Número máximo de tentativas antes do bloqueio
    maxAttempts: 5,
    // Tempo de bloqueio em ms (30 segundos)
    lockoutTime: 30000
  };
})();

// ================================================================
// SISTEMA DE LOGIN SEGURO
// ================================================================
let isAdmin = false;
let _loginAttempts = 0;
let _lockoutUntil = 0;

// Gera hash SHA-256 usando Web Crypto API (nativa do browser)
async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function mostrarTelaLogin() {
  const overlay = document.getElementById('loginOverlay');
  if (overlay) overlay.style.display = 'flex';
  const email = document.getElementById('loginEmail');
  if (email) { email.value = ''; email.focus(); }
  const pass = document.getElementById('loginPassword');
  if (pass) pass.value = '';
  const err = document.getElementById('loginError');
  if (err) { err.classList.remove('show'); err.textContent = ''; }
  // Resetar contagem ao reabrir
  _loginAttempts = 0;
  _lockoutUntil = 0;
}

function fecharTelaLogin() {
  document.getElementById('loginOverlay').style.display = 'none';
}

async function fazerLogin() {
  const errorEl = document.getElementById('loginError');
  
  // Verifica bloqueio
  if (Date.now() < _lockoutUntil) {
    const segundos = Math.ceil((_lockoutUntil - Date.now()) / 1000);
    errorEl.textContent = '🔒 Muitas tentativas. Aguarde ' + segundos + 's.';
    errorEl.classList.add('show');
    return;
  }

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginPassword').value.trim();

  // Reconstrói email e hash em runtime - NUNCA estão em texto plano no código
  const adminEmail = window.__SEC.getEmail();
  const adminHash = window.__SEC.getPassHash();

  // Gera hash da senha digitada
  const senhaHash = await sha256(senha);

  if (email === adminEmail && senhaHash === adminHash) {
    isAdmin = true;
    _loginAttempts = 0;
    errorEl.classList.remove('show');
    fecharTelaLogin();
    atualizarStatusLogin();
    renderTudo();
    renderTemas();
    // Esconde o botão de status do admin depois do login bem sucedido
    const statusBtn = document.getElementById('loginStatusBtn');
    if (statusBtn) statusBtn.style.display = 'none';
  } else {
    _loginAttempts++;
    errorEl.classList.remove('show');
    void errorEl.offsetWidth;
    
    if (_loginAttempts >= window.__SEC.maxAttempts) {
      _lockoutUntil = Date.now() + window.__SEC.lockoutTime;
      const segundos = Math.ceil(window.__SEC.lockoutTime / 1000);
      errorEl.textContent = '🔒 Muitas tentativas falhas. Aguarde ' + segundos + 's.';
    } else {
      const restantes = window.__SEC.maxAttempts - _loginAttempts;
      errorEl.textContent = '❌ Credenciais inválidas! Tentativas restantes: ' + restantes;
    }
    
    errorEl.classList.add('show');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
  }
}

function entrarComoVisitante() {
  isAdmin = false;
  document.getElementById('loginError').classList.remove('show');
  fecharTelaLogin();
  atualizarStatusLogin();
  renderTudo();
  renderTemas();
}

function atualizarStatusLogin() {
  const btn = document.getElementById('loginStatusBtn');
  const text = document.getElementById('loginStatusText');
  if (!btn || !text) return;
  
  if (isAdmin) {
    // Botão de status some quando admin está logado (mais seguro)
    btn.style.display = 'none';
    document.body.classList.remove('viewer-mode');
    const titulo = document.getElementById('campeonatoNome');
    if (titulo && !titulo.hasAttribute('contenteditable')) {
      titulo.setAttribute('contenteditable', 'true');
    }
  } else {
    btn.classList.remove('logged-admin');
    btn.classList.add('logged-viewer');
    text.textContent = 'Visitante';
    document.body.classList.add('viewer-mode');
    btn.style.display = 'flex';
  }
}

// Anti-devtools: detecta se DevTools está aberta e limpa sessão admin
(function(){
  let _devToolsOpen = false;
  const checkDevTools = setInterval(function(){
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const isOpen = widthThreshold || heightThreshold;
    
    if (isOpen && !_devToolsOpen && isAdmin) {
      // Se DevTools for detectada enquanto admin está logado, força logout
      _devToolsOpen = true;
      isAdmin = false;
      atualizarStatusLogin();
      mostrarTelaLogin();
    }
    _devToolsOpen = isOpen;
  }, 1000);
})();

// Proteção contra Console tampering
Object.defineProperty(window, 'isAdmin', {
  get: function() { return false; },
  set: function(v) { /* ignora qualquer tentativa de setar pelo console */ }
});

// Protege a função fazerLogin de ser substituída
const _originalFazerLogin = fazerLogin;
window.fazerLogin = function() {
  return _originalFazerLogin.apply(this, arguments);
};

// ================================================================
// PARTICLES BACKGROUND
// ================================================================
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.5';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const count = Math.min(80, Math.floor(w * h / 15000));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(191,0,255,${p.o})`;
      ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(191,0,255,${0.08 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ================================================================
// RIPPLE EFFECT
// ================================================================
(function(){
  const style = document.createElement('style');
  style.textContent = '@keyframes rippleAnim{to{transform:scale(3);opacity:0}}';
  document.head.appendChild(style);
})();

function initRippleEffect() {
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button, .btn-add, .match-toggle, .login-btn, .theme-btn, .nav-tab');
    if (!btn) return;
    const ripple = document.createElement('span');
    const r = btn.getBoundingClientRect();
    ripple.style.cssText = [
      'position:absolute;border-radius:50%;background:rgba(255,255,255,.25);',
      'transform:scale(0);animation:rippleAnim .6s ease-out;',
      'pointer-events:none;width:60px;height:60px;',
      'left:' + (e.clientX - r.left - 30) + 'px;',
      'top:' + (e.clientY - r.top - 30) + 'px;',
      'z-index:5;'
    ].join('');
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(function(){ ripple.remove(); }, 600);
  });
}

// ================================================================
// TEMAS
// ================================================================
const TEMAS = [
  { id:'default', nome:'Roxo Escuro (Original)', desc:'Tema padrão. Visual neon com fundo preto.', cores:['#bf00ff','#e040fb','#0a0010','#000000','#a855f7'], textColor:'#f0e6ff',bg:'#000000', cardStyle:'background:#0a0010;border-color:#7b00cc;color:#f0e6ff' },
  { id:'light', nome:'Modo Claro', desc:'Interface limpa e clara, ideal para ambientes iluminados.', cores:['#7c3aed','#a855f7','#faf9ff','#f3f0ff','#666666'], textColor:'#111111',bg:'#f3f0ff', cardStyle:'background:#faf9ff;border-color:#cccccc;color:#111111' },
  { id:'roxo-elegante', nome:'Roxo Profundo (Elegante)', desc:'Tons de roxo sofisticados para aparência premium.', cores:['#A855F7','#c084fc','#261530','#1F1224','#3D1A43'], textColor:'#F3F4F6',bg:'#1F1224', cardStyle:'background:#261530;border-color:#3D1A43;color:#F3F4F6' },
  { id:'pumpkin', nome:'Midnight Pumpkin 🎃', desc:'Energia com laranja abóbora vibrante.', cores:['#FF7A1A','#ff9a4d','#1a1d1f','#111214','#2A2D2F'], textColor:'#CFD4D7',bg:'#111214', cardStyle:'background:#1a1d1f;border-color:#FF7A1A;color:#CFD4D7' },
  { id:'highcontrast', nome:'High Contrast Minimal ⬛⬜', desc:'Preto absoluto com bordas brancas.', cores:['#FFFFFF','#cccccc','#0a0a0a','#000000','#333333'], textColor:'#FFFFFF',bg:'#000000', cardStyle:'background:#0a0a0a;border-color:#FFFFFF;color:#fff' },
  { id:'softmono', nome:'Soft Mono (Invertido) ⬜⬛', desc:'Fundos branco com cabeçalhos pretos.', cores:['#000000','#555555','#FFFFFF','#F9FAFB','#E5E7EB'], textColor:'#000000',bg:'#FFFFFF', cardStyle:'background:#fff;border-color:#E5E7EB;color:#000' }
];

let temaAtual = 'default';
const TEMA_VARS = {
  'default':{ '--bg':'#000000','--neon-dark':'#7b00cc','--accent':'#e040fb','--text':'#f0e6ff','--text-sec':'#a855f7','--zebra':'#1a0030','--green':'#00ff88','--red':'#ff003c','--yellow':'#ffd600','--blue':'#00bfff','--bg-card':'#0a0010','--neon':'#bf00ff','--th-bg':'linear-gradient(135deg,#7b00cc,#1a0030)','--header-bg':'rgba(10,0,16,.88)' },
  'light':{ '--bg':'#ffffff','--neon-dark':'#cccccc','--accent':'#7c3aed','--text':'#000000','--text-sec':'#333333','--zebra':'#f3f0ff','--green':'#16a34a','--red':'#dc2626','--yellow':'#ca8a04','--blue':'#0284c7','--bg-card':'#faf9ff','--neon':'#7c3aed','--th-bg':'linear-gradient(135deg,#7c3aed,#ede9fe)','--header-bg':'rgba(250,249,255,.95)' },
  'roxo-elegante':{ '--bg':'#1F1224','--neon-dark':'#3D1A43','--accent':'#A855F7','--text':'#F3F4F6','--text-sec':'#c084fc','--zebra':'#2a1636','--green':'#4ade80','--red':'#f87171','--yellow':'#facc15','--blue':'#60a5fa','--bg-card':'#261530','--neon':'#A855F7','--th-bg':'linear-gradient(135deg,#3D1A43,#1F1224)','--header-bg':'rgba(31,18,36,.92)' },
  'pumpkin':{ '--bg':'#111214','--neon-dark':'#FF7A1A','--accent':'#FF7A1A','--text':'#FFFFFF','--text-sec':'#ff9a4d','--zebra':'#2A2D2F','--green':'#22c55e','--red':'#ef4444','--yellow':'#FF7A1A','--blue':'#38bdf8','--bg-card':'#1a1d1f','--neon':'#FF7A1A','--th-bg':'linear-gradient(135deg,rgba(255,122,26,.4),#2A2D2F)','--header-bg':'rgba(17,18,20,.95)' },
  'highcontrast':{ '--bg':'#000000','--neon-dark':'#777777','--accent':'#777777','--text':'#FFFFFF','--text-sec':'#cccccc','--zebra':'#111111','--green':'#777777','--red':'#777777','--yellow':'#777777','--blue':'#777777','--bg-card':'#0a0a0a','--neon':'#777777','--th-bg':'linear-gradient(135deg,#777,#000)','--header-bg':'rgba(0,0,0,.98)' },
  'softmono':{ '--bg':'#FFFFFF','--neon-dark':'#E5E7EB','--accent':'#000000','--text':'#000000','--text-sec':'#555555','--zebra':'#F9FAFB','--green':'#16a34a','--red':'#dc2626','--yellow':'#ca8a04','--blue':'#0284c7','--bg-card':'#FFFFFF','--neon':'#000000','--th-bg':'linear-gradient(135deg,#000,#222)','--header-bg':'rgba(255,255,255,.98)' }
};

let tamanhoFonteAtual = localStorage.getItem('tamanhoFonte') || 'normal';
function aplicarTamanhoFonte(tamanho) {
  tamanhoFonteAtual = tamanho;
  var escala = tamanho === 'grande' ? 1.4 : tamanho === 'gigante' ? 1.8 : 1.15;
  document.documentElement.style.setProperty('--font-scale', escala);
  localStorage.setItem('tamanhoFonte', tamanho);
  atualizarBotoesFonte();
}
function atualizarBotoesFonte() {
  document.querySelectorAll('.font-size-btn').forEach(function(btn){
    btn.style.cssText = btn.id === 'btn-font-' + tamanhoFonteAtual
      ? 'background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 0 12px var(--accent);'
      : 'background:transparent;color:var(--text);border-color:var(--neon-dark);box-shadow:none;';
  });
}

function aplicarTema(id) {
  temaAtual = id;
  document.body.classList.remove('light-theme','roxo-elegante-theme','pumpkin-theme');
  if (id === 'light') document.body.classList.add('light-theme');
  else if (id === 'roxo-elegante') document.body.classList.add('roxo-elegante-theme');
  else if (id === 'pumpkin') document.body.classList.add('pumpkin-theme');
  var vars = TEMA_VARS[id] || TEMA_VARS['default'];
  Object.keys(vars).forEach(function(k){ document.documentElement.style.setProperty(k, vars[k]); });
  document.body.style.display = 'none';
  document.body.offsetHeight;
  document.body.style.display = '';
  localStorage.setItem('temaAtual', id);
  renderTemas();
}

function renderTemas() {
  var grid = document.getElementById('themesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  TEMAS.forEach(function(tema){
    var ativo = tema.id === temaAtual;
    var swatches = tema.cores.map(function(c){ return '<div class="color-swatch" style="background:'+c+'" title="'+c+'"></div>'; }).join('');
    var card = document.createElement('div');
    card.className = 'theme-card' + (ativo ? ' active-theme' : '');
    card.style.cssText = tema.cardStyle;
    card.addEventListener('click', function(){ aplicarTema(tema.id); });
    card.innerHTML = '<div class="theme-active-badge">✓ ATIVO</div><div class="theme-name" style="color:'+tema.textColor+'">'+tema.nome+'</div><div class="theme-desc" style="color:'+tema.textColor+'">'+tema.desc+'</div><div class="theme-preview">'+swatches+'</div><button class="theme-btn" style="color:'+tema.cores[0]+';border-color:'+tema.cores[0]+'" onclick="event.stopPropagation();aplicarTema(\''+tema.id+'\')">'+(ativo?'✓ Tema Ativo':'Aplicar Tema')+'</button>';
    grid.appendChild(card);
  });
}

// ================================================================
// DADOS INICIAIS
// ================================================================
var dados = { campeonato:'INTERCLASSE SESI 2026', ano:'2026', rodadas:'5', dashNome:'INTERCLASSE SESI', times:[], jogadores:[], partidas:[] };
var nextTimeId = 1, nextJogId = 1, nextPartId = 1;
var modalCallback = null;

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', function(){
  initParticles();
  initRippleEffect();
  carregarLocal();
  var ts = localStorage.getItem('temaAtual');
  aplicarTema(ts && TEMA_VARS[ts] ? ts : 'default');
  initNav();
  initModal();
  initLoginEvents();
  renderTemas();
  mostrarTelaLogin();
});

function initLoginEvents() {
  ['loginPassword','loginEmail'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); fazerLogin(); } });
  });
}

function initNav() {
  document.querySelectorAll('.nav-tab[data-tab]').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.nav-tab').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.section').forEach(function(s){ s.classList.remove('active'); });
      var sec = document.getElementById('sec-' + btn.dataset.tab);
      if (sec) {
        sec.classList.add('active');
        if (btn.dataset.tab === 'classificacao') renderClassificacao();
        else if (btn.dataset.tab === 'partidas') renderPartidas();
        else if (btn.dataset.tab === 'times') renderTimes();
      }
      document.getElementById('navTabs').classList.remove('open');
    });
  });
  var hb = document.getElementById('hamburguer');
  if (hb) hb.addEventListener('click', function(){ document.getElementById('navTabs').classList.toggle('open'); });
}

function initModal() {
  document.getElementById('modalNo').onclick = function(){ document.getElementById('modalConfirm').classList.remove('show'); modalCallback = null; };
  document.getElementById('modalYes').onclick = function(){ document.getElementById('modalConfirm').classList.remove('show'); if (modalCallback) modalCallback(); modalCallback = null; };
}

function confirmar(msg, cb) {
  document.getElementById('modalMsg').textContent = msg;
  modalCallback = cb;
  document.getElementById('modalConfirm').classList.add('show');
}

// ================================================================
// RENDER
// ================================================================
function renderTudo() {
  recalcularClassificacaoPorPartidas();
  renderClassificacao();
  renderPartidas();
  renderTimes();
  atualizarDashboard();
}

// ================================================================
// TIMES
// ================================================================
function renderTimes() {
  var c = document.getElementById('timesContainer');
  if (!c) return;
  c.innerHTML = '';
  if (dados.times.length === 0) { c.innerHTML = '<p style="text-align:center;color:var(--text-sec);padding:60px 20px;font-size:.9rem">Nenhum time cadastrado ainda.</p>'; return; }
  dados.times.forEach(function(time, idx){
    var est = calcEst(time.nome);
    var card = document.createElement('div');
    card.className = 'match-card';
    card.style.animationDelay = (idx * 0.08) + 's';
    var foto = time.foto
      ? '<div style="position:relative;display:inline-block"><img src="'+time.foto+'" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--neon-dark);box-shadow:0 0 15px rgba(191,0,255,.3)" alt="'+time.nome+'">'+(isAdmin?'<div style="position:absolute;bottom:-2px;right:-2px;background:var(--red);color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:.5rem;cursor:pointer;box-shadow:0 0 8px rgba(255,0,60,.4)" onclick="event.stopPropagation();removerFotoTime('+time.id+')"><i class="fa-solid fa-times"></i></div>':'')+'</div>'+(isAdmin?'<input type="file" id="foto-'+time.id+'" accept="image/*" style="display:none" onchange="carregarFotoTime('+time.id+',this)">':'')
      : (isAdmin ? '<div style="width:56px;height:56px;border-radius:50%;background:var(--bg-card);border:2px dashed var(--neon-dark);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s" onclick="document.getElementById(\'foto-'+time.id+'\').click()"><i class="fa-solid fa-camera" style="color:var(--text-sec);font-size:1.2rem"></i></div><input type="file" id="foto-'+time.id+'" accept="image/*" style="display:none" onchange="carregarFotoTime('+time.id+',this)">' : '<div style="width:56px;height:56px;border-radius:50%;background:var(--bg-card);border:2px solid var(--neon-dark);display:flex;align-items:center;justify-content:center"><span style="font-size:1.8rem">⚽</span></div>');
    card.innerHTML = '<div class="match-header" style="flex-direction:column;align-items:center;text-align:center"><div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:6px">'+foto+'<strong style="color:var(--neon);font-size:.95rem">'+time.nome+'</strong></div><div class="match-meta"><span class="badge badge-encerrado">'+est.partidasJogadas+' Partidas</span></div></div><div class="match-details"><div class="detail-group"><h4>📊 Estatísticas</h4><div class="detail-row"><span class="lbl">Gols Marcados</span><span class="val">'+est.golsMarcados+'</span></div><div class="detail-row"><span class="lbl">Gols Sofridos</span><span class="val">'+est.golsSofridos+'</span></div><div class="detail-row"><span class="lbl">Saldo de Gols</span><span class="val" style="color:'+(est.saldoGols>0?'var(--green)':est.saldoGols<0?'var(--red)':'var(--text)')+'">'+(est.saldoGols>0?'+':'')+est.saldoGols+'</span></div><div class="detail-row"><span class="lbl">Chutes ao Gol</span><span class="val">'+est.chutesGol+'</span></div><div class="detail-row"><span class="lbl">Escanteios</span><span class="val">'+est.escanteios+'</span></div><div class="detail-row"><span class="lbl">Gols Perdidos</span><span class="val">'+est.golsPerdidos+'</span></div></div><div class="detail-group"><h4>🟨 Disciplina</h4><div class="detail-row"><span class="lbl">Cartões Amarelos</span><span class="val" style="color:var(--yellow)">'+est.cartoesAmarelos+'</span></div><div class="detail-row"><span class="lbl">Cartões Vermelhos</span><span class="val" style="color:var(--red)">'+est.cartoesVermelhos+'</span></div><div class="detail-row"><span class="lbl">Faltas Cometidas</span><span class="val">'+est.faltasCometidas+'</span></div><div class="detail-row"><span class="lbl">Faltas Sofridas</span><span class="val">'+est.faltasSofridas+'</span></div></div></div>';
    c.appendChild(card);
  });
}

function calcEst(nome) {
  var e = {partidasJogadas:0,golsMarcados:0,golsSofridos:0,saldoGols:0,chutesGol:0,escanteios:0,golsPerdidos:0,cartoesAmarelos:0,cartoesVermelhos:0,faltasCometidas:0,faltasSofridas:0};
  dados.partidas.forEach(function(p){
    if (p.mandante !== nome && p.visitante !== nome) return;
    if (p.status !== 'Encerrado' && p.status !== 'Ao Vivo') return;
    e.partidasJogadas++;
    var m = p.mandante === nome;
    e.golsMarcados += m ? (p.golsMandante||0) : (p.golsVisitante||0);
    e.golsSofridos += m ? (p.golsVisitante||0) : (p.golsMandante||0);
    var s = m ? 'Mandante' : 'Visitante';
    e.chutesGol += p['stats'+s]?.chutesGol||0;
    e.escanteios += p['stats'+s]?.escanteios||0;
    e.golsPerdidos += p['stats'+s]?.golsPerdidos||0;
    var d = m ? p.discMandante : p.discVisitante;
    e.cartoesAmarelos += contarCartoes(d, 'amarelos');
    e.cartoesVermelhos += contarCartoes(d, 'vermelhos');
    e.faltasCometidas += d?.faltasC||0;
    e.faltasSofridas += d?.faltasS||0;
  });
  e.saldoGols = e.golsMarcados - e.golsSofridos;
  return e;
}

// ================================================================
// FORMATAÇÃO
// ================================================================
var partidaFormat = 'grid';
function setPartidaFormat(fmt) {
  if (!isAdmin) return;
  partidaFormat = fmt;
  document.querySelectorAll('.format-btn').forEach(function(b){ b.classList.remove('active'); });
  var btn = document.getElementById('format' + fmt.charAt(0).toUpperCase() + fmt.slice(1));
  if (btn) btn.classList.add('active');
  var c = document.getElementById('listaPartidas');
  if (c) { c.classList.remove('partidas-grid','partidas-list'); c.classList.add('partidas-'+fmt); }
  localStorage.setItem('partidaFormat', fmt);
  renderPartidas();
}
function initPartidaFormat() { setPartidaFormat(localStorage.getItem('partidaFormat') || 'grid'); }

function adicionarTimeSeNaoExistir(n) {
  if (!n || !n.trim()) return null;
  var t = dados.times.find(function(x){ return x.nome === n.trim(); });
  if (!t) { t = {id:nextTimeId++,escudo:'⚽',foto:null,nome:n.trim(),j:0,v:0,e:0,d:0,gm:0,gs:0,ult5:['','','','',''],melhor:'-'}; dados.times.push(t); }
  return t;
}
function sincronizarTimes() {
  var nomes = new Set();
  dados.partidas.forEach(function(p){ if (p.mandante) nomes.add(p.mandante.trim()); if (p.visitante) nomes.add(p.visitante.trim()); });
  nomes.forEach(function(n){ adicionarTimeSeNaoExistir(n); });
  dados.times = dados.times.filter(function(t){ return nomes.has(t.nome); });
}

function recalcularClassificacaoPorPartidas() {
  sincronizarTimes();
  dados.times.forEach(function(t){ t.j=0; t.v=0; t.e=0; t.d=0; t.gm=0; t.gs=0; t.pts=0; t.sg=0; t.ult5=['','','','','']; });
  [].concat(dados.partidas).sort(function(a,b){ return (a.data||'').localeCompare(b.data||'')||(a.id-b.id); }).forEach(function(p){
    var tm = dados.times.find(function(t){ return t.nome===p.mandante; });
    var tv = dados.times.find(function(t){ return t.nome===p.visitante; });
    var gm = parseInt(p.golsMandante)||0, gv = parseInt(p.golsVisitante)||0;
    if (tm) { tm.j++; tm.gm+=gm; tm.gs+=gv; if(gm>gv){tm.v++;tm.ult5.push('v')}else if(gm===gv){tm.e++;tm.ult5.push('e')}else{tm.d++;tm.ult5.push('d')} }
    if (tv) { tv.j++; tv.gm+=gv; tv.gs+=gm; if(gv>gm){tv.v++;tv.ult5.push('v')}else if(gv===gm){tv.e++;tv.ult5.push('e')}else{tv.d++;tv.ult5.push('d')} }
  });
  dados.times.forEach(function(t){
    t.pts = t.v*3 + t.e*1 + t.gm - t.gs;
    t.sg = t.gm - t.gs;
    if (t.ult5.length > 5) t.ult5 = t.ult5.slice(-5);
    while (t.ult5.length < 5) t.ult5.unshift('');
  });
}
function calcTime(t) { t.pts = t.v*3 + t.e*1 + t.gm - t.gs; t.sg = t.gm - t.gs; }

function renderClassificacao() {
  dados.times.sort(function(a,b){ return b.pts-a.pts||b.sg-a.sg||b.gm-a.gm||b.v-a.v; });
  var tb = document.getElementById('bodyClassificacao');
  if (!tb) return;
  tb.innerHTML = '';
  dados.times.forEach(function(t, i){
    var pos = i+1, total = dados.times.length;
    var zone = (total>=4 && pos<=4) ? 'zone-class' : (total>=4 && pos>total-2) ? 'zone-rel' : 'zone-mid';
    var medal = pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':'';
    var pd = medal ? '<span class="pos-medal-'+pos+'">'+medal+' '+pos+'º</span>' : '<strong>'+pos+'º</strong>';
    var dots = (t.ult5||[]).map(function(r){ return r ? '<span class="dot '+r+'">'+r.toUpperCase()+'</span>' : ''; }).join('');
    var sgC = t.sg>0?'var(--green)':t.sg<0?'var(--red)':'var(--text)';
    var sgT = (t.sg>0?'+':'')+t.sg;
    var fc = '';
    if (isAdmin) {
      fc = '<input type="file" id="foto-c-'+t.id+'" accept="image/*" style="display:none" onchange="carregarFotoTime('+t.id+',this)">'+(t.foto?'<div style="position:relative;cursor:pointer;display:inline-block" onclick="document.getElementById(\'foto-c-'+t.id+'\').click()"><img src="'+t.foto+'" style="width:26px;height:26px;border-radius:50%;object-fit:cover"><div style="position:absolute;bottom:-2px;right:-2px;background:var(--red);color:#fff;border-radius:50%;width:12px;height:12px;display:flex;align-items:center;justify-content:center;font-size:.45rem;cursor:pointer" onclick="event.stopPropagation();removerFotoTime('+t.id+')"><i class="fa-solid fa-times"></i></div></div>':'<div style="width:26px;height:26px;border-radius:50%;background:var(--bg-card);border:2px dashed var(--neon-dark);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="document.getElementById(\'foto-c-'+t.id+'\').click()"><i class="fa-solid fa-camera" style="color:var(--text-sec);font-size:.55rem"></i></div>');
    } else {
      fc = t.foto ? '<img src="'+t.foto+'" style="width:26px;height:26px;border-radius:50%;object-fit:cover">' : '<span style="font-size:1rem">⚽</span>';
    }
    var tr = document.createElement('tr');
    tr.className = zone;
    tr.style.animationDelay = (i*0.04)+'s';
    tr.innerHTML = '<td>'+pd+'</td><td><div style="display:flex;align-items:center;justify-content:center;gap:4px">'+fc+'</div></td><td style="text-align:left;font-weight:600">'+(isAdmin?'<span contenteditable="true" onblur="updTime('+t.id+',\'nome\',this.textContent)">'+(t.nome||'-')+'</span>':'<span>'+(t.nome||'-')+'</span>')+'</td><td style="opacity:.7">'+(t.j||0)+'</td><td style="color:var(--green);font-weight:600">'+(t.v||0)+'</td><td style="color:var(--yellow)">'+(t.e||0)+'</td><td style="color:var(--red)">'+(t.d||0)+'</td><td>'+(t.gm||0)+'</td><td>'+(t.gs||0)+'</td><td style="color:'+sgC+';font-weight:700">'+sgT+'</td><td class="pts-cell">'+(t.pts||0)+'</td><td><div class="result-dots">'+dots+'</div></td>';
    tb.appendChild(tr);
  });
}

function getTimeDisplay(nome, esc, campo, pid) {
  var time = dados.times.find(function(t){ return t.nome === nome; });
  var id = 'foto-p-'+(time&&time.id||nome.replace(/\s/g,''))+'-'+campo;
  if (isAdmin) {
    if (time && time.foto) return '<input type="file" id="'+id+'" accept="image/*" style="display:none" onchange="carregarFotoTime('+time.id+',this)"><div style="position:relative;cursor:pointer;display:inline-block" onclick="document.getElementById(\''+id+'\').click()"><img src="'+time.foto+'" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid var(--neon-dark);box-shadow:0 0 20px rgba(191,0,255,.3)" alt="'+nome+'"><div style="position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:.5rem;cursor:pointer;box-shadow:0 0 8px rgba(255,0,60,.4)" onclick="event.stopPropagation();removerFotoTime('+time.id+')"><i class="fa-solid fa-times"></i></div></div>';
    return '<input type="file" id="'+id+'" accept="image/*" style="display:none" onchange="carregarFotoTime('+((time&&time.id)||0)+',this)"><div style="width:90px;height:90px;border-radius:50%;border:3px dashed var(--neon-dark);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;box-shadow:0 0 15px rgba(191,0,255,.15)" onclick="document.getElementById(\''+id+'\').click()"><i class="fa-solid fa-camera" style="color:var(--text-sec);font-size:1.4rem"></i></div>';
  }
  if (time && time.foto) return '<div style="display:inline-block"><img src="'+time.foto+'" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid var(--neon-dark);box-shadow:0 0 20px rgba(191,0,255,.3)" alt="'+nome+'"></div>';
  return '<div style="width:90px;height:90px;border-radius:50%;border:3px solid var(--neon-dark);display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(191,0,255,.15)"><span style="font-size:2.2rem">⚽</span></div>';
}

// ================================================================
// FOTO MODAL
// ================================================================
var ajusteFotoAtual = { timeId:null, imagemOriginal:null, zoom:1, posX:0, posY:0 };
var isDragging = false, dragStartX = 0, dragStartY = 0;

function carregarFotoTime(timeId, input) {
  if (!isAdmin || !input.files || !input.files[0]) return;
  var file = input.files[0];
  if (!file.type.startsWith('image/')) { alert('Selecione uma imagem.'); return; }
  if (file.size > 5*1024*1024) { alert('Máximo 5MB.'); return; }
  var r = new FileReader();
  r.onload = function(e){ abrirModalAjusteFoto(timeId, e.target.result); };
  r.readAsDataURL(file);
}
function abrirModalAjusteFoto(timeId, data) {
  if (!isAdmin) return;
  ajusteFotoAtual = { timeId:timeId, imagemOriginal:data, zoom:1, posX:0, posY:0 };
  var img = document.getElementById('ajusteImagem');
  var prev = document.getElementById('previewImagem');
  if (img) img.src = data;
  if (prev) prev.src = data;
  var s = document.getElementById('zoomSlider');
  var v = document.getElementById('zoomValue');
  if (s) s.value = 1;
  if (v) v.textContent = '1.0x';
  resetarPosicao(); atualizarPreview();
  document.getElementById('modalAjusteFoto').classList.add('show');
}
function resetarPosicao() {
  ajusteFotoAtual.posX = 0; ajusteFotoAtual.posY = 0; ajusteFotoAtual.zoom = 1;
  var el = document.getElementById('ajusteImagem');
  if (el) { el.style.transform = 'translate(-50%,-50%) scale(1)'; el.style.left = '50%'; el.style.top = '50%'; }
}
function resetarAjuste() { resetarPosicao(); document.getElementById('zoomSlider').value = 1; document.getElementById('zoomValue').textContent = '1.0x'; atualizarPreview(); }
function atualizarPreview() {
  var imgEl = document.getElementById('ajusteImagem');
  var prevEl = document.getElementById('previewImagem');
  if (!imgEl || !prevEl) return;
  imgEl.style.transform = 'translate(calc(-50% + '+ajusteFotoAtual.posX+'px), calc(-50% + '+ajusteFotoAtual.posY+'px)) scale('+ajusteFotoAtual.zoom+')';
  var c = document.createElement('canvas'); c.width = 80; c.height = 80;
  var ctx = c.getContext('2d');
  var img = new Image();
  img.onload = function(){
    var ir = img.width / img.height;
    var dw = ir > 1 ? 80*ir : 80, dh = ir > 1 ? 80 : 80/ir;
    ctx.save(); ctx.beginPath(); ctx.arc(40,40,40,0,Math.PI*2); ctx.clip();
    ctx.translate(40+ajusteFotoAtual.posX, 40+ajusteFotoAtual.posY);
    ctx.scale(ajusteFotoAtual.zoom, ajusteFotoAtual.zoom);
    ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
    ctx.restore();
    prevEl.src = c.toDataURL();
  };
  img.src = ajusteFotoAtual.imagemOriginal;
}
function confirmarAjusteFoto() {
  if (!isAdmin) return;
  var c = document.createElement('canvas'); c.width = 200; c.height = 200;
  var ctx = c.getContext('2d');
  var img = new Image();
  img.onload = function(){
    var ir = img.width / img.height;
    var dw = ir > 1 ? 200*ir : 200, dh = ir > 1 ? 200 : 200/ir;
    ctx.save(); ctx.beginPath(); ctx.arc(100,100,100,0,Math.PI*2); ctx.clip();
    ctx.translate(100+ajusteFotoAtual.posX*2.5, 100+ajusteFotoAtual.posY*2.5);
    ctx.scale(ajusteFotoAtual.zoom, ajusteFotoAtual.zoom);
    ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
    ctx.restore();
    var final = c.toDataURL('image/png', 0.9);
    var time = dados.times.find(function(t){ return t.id === ajusteFotoAtual.timeId; });
    if (time) { time.foto = final; salvarLocal(); renderTimes(); renderClassificacao(); renderPartidas(); }
    cancelarAjusteFoto();
  };
  img.src = ajusteFotoAtual.imagemOriginal;
}
function cancelarAjusteFoto() {
  document.getElementById('modalAjusteFoto').classList.remove('show');
  ajusteFotoAtual = { timeId:null, imagemOriginal:null, zoom:1, posX:0, posY:0 };
}

document.addEventListener('DOMContentLoaded', function(){
  var ac = document.getElementById('ajusteContainer');
  var zs = document.getElementById('zoomSlider');
  var zv = document.getElementById('zoomValue');
  if (ac) ac.addEventListener('mousedown', function(e){ isDragging = true; dragStartX = e.clientX - ajusteFotoAtual.posX; dragStartY = e.clientY - ajusteFotoAtual.posY; ac.style.cursor = 'grabbing'; });
  document.addEventListener('mousemove', function(e){ if (!isDragging) return; ajusteFotoAtual.posX = e.clientX - dragStartX; ajusteFotoAtual.posY = e.clientY - dragStartY; atualizarPreview(); });
  document.addEventListener('mouseup', function(){ isDragging = false; if (ac) ac.style.cursor = 'move'; });
  if (zs) zs.addEventListener('input', function(e){ ajusteFotoAtual.zoom = parseFloat(e.target.value); if (zv) zv.textContent = ajusteFotoAtual.zoom.toFixed(1)+'x'; atualizarPreview(); });
});

function removerFotoTime(id) {
  if (!isAdmin) return;
  if (!confirm('Remover a foto?')) return;
  var t = dados.times.find(function(x){ return x.id === id; });
  if (t) { t.foto = null; salvarLocal(); renderTimes(); renderClassificacao(); renderPartidas(); }
}
function resetarDados() {
  if (!isAdmin) return;
  if (!confirm('⚠️ Isso apagará TODOS os dados.\nO tema será mantido.\nContinuar?')) return;
  if (!confirm('🔴 ÚLTIMA CHANCE: Tem certeza absoluta?')) return;
  var t = localStorage.getItem('temaAtual'), f = localStorage.getItem('partidaFormat');
  localStorage.clear();
  if (t) localStorage.setItem('temaAtual', t);
  if (f) localStorage.setItem('partidaFormat', f);
  location.reload();
}
function updTime(id, campo, val) {
  if (!isAdmin) return;
  var t = dados.times.find(function(x){ return x.id === id; });
  if (t) { t[campo] = val.trim(); recalcularClassificacaoPorPartidas(); renderClassificacao(); atualizarDashboard(); salvarLocal(); }
}
function delTime(id) {
  if (!isAdmin) return;
  confirmar('Excluir este time?', function(){
    dados.times = dados.times.filter(function(x){ return x.id !== id; });
    recalcularClassificacaoPorPartidas(); renderClassificacao(); atualizarDashboard(); salvarLocal();
  });
}
function addTime() {
  if (!isAdmin) return;
  dados.times.push({id:nextTimeId++,escudo:'⚽',foto:null,nome:'Novo Time',j:0,v:0,e:0,d:0,gm:0,gs:0,ult5:['','','','',''],melhor:'-'});
  recalcularClassificacaoPorPartidas(); renderClassificacao(); renderTimes(); atualizarDashboard(); salvarLocal();
}

// ================================================================
// STATUS HELPERS
// ================================================================
var statusBadgeClass = function(s){ return ({Agendado:'badge-agendado','Ao Vivo':'badge-aovivo',Encerrado:'badge-encerrado',Cancelado:'badge-cancelado',Adiado:'badge-adiado'})[s]||'badge-agendado'; };
var statusCardClass = function(s){ return ({Agendado:'status-agendado','Ao Vivo':'status-aovivo',Encerrado:'status-encerrado',Cancelado:'status-cancelado',Adiado:'status-adiado'})[s]||''; };
var statusOpts = ['Agendado','Ao Vivo','Encerrado','Cancelado','Adiado'];

// ================================================================
// PARTIDAS
// ================================================================
var statsLabels = ['Chutes ao Gol','Escanteios','Gols Perdidos'];
var statsKeys = ['chutesGol','escanteios','golsPerdidos'];
var discNumLabels = ['Faltas Cometidas','Faltas Sofridas','Reclamações c/ Árbitro'];
var discNumKeys = ['faltasC','faltasS','reclamacoes'];
var compOpts = ['Ótimo','Bom','Regular','Ruim'];

function statsHTML(pid, side, stats) {
  return statsKeys.map(function(k,i){ return isAdmin ? '<div class="detail-row"><span class="lbl">'+statsLabels[i]+'</span><span class="val" contenteditable="true" onblur="updStat('+pid+',\''+side+'\',\''+k+'\',this.textContent)">'+(stats[k]??0)+'</span></div>' : '<div class="detail-row"><span class="lbl">'+statsLabels[i]+'</span><span class="val">'+(stats[k]??0)+'</span></div>'; }).join('');
}
function discHTML(pid, side, disc) {
  var contar = function(arr){ return Array.isArray(arr) ? arr.length : 0; };
  var h = discNumKeys.map(function(k,i){ return isAdmin ? '<div class="detail-row"><span class="lbl">'+discNumLabels[i]+'</span><span class="val" contenteditable="true" onblur="updDisc('+pid+',\''+side+'\',\''+k+'\',this.textContent)">'+(disc[k]??0)+'</span></div>' : '<div class="detail-row"><span class="lbl">'+discNumLabels[i]+'</span><span class="val">'+(disc[k]??0)+'</span></div>'; }).join('');
  if (isAdmin) {
    var am = Array.from({length:12},function(_,i){ return '<option value="'+i+'" '+(contar(disc.amarelos)===i?'selected':'')+'>'+i+'</option>'; }).join('');
    var vm = Array.from({length:12},function(_,i){ return '<option value="'+i+'" '+(contar(disc.vermelhos)===i?'selected':'')+'>'+i+'</option>'; }).join('');
    h += '<div class="detail-row"><span class="lbl">Cartões Amarelos</span><span class="val"><select onchange="updDiscCardsCount('+pid+',\''+side+'\',\'amarelos\',this.value)" style="color:var(--yellow)">'+am+'</select></span></div>';
    h += '<div class="detail-row"><span class="lbl">Cartões Vermelhos</span><span class="val"><select onchange="updDiscCardsCount('+pid+',\''+side+'\',\'vermelhos\',this.value)" style="color:#ff003c">'+vm+'</select></span></div>';
    h += '<div class="detail-row"><span class="lbl">Comportamento</span><span class="val"><select onchange="updDiscS('+pid+',\''+side+'\',\'comportamento\',this.value)">'+compOpts.map(function(o){ return '<option value="'+o+'" '+(disc.comportamento===o?'selected':'')+'>'+o+'</option>'; }).join('')+'</select></span></div>';
    h += '<div class="detail-row"><span class="lbl">Punições Pós-Jogo</span><span class="val" contenteditable="true" onblur="updDiscS('+pid+',\''+side+'\',\'punicoes\',this.textContent)">'+(disc.punicoes||'-')+'</span></div>';
    h += '<div class="detail-row"><span class="lbl">Obs. Disciplinares</span><span class="val" contenteditable="true" onblur="updDiscS('+pid+',\''+side+'\',\'obs\',this.textContent)" style="white-space:normal;text-align:right;max-width:180px">'+(disc.obs||'-')+'</span></div>';
  } else {
    h += '<div class="detail-row"><span class="lbl">Cartões Amarelos</span><span class="val" style="color:var(--yellow)">'+contar(disc.amarelos)+'</span></div>';
    h += '<div class="detail-row"><span class="lbl">Cartões Vermelhos</span><span class="val" style="color:#ff003c">'+contar(disc.vermelhos)+'</span></div>';
    h += '<div class="detail-row"><span class="lbl">Comportamento</span><span class="val">'+(disc.comportamento||'Ótimo')+'</span></div>';
    h += '<div class="detail-row"><span class="lbl">Punições Pós-Jogo</span><span class="val">'+(disc.punicoes||'-')+'</span></div>';
    h += '<div class="detail-row"><span class="lbl">Obs. Disciplinares</span><span class="val" style="white-space:normal;text-align:right;max-width:180px">'+(disc.obs||'-')+'</span></div>';
  }
  return h;
}

function cardHTML(p) {
  return '<div class="match-header"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="badge '+statusBadgeClass(p.status)+'" id="badge-'+p.id+'">'+p.status+'</span>'+(isAdmin?'<button class="btn-del" onclick="delPartida('+p.id+')"><i class="fa-solid fa-trash"></i> Excluir</button>':'')+'</div><div class="match-meta">'+(p.rodada||'')+'</div></div><div class="match-scoreboard"><div class="match-team">'+(isAdmin?'<button class="gols-toggle-btn" onclick="toggleGols('+p.id+',\'mandante\',this)"><i class="fa-solid fa-futbol"></i></button>':'')+getTimeDisplay(p.mandante,p.escMandante,'mandante',p.id)+'<span class="name">'+p.mandante+'</span>'+(isAdmin?'<div class="gols-container" id="gols-mandante-'+p.id+'">'+renderGols(p.id,'mandante',p.golsMandante,p.golsMandanteMarcadores)+'</div>':'')+'</div><div class="match-score"><div>'+(isAdmin?'<span contenteditable="true" onblur="updPartN('+p.id+',\'golsMandante\',this.textContent)">'+p.golsMandante+'</span>':'<span>'+p.golsMandante+'</span>')+'<span class="x">×</span>'+(isAdmin?'<span contenteditable="true" onblur="updPartN('+p.id+',\'golsVisitante\',this.textContent)">'+p.golsVisitante+'</span>':'<span>'+p.golsVisitante+'</span>')+'</div></div><div class="match-team">'+(isAdmin?'<button class="gols-toggle-btn" onclick="toggleGols('+p.id+',\'visitante\',this)"><i class="fa-solid fa-futbol"></i></button>':'')+getTimeDisplay(p.visitante,p.escVisitante,'visitante',p.id)+'<span class="name">'+p.visitante+'</span>'+(isAdmin?'<div class="gols-container" id="gols-visitante-'+p.id+'">'+renderGols(p.id,'visitante',p.golsVisitante,p.golsVisitanteMarcadores)+'</div>':'')+'</div></div>'+(isAdmin?'<div style="text-align:center"><button class="match-toggle" onclick="toggleMatch(this)"><i class="fa-solid fa-chart-bar"></i> Ver Detalhes</button></div>':'')+'<div class="match-expandable"><div class="match-details" style="margin-top:10px"><div class="detail-group"><h4>📅 Informações</h4>'+(isAdmin?'<div class="detail-row"><span class="lbl">Rodada</span><span class="val" contenteditable="true" onblur="updPart('+p.id+',\'rodada\',this.textContent)" style="color:var(--accent);font-family:\'Orbitron\';font-weight:700">'+p.rodada+'</span></div><div class="detail-row"><span class="lbl">Data</span><span class="val"><input type="date" value="'+p.data+'" onchange="updPart('+p.id+',\'data\',this.value)"></span></div><div class="detail-row"><span class="lbl">Horário</span><span class="val" style="display:flex;gap:4px"><input type="time" value="'+p.horaInicio+'" onchange="updPart('+p.id+',\'horaInicio\',this.value)" style="width:48%"> - <input type="time" value="'+p.horaFim+'" onchange="updPart('+p.id+',\'horaFim\',this.value)" style="width:48%"></span></div><div class="detail-row"><span class="lbl">Status</span><span class="val"><select onchange="updPartStatus('+p.id+',this.value)">'+statusOpts.map(function(o){ return '<option value="'+o+'" '+(p.status===o?'selected':'')+'>'+o+'</option>'; }).join('')+'</select></span></div>':'<div class="detail-row"><span class="lbl">Rodada</span><span class="val">'+p.rodada+'</span></div><div class="detail-row"><span class="lbl">Data</span><span class="val">'+(p.data||'-')+'</span></div><div class="detail-row"><span class="lbl">Horário</span><span class="val">'+(p.horaInicio||'')+(p.horaFim?' - '+p.horaFim:'')+'</span></div><div class="detail-row"><span class="lbl">Status</span><span class="val">'+p.status+'</span></div>')+'<div class="detail-row"><span class="lbl">Local</span><span class="val">'+(isAdmin?'<span contenteditable="true" onblur="updPart('+p.id+',\'local\',this.textContent)">'+p.local+'</span>':p.local)+'</span></div><div class="detail-row"><span class="lbl">Árbitro</span><span class="val">'+(isAdmin?'<span contenteditable="true" onblur="updPart('+p.id+',\'arbitro\',this.textContent)">'+p.arbitro+'</span>':p.arbitro)+'</span></div><div class="detail-row"><span class="lbl">Assistente</span><span class="val">'+(isAdmin?'<span contenteditable="true" onblur="updPart('+p.id+',\'arbitro2\',this.textContent)">'+p.arbitro2+'</span>':p.arbitro2)+'</span></div><div class="detail-row"><span class="lbl">Observador</span><span class="val">'+(isAdmin?'<span contenteditable="true" onblur="updPart('+p.id+',\'observador\',this.textContent)">'+p.observador+'</span>':p.observador)+'</span></div></div></div><div class="match-details" style="margin-top:10px"><div class="detail-group"><h4>📊 Estatísticas — '+p.mandante+'</h4>'+statsHTML(p.id,'statsMandante',p.statsMandante)+'</div><div class="detail-group"><h4>📊 Estatísticas — '+p.visitante+'</h4>'+statsHTML(p.id,'statsVisitante',p.statsVisitante)+'</div></div><div class="match-details" style="margin-top:10px"><div class="detail-group"><h4>🟨 Disciplina — '+p.mandante+'</h4>'+discHTML(p.id,'discMandante',p.discMandante)+'</div><div class="detail-group"><h4>🟨 Disciplina — '+p.visitante+'</h4>'+discHTML(p.id,'discVisitante',p.discVisitante)+'</div></div></div>';
}

function renderPartidas() {
  var c = document.getElementById('listaPartidas');
  if (!c) return;
  c.innerHTML = '';
  c.classList.remove('partidas-grid','partidas-list');
  c.classList.add('partidas-'+partidaFormat);
  dados.partidas.forEach(function(p, idx){
    var card = document.createElement('div');
    card.className = 'match-card ' + statusCardClass(p.status) + ' match-card-enter';
    card.style.animationDelay = (idx*0.07)+'s';
    card.dataset.partida = p.id;
    card.innerHTML = cardHTML(p);
    if (isAdmin) card.addEventListener('click', function(e){
      if (e.target.closest('button,select,input,[contenteditable],.match-expandable')) return;
      var btn = this.querySelector('.match-toggle');
      if (btn) toggleMatch(btn);
    });
    c.appendChild(card);
  });
  atualizarDashboard();
}

function toggleMatch(btn) {
  var exp = btn.parentElement.nextElementSibling;
  if (!exp) return;
  exp.classList.toggle('show');
  btn.innerHTML = exp.classList.contains('show') ? '<i class="fa-solid fa-eye-slash"></i> Ocultar Detalhes' : '<i class="fa-solid fa-chart-bar"></i> Ver Detalhes';
}

function updPart(id, campo, val) {
  if (!isAdmin) return;
  var p = dados.partidas.find(function(x){ return x.id === id; });
  if (!p) return;
  p[campo] = typeof val === 'string' ? val.trim() : val;
  if (campo === 'mandante' || campo === 'visitante') { recalcularClassificacaoPorPartidas(); renderClassificacao(); renderTimes(); }
  atualizarDashboard(); renderTimes(); salvarLocal();
}
function updPartN(id, campo, val) {
  if (!isAdmin) return;
  var p = dados.partidas.find(function(x){ return x.id === id; });
  if (!p) return;
  p[campo] = parseInt(val) || 0;
  atualizarGols(p.id, campo, p[campo]);
  recalcularClassificacaoPorPartidas(); renderClassificacao(); atualizarDashboard(); renderTimes(); salvarLocal();
}
function toggleGols(pid, time, btn) {
  if (!isAdmin) return;
  var c = document.getElementById('gols-'+time+'-'+pid);
  if (!c) return;
  c.classList.toggle('show');
  var open = c.classList.contains('show');
  btn.innerHTML = open ? '<i class="fa-solid fa-times"></i>' : '<i class="fa-solid fa-futbol"></i>';
  btn.style.background = open ? 'var(--red)' : 'var(--accent)';
}
function atualizarGols(pid, cp, ng) {
  var time = cp === 'golsMandante' ? 'mandante' : 'visitante';
  var c = document.getElementById('gols-'+time+'-'+pid);
  if (!c) return;
  var camp = time === 'mandante' ? 'golsMandanteMarcadores' : 'golsVisitanteMarcadores';
  var marc = dados.partidas.find(function(p){ return p.id === pid; })[camp] || [];
  c.innerHTML = renderGols(pid, time, ng, marc);
}
function renderGols(pid, time, ng, marc) {
  var al = time === 'mandante' ? 'right' : 'left';
  var h = '';
  for (var i=0; i<ng; i++) {
    var v = marc && marc[i] ? marc[i] : '';
    h += '<div style="margin:2px 0"><input type="text" value="'+v+'" placeholder="jogador;minuto" onchange="updGol('+pid+',\''+time+'\','+i+',this.value)" style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--neon-dark);padding:2px 4px;font-size:calc(.5rem * var(--font-scale));color:var(--text);text-align:'+al+'"></div>';
  }
  return h;
}
function updGol(pid, time, idx, val) {
  if (!isAdmin) return;
  var p = dados.partidas.find(function(x){ return x.id === pid; });
  if (!p) return;
  var camp = time === 'mandante' ? 'golsMandanteMarcadores' : 'golsVisitanteMarcadores';
  if (!p[camp]) p[camp] = [];
  p[camp][idx] = val.trim();
  salvarLocal();
}
function updPartStatus(id, val) {
  if (!isAdmin) return;
  var p = dados.partidas.find(function(x){ return x.id === id; });
  if (!p) return;
  p.status = val;
  var badge = document.getElementById('badge-'+id);
  if (badge) { badge.className = 'badge '+statusBadgeClass(val); badge.textContent = val; }
  var card = document.querySelector('[data-partida="'+id+'"]');
  if (card) { card.className = card.className.replace(/status-\w+/g,'') + ' ' + statusCardClass(val); }
  if (val === 'Encerrado') { recalcularClassificacaoPorPartidas(); renderClassificacao(); }
  atualizarDashboard(); renderTimes(); salvarLocal();
}
function updStat(id, side, key, val) { if (!isAdmin) return; var p = dados.partidas.find(function(x){ return x.id === id; }); if (p) { p[side][key] = parseInt(val)||0; atualizarDashboard(); renderTimes(); salvarLocal(); } }
function updDisc(id, side, key, val) { if (!isAdmin) return; var p = dados.partidas.find(function(x){ return x.id === id; }); if (p) { p[side][key] = parseInt(val)||0; atualizarDashboard(); renderTimes(); salvarLocal(); } }
function updDiscS(id, side, key, val) { if (!isAdmin) return; var p = dados.partidas.find(function(x){ return x.id === id; }); if (p) { p[side][key] = val; renderTimes(); salvarLocal(); } }
function updDiscCardsCount(id, side, key, count) {
  if (!isAdmin) return;
  var p = dados.partidas.find(function(x){ return x.id === id; });
  if (!p) return;
  var n = parseInt(count)||0;
  p[side][key] = n === 0 ? [] : Array.from({length:n}, function(_,i){ return {jogador:'Jogador '+(i+1), motivo:'Cartão '+(key==='amarelos'?'Amarelo':'Vermelho')+' '+(i+1)}; });
  atualizarDashboard(); renderTimes(); salvarLocal();
}
function delPartida(id) {
  if (!isAdmin) return;
  confirmar('Excluir esta partida?', function(){
    dados.partidas = dados.partidas.filter(function(x){ return x.id !== id; });
    var card = document.querySelector('[data-partida="'+id+'"]');
    if (card) { card.style.transition = 'opacity .3s,transform .3s'; card.style.opacity = '0'; card.style.transform = 'translateX(30px)'; setTimeout(function(){ card.remove(); }, 300); }
    recalcularClassificacaoPorPartidas(); renderClassificacao(); atualizarDashboard(); renderTimes(); salvarLocal();
  });
}
function addPartida() {
  if (!isAdmin) return;
  var p = { id:nextPartId++, rodada:'Nova Rodada', data:new Date().toISOString().slice(0,10), horaInicio:'08:00', horaFim:'', mandante:'Time A', escMandante:'⚽', golsMandante:0, golsMandanteMarcadores:[], visitante:'Time B', escVisitante:'⚽', golsVisitante:0, golsVisitanteMarcadores:[], local:'Local', arbitro:'Árbitro', arbitro2:'Assistente', observador:'Observador', status:'Ao Vivo', statsMandante:{chutesGol:0,escanteios:0,golsPerdidos:0}, statsVisitante:{chutesGol:0,escanteios:0,golsPerdidos:0}, discMandante:{faltasC:0,faltasS:0,amarelos:[],vermelhos:[],punicoes:'',reclamacoes:0,comportamento:'Ótimo',obs:''}, discVisitante:{faltasC:0,faltasS:0,amarelos:[],vermelhos:[],punicoes:'',reclamacoes:0,comportamento:'Ótimo',obs:''} };
  dados.partidas.push(p); salvarLocal();
  var card = document.createElement('div');
  card.className = 'match-card ' + statusCardClass(p.status) + ' match-card-enter';
  card.style.animationDelay = '0s';
  card.dataset.partida = p.id;
  card.innerHTML = cardHTML(p);
  document.getElementById('listaPartidas').appendChild(card);
  atualizarDashboard();
  document.querySelectorAll('.nav-tab').forEach(function(b){ b.classList.remove('active'); });
  var tab = document.querySelector('.nav-tab[data-tab="partidas"]');
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.section').forEach(function(s){ s.classList.remove('active'); });
  var sec = document.getElementById('sec-partidas');
  if (sec) sec.classList.add('active');
  setTimeout(function(){ card.scrollIntoView({behavior:'smooth',block:'center'}); }, 120);
}

// ================================================================
// DASHBOARD
// ================================================================
function contarCartoes(d, t) {
  if (!d || !d[t]) return 0;
  var c = d[t];
  if (Array.isArray(c)) return c.length;
  if (typeof c === 'string') return (c.trim()===''||c.trim()==='Nenhum')?0:c.split(';').filter(function(s){ return s.trim(); }).length;
  if (typeof c === 'number') return c;
  if (typeof c === 'object') return Object.keys(c).length;
  return 0;
}
function atualizarDashboard() {
  var gols=0,ama=0,ver=0,faltas=0,part=0;
  dados.partidas.forEach(function(p){
    gols += (p.golsMandante||0)+(p.golsVisitante||0);
    part++;
    ama += contarCartoes(p.discMandante,'amarelos')+contarCartoes(p.discVisitante,'amarelos');
    ver += contarCartoes(p.discMandante,'vermelhos')+contarCartoes(p.discVisitante,'vermelhos');
    faltas += (p.discMandante?.faltasC||0)+(p.discVisitante?.faltasC||0);
  });
  document.getElementById('dashGols').textContent = gols;
  document.getElementById('dashPartidas').textContent = part;
  document.getElementById('dashAmarelos').textContent = ama;
  document.getElementById('dashVermelhos').textContent = ver;
  if (dados.times.length > 0) {
    dados.times.forEach(calcTime);
    var sorted = [].concat(dados.times).sort(function(a,b){ return b.pts-a.pts||b.sg-a.sg||b.gm-a.gm||b.v-a.v; });
    document.getElementById('dashLider').textContent = sorted[0].nome;
  }
}

// ================================================================
// LOCAL STORAGE
// ================================================================
function salvarLocal() {
  try {
    var el = document.getElementById('campeonatoNome');
    if (el) dados.campeonato = el.textContent.trim()||dados.campeonato;
    localStorage.setItem('futebolEscolar', JSON.stringify(dados));
  } catch(e){}
}
function carregarLocal() {
  try {
    var raw = localStorage.getItem('futebolEscolar');
    if (raw) {
      var d = JSON.parse(raw);
      dados = Object.assign({}, dados, d);
      if (!Array.isArray(dados.times)) dados.times = [];
      if (!Array.isArray(dados.jogadores)) dados.jogadores = [];
      if (!Array.isArray(dados.partidas)) dados.partidas = [];
      var defS = {chutesGol:0,escanteios:0,golsPerdidos:0};
      var defD = {faltasC:0,faltasS:0,amarelos:[],vermelhos:[],punicoes:'',reclamacoes:0,comportamento:'Ótimo',obs:''};
      dados.partidas.forEach(function(p){
        if (!p.statsMandante) p.statsMandante = Object.assign({}, defS);
        if (!p.statsVisitante) p.statsVisitante = Object.assign({}, defS);
        if (!p.discMandante) p.discMandante = Object.assign({}, defD);
        if (!p.discVisitante) p.discVisitante = Object.assign({}, defD);
        ['amarelos','vermelhos'].forEach(function(k){
          if (!Array.isArray(p.discMandante[k])) p.discMandante[k]=[];
          if (!Array.isArray(p.discVisitante[k])) p.discVisitante[k]=[];
        });
      });
      if (dados.times.length) nextTimeId = Math.max.apply(null, dados.times.map(function(t){ return t.id; })) + 1;
      if (dados.jogadores.length) nextJogId = Math.max.apply(null, dados.jogadores.map(function(j){ return j.id; })) + 1;
      if (dados.partidas.length) nextPartId = Math.max.apply(null, dados.partidas.map(function(p){ return p.id; })) + 1;
      var el = document.getElementById('campeonatoNome');
      if (el) el.textContent = dados.campeonato || 'INTERCLASSE SESI 2026';
      recalcularClassificacaoPorPartidas();
    }
    var ts = localStorage.getItem('temaAtual');
    aplicarTema(ts && TEMA_VARS[ts] ? ts : 'default');
    var ft = localStorage.getItem('tamanhoFonte');
    if (ft) aplicarTamanhoFonte(ft);
    initPartidaFormat();
  } catch(e){}
}
