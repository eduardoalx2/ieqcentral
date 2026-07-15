// ============================================================
//  CONGRESSO ESTADUAL DE JOVENS — IEQ Região 655
//  Google Apps Script — Web App Backend
//  Deploy: Executar como "Eu", Acesso "Qualquer pessoa"
// ============================================================

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function inicializarPlanilha() {
  const config = {
    igrejas:   ['id', 'nome', 'meta'],
    inscritos: ['id', 'nomeCompleto', 'cpf', 'dataNascimento', 'sexo', 'email', 'igrejaId', 'igrejaNome', 'dataInscricao'],
    lideres:   ['id', 'igrejaId', 'igrejaNome', 'nome', 'whatsapp', 'email'],
    anotacoes: ['id', 'igrejaId', 'igrejaNome', 'data', 'texto']
  };
  
  for (const [name, headers] of Object.entries(config)) {
    const sheet = getSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
           .setFontWeight('bold')
           .setBackground('#6d28d9') // Violet-700 para tema dos Jovens
           .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    } else {
      // Garante que colunas novas existam no cabeçalho
      const existentes = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
      headers.forEach(h => {
        if (existentes.indexOf(h) === -1) {
          const col = sheet.getLastColumn() + 1;
          sheet.getRange(1, col).setValue(h)
               .setFontWeight('bold')
               .setBackground('#6d28d9')
               .setFontColor('#ffffff');
        }
      });
    }
  }
}

function gerarId() {
  return Utilities.getUuid();
}

function sheetToArray(sheetName) {
  const sheet = getSheet(sheetName);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if (v instanceof Date) {
        const semHora = v.getHours() === 0 && v.getMinutes() === 0 && v.getSeconds() === 0;
        v = Utilities.formatDate(v, 'America/Sao_Paulo', semHora ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm');
      }
      obj[h] = (v === '' || v === null) ? null : String(v);
    });
    return obj;
  });
}

function findRowById(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
  }
  return -1;
}

function jsonpResponse(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Router GET (também processa POSTs via ?method=POST para CORS) ──────
function doGet(e) {
  const p        = e.parameter;
  const callback = p.callback || null;

  try {
    // POST enviado via GET (contorno de CORS no frontend estático)
    if (p.method === 'POST' && p.body) {
      const body = JSON.parse(decodeURIComponent(p.body));
      const result = processPost(body);
      return jsonpResponse(result, callback);
    }

    // GET normal
    let result;
    switch (p.action) {
      case 'getIgrejas':   result = sheetToArray('igrejas');   break;
      case 'getInscritos': result = sheetToArray('inscritos'); break;
      case 'getLideres':   result = sheetToArray('lideres');   break;
      case 'getAnotacoes': result = sheetToArray('anotacoes'); break;
      case 'init':         inicializarPlanilha(); result = { ok: true }; break;
      default:             result = { error: 'Ação não encontrada: ' + p.action };
    }
    return jsonpResponse(result, callback);

  } catch (err) {
    return jsonpResponse({ error: err.message }, callback);
  }
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const result = processPost(body);
    return jsonpResponse(result, null);
  } catch (err) {
    return jsonpResponse({ error: err.message }, null);
  }
}

function processPost(body) {
  switch (body.action) {
    case 'addIgreja':       return addIgreja(body.data);
    case 'editIgreja':      return editIgreja(body.data);
    case 'deleteIgreja':    return deleteRow('igrejas', body.id);
    case 'addInscrito':     return addInscrito(body.data);
    case 'editInscrito':    return editInscrito(body.data);
    case 'deleteInscrito':  return deleteRow('inscritos', body.id);
    case 'addLider':        return addLider(body.data);
    case 'editLider':       return editLider(body.data);
    case 'deleteLider':     return deleteRow('lideres', body.id);
    case 'addAnotacao':     return addAnotacao(body.data);
    case 'deleteAnotacao':  return deleteRow('anotacoes', body.id);
    default:                return { error: 'Ação não encontrada: ' + body.action };
  }
}

// ── IGREJAS ──────────────────────────────────────────────────
function addIgreja(data) {
  const id = data.id || gerarId();
  // Se já existir, não duplica
  const row = findRowById('igrejas', id);
  if (row !== -1) {
    return { ok: true, id, message: 'Igreja já cadastrada' };
  }
  const meta = Number(data.meta) !== undefined && !isNaN(Number(data.meta)) ? Number(data.meta) : 5;
  getSheet('igrejas').appendRow([id, data.nome, meta]);
  return { ok: true, id };
}

function editIgreja(data) {
  const row = findRowById('igrejas', data.id);
  if (row === -1) return { ok: false, error: 'Igreja não encontrada' };
  const sheet = getSheet('igrejas');
  const meta = Number(data.meta) !== undefined && !isNaN(Number(data.meta)) ? Number(data.meta) : 5;
  sheet.getRange(row, 2, 1, 2).setValues([[data.nome, meta]]);
  return { ok: true };
}

// ── INSCRIÇÕES (Jovens) ──────────────────────────────────────
function addInscrito(data) {
  const id  = gerarId();
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  getSheet('inscritos').appendRow([
    id, data.nomeCompleto, data.cpf || '', data.dataNascimento || '',
    data.sexo || '', data.email || '', data.igrejaId, data.igrejaNome, now
  ]);
  return { ok: true, id };
}

function editInscrito(data) {
  const row = findRowById('inscritos', data.id);
  if (row === -1) return { ok: false, error: 'Inscrição não encontrada' };
  getSheet('inscritos').getRange(row, 2, 1, 7).setValues([[
    data.nomeCompleto, data.cpf || '', data.dataNascimento || '',
    data.sexo || '', data.email || '', data.igrejaId, data.igrejaNome
  ]]);
  return { ok: true };
}

// ── LÍDERES DE JOVENS ────────────────────────────────────────
function addLider(data) {
  const id = gerarId();
  getSheet('lideres').appendRow([
    id, data.igrejaId, data.igrejaNome, data.nome, data.whatsapp, data.email || ''
  ]);
  return { ok: true, id };
}

function editLider(data) {
  const row = findRowById('lideres', data.id);
  if (row === -1) return { ok: false, error: 'Líder não encontrado' };
  getSheet('lideres').getRange(row, 4, 1, 3).setValues([[
    data.nome, data.whatsapp, data.email || ''
  ]]);
  return { ok: true };
}

// ── ANOTAÇÕES / HISTÓRICO DE CONVERSAS ───────────────────────
function addAnotacao(data) {
  const id  = gerarId();
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  getSheet('anotacoes').appendRow([
    id, data.igrejaId, data.igrejaNome, now, data.texto
  ]);
  return { ok: true, id };
}

// ── EXCLUSÃO GENÉRICA ────────────────────────────────────────
function deleteRow(sheetName, id) {
  const row = findRowById(sheetName, id);
  if (row === -1) return { ok: false, error: 'Registro não encontrado' };
  getSheet(sheetName).deleteRow(row);
  return { ok: true };
}
