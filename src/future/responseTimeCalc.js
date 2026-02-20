/**
 * responseTimeCalc.js — Future Stub
 *
 * MÓDULO FUTURO: Calculadora de métricas temporais de resposta em conversas.
 *
 * Quando implementado, este módulo analisará o padrão temporal das mensagens
 * para identificar dinâmicas comportamentais baseadas em tempo.
 *
 * Métricas planejadas:
 *   1. Tempo médio de resposta por participante (em segundos)
 *   2. Desvio padrão dos tempos de resposta (consistência)
 *   3. Pico máximo de demora (potencial evitação)
 *   4. Razão de reciprocidade temporal (quem inicia vs. quem responde)
 *   5. Padrão diurno (horários de maior atividade)
 *
 * Entrada esperada: Array de MensagemChat (do chatFileParser)
 * Saída esperada: Objeto com métricas temporais por participante
 *
 * Dependências futuras: Nenhuma (cálculos baseados em Date)
 *
 * Status: NÃO IMPLEMENTADO — Placeholder para expansão futura.
 */

'use strict';

/**
 * @typedef {Object} MetricasTemporais
 * @property {string} participante
 * @property {number} tempo_medio_segundos
 * @property {number} desvio_padrao_segundos
 * @property {number} pico_maximo_segundos
 * @property {number} total_mensagens
 */

/**
 * Calcula métricas de tempo de resposta para todos os participantes.
 *
 * @param {Array<{timestamp: string, participante: string, conteudo: string}>} _mensagens
 * @returns {MetricasTemporais[]}
 * @throws {Error} - Sempre (stub não implementado)
 */
function calcularTemposResposta(_mensagens) {
    throw new Error('[responseTimeCalc] Cálculo de tempo de resposta ainda não implementado. Previsto para v2.0.0.');
}

module.exports = { calcularTemposResposta };
