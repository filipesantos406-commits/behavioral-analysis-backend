/**
 * errorHandler.js — Error Handling Layer
 *
 * Middleware Express centralizado para tratamento de todos os erros.
 *
 * Mapeamento de tipos de erro → HTTP status:
 *   ValidationError  → 400 Bad Request          (entrada inválida)
 *   GeminiError      → 502 Bad Gateway          (falha na API externa)
 *   SchemaError      → 422 Unprocessable Entity (resposta internamente inválida)
 *   Outros           → 500 Internal Server Error
 *
 * Segurança:
 *   - Nunca expõe stack traces em produção
 *   - Nunca expõe a GEMINI_API_KEY em nenhuma resposta
 *   - Sempre retorna JSON estruturado
 */

'use strict';

const { ValidationError } = require('../parser/inputParser');
const { GeminiError } = require('../gemini/geminiClient');
const { SchemaError } = require('../metrics/metricsCalculator');

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Sanitiza um objeto de detalhes de erro para remover informações sensíveis.
 * Em produção, suprime detalhes que possam vazar.
 *
 * @param {object|null} details
 * @returns {object|null}
 */
function sanitizarDetalhes(details) {
    if (!details || IS_PROD) return null;
    return details;
}

/**
 * Middleware de tratamento de erros do Express.
 * Deve ser registrado APÓS todas as rotas no server.js.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    // Log interno sempre (com stack em dev, sem em prod)
    if (!IS_PROD) {
        console.error(`[errorHandler] ${err.name}: ${err.message}`);
        if (err.stack) console.error(err.stack);
    } else {
        console.error(`[errorHandler] ${err.name}: ${err.message}`);
    }

    // ─── Erros de Validação de Entrada (400) ─────────────────────
    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: 'ValidationError',
            code: 400,
            message: err.message,
            details: sanitizarDetalhes(err.details),
        });
    }

    // ─── Erros da Gemini API (502) ─────────────────────────────────
    if (err instanceof GeminiError) {
        return res.status(502).json({
            error: 'GeminiError',
            code: 502,
            message: err.message,
            details: sanitizarDetalhes(err.details),
        });
    }

    // ─── Erros de Schema Interno (422) ────────────────────────────
    if (err instanceof SchemaError) {
        return res.status(422).json({
            error: 'SchemaError',
            code: 422,
            message: err.message,
            details: sanitizarDetalhes(err.details),
        });
    }

    // ─── Erro de JSON malformado do Express (400) ─────────────────
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'InvalidJSON',
            code: 400,
            message: 'O corpo da requisição contém JSON inválido.',
            details: null,
        });
    }

    // ─── Erros Genéricos (500) ─────────────────────────────────────
    return res.status(500).json({
        error: 'InternalServerError',
        code: 500,
        message: 'Erro interno do servidor. Tente novamente.',
        details: null, // Nunca expor detalhes de erro genérico
    });
}

module.exports = errorHandler;
