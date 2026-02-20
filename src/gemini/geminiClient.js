/**
 * geminiClient.js — Gemini Layer
 *
 * Cliente seguro para integração com a Google Gemini API.
 *
 * Características:
 *   - Chave lida exclusivamente de variável de ambiente GEMINI_API_KEY
 *   - Modelo configurável via GEMINI_MODEL
 *   - Timeout via AbortController + GEMINI_TIMEOUT_MS
 *   - Nunca expõe a chave em logs ou respostas de erro
 *   - Lança GeminiError para falhas da API (mapeado para HTTP 502)
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 30000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Classe de erro para falhas na integração com Gemini.
 * Capturada pelo errorHandler e mapeada para HTTP 502.
 */
class GeminiError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'GeminiError';
        this.details = details;
    }
}

/**
 * Valida que a chave de API está configurada antes de qualquer chamada.
 * Falha imediatamente (fail-fast) se ausente — sem exposição da chave.
 *
 * @throws {GeminiError}
 */
function validarChaveApi() {
    if (!process.env.GEMINI_API_KEY) {
        throw new GeminiError(
            'GEMINI_API_KEY não configurada. Defina a variável de ambiente.',
            { tipo: 'missing_api_key' }
        );
    }
}

/**
 * Extrai o texto puro da resposta Gemini.
 * Tenta limpar possíveis blocos markdown que o modelo possa incluir.
 *
 * @param {string} textoRaw
 * @returns {string}
 */
function extrairJson(textoRaw) {
    // Remover possíveis blocos ```json ... ``` caso o modelo não siga a instrução
    const semMarkdown = textoRaw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    return semMarkdown;
}

/**
 * Chama a Gemini API com o prompt estruturado e retorna o texto da resposta.
 *
 * @param {{ systemInstruction: string, userPrompt: string }} prompt
 * @returns {Promise<string>} - Texto bruto da resposta (deve ser JSON)
 * @throws {GeminiError} - Em caso de falha na API ou timeout
 */
async function callGemini({ systemInstruction, userPrompt }) {
    validarChaveApi();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction,
        // Configuração para maximizar consistência do JSON:
        generationConfig: {
            temperature: 0.2,      // Baixa temperatura = respostas mais determinísticas
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
        },
    });

    // Timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
        const result = await model.generateContent(
            userPrompt,
            { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        const response = result.response;

        if (!response) {
            throw new GeminiError('Resposta vazia recebida da Gemini API.', { tipo: 'empty_response' });
        }

        const textoRaw = response.text();
        return extrairJson(textoRaw);
    } catch (err) {
        clearTimeout(timeoutId);

        // Identificar timeout
        if (err.name === 'AbortError' || err.message?.includes('abort')) {
            throw new GeminiError(
                `Timeout atingido após ${GEMINI_TIMEOUT_MS}ms na chamada à Gemini API.`,
                { tipo: 'timeout', timeout_ms: GEMINI_TIMEOUT_MS }
            );
        }

        // Re-lançar GeminiErrors já formatados
        if (err instanceof GeminiError) throw err;

        // Erros da SDK Gemini
        throw new GeminiError(
            'Falha na comunicação com a Gemini API.',
            { tipo: 'api_error', mensagem_original: err.message }
        );
    }
}

module.exports = { callGemini, GeminiError };
