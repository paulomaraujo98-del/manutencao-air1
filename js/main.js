import { lerEquipamentosEmCicloSLA, lerConfiguracoes, lerAlertas } from './sheets-api.js';
import { calcularKPIs, renderizarKPIs } from './render-kpis.js';
import { renderizarLista, ordenarPor } from './render-list.js';
import { renderizarKanban } from './render-kanban.js';
import { renderizarAlertas } from './render-alerts.js';
import { DEFAULTS } from './config.js';

let estado = {
  equipamentos: [],
  equipamentosFiltrados: [],
  config: { ...DEFAULTS },
  viewAtiva: 'kanban',
  filtros: { status: '', cliente: '' },
  ordenacao: { coluna: null, direcao: 'asc' }
};

async function carregarErenderizar() {
  try {
    const cfg = await lerConfiguracoes();
    estado.config = {
      dias_amarelo_antes_prazo: Number(cfg.dias_amarelo_antes_prazo) || DEFAULTS.dias_amarelo_antes_prazo,
      dias_sumido_para_alerta: Number(cfg.dias_sumido_para_alerta) || DEFAULTS.dias_sumido_para_alerta,
      intervalo_refresh_dashboard_min: Number(cfg.intervalo_refresh_dashboard_min) || DEFAULTS.intervalo_refresh_dashboard_min
    };

    estado.equipamentos = await lerEquipamentosEmCicloSLA();

    let alertas = [];
    try { alertas = await lerAlertas(); } catch (e) { console.warn('Sem alertas:', e); }

    popularFiltros();
    aplicarFiltros();

    const kpis = calcularKPIs(estado.equipamentos, estado.config.dias_amarelo_antes_prazo);
    renderizarKPIs(kpis);

    renderizarAlertas(alertas);

    document.getElementById('hora-atualizacao').textContent =
      new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  } catch (e) {
    console.error('Erro ao carregar:', e);
    document.getElementById('kpis').innerHTML =
      `<div class="kpi-card"><div class="value" style="font-size:14px;color:var(--hg-error);">Erro: ${e.message}</div></div>`;
  }
}

function popularFiltros() {
  const statusUnicos = [...new Set(estado.equipamentos.map(e => e.status_atual).filter(Boolean))];
  const clientesUnicos = [...new Set(estado.equipamentos.map(e => e.cliente).filter(Boolean))];

  const selStatus = document.getElementById('filtro-status');
  const selCliente = document.getElementById('filtro-cliente');

  const valStatus = selStatus.value;
  const valCliente = selCliente.value;

  selStatus.innerHTML = '<option value="">Todos os status</option>' +
    statusUnicos.map(s => `<option value="${s}">${s}</option>`).join('');
  selCliente.innerHTML = '<option value="">Todos os clientes</option>' +
    clientesUnicos.map(c => `<option value="${c}">${c}</option>`).join('');

  selStatus.value = valStatus;
  selCliente.value = valCliente;
}

function aplicarFiltros() {
  estado.equipamentosFiltrados = estado.equipamentos.filter(eq => {
    if (estado.filtros.status && eq.status_atual !== estado.filtros.status) return false;
    if (estado.filtros.cliente && eq.cliente !== estado.filtros.cliente) return false;
    return true;
  });

  if (estado.ordenacao.coluna) {
    estado.equipamentosFiltrados = ordenarPor(
      estado.equipamentosFiltrados,
      estado.ordenacao.coluna,
      estado.ordenacao.direcao
    );
  }

  if (estado.viewAtiva === 'kanban') {
    renderizarKanban(estado.equipamentosFiltrados, estado.config.dias_amarelo_antes_prazo);
  } else {
    renderizarLista(estado.equipamentosFiltrados, estado.config.dias_amarelo_antes_prazo);
  }
}

function alternarView(novaView) {
  estado.viewAtiva = novaView;
  document.getElementById('btn-kanban').classList.toggle('ativo', novaView === 'kanban');
  document.getElementById('btn-lista').classList.toggle('ativo', novaView === 'lista');
  document.getElementById('view-kanban').classList.toggle('hidden', novaView !== 'kanban');
  document.getElementById('view-lista').classList.toggle('hidden', novaView !== 'lista');
  aplicarFiltros();
}

document.getElementById('btn-kanban').addEventListener('click', () => alternarView('kanban'));
document.getElementById('btn-lista').addEventListener('click', () => alternarView('lista'));

document.getElementById('filtro-status').addEventListener('change', (e) => {
  estado.filtros.status = e.target.value;
  aplicarFiltros();
});
document.getElementById('filtro-cliente').addEventListener('change', (e) => {
  estado.filtros.cliente = e.target.value;
  aplicarFiltros();
});

document.querySelectorAll('.lista th').forEach(th => {
  th.addEventListener('click', () => {
    const coluna = th.dataset.coluna;
    if (estado.ordenacao.coluna === coluna) {
      estado.ordenacao.direcao = estado.ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    } else {
      estado.ordenacao.coluna = coluna;
      estado.ordenacao.direcao = 'asc';
    }
    aplicarFiltros();
  });
});

carregarErenderizar();

setInterval(() => {
  carregarErenderizar();
}, estado.config.intervalo_refresh_dashboard_min * 60 * 1000);
