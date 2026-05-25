import { diasNaFabrica, classificarSLA } from './sla.js';

/**
 * Calcula os KPIs.
 * @param {Array<Object>} equipamentos
 * @param {number} diasAmareloAntes
 * @returns {{emCicloSLA:number, estourados:number, noLimite:number, tempoMedio:number}}
 */
export function calcularKPIs(equipamentos, diasAmareloAntes) {
  let estourados = 0;
  let noLimite = 0;
  let somaDias = 0;

  equipamentos.forEach(eq => {
    const cls = classificarSLA(eq.prazo_manutencao, diasAmareloAntes);
    if (cls === 'vermelha') estourados++;
    if (cls === 'amarela') noLimite++;
    somaDias += diasNaFabrica(eq.data_entrada);
  });

  const tempoMedio = equipamentos.length > 0 ? Math.round(somaDias / equipamentos.length) : 0;

  return {
    emCicloSLA: equipamentos.length,
    estourados,
    noLimite,
    tempoMedio
  };
}

/**
 * Renderiza a faixa de KPIs no elemento #kpis.
 */
export function renderizarKPIs(kpis) {
  const container = document.getElementById('kpis');
  container.innerHTML = `
    <div class="kpi-card manutencao">
      <div class="label">Em ciclo SLA</div>
      <div class="value">${kpis.emCicloSLA}</div>
    </div>
    <div class="kpi-card estourados">
      <div class="label">Estourados</div>
      <div class="value">${kpis.estourados}</div>
    </div>
    <div class="kpi-card limite">
      <div class="label">No limite</div>
      <div class="value">${kpis.noLimite}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Tempo médio na fábrica</div>
      <div class="value">${kpis.tempoMedio}<span style="font-size:14px;color:var(--hg-subtle);"> dias</span></div>
    </div>
  `;
}
