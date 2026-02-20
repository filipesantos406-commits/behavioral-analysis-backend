/**
 * promptBuilder.js — Prompt Layer
 *
 * Constrói o prompt estruturado enviado à Gemini API.
 *
 * Princípios aplicados:
 *   - Instrução explícita para diferenciar FATO / INFERÊNCIA / HIPÓTESE
 *   - Escala 0–10 com definição clara de cada métrica
 *   - Proibição explícita de aconselhamento e diagnóstico clínico
 *   - Exigência de output exclusivamente JSON (sem markdown, sem prefixos)
 *   - Instrução para justificar todas as inferências
 */

'use strict';

/**
 * Retorna o prompt de sistema que define o comportamento do modelo.
 * Separado do conteúdo do usuário para melhor controle.
 *
 * @returns {string}
 */
function getSystemInstruction() {
    return `Você é um motor analítico de linguagem comportamental.
Sua função é analisar textos e retornar exclusivamente um objeto JSON válido.

REGRAS ABSOLUTAS:
1. Não gere aconselhamento psicológico ou emocional.
2. Não gere diagnóstico clínico de nenhum tipo.
3. Não invente dados ausentes no texto.
4. Justifique todas as inferências com referência ao texto.
5. Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois.
6. Não use blocos de código como \`\`\`json — apenas o JSON puro.

DEFINIÇÕES:
- FATO: Informação explicitamente declarada no texto.
- INFERÊNCIA: Conclusão razoável baseada no texto, que deve ser justificada.
- HIPÓTESE: Possibilidade especulativa, sem base direta no texto.

MÉTRICAS (escala 0.0 a 10.0):
- risco_emocional: Intensidade de sofrimento emocional perceptível no texto.
- indice_manipulacao: Presença de padrões de manipulação ou coerção comunicativa.
- ambivalencia: Contradição ou inconsistência entre sentimentos/declarações.
- coerencia_interna: Consistência lógica entre as partes do discurso.`;
}

/**
 * Retorna o schema JSON esperado como string para instrução explícita.
 *
 * @returns {string}
 */
function getExpectedSchema() {
    return `{
  "analise": {
    "fatos": ["string"],
    "inferencias": [{"afirmacao": "string", "justificativa": "string"}],
    "hipoteses": ["string"]
  },
  "metricas": {
    "risco_emocional": 0.0,
    "indice_manipulacao": 0.0,
    "ambivalencia": 0.0,
    "coerencia_interna": 0.0
  },
  "justificativa": "Explicação geral do raciocínio analítico.",
  "timestamp": "ISO 8601",
  "engine_version": "1.0.0"
}`;
}

/**
 * Constrói o prompt completo para envio à Gemini API.
 *
 * @param {string} mensagemSanitizada - Texto já validado e sanitizado
 * @returns {{ systemInstruction: string, userPrompt: string }}
 */
function buildPrompt(mensagemSanitizada) {
    const userPrompt = `Analise o seguinte texto comportamental e retorne EXCLUSIVAMENTE o JSON no formato especificado abaixo.

TEXTO PARA ANÁLISE:
---
${mensagemSanitizada}
---

FORMATO DE RESPOSTA OBRIGATÓRIO:
${getExpectedSchema()}

Lembre-se:
- Preencha o campo "timestamp" com a data/hora atual em ISO 8601.
- Preencha o campo "engine_version" com "1.0.0".
- Todos os valores numéricos de métricas devem ser floats entre 0.0 e 10.0.
- Não adicione nenhum texto fora do JSON.`;

    return {
        systemInstruction: getSystemInstruction(),
        userPrompt,
    };
}

module.exports = { buildPrompt, getSystemInstruction };
