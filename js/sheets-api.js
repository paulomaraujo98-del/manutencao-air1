// Lê dados de uma aba do Google Sheets via "Visualization API" (sem chave, com planilha pública).
// Endpoint: https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:json&sheet={ABA}

import { SHEETS } from './config.js';

/**
 * Lê uma aba da planilha e devolve um array de objetos.
 * @param {string} nomeAba - ex: 'equipamentos'
 * @returns {Promise<Array<Object>>} array onde cada objeto tem chave=nome_coluna
 */
export async function lerAba(nomeAba) {
  // headers=1 força a API a usar a linha 1 como cabeçalho (nomes das colunas)
  // em vez de tratá-la como dado.
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.PLANILHA_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(nomeAba)}`;
  const resposta = await fetch(url);
  const texto = await resposta.text();

  // A resposta vem embrulhada num "google.visualization.Query.setResponse(...)".
  // Precisamos extrair só o JSON do meio.
  const inicio = texto.indexOf('{');
  const fim = texto.lastIndexOf('}');
  const json = JSON.parse(texto.substring(inicio, fim + 1));

  if (json.status === 'error') {
    throw new Error(`Erro ao ler aba ${nomeAba}: ${json.errors?.[0]?.message || 'desconhecido'}`);
  }

  const colunas = json.table.cols.map(c => c.label || c.id);
  const tipos = json.table.cols.map(c => c.type);

  const linhas = json.table.rows.map(linha => {
    const obj = {};
    linha.c.forEach((celula, i) => {
      const valor = celula?.v ?? null;
      // Datas vêm do gviz como "Date(YYYY,M,D)" onde M é 0-indexed (jan=0).
      // Convertemos para Date nativo do JS.
      if (tipos[i] === 'date' && typeof valor === 'string') {
        const m = valor.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (m) {
          obj[colunas[i]] = new Date(Number(m[1]), Number(m[2]), Number(m[3]));
          return;
        }
      }
      obj[colunas[i]] = valor;
    });
    return obj;
  });

  return linhas;
}

/**
 * Lê a aba 'equipamentos' e devolve só os que estão em ciclo de SLA
 * (com data_entrada preenchida e sem data_retorno_cliente).
 */
export async function lerEquipamentosEmCicloSLA() {
  const todos = await lerAba(SHEETS.ABA_EQUIPAMENTOS);
  return todos.filter(eq => eq.data_entrada && !eq.data_retorno_cliente);
}

/**
 * Lê a aba 'configuracoes' e devolve um objeto chave→valor.
 */
export async function lerConfiguracoes() {
  const linhas = await lerAba(SHEETS.ABA_CONFIGURACOES);
  const config = {};
  linhas.forEach(linha => {
    if (linha.chave) {
      config[linha.chave] = linha.valor;
    }
  });
  return config;
}

/**
 * Lê a aba 'alertas' e devolve as linhas mais recentes.
 */
export async function lerAlertas() {
  return await lerAba(SHEETS.ABA_ALERTAS);
}
