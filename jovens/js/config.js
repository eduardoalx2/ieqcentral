// ============================================================
//  config.js — Configuração central do sistema de Jovens
//  CONGRESSO ESTADUAL DE JOVENS — IEQ Região 655
// ============================================================

// ⚠️ COLE AQUI a URL do Web App gerada no deploy do Apps Script da planilha
export const API_URL = 'https://script.google.com/macros/s/AKfycbwL4rklo6SthsP5rCEGXOAvE-7i5gSj68VmZyHaKa2e4VmBkLrFLOZcDR7C2V0r4CE/exec';

// Senha de acesso administrativo ao painel
export const SENHA_ADMIN = 'admin';

// ── Chamadas à API (CORS com fetch sem credenciais para evitar conflitos de login) ──
export async function apiGet(action, tentativas = 3) {
  if (API_URL === 'COLE_AQUI_A_URL_DO_WEB_APP') {
    throw new Error('A URL da API não foi configurada no arquivo js/config.js');
  }

  const url = `${API_URL}?action=${action}`;

  for (let i = 0; i < tentativas; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit' // Evita enviar cookies do Google, contornando o erro de login múltiplo
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (err) {
      if (i === tentativas - 1) {
        console.error('Erro na requisição da API:', err);
        throw new Error('Erro ao conectar com a API do Google Sheets');
      }
      // Espera antes de tentar novamente (backoff)
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
}

export async function apiPost(action, payload) {
  if (API_URL === 'COLE_AQUI_A_URL_DO_WEB_APP') {
    throw new Error('A URL da API não foi configurada no arquivo js/config.js');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit', // Evita enviar cookies do Google
      headers: {
        'Content-Type': 'text/plain' // Usamos text/plain para evitar o preflight OPTIONS
      },
      body: JSON.stringify({ action, ...payload })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (err) {
    console.error('Erro no envio da API:', err);
    throw new Error('Erro ao conectar com a API do Google Sheets ao enviar dados');
  }
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
