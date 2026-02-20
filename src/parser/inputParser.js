/**
 * inputParser.js — Parser Layer
 *
 * Responsável por validar e sanitizar a entrada recebida via webhook.
 *
 * Regras:
 *   - Campo "mensagem" é obrigatório e deve ser string não-vazia
 *   - Remove tags HTML para prevenir injeção
 *   - Normaliza espaços e quebras de linha excessivas
 *   - Aplica limite de tamanho configurável via MAX_MESSAGE_LENGTH
 *   - Nunca inventa dados: se inválido, lança ValidationError
 */

'use strict';

const MAX_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH, 10) || 10000;

/**
 * Classe de erro para falhas de validação de entrada.
 * Capturada pelo errorHandler e mapeada para HTTP 400.
 */
class ValidationError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
    }
}

/**
 * Remove tags HTML simples do texto.
 * Não usa DOMParser (ambiente Node.js sem DOM).
 *
 * @param {string} texto
 * @returns {string}
 */
function removeTags(texto) {
    return texto.replace(/<[^>]*>/g, '');
}

/**
 * Normaliza whitespace: colapsa múltiplos espaços/tabs,
 * mantém quebras de linha únicas para preservar estrutura do texto.
 *
 * @param {string} texto
 * @returns {string}
 */
function normalizarEspacos(texto) {
    return texto
        .replace(/\t/g, ' ')               // tabs → espaço
        .replace(/ {2,}/g, ' ')            // múltiplos espaços → um
        .replace(/\n{3,}/g, '\n\n')        // mais de 2 quebras → 2
        .trim();
}

/**
 * Valida e sanitiza o corpo da requisição.
 *
 * @param {object} body - req.body do Express
 * @returns {string} - mensagem sanitizada pronta para análise
 * @throws {ValidationError} - se entrada inválida
 */
function parseInput(body) {
    // Verificar presença do campo
    if (!body || body.mensagem === undefined) {
        throw new ValidationError(
            'Campo obrigatório ausente: "mensagem".',
            { campo: 'mensagem', tipo: 'missing_field' }
        );
    }

    // Verificar tipo
    if (typeof body.mensagem !== 'string') {
        throw new ValidationError(
            'O campo "mensagem" deve ser uma string.',
            { campo: 'mensagem', tipo: 'invalid_type', recebido: typeof body.mensagem }
        );
    }

    // Verificar se não está vazio após trim
    const textoLimpo = body.mensagem.trim();
    if (textoLimpo.length === 0) {
        throw new ValidationError(
            'O campo "mensagem" não pode estar vazio.',
            { campo: 'mensagem', tipo: 'empty_string' }
        );
    }

    // Sanitizar: remover HTML, normalizar espaços
    const textoSanitizado = normalizarEspacos(removeTags(textoLimpo));

    // Verificar tamanho máximo (após sanitização)
    if (textoSanitizado.length > MAX_LENGTH) {
        throw new ValidationError(
            `O campo "mensagem" excede o limite de ${MAX_LENGTH} caracteres (recebido: ${textoSanitizado.length}).`,
            { campo: 'mensagem', tipo: 'max_length_exceeded', limite: MAX_LENGTH, recebido: textoSanitizado.length }
        );
    }

    return textoSanitizado;
}

module.exports = { parseInput, ValidationError };
