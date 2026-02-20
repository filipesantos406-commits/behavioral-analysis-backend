/**
 * svgGenerator.js — Future Stub
 *
 * MÓDULO FUTURO: Gerador de SVG emocional baseado nas métricas analíticas.
 *
 * Quando implementado, este módulo criará representações visuais das métricas
 * retornadas pelo motor analítico, permitindo visualização rápida dos padrões.
 *
 * Tipos de visualização planejados:
 *   1. Radar Chart SVG — 4 eixos com as métricas (risco, manipulação, etc.)
 *   2. Timeline SVG — evolução das métricas ao longo de múltiplas mensagens
 *   3. Heatmap SVG — intensidade emocional por segmento do texto
 *
 * Dependências futuras:
 *   - Nenhuma (SVG pode ser gerado com template strings puras)
 *   - Opcional: d3-node para visualizações complexas
 *
 * Formato de saída planejado: string SVG completa para embed em HTML
 *
 * Status: NÃO IMPLEMENTADO — Placeholder para expansão futura.
 */

'use strict';

/**
 * @typedef {Object} MetricasAnalise
 * @property {number} risco_emocional - 0–10
 * @property {number} indice_manipulacao - 0–10
 * @property {number} ambivalencia - 0–10
 * @property {number} coerencia_interna - 0–10
 */

/**
 * Gera um SVG de radar chart com as 4 métricas analíticas.
 *
 * @param {MetricasAnalise} _metricas
 * @returns {string} - String SVG
 * @throws {Error} - Sempre (stub não implementado)
 */
function gerarRadarChartSVG(_metricas) {
    throw new Error('[svgGenerator] Geração de SVG ainda não implementada. Previsto para v2.0.0.');
}

/**
 * Gera um SVG de timeline para análise de múltiplas mensagens.
 *
 * @param {Array<MetricasAnalise>} _serieMetricas - Array cronológico de métricas
 * @returns {string} - String SVG
 * @throws {Error} - Sempre (stub não implementado)
 */
function gerarTimelineSVG(_serieMetricas) {
    throw new Error('[svgGenerator] Geração de timeline SVG ainda não implementada. Previsto para v2.0.0.');
}

module.exports = { gerarRadarChartSVG, gerarTimelineSVG };
