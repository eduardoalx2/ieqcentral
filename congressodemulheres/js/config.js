// ============================================================
//  config.js — Configuração central do sistema
//  CONGRESSO DE MULHERES — IEQ Região 655
// ============================================================

// ⚠️ COLE AQUI a URL do Web App gerada no deploy do Apps Script (ver LEIA-ME.md)
export const API_URL = 'https://script.google.com/macros/s/AKfycbyitQ6E-O0bbnPBeAPFXUvmJ3_t0i2e_OQxeUROS6q8bwGm6CVjn0WgXl8zD8_usfV4gw/exec';

// Valor da inscrição por pessoa (R$)
export const VALOR_INSCRICAO = 210;

// ── Chamadas à API ───────────────────────────────────────────
// GET — usa parâmetro callback para contornar CORS (JSONP).
// Faz novas tentativas automáticas: o backend (Apps Script) às vezes "dorme"
// e a 1ª chamada falha/demora. Repetir a LEITURA é seguro (não duplica dados).
export function apiGet(action, tentativas = 3) {
  function umaTentativa(timeoutMs) {
    return new Promise((resolve, reject) => {
      const cbName = '_cb_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout na requisição'));
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

      script.onerror = () => { cleanup(); reject(new Error('Erro ao conectar com a API')); };
      script.src = `${API_URL}?action=${action}&callback=${cbName}`;
      document.head.appendChild(script);
    });
  }

  function tentar(restantes, timeoutMs) {
    return umaTentativa(timeoutMs).catch(err => {
      if (restantes <= 1) throw err;
      // espera um pouco e tenta de novo, dando mais tempo a cada rodada
      return new Promise(r => setTimeout(r, 800))
        .then(() => tentar(restantes - 1, Math.min(timeoutMs + 6000, 25000)));
    });
  }

  return tentar(tentativas, 12000);
}

// POST — usa no-cors com dados via URL (GET com action=post)
export async function apiPost(action, payload) {
  const body = JSON.stringify({ action, ...payload });
  const url  = `${API_URL}?method=POST&body=${encodeURIComponent(body)}`;

  return new Promise((resolve, reject) => {
    const cbName = '_cb_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout na requisição'));
    }, 15000);

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

    script.onerror = () => { cleanup(); reject(new Error('Erro ao conectar com a API')); };
    script.src = `${url}&callback=${cbName}`;
    document.head.appendChild(script);
  });
}

// ── Formatação ───────────────────────────────────────────────
export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(str) {
  if (!str) return '—';
  return str;
}

// ── Toast de feedback ────────────────────────────────────────
export function showToast(msg, type = 'success') {
  const colors = { success: '#22c55e', error: '#ef4444', info: '#e11d48' };
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colors[type] || colors.info}; color:#fff;
    padding:12px 20px; border-radius:10px; font-size:14px;
    box-shadow:0 4px 20px rgba(0,0,0,.2); font-family:inherit;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Modal ────────────────────────────────────────────────────
export function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.getElementById(id).classList.add('flex');
}

export function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.getElementById(id).classList.remove('flex');
}
