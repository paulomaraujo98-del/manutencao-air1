// Apps Script: processa a mensagem do Form e atualiza a aba 'equipamentos'.
// Trigger: onFormSubmit.

const NOME_ABA_EQUIPAMENTOS = 'equipamentos';
const NOME_ABA_RESPOSTAS = 'respostas_form';
const NOME_ABA_ALERTAS = 'alertas';
const NOME_ABA_CONFIG = 'configuracoes';

// Colunas da aba equipamentos (1-indexed para getRange):
// 1=hgid, 2=numero_serie, 3=cliente, 4=data_entrada, 5=prazo_analise,
// 6=prazo_manutencao, 7=status_atual, 8=data_retorno_cliente, 9=observacoes
const COL = {
  HGID: 1,
  NS: 2,
  CLIENTE: 3,
  DATA_ENTRADA: 4,
  PRAZO_ANALISE: 5,
  PRAZO_MANUTENCAO: 6,
  STATUS_ATUAL: 7,
  DATA_RETORNO: 8,
  OBSERVACOES: 9
};

/**
 * Função chamada automaticamente quando alguém submete o Form.
 */
function onFormSubmit(e) {
  try {
    const valores = e.values; // [timestamp, mensagem_colada]
    const mensagem = valores[1];

    const equipamentosNaMensagem = parsearMensagem(mensagem);
    console.log(`Mensagem parseada: ${equipamentosNaMensagem.length} equipamentos.`);

    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const abaEquip = planilha.getSheetByName(NOME_ABA_EQUIPAMENTOS);
    const abaAlertas = planilha.getSheetByName(NOME_ABA_ALERTAS);

    const cadastrados = lerEquipamentosCadastrados(abaEquip);

    equipamentosNaMensagem.forEach(eqMsg => {
      const cadastrado = cadastrados.find(c => String(c.hgid) === String(eqMsg.hgid));

      if (cadastrado) {
        // Já existe — só atualiza status (se mudou)
        if (eqMsg.status && eqMsg.status !== cadastrado.status_atual) {
          abaEquip.getRange(cadastrado.linha, COL.STATUS_ATUAL).setValue(eqMsg.status);
        }
      } else {
        // HGID novo — tenta criar linha automaticamente
        if (temDadosCompletos(eqMsg)) {
          criarLinhaEquipamento(abaEquip, eqMsg);
        } else {
          registrarAlerta(abaAlertas, 'HGID novo sem dados completos', eqMsg.hgid,
            `Apareceu na mensagem mas faltam dados (esperado: cliente, data_entrada, prazo_analise, prazo_manutencao). Recebido: ${JSON.stringify(eqMsg)}`);
        }
      }
    });

    verificarHGIDsSumidos(planilha);

  } catch (err) {
    console.error('Erro em onFormSubmit:', err);
    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const abaAlertas = planilha.getSheetByName(NOME_ABA_ALERTAS);
    if (abaAlertas) {
      registrarAlerta(abaAlertas, 'Erro no processamento', '', err.message);
    }
  }
}

/**
 * Verifica se um equipamento parseado tem dados suficientes pra ser cadastrado.
 */
function temDadosCompletos(eq) {
  return !!(eq.hgid && eq.numero_serie && eq.cliente && eq.status &&
            eq.data_entrada && eq.prazo_analise && eq.prazo_manutencao);
}

/**
 * Cria nova linha na aba equipamentos com os dados da mensagem.
 */
function criarLinhaEquipamento(aba, eq) {
  aba.appendRow([
    eq.hgid,
    eq.numero_serie,
    eq.cliente,
    eq.data_entrada,
    eq.prazo_analise,
    eq.prazo_manutencao,
    eq.status,
    '',  // data_retorno_cliente (Paulo preenche manual depois)
    ''   // observacoes
  ]);
}

/**
 * Parse de uma mensagem do Chat. Aceita 3 formatos:
 *
 * Formato 1 — RECOMENDADO (com ponto-vírgula, 6 campos):
 *   HGID. NS ; Cliente ; Status ; Data Entrada ; Prazo Análise ; Prazo Manutenção
 *
 * Formato 2 — legado curto (4 campos, sem datas):
 *   HGID. NS ; Cliente ; Status        OU      HGID. NS Cliente - Status
 *
 * Formato 3 — legado super-curto (só HGID. NS, com header de status acima)
 *
 * @param {string} mensagem
 * @returns {Array<Object>}
 */
