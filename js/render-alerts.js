/**
 * Renderiza a faixa de alertas no rodapé.
 * Mostra apenas se houver alertas; senão fica escondido.
 * @param {Array<Object>} alertas - linhas da aba 'alertas'
 */
export function renderizarAlertas(alertas) {
  const container = document.getElementById('alertas');
  const texto = document.getElementById('alertas-texto');

  if (!alertas || alertas.length === 0) {
    container.classList.remove('visivel');
    return;
  }

  // Conta por tipo
  const porTipo = {};
  alertas.forEach(a => {
    porTipo[a.tipo] = (porTipo[a.tipo] || 0) + 1;
  });

  const resumo = Object.entries(porTipo)
    .map(([tipo, qtd]) => `${qtd} ${tipo}`)
    .join(' · ');

  texto.textContent = `⚠️ ${alertas.length} alertas: ${resumo}`;
  container.classList.add('visivel');
}
