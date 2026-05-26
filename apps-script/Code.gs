// Apps Script: processa a mensagem do Form e atualiza a aba 'equipamentos'.
// Trigger: onFormSubmit.

const NOME_ABA_EQUIPAMENTOS = 'equipamentos';
const NOME_ABA_RESPOSTAS = 'respostas_form';
const NOME_ABA_ALERTAS = 'alertas';
const NOME_ABA_CONFIG = 'configuracoes';

// Colunas da aba equipamentos (1-indexed):
// 1=hgid, 2=numero_serie, 3=cliente, 4=data_entrada, 5=prazo_analise,
// 6=prazo_manutencao, 7=status_atual, 8=data_retorno_cliente, 9=observacoes
const COL = {
  HGID: 1, NS: 2, CLIENTE: 3,
  DATA_ENTRADA: 4, PRAZO_ANALISE: 5, PRAZO_MANUTENCAO: 6,
  STATUS_ATUAL: 7, DATA_RETORNO: 8, OBSERVACOES: 9
};

function onFormSubmit(e) {
  try {
    const valores = e.values;
    const mensagem = valores[1];

    const { equipamentos, linhasInvalidas } = parsearMensagem(mensagem);
    console.log(`Mensagem parseada: ${equipamentos.length} equipamentos, ${linhasInvalidas.length} linhas inválidas.`);

    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const abaEquip = planilha.getSheetByName(NOME_ABA_EQUIPAMENTOS);
    const abaAlertas = planilha.getSheetByName(NOME_ABA_ALERTAS);

    // Registra alertas pra cada linha inválida
    linhasInvalidas.forEach(({ linha, motivo }) => {
      registrarAlerta(abaAlertas, 'Linha invalida na mensagem', '', `${motivo} | linha: ${linha.substring(0, 120)}`);
    });

    const cadastrados = lerEquipamentosCadastrados(abaEquip);

    equipamentos.forEach(eqMsg => {
      const cadastrado = cadastrados.find(c => String(c.hgid) === String(eqMsg.hgid));

      if (cadastrado) {
        // Já existe — só atualiza status (se mudou)
        if (eqMsg.status && eqMsg.status !== cadastrado.status_atual) {
          abaEquip.getRange(cadastrado.linha, COL.STATUS_ATUAL).setValue(eqMsg.status);
        }
      } else {
        if (temDadosCompletos(eqMsg)) {
          criarLinhaEquipamento(abaEquip, eqMsg);
        } else {
          registrarAlerta(abaAlertas, 'HGID novo sem dados completos', eqMsg.hgid,
            `Apareceu na mensagem mas faltam dados. Recebido: ${JSON.stringify(eqMsg)}`);
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

function temDadosCompletos(eq) {
  return !!(eq.hgid && eq.numero_serie && eq.cliente && eq.status &&
            eq.data_entrada && eq.prazo_analise && eq.prazo_manutencao);
}

function criarLinhaEquipamento(aba, eq) {
  aba.appendRow([
    eq.hgid, eq.numero_serie, eq.cliente,
    eq.data_entrada, eq.prazo_analise, eq.prazo_manutencao,
    eq.status, '', ''
  ]);
}

/**
 * Parser flexível. Tenta múltiplos formatos por linha.
 * Retorna { equipamentos, linhasInvalidas }.
 */
function parsearMensagem(mensagem) {
  if (!mensagem) return { equipamentos: [], linhasInvalidas: [] };

  const linhas = mensagem.split('\n');
  const equipamentos = [];
  const linhasInvalidas = [];

  let statusCorrente = null;
  let clienteCorrente = null;

  linhas.forEach(linhaOriginal => {
    const linha = linhaOriginal.trim();
    if (!linha) return;

    // Cabeçalho da tabela (ignora)
    if (/^HGID\.?\s+NS\.?$/i.test(linha)) return;

    // Estratégia 1: split por ; (formato do técnico)
    const partesPV = linha.split(';').map(p => p.trim()).filter(p => p.length > 0);

    if (partesPV.length >= 2 && ehHgidValido(partesPV[0]) && ehNsValido(partesPV[1])) {
      // Formato A: 7 partes — completo (HGID, NS, Cliente, Status, 3 datas)
      if (partesPV.length === 7) {
        equipamentos.push({
          hgid: extrairHgid(partesPV[0]),
          numero_serie: partesPV[1],
          cliente: partesPV[2],
          status: mapearStatusRaw(partesPV[3]),
          data_entrada: parseData(partesPV[4]),
          prazo_analise: parseData(partesPV[5]),
          prazo_manutencao: parseData(partesPV[6])
        });
        return;
      }
      // Formato B: 4 partes — sem datas (legado)
      if (partesPV.length === 4) {
        equipamentos.push({
          hgid: extrairHgid(partesPV[0]),
          numero_serie: partesPV[1],
          cliente: partesPV[2],
          status: mapearStatusRaw(partesPV[3]),
          data_entrada: null, prazo_analise: null, prazo_manutencao: null
        });
        return;
      }
      // Número de partes inesperado: marca como inválida
      linhasInvalidas.push({
        linha,
        motivo: `Esperado 4 ou 7 campos separados por ; , veio ${partesPV.length} campos`
      });
      return;
    }

    // Estratégia 2: linha com traço (legado original)
    const matchTraco = linha.match(/^(\d{6,9})\.\s+(\d{8,13})\s+(.+?)\s+-\s+(.+?)\s*$/);
    if (matchTraco) {
      equipamentos.push({
        hgid: matchTraco[1], numero_serie: matchTraco[2],
        cliente: matchTraco[3].trim(),
        status: mapearStatusRaw(matchTraco[4]),
        data_entrada: null, prazo_analise: null, prazo_manutencao: null
      });
      return;
    }

    // Estratégia 3: header de status
    const statusDetectado = detectarStatusHeader(linha);
    if (statusDetectado) {
      statusCorrente = statusDetectado;
      clienteCorrente = null;
      return;
    }

    // Estratégia 4: linha curta só com HGID + NS (legado)
    const matchSimples = linha.match(/^(\d{6,9})\.\s+(\d{8,13})\s*$/);
    if (matchSimples) {
      equipamentos.push({
        hgid: matchSimples[1], numero_serie: matchSimples[2],
        cliente: clienteCorrente, status: statusCorrente,
        data_entrada: null, prazo_analise: null, prazo_manutencao: null
      });
      return;
    }

    // Sub-header (cliente)
    if (/[A-Za-zÀ-ÿ]/.test(linha)) {
      clienteCorrente = linha;
    }
  });

  return { equipamentos, linhasInvalidas };
}

function ehHgidValido(s) {
  return /^\d{6,9}\.?$/.test(s.trim());
}

function ehNsValido(s) {
  return /^\d{8,13}$/.test(s.trim());
}

function extrairHgid(s) {
  return s.trim().replace(/\.$/, '');
}

function detectarStatusHeader(linha) {
  const l = linha.toLowerCase();
  if (l.includes('pós calibração') || l.includes('pos calibracao')) return 'Pós-calibração';
  if (l.includes('pré calibração') || l.includes('pre calibracao')) return 'Pré-calibração';
  if (l.includes('calibrando')) return 'Em calibração';
  if (l.includes('manutenção') || l.includes('manutencao')) return 'Manutenção';
  return null;
}

function mapearStatusRaw(statusRaw) {
  if (!statusRaw) return null;
  const l = statusRaw.toLowerCase();
  if (l.includes('pós calibração') || l.includes('pos calibracao')) return 'Pós-calibração';
  if (l.includes('pré calibração') || l.includes('pre calibracao')) return 'Pré-calibração';
  if (l.includes('calibrando') || l.includes('em calibração') || l.includes('em calibracao')) return 'Em calibração';
  if (l.includes('manutenção') || l.includes('manutencao')) return 'Manutenção';
  return null;
}

/**
 * Parse data em vários formatos:
 *   "DDMMAA"     → "150526"
 *   "DDMMAAAA"   → "15052026"
 *   "DD/MM/AA"   → "15/05/26"
 *   "DD/MM/AAAA" → "15/05/2026"
 *   "DD-MM-AAAA", "DD.MM.AAAA"
 *   "AAAA-MM-DD" (ISO)
 */
function parseData(str) {
  if (!str) return null;
  const s = String(str).trim();

  // Só dígitos: DDMMAA (6) ou DDMMAAAA (8)
  if (/^\d{6}$/.test(s)) {
    const dia = Number(s.substring(0, 2));
    const mes = Number(s.substring(2, 4));
    const ano = 2000 + Number(s.substring(4, 6));
    return new Date(ano, mes - 1, dia);
  }
  if (/^\d{8}$/.test(s)) {
    const dia = Number(s.substring(0, 2));
    const mes = Number(s.substring(2, 4));
    const ano = Number(s.substring(4, 8));
    return new Date(ano, mes - 1, dia);
  }

  // Com separador: DD/MM/AAAA, DD-MM-AAAA, DD.MM.AAAA, DD/MM/AA
  let m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (m) {
    let ano = Number(m[3]);
    if (ano < 100) ano += 2000;
    return new Date(ano, Number(m[2]) - 1, Number(m[1]));
  }

  // ISO: AAAA-MM-DD
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

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
      const { equipamentos } = parsearMensagem(submissao[1]);
      return equipamentos.some(eqMsg => eqMsg.hgid === eq.hgid);
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

function testParser() {
  // Mensagem real do técnico (2026-05-26) — formato com ; entre todos os campos
  const exemplo = `25090909;202509190005; Aline Carbone Casado; Manutenção;150526;210526;020626;
26010806;202601210004;Jankarla Salazar; Manutenção;180526;220526;030626;
00000000;202506130011;Eloi Pereira Teles; Manutenção;200526;270526;270526;080626;
26043003;202503020007; Marcelo Kalichstein; Calibrando;170426;290426;100526`;

  const r = parsearMensagem(exemplo);
  console.log(`Parseados: ${r.equipamentos.length}, inválidas: ${r.linhasInvalidas.length}`);
  r.equipamentos.forEach((eq, i) => {
    console.log(`${i+1}. HGID=${eq.hgid} Cliente=${eq.cliente} Status=${eq.status} Entrada=${eq.data_entrada?.toLocaleDateString('pt-BR')} PrazoMan=${eq.prazo_manutencao?.toLocaleDateString('pt-BR')}`);
  });
  r.linhasInvalidas.forEach(({ linha, motivo }) => {
    console.log(`  ✗ INVÁLIDA: ${motivo} → ${linha.substring(0, 60)}...`);
  });

  if (r.equipamentos.length !== 3) {
    console.error(`FALHOU: esperava 3 válidos, veio ${r.equipamentos.length}`);
    return;
  }
  if (r.linhasInvalidas.length !== 1) {
    console.error(`FALHOU: esperava 1 inválida (linha com 4 datas), veio ${r.linhasInvalidas.length}`);
    return;
  }
  if (r.equipamentos[0].status !== 'Manutenção') {
    console.error(`FALHOU: eq 1 status esperado Manutenção, veio ${r.equipamentos[0].status}`);
    return;
  }
  if (r.equipamentos[0].data_entrada?.getDate() !== 15) {
    console.error(`FALHOU: eq 1 data_entrada esperada dia 15, veio ${r.equipamentos[0].data_entrada}`);
    return;
  }
  if (r.equipamentos[2].status !== 'Em calibração') {
    console.error(`FALHOU: eq 3 status esperado Em calibração, veio ${r.equipamentos[2].status}`);
    return;
  }

  console.log('✓ Todos os testes passaram');
}