function parsearMensagem(mensagem) {
  if (!mensagem) return [];

  const linhas = mensagem.split('\n');
  const resultado = [];

  let statusCorrente = null;
  let clienteCorrente = null;

  linhas.forEach(linhaOriginal => {
    const linha = linhaOriginal.trim();
    if (!linha) return;

    // Cabeçalho de tabela ("HGID. NS" ou variações) — ignora
    if (/^HGID\.?\s+NS\.?$/i.test(linha)) return;

    // FORMATO 1: HGID. NS ; Cliente ; Status ; DataEntrada ; PrazoAnalise ; PrazoManutencao
    const match6 = linha.match(/^(\d{6,9})\.?\s+(\d{8,13})\s*;\s*(.+?)\s*;\s*(.+?)\s*;\s*(.+?)\s*;\s*(.+?)\s*;\s*(.+?)\s*$/);
    if (match6) {
      resultado.push({
        hgid: match6[1],
        numero_serie: match6[2],
        cliente: match6[3].trim(),
        status: mapearStatusRaw(match6[4]),
        data_entrada: parseData(match6[5]),
        prazo_analise: parseData(match6[6]),
        prazo_manutencao: parseData(match6[7])
      });
      return;
    }

    // FORMATO 2A: linha com ; mas só cliente + status (sem datas)
    const match3 = linha.match(/^(\d{6,9})\.?\s+(\d{8,13})\s*;\s*(.+?)\s*;\s*(.+?)\s*$/);
    if (match3) {
      resultado.push({
        hgid: match3[1],
        numero_serie: match3[2],
        cliente: match3[3].trim(),
        status: mapearStatusRaw(match3[4]),
        data_entrada: null,
        prazo_analise: null,
        prazo_manutencao: null
      });
      return;
    }

    // FORMATO 2B: linha com - (formato legado original)
    const matchTraco = linha.match(/^(\d{6,9})\.\s+(\d{8,13})\s+(.+?)\s+-\s+(.+?)\s*$/);
    if (matchTraco) {
      resultado.push({
        hgid: matchTraco[1],
        numero_serie: matchTraco[2],
        cliente: matchTraco[3].trim(),
        status: mapearStatusRaw(matchTraco[4]),
        data_entrada: null,
        prazo_analise: null,
        prazo_manutencao: null
      });
      return;
    }

    // FORMATO 3: header de status
    const statusDetectado = detectarStatusHeader(linha);
    if (statusDetectado) {
      statusCorrente = statusDetectado;
      clienteCorrente = null;
      return;
    }

    // FORMATO 3: linha curta (só HGID + NS, herda status do header acima)
    const matchSimples = linha.match(/^(\d{6,9})\.\s+(\d{8,13})\s*$/);
    if (matchSimples) {
      resultado.push({
        hgid: matchSimples[1],
        numero_serie: matchSimples[2],
        cliente: clienteCorrente,
        status: statusCorrente,
        data_entrada: null,
        prazo_analise: null,
        prazo_manutencao: null
      });
      return;
    }

    // Sub-header (cliente)
    if (/[A-Za-zÀ-ÿ]/.test(linha)) {
      clienteCorrente = linha;
    }
  });

  return resultado;
}

function detectarStatusHeader(linha) {
  const l = linha.toLowerCase();
  if (l.includes('pós calibração') || l.includes('pos calibracao')) return 'Pós-calibração';
  if (l.includes('pré calibração') || l.includes('pre calibracao')) return 'Pré-calibração';
  if (l.includes('calibrando')) return 'Em calibração';
  return null;
}

function mapearStatusRaw(statusRaw) {
  if (!statusRaw) return null;
  const l = statusRaw.toLowerCase();
  if (l.includes('pós calibração') || l.includes('pos calibracao')) return 'Pós-calibração';
  if (l.includes('pré calibração') || l.includes('pre calibracao')) return 'Pré-calibração';
  if (l.includes('calibrando') || l.includes('em calibração') || l.includes('em calibracao')) return 'Em calibração';
  return null;
}

/**
 * Parse uma data em formatos PT-BR comuns:
 *   "15/05/2026", "15-05-2026", "15.05.2026", "2026-05-15"
 * Retorna Date ou null.
 */
function parseData(str) {
  if (!str) return null;
  const s = str.trim();

  // Formato DD/MM/AAAA ou DD-MM-AAAA ou DD.MM.AAAA
  let m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (m) {
    let ano = Number(m[3]);
    if (ano < 100) ano += 2000;
    return new Date(ano, Number(m[2]) - 1, Number(m[1]));
  }

  // Formato AAAA-MM-DD (ISO)
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  return null;
}

function lerEquipamentosCadastrados(aba) {
  const ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return [];

  const valores = aba.getRange(2, 1, ultimaLinha - 1, 9).getValues();
  const cadastrados = [];
  valores.forEach((linha, idx) => {
    const dataEntrada = linha[COL.DATA_ENTRADA - 1];
    const dataRetorno = linha[COL.DATA_RETORNO - 1];
    if (!dataEntrada) return;
    if (dataRetorno) return;
    cadastrados.push({
      linha: idx + 2,
      hgid: String(linha[COL.HGID - 1]),
      numero_serie: String(linha[COL.NS - 1]),
      cliente: linha[COL.CLIENTE - 1],
      status_atual: linha[COL.STATUS_ATUAL - 1]
    });
  });
  return cadastrados;
}

