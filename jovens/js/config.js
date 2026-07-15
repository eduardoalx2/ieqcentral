// ============================================================
//  config.js — Configuração central do sistema de Jovens
//  CONGRESSO ESTADUAL DE JOVENS — IEQ Região 655
// ============================================================

// ⚠️ COLE AQUI a URL do Web App gerada no deploy do Apps Script da planilha
export const API_URL = 'https://script.google.com/macros/s/AKfycbwL4rklo6SthsP5rCEGXOAvE-7i5gSj68VmZyHaKa2e4VmBkLrFLOZcDR7C2V0r4CE/exec';

// Senha de acesso administrativo ao painel
export const SENHA_ADMIN = 'admin';

// ── Chamadas à API (JSONP para contornar CORS no GitHub Pages) ────────────────
export function apiGet(action, tentativas = 3) {
  function umaTentativa(timeoutMs) {
    return new Promise((resolve, reject) => {
      if (API_URL === 'COLE_AQUI_A_URL_DO_WEB_APP') {
        reject(new Error('A URL da API não foi configurada no arquivo js/config.js'));
        return;
      }
      const cbName = '_cb_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout na requisição da API (Apps Script dormindo?)'));
      }, timeoutMs);

      window[cbName] = function(data) {
        cleanup();
        if (data && data.error) reject(new Error(data.error));
        else resolve(data);
      };

      function cleanup() {
        clearTimeout(timeout);
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      script.onerror = () => { cleanup(); reject(new Error('Erro ao conectar com a API do Google Sheets')); };
      script.src = `${API_URL}?action=${action}&callback=${cbName}`;
      document.head.appendChild(script);
    });
  }

  function tentar(restantes, timeoutMs) {
    return umaTentativa(timeoutMs).catch(err => {
      if (restantes <= 1) throw err;
      // Espera 800ms antes de tentar novamente, dando mais timeout na próxima tentativa
      return new Promise(r => setTimeout(r, 800))
        .then(() => tentar(restantes - 1, Math.min(timeoutMs + 6000, 25000)));
    });
  }

  return tentar(tentativas, 12000);
}

export async function apiPost(action, payload) {
  return new Promise((resolve, reject) => {
    if (API_URL === 'COLE_AQUI_A_URL_DO_WEB_APP') {
      reject(new Error('A URL da API não foi configurada no arquivo js/config.js'));
      return;
    }
    const body = JSON.stringify({ action, ...payload });
    const url  = `${API_URL}?method=POST&body=${encodeURIComponent(body)}`;
    
    const cbName = '_cb_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout no envio dos dados (Apps Script dormindo?)'));
    }, 18000);

    window[cbName] = function(data) {
      cleanup();
      if (data && data.error) reject(new Error(data.error));
      else resolve(data);
    };

    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    script.onerror = () => { cleanup(); reject(new Error('Erro ao conectar com a API do Google Sheets ao enviar dados')); };
    script.src = `${url}&callback=${cbName}`;
    document.head.appendChild(script);
  });
}

// ── Verificação de Sessão (Login Administrativo) ─────────────────────────────
export function checkAdminSession() {
  const isAuth = sessionStorage.getItem('jovens_admin_auth') === 'true';
  return isAuth;
}

export function setAdminSession(senha) {
  if (senha === SENHA_ADMIN) {
    sessionStorage.setItem('jovens_admin_auth', 'true');
    return true;
  }
  return false;
}

export function clearAdminSession() {
  sessionStorage.removeItem('jovens_admin_auth');
}

// ── Utilitários de Formatação ────────────────────────────────────────────────
export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(str) {
  if (!str) return '—';
  return str;
}

// Formata data do formato de banco para formato de visualização amigável
export function fmtData(v) {
  if (!v) return '';
  if (/^\d{2}\/\d{2}\/\d{4}/.test(v)) return v.slice(0, 10);
  const d = new Date(v);
  if (isNaN(d)) return v;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Converte data para o input HTML (yyyy-MM-dd)
export function toInputDate(v) {
  if (!v) return '';
  if (/^\d{2}\/\d{2}\/\d{4}/.test(v)) { 
    const [d,m,y] = v.slice(0,10).split('/'); 
    return `${y}-${m}-${d}`; 
  }
  const dt = new Date(v);
  if (isNaN(dt)) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

// ── Toast de Feedback (Aparência Roxo/Jovem) ──────────────────────────────────
export function showToast(msg, type = 'success') {
  const colors = { 
    success: '#7c3aed', // Roxo Violet-600
    error: '#ef4444',   // Vermelho Red-500
    info: '#3b82f6',    // Azul Blue-500
    warning: '#f59e0b'  // Laranja Amber-500
  };
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${colors[type] || colors.info}; color: #fff;
    padding: 12px 20px; border-radius: 12px; font-size: 14px;
    font-weight: 500; box-shadow: 0 10px 25px rgba(124, 58, 237, 0.25);
    font-family: inherit; transition: all 0.3s ease;
    opacity: 0; transform: translateY(10px);
  `;
  document.body.appendChild(t);
  
  // Animation frames
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    setTimeout(() => t.remove(), 300);
  }, 4000);
}
