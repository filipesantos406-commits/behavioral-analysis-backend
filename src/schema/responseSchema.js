/**
 * responseSchema.js — Schema Layer
 *
 * Valida a estrutura final do objeto de resposta usando AJV (JSON Schema Draft-07).
 *
 * Esta é a última barreira antes de enviar a resposta ao cliente.
 * Garante que mesmo se a Gemini retornar um JSON inesperado,
 * o sistema nunca enviará uma resposta malformada.
 */

'use strict';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const { SchemaError } = require('../metrics/metricsCalculator');

// Instanciar AJV com todas as opções de rigor
const ajv = new Ajv({
    allErrors: true,       // Reportar todos os erros, não apenas o primeiro
    strict: true,          // Modo estrito: sem propriedades adicionais não declaradas
    removeAdditional: true, // Remove campos extras que o modelo possa ter adicionado
});
addFormats(ajv); // Suporte a formatos: date-time, email, uri, etc.

/**
 * Schema AJV da resposta analítica completa.
 *
 * Campos obrigatórios:
 *   - analise: objeto com arrays fatos, inferencias, hipoteses
 *   - metricas: objeto com 4 valores numéricos 0–10
 *   - justificativa: string explicando o raciocínio
 *   - timestamp: string ISO 8601
 *   - engine_version: string de versão
 */
const SCHEMA_RESPOSTA = {
    type: 'object',
    required: ['analise', 'metricas', 'justificativa', 'timestamp', 'engine_version'],
    additionalProperties: false,
    properties: {
        analise: {
            type: 'object',
            required: ['fatos', 'inferencias', 'hipoteses'],
            additionalProperties: false,
            properties: {
                fatos: {
                    type: 'array',
                    items: { type: 'string', minLength: 1 },
                },
                inferencias: {
                    type: 'array',
                    items: {
                        // Inferências são objetos com afirmação + justificativa
                        oneOf: [
                            {
                                type: 'object',
                                required: ['afirmacao', 'justificativa'],
                                additionalProperties: false,
                                properties: {
                                    afirmacao: { type: 'string', minLength: 1 },
                                    justificativa: { type: 'string', minLength: 1 },
                                },
                            },
                            // Fallback: permite string simples caso o modelo não siga a estrutura
                            { type: 'string', minLength: 1 },
                        ],
                    },
                },
                hipoteses: {
                    type: 'array',
                    items: { type: 'string', minLength: 1 },
                },
            },
        },
        metricas: {
            type: 'object',
            required: ['risco_emocional', 'indice_manipulacao', 'ambivalencia', 'coerencia_interna'],
            additionalProperties: false,
            properties: {
                risco_emocional: { type: 'number', minimum: 0, maximum: 10 },
                indice_manipulacao: { type: 'number', minimum: 0, maximum: 10 },
                ambivalencia: { type: 'number', minimum: 0, maximum: 10 },
                coerencia_interna: { type: 'number', minimum: 0, maximum: 10 },
            },
        },
        justificativa: { type: 'string' },
        timestamp: {
            type: 'string',
            format: 'date-time', // Valida formato ISO 8601
        },
        engine_version: { type: 'string', minLength: 1 },
    },
};

// Compilar schema uma vez (AJV compila para função JS — eficiente)
const validar = ajv.compile(SCHEMA_RESPOSTA);

/**
 * Valida o objeto de resposta normalizado contra o schema.
 *
 * @param {object} dados - Objeto retornado pelo metricsCalculator
 * @returns {object} - O mesmo objeto se válido
 * @throws {SchemaError} - Se o objeto não atender ao schema
 */
function validateResponse(dados) {
    const valido = validar(dados);

    if (!valido) {
        const erros = validar.errors.map(e => `${e.instancePath || '(raiz)'}: ${e.message}`);
        throw new SchemaError(
            'Resposta interna não atende ao schema de validação.',
            { tipo: 'schema_validation_failed', erros }
        );
    }

    return dados;
}

module.exports = { validateResponse, SCHEMA_RESPOSTA };