function registrarAlerta(abaAlertas, tipo, hgid, mensagem) {
  abaAlertas.appendRow([new Date(), tipo, hgid, mensagem]);
}

function verificarHGIDsSumidos(planilha) {
  const config = lerConfig(planilha);
  const diasLimite = Number(config.dias_sumido_para_alerta) || 3;
  const abaRespostas = planilha.getSheetByName(NOME_ABA_RESPOSTAS);
  if (!abaRespostas) return;
  const ultimaLinha = abaRespostas.getLastRow();
  if (ultimaLinha < diasLimite + 1) return;
  const ultimas = abaRespostas.getRange(ultimaLinha - diasLimite + 1, 1, diasLimite, 2).getValues();
  const abaEquip = planilha.getSheetByName(NOME_ABA_EQUIPAMENTOS);
  const cadastrados = lerEquipamentosCadastrados(abaEquip);
  cadastrados.forEach(eq => {
    const aparece = ultimas.some(submissao => {
      return parsearMensagem(submissao[1]).some(eqMsg => eqMsg.hgid === eq.hgid);
    });
    if (!aparece) {
      if (!alertaJaRegistradoHoje(planilha, 'HGID sumido', eq.hgid)) {
        const abaAlertas = planilha.getSheetByName(NOME_ABA_ALERTAS);
        registrarAlerta(abaAlertas, 'HGID sumido', eq.hgid, `Não aparece na mensagem há ${diasLimite} dias seguidos. Verifique se saiu da manutenção.`);
      }
    }
  });
}

function lerConfig(planilha) {
  const aba = planilha.getSheetByName(NOME_ABA_CONFIG);
  const ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return {};
  const valores = aba.getRange(2, 1, ultimaLinha - 1, 2).getValues();
  const cfg = {};
  valores.forEach(([chave, valor]) => { if (chave) cfg[chave] = valor; });
  return cfg;
}

function alertaJaRegistradoHoje(planilha, tipo, hgid) {
  const aba = planilha.getSheetByName(NOME_ABA_ALERTAS);
  const ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const valores = aba.getRange(2, 1, ultimaLinha - 1, 4).getValues();
  return valores.some(([data, t, h]) => {
    if (!data) return false;
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === hoje.getTime() && t === tipo && h === hgid;
  });
}

/**
 * Executar manualmente no editor: menu suspenso → testParser → Executar.
 */
function testParser() {
  // Mensagem com formato novo (6 campos)
  const exemplo = `26050604. 202508220004 ; Fernando Jorge ; Pré Calibração ; 15/05/2026 ; 22/05/2026 ; 08/06/2026
26043007. 202506130016 ; Sem cliente ; Em Calibração ; 10/05/2026 ; 17/05/2026 ; 03/06/2026
26050613. 202511250002 ; C e F Sinkos / Camila Sinkos ; Pós Calibração ; 01/05/2026 ; 08/05/2026 ; 25/05/2026`;

  const r = parsearMensagem(exemplo);
  console.log(`Parseados: ${r.length}`);
  r.forEach((eq, i) => {
    console.log(`${i+1}. HGID=${eq.hgid} Cliente=${eq.cliente} Status=${eq.status} Entrada=${eq.data_entrada?.toLocaleDateString('pt-BR')} PrazoAna=${eq.prazo_analise?.toLocaleDateString('pt-BR')} PrazoMan=${eq.prazo_manutencao?.toLocaleDateString('pt-BR')}`);
  });

  if (r.length !== 3) { console.error('FALHOU: esperava 3'); return; }
  if (r[0].cliente !== 'Fernando Jorge') { console.error('FALHOU eq 1 cliente'); return; }
  if (r[0].status !== 'Pré-calibração') { console.error('FALHOU eq 1 status'); return; }
  if (!r[0].data_entrada || r[0].data_entrada.getDate() !== 15) { console.error('FALHOU eq 1 data_entrada'); return; }
  if (!r[0].prazo_manutencao || r[0].prazo_manutencao.getMonth() !== 5) { console.error('FALHOU eq 1 prazo_manutencao'); return; }
  if (r[2].cliente !== 'C e F Sinkos / Camila Sinkos') { console.error('FALHOU eq 3 cliente'); return; }

  // Teste de compatibilidade com formato legado (sem datas)
  const legado = `26050604. 202508220004 ; Fernando Jorge ; Pré Calibração`;
  const rLeg = parsearMensagem(legado);
  if (rLeg.length !== 1 || rLeg[0].data_entrada !== null) {
    console.error('FALHOU compat legado'); return;
  }

  console.log('✓ Todos os testes passaram');
}
