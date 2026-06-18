// ============================================================
//  CONGRESSO ESTADUAL DO DIACONATO — IEQ Região 655
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
    igrejas:    ['id', 'nome', 'qtdVagas'],
    diaconos:   ['id', 'nomeCompleto', 'cpf', 'rg', 'dataNascimento', 'whatsapp', 'igrejaId', 'igrejaNome', 'dataCadastro'],
    inscricoes: ['id', 'diaconoId', 'nomeCompleto', 'cpf', 'rg', 'dataNascimento', 'whatsapp', 'igrejaId', 'igrejaNome', 'dataInscricao'],
    pagamentos: ['id', 'igrejaId', 'igrejaNome', 'valor', 'formaPagamento', 'dataLancamento', 'observacao', 'dataDeposito']
  };
  for (const [name, headers] of Object.entries(config)) {
    const sheet = getSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4338ca').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    } else {
      // Migração: garante que colunas novas existam no cabeçalho de planilhas já criadas
      const existentes = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
      headers.forEach(h => {
        if (existentes.indexOf(h) === -1) {
          const col = sheet.getLastColumn() + 1;
          sheet.getRange(1, col).setValue(h).setFontWeight('bold').setBackground('#4338ca').setFontColor('#ffffff');
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
    headers.forEach((h, i) => { obj[h] = row[i] === '' ? null : String(row[i]); });
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

// ── Router GET (também processa POSTs via ?method=POST) ──────
function doGet(e) {
  const p        = e.parameter;
  const callback = p.callback || null;

  try {
    // POST enviado via GET (contorno de CORS)
    if (p.method === 'POST' && p.body) {
      const body = JSON.parse(decodeURIComponent(p.body));
      const result = processPost(body);
      return jsonpResponse(result, callback);
    }

    // GET normal
    let result;
    switch (p.action) {
      case 'getIgrejas':    result = sheetToArray('igrejas');    break;
      case 'getDiaconos':   result = sheetToArray('diaconos');   break;
      case 'getInscricoes': result = sheetToArray('inscricoes'); break;
      case 'getPagamentos': result = sheetToArray('pagamentos'); break;
      case 'init':          inicializarPlanilha(); result = { ok: true }; break;
      default:              result = { error: 'Ação não encontrada: ' + p.action };
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
    case 'addInscricao':    return addInscricao(body.data);
    case 'editInscricao':   return editInscricao(body.data);
    case 'deleteInscricao': return deleteRow('inscricoes', body.id);
    case 'addPagamento':    return addPagamento(body.data);
    case 'editPagamento':   return editPagamento(body.data);
    case 'deletePagamento': return deleteRow('pagamentos', body.id);
    default:                return { error: 'Ação não encontrada: ' + body.action };
  }
}

// ── IGREJAS ──────────────────────────────────────────────────
function addIgreja(data) {
  const id = gerarId();
  getSheet('igrejas').appendRow([id, data.nome, Number(data.qtdVagas) || 0]);
  return { ok: true, id };
}

function editIgreja(data) {
  const row = findRowById('igrejas', data.id);
  if (row === -1) return { ok: false, error: 'Igreja não encontrada' };
  getSheet('igrejas').getRange(row, 2, 1, 2).setValues([[data.nome, Number(data.qtdVagas) || 0]]);
  return { ok: true };
}

// ── INSCRIÇÕES ───────────────────────────────────────────────
function addInscricao(data) {
  const id  = gerarId();
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  getSheet('inscricoes').appendRow([
    id, data.diaconoId || '', data.nomeCompleto,
    data.cpf || '', data.rg || '', data.dataNascimento || '',
    data.whatsapp, data.igrejaId, data.igrejaNome, now
  ]);
  return { ok: true, id };
}

function editInscricao(data) {
  const row = findRowById('inscricoes', data.id);
  if (row === -1) return { ok: false, error: 'Inscrição não encontrada' };
  getSheet('inscricoes').getRange(row, 3, 1, 7).setValues([[
    data.nomeCompleto, data.cpf || '', data.rg || '',
    data.dataNascimento || '', data.whatsapp, data.igrejaId, data.igrejaNome
  ]]);
  return { ok: true };
}

// ── PAGAMENTOS ───────────────────────────────────────────────
function addPagamento(data) {
  const id  = gerarId();
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  getSheet('pagamentos').appendRow([
    id, data.igrejaId, data.igrejaNome,
    Number(data.valor), data.formaPagamento, now, data.observacao || '', data.dataDeposito || ''
  ]);
  return { ok: true, id };
}

function editPagamento(data) {
  const row = findRowById('pagamentos', data.id);
  if (row === -1) return { ok: false, error: 'Pagamento não encontrado' };
  const sheet = getSheet('pagamentos');
  sheet.getRange(row, 4, 1, 5).setValues([[
    Number(data.valor), data.formaPagamento,
    data.dataLancamento || sheet.getRange(row, 6).getValue(),
    data.observacao || '', data.dataDeposito || ''
  ]]);
  return { ok: true };
}

// ── DELETE GENÉRICO ──────────────────────────────────────────
function deleteRow(sheetName, id) {
  const row = findRowById(sheetName, id);
  if (row === -1) return { ok: false, error: 'Registro não encontrado' };
  getSheet(sheetName).deleteRow(row);
  return { ok: true };
}
