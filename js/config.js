// Configurações fixas do sistema.
// Parâmetros operacionais (limite SLA, etc) vêm da aba 'configuracoes' da planilha.

export const SHEETS = {
  // ID da planilha "Manutenção Air 1" (capturado em 2026-05-25).
  // Está na URL: https://docs.google.com/spreadsheets/d/AQUI_O_ID/edit
  PLANILHA_ID: '1e9lJVwdf-bHA0yLmfE3Og72myX8KkWDAz83T1baZ44k',

  // Nomes das abas (não mexer)
  ABA_EQUIPAMENTOS: 'equipamentos',
  ABA_CONFIGURACOES: 'configuracoes',
  ABA_ALERTAS: 'alertas',
  ABA_RESPOSTAS_FORM: 'respostas_form'
};

// Valores default — usados se a aba 'configuracoes' não responder
export const DEFAULTS = {
  dias_amarelo_antes_prazo: 3,
  dias_sumido_para_alerta: 3,
  intervalo_refresh_dashboard_min: 2
};
