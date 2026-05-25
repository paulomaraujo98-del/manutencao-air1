// Funções puras de cálculo de SLA baseado em PRAZO_MANUTENCAO da etiqueta.
// Nenhuma chamada de rede, nenhuma dependência externa — fácil de testar.

/**
 * Calcula quantos dias faltam até o prazo (positivo) ou quantos dias passaram do prazo (negativo).
 * @param {string|Date} prazoManutencao
 * @param {Date} [referencia=hoje]
 * @returns {number} dias até o prazo. Negativo se já estourou.
 */
export function diasAteOPrazo(prazoManutencao, referencia = new Date()) {
  if (!prazoManutencao) return null;
  const prazo = new Date(prazoManutencao);
  if (isNaN(prazo.getTime())) return null;

  const MS_POR_DIA = 1000 * 60 * 60 * 24;
  const ref = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  const pra = new Date(prazo.getFullYear(), prazo.getMonth(), prazo.getDate());
  const diff = pra.getTime() - ref.getTime();
  return Math.round(diff / MS_POR_DIA);
}

/**
 * Calcula quantos dias o equipamento está na fábrica.
 * @param {string|Date} dataEntrada
 * @param {Date} [referencia=hoje]
 * @returns {number} dias na fábrica (>= 0)
 */
export function diasNaFabrica(dataEntrada, referencia = new Date()) {
  if (!dataEntrada) return 0;
  const entrada = new Date(dataEntrada);
  if (isNaN(entrada.getTime())) return 0;

  const MS_POR_DIA = 1000 * 60 * 60 * 24;
  const diff = referencia.getTime() - entrada.getTime();
  return Math.max(0, Math.floor(diff / MS_POR_DIA));
}

/**
 * Classifica um equipamento conforme proximidade do prazo_manutencao.
 * @param {string|Date} prazoManutencao
 * @param {number} diasAmareloAntes - dias antes do prazo para entrar em "amarelo" (ex: 3)
 * @param {Date} [referencia=hoje]
 * @returns {'verde'|'amarela'|'vermelha'|null}
 */
export function classificarSLA(prazoManutencao, diasAmareloAntes, referencia = new Date()) {
  const dias = diasAteOPrazo(prazoManutencao, referencia);
  if (dias === null) return null;
  if (dias < 0) return 'vermelha';           // já passou do prazo
  if (dias <= diasAmareloAntes) return 'amarela'; // dentro da zona de alerta
  return 'verde';
}
