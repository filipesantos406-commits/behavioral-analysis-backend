/**
 * chatFileParser.js — Future Stub
 *
 * MÓDULO FUTURO: Parser de arquivos _chat.txt exportados do WhatsApp.
 *
 * Quando implementado, este módulo será responsável por:
 *   1. Receber upload multipart de arquivo _chat.txt
 *   2. Extrair mensagens por participante com timestamps
 *   3. Detectar participantes (remetentes únicos)
 *   4. Calcular volume de mensagens por participante
 *   5. Preparar array de mensagens para análise sequencial
 *   6. Suportar extração de ZIP exportado pelo WhatsApp
 *
 * Formatos suportados (futuro):
 *   - WhatsApp Android: "[DD/MM/YYYY, HH:MM:SS] Participante: Mensagem"
 *   - WhatsApp iOS:     "[DD/MM/YYYY HH:MM:SS] Participante: Mensagem"
 *
 * Dependências futuras:
 *   - multer (upload de arquivos)
 *   - adm-zip (extração de .zip)
 *   - chardet (detecção de encoding)
 *
 * Status: NÃO IMPLEMENTADO — Placeholder para expansão futura.
 */

'use strict';

/**
 * @typedef {Object} MensagemChat
 * @property {string} timestamp - ISO 8601
 * @property {string} participante - Nome do remetente
 * @property {string} conteudo - Texto da mensagem
 */

/**
 * Faz parse do conteúdo bruto de um _chat.txt do WhatsApp.
 *
 * @param {string} _conteudoArquivo - Conteúdo bruto do arquivo .txt
 * @returns {MensagemChat[]} - Array de mensagens estruturadas
 * @throws {Error} - Sempre (stub não implementado)
 */
function parseChatFile(_conteudoArquivo) {
    throw new Error('[chatFileParser] Módulo ainda não implementado. Previsto para v2.0.0.');
}

/**
 * Extrai e parseia um _chat.txt de dentro de um .zip do WhatsApp.
 *
 * @param {Buffer} _zipBuffer - Buffer do arquivo ZIP
 * @returns {MensagemChat[]}
 * @throws {Error} - Sempre (stub não implementado)
 */
function parseZipExport(_zipBuffer) {
    throw new Error('[chatFileParser] Extração de ZIP ainda não implementada. Previsto para v2.0.0.');
}

module.exports = { parseChatFile, parseZipExport };
