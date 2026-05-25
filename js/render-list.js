import { diasNaFabrica, diasAteOPrazo, classificarSLA } from './sla.js';

/**
 * Renderiza a tabela de equipamentos no <tbody id="tabela-corpo">.
 * @param {Array<Object>} equipamentos
 * @param {number} diasAmareloAntes
 */
export function renderizarLista(equipamentos, diasAmareloAntes) {
  const tbody = document.getElementById('tabela-corpo');
  tbody.innerHTML = equipamentos.map(eq => {
    const cls = classificarSLA(eq.prazo_manutencao, diasAmareloAntes);
    const diasParaPrazo = diasAteOPrazo(eq.prazo_manutencao);
    const dias = diasNaFabrica(eq.data_entrada);

    let rotulo = '—';
    if (cls === 'vermelha') rotulo = `Estourado (${Math.abs(diasParaPrazo)}d)`;
    else if (cls === 'amarela') rotulo = `Limite (${diasParaPrazo}d)`;
    else if (cls === 'verde') rotulo = `OK (${diasParaPrazo}d)`;

    const dataFormatada = eq.prazo_manutencao
      ? new Date(eq.prazo_manutencao).toLocaleDateString('pt-BR')
      : '—';

    const corBolinha = cls === 'vermelha' ? '#C75050' : cls === 'amarela' ? '#D4A843' : cls === 'verde' ? '#2E7D5B' : '#C4D1DB';

    return `
      <tr>
        <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${corBolinha};margin-right:6px;"></span>${eq.hgid || '—'}</td>
        <td>${eq.numero_serie || '—'}</td>
        <td>${eq.cliente || '—'}</td>
        <td>${eq.status_atual || '—'}</td>
        <td>${dias}</td>
        <td>${dataFormatada}</td>
        <td>${rotulo}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Ordena uma lista por uma coluna.
 */
export function ordenarPor(equipamentos, coluna, direcao) {
  const ordenados = [...equipamentos];
  ordenados.sort((a, b) => {
    let va = a[coluna];
    let vb = b[coluna];
    if (coluna === 'dias_na_fabrica') {
      va = diasNaFabrica(a.data_entrada);
      vb = diasNaFabrica(b.data_entrada);
    }
    if (coluna === 'dias_para_prazo') {
      va = diasAteOPrazo(a.prazo_manutencao) ?? Infinity;
      vb = diasAteOPrazo(b.prazo_manutencao) ?? Infinity;
    }
    if (va < vb) return direcao === 'asc' ? -1 : 1;
    if (va > vb) return direcao === 'asc' ? 1 : -1;
    return 0;
  });
  return ordenados;
}
