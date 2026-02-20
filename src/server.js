/**
 * server.js — Entry Point
 *
 * Inicializa o servidor Express com middlewares de segurança
 * e registra as rotas do sistema analítico.
 *
 * Camadas de segurança:
 *   - helmet: headers HTTP seguros
 *   - express-rate-limit: protege contra abuso do endpoint
 *   - JSON body parser com limite de tamanho
 */

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const webhookRouter = require('./webhook/webhookRouter');
const errorHandler = require('./errors/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares de Segurança ──────────────────────────────────
app.use(helmet());

// Limite: 60 requisições por IP a cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    code: 429,
    message: 'Limite de requisições atingido. Tente novamente em alguns minutos.',
  },
});

app.use(limiter);

// ─── Body Parser ───────────────────────────────────────────────
// Limite de 1mb para prevenir payloads maliciosos
app.use(express.json({ limit: '1mb' }));

// ─── Rotas ─────────────────────────────────────────────────────
app.use('/analisar', webhookRouter);

// Health check mínimo para deploy e monitoramento
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    engine_version: process.env.ENGINE_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    code: 404,
    message: `Rota '${req.method} ${req.path}' não existe.`,
  });
});

// ─── Tratamento Global de Erros ────────────────────────────────
app.use(errorHandler);

// ─── Inicialização ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Motor analítico rodando em http://localhost:${PORT}`);
  console.log(`[server] Engine version: ${process.env.ENGINE_VERSION || '1.0.0'}`);
  console.log(`[server] Modelo Gemini: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}`);
});

module.exports = app;
