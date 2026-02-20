/**
 * metricsCalculator.js — Metrics Layer
 *
 * Recebe o texto bruto da resposta Gemini (que deve ser JSON),
 * faz o parse, normaliza as métricas e adiciona metadados do motor.
 *
 * Responsabilidades:
 *   - Parse seguro do JSON retornado pela Gemini
 *   - Normalização de valores numéricos (clamp 0.0–10.0)
 *   - Adição de timestamp e engine_version (fonte autoritativa)
 *   - Lança SchemaError se o JSON for inválido ou não parseável
 */

'use strict';

const ENGINE_VERSION = process.env.ENGINE_VERSION || '1.0.0';

/**
 * Classe de erro para falhas de estrutura/parse do JSON.
 * Capturada pelo errorHandler e mapeada para HTTP 422.
 */
class SchemaError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'SchemaError';
        this.details = details;
    }
}

/**
 * Converte e clampa um valor numérico para o intervalo [0.0, 10.0].
 * Retorna null se o valor não for conversível para número.
 *
 * @param {any} valor
 * @returns {number|null}
 */
function clamp(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return null;
    return Math.min(10.0, Math.max(0.0, num));
}

/**
 * Garante que uma métrica é um número válido no intervalo esperado.
 * Se null/inválido, lança SchemaError com o nome da métrica.
 *
 * @param {any} valor
 * @param {string} nomeMetrica
 * @returns {number}
 */
function normalizarMetrica(valor, nomeMetrica) {
    const normalizado = clamp(valor);
    if (normalizado === null) {
        throw new SchemaError(
            `Métrica inválida: "${nomeMetrica}" não é um número válido.`,
            { metrica: nomeMetrica, valor_recebido: valor }
        );
    }
    return normalizado;
}

/**
 * Faz parse do JSON bruto retornado pela Gemini e normaliza todos os campos.
 *
 * @param {string} textoRaw - Texto puro da resposta Gemini (deve ser JSON)
 * @returns {object} - Objeto normalizado pronto para validação de schema
 * @throws {SchemaError} - Se JSON inválido ou métricas ausentes/inválidas
 */
function extractAndNormalizeMetrics(textoRaw) {
    // 1. Parse JSON
    let dados;
    try {
        dados = JSON.parse(textoRaw);
    } catch (parseErr) {
        throw new SchemaError(
            'A Gemini retornou uma resposta que não é JSON válido.',
            { tipo: 'json_parse_error', trecho: textoRaw.substring(0, 200) }
        );
    }

    // 2. Verificar presença da seção analise
    if (!dados.analise || typeof dados.analise !== 'object') {
        throw new SchemaError('Campo "analise" ausente ou inválido na resposta Gemini.');
    }

    // 3. Verificar presença da seção metricas
    if (!dados.metricas || typeof dados.metricas !== 'object') {
        throw new SchemaError('Campo "metricas" ausente ou inválido na resposta Gemini.');
    }

    // 4. Normalizar métricas individualmente
    const metricasNormalizadas = {
        risco_emocional: normalizarMetrica(dados.metricas.risco_emocional, 'risco_emocional'),
        indice_manipulacao: normalizarMetrica(dados.metricas.indice_manipulacao, 'indice_manipulacao'),
        ambivalencia: normalizarMetrica(dados.metricas.ambivalencia, 'ambivalencia'),
        coerencia_interna: normalizarMetrica(dados.metricas.coerencia_interna, 'coerencia_interna'),
    };

    // 5. Garantir arrays válidos para analise
    const analise = {
        fatos: Array.isArray(dados.analise.fatos) ? dados.analise.fatos : [],
        inferencias: Array.isArray(dados.analise.inferencias) ? dados.analise.inferencias : [],
        hipoteses: Array.isArray(dados.analise.hipoteses) ? dados.analise.hipoteses : [],
    };

    // 6. Montar objeto final com metadados autoritativos (sobrescreve o que Gemini possa ter gerado)
    return {
        analise,
        metricas: metricasNormalizadas,
        justificativa: typeof dados.justificativa === 'string' ? dados.justificativa : '',
        timestamp: new Date().toISOString(),   // Fonte autoritativa: o servidor, não o modelo
        engine_version: ENGINE_VERSION,         // Sempre reflete a versão real do motor
    };
}

module.exports = { extractAndNormalizeMetrics, SchemaError };
