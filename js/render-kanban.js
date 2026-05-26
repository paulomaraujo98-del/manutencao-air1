import { diasNaFabrica, diasAteOPrazo, classificarSLA } from './sla.js';

// Lista de status (confirmada com produção em 2026-05-25, atualizada 2026-05-26)
const STATUS_ORDEM = ['Manutenção', 'Pré-calibração', 'Em calibração', 'Pós-calibração'];

/**
 * Renderiza o Kanban no <section id="view-kanban">.
 */
export function renderizarKanban(equipamentos, diasAmareloAntes) {
  const container = document.getElementById('view-kanban');

  // Agrupa por status
  const grupos = {};
  STATUS_ORDEM.forEach(s => grupos[s] = []);
  equipamentos.forEach(eq => {
    const s = eq.status_atual || 'Outro';
    if (!grupos[s]) grupos[s] = [];
    grupos[s].push(eq);
  });

  container.innerHTML = STATUS_ORDEM.map(status => {
    const lista = grupos[status] || [];
    const cards = lista.map(eq => {
      const cls = classificarSLA(eq.prazo_manutencao, diasAmareloAntes);
      const dias = diasNaFabrica(eq.data_entrada);
      const diasParaPrazo = diasAteOPrazo(eq.prazo_manutencao);

      let info = `${dias} dias na fábrica`;
      if (diasParaPrazo !== null) {
        if (diasParaPrazo < 0) info += ` · estourou há ${Math.abs(diasParaPrazo)}d`;
        else if (diasParaPrazo <= diasAmareloAntes) info += ` · faltam ${diasParaPrazo}d`;
      }

      return `
        <div class="card">
          <span class="bolinha ${cls || ''}"></span>
          <div class="hgid">${eq.hgid || '—'}</div>
          <div class="ns">${eq.numero_serie || '—'}</div>
          <div class="cliente">${eq.cliente || '—'}</div>
          <div class="dias">${info}</div>
        </div>
      `;
    }).join('') || '<p style="color:var(--hg-subtle);font-size:12px;">Vazio</p>';

    return `
      <div class="kanban-coluna">
        <h2>${status} (${lista.length})</h2>
        ${cards}
      </div>
    `;
  }).join('');
}
