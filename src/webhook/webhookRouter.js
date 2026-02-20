/**
 * webhookRouter.js — Webhook Layer
 *
 * Define e orquestra o endpoint POST /analisar.
 * Este módulo age como controlador do pipeline analítico:
 *
 *   inputParser → promptBuilder → geminiClient
 *       → metricsCalculator → responseSchema → JSON Response
 *
 * Não contém lógica de negócio — apenas coordenação de camadas.
 */

'use strict';

const express = require('express');
const router = express.Router();

const { parseInput } = require('../parser/inputParser');
const { buildPrompt } = require('../prompt/promptBuilder');
const { callGemini } = require('../gemini/geminiClient');
const { extractAndNormalizeMetrics } = require('../metrics/metricsCalculator');
const { validateResponse } = require('../schema/responseSchema');

/**
 * POST /analisar
 *
 * Body esperado:
 * {
 *   "mensagem": "Texto bruto para análise comportamental"
 * }
 *
 * Resposta de sucesso (200):
 * {
 *   "analise": { "fatos": [], "inferencias": [], "hipoteses": [] },
 *   "metricas": { "risco_emocional": 0.0, "indice_manipulacao": 0.0, ... },
 *   "justificativa": "...",
 *   "timestamp": "ISO string",
 *   "engine_version": "1.0.0"
 * }
 */
router.post('/', async (req, res, next) => {
    try {
        // 1. Validar e sanitizar entrada
        const mensagemSanitizada = parseInput(req.body);

        // 2. Construir prompt estruturado para Gemini
        const prompt = buildPrompt(mensagemSanitizada);

        // 3. Chamar Gemini API e obter texto bruto da resposta
        const respostaGeminiRaw = await callGemini(prompt);

        // 4. Extrair JSON da resposta e normalizar métricas
        const dadosNormalizados = extractAndNormalizeMetrics(respostaGeminiRaw);

        // 5. Validar estrutura do JSON contra schema
        const dadosValidados = validateResponse(dadosNormalizados);

        // 6. Retornar resposta final
        return res.status(200).json(dadosValidados);
    } catch (err) {
        // Delega ao middleware centralizado de erros
        return next(err);
    }
});

module.exports = router;
