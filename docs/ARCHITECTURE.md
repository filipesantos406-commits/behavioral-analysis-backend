# Arquitetura do Sistema

## Visão Geral

O motor analítico é composto por **6 camadas independentes**, cada uma com responsabilidade única.
A separação garante que mudanças em uma camada não afetem as demais.

---

## Diagrama de Fluxo

```
Cliente (HTTP POST /analisar)
         │
         ▼
┌─────────────────────────────┐
│    Webhook Layer            │
│    webhookRouter.js         │  ← Orquestrador do pipeline
│    POST /analisar           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    Parser Layer             │
│    inputParser.js           │  ← Valida + sanitiza entrada
│                             │    Lança ValidationError (→ 400)
└──────────────┬──────────────┘
               │ string sanitizada
               ▼
┌─────────────────────────────┐
│    Prompt Layer             │
│    promptBuilder.js         │  ← Constrói prompt estruturado
│                             │    System instruction + user prompt
└──────────────┬──────────────┘
               │ { systemInstruction, userPrompt }
               ▼
┌─────────────────────────────┐
│    Gemini Layer             │
│    geminiClient.js          │  ← Chama Gemini API
│                             │    Timeout configurável
│                             │    Lança GeminiError (→ 502)
└──────────────┬──────────────┘
               │ string JSON bruta
               ▼
┌─────────────────────────────┐
│    Metrics Layer            │
│    metricsCalculator.js     │  ← Parse JSON + clamp 0–10
│                             │    Stampa timestamp autoritativo
│                             │    Lança SchemaError (→ 422)
└──────────────┬──────────────┘
               │ objeto normalizado
               ▼
┌─────────────────────────────┐
│    Schema Layer             │
│    responseSchema.js        │  ← Valida estrutura com AJV
│                             │    Remove campos extras
│                             │    Lança SchemaError (→ 422)
└──────────────┬──────────────┘
               │ objeto validado
               ▼
     JSON Response (200)

Em qualquer ponto:
         ↓
┌─────────────────────────────┐
│    Error Handler            │
│    errorHandler.js          │  ← Middleware centralizado
│    ValidationError → 400    │
│    GeminiError     → 502    │
│    SchemaError     → 422    │
│    Generic         → 500    │
└─────────────────────────────┘
```

---

## Princípios Arquiteturais

| Princípio          | Implementação                                                    |
|--------------------|------------------------------------------------------------------|
| Responsabilidade única | Cada módulo faz apenas uma coisa                           |
| Fail-fast          | Erros detectados cedo, na camada mais próxima da entrada         |
| Erros tipados      | 3 classes de erro distintas mapeadas para HTTP status corretos   |
| Sem estado         | Nenhuma memória entre requisições (stateless)                    |
| Configurável       | Modelo, timeout e limites via variáveis de ambiente              |
| Extensível         | Stubs em `src/future/` prontos para expansão sem refactoring     |

---

## Estrutura de Arquivos

```
behavioral-analysis-backend/
├── src/
│   ├── server.js                     # Entry point Express
│   ├── webhook/
│   │   └── webhookRouter.js          # Orquestrador do pipeline
│   ├── parser/
│   │   └── inputParser.js            # Validação e sanitização
│   ├── prompt/
│   │   └── promptBuilder.js          # Geração de prompt Gemini
│   ├── gemini/
│   │   └── geminiClient.js           # Cliente Gemini API
│   ├── metrics/
│   │   └── metricsCalculator.js      # Parse + normalização
│   ├── schema/
│   │   └── responseSchema.js         # Validação AJV
│   ├── errors/
│   │   └── errorHandler.js           # Middleware de erros
│   └── future/                       # Módulos planejados (stubs)
│       ├── chatFileParser.js
│       ├── svgGenerator.js
│       └── responseTimeCalc.js
├── docs/
│   ├── ARCHITECTURE.md               # Este arquivo
│   ├── API.md                        # Spec do endpoint
│   └── DEPLOY.md                     # Instruções de deploy
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Dependências Externas

| Pacote                  | Propósito                                    |
|-------------------------|----------------------------------------------|
| `express`               | Framework HTTP                               |
| `helmet`                | Headers de segurança HTTP                    |
| `express-rate-limit`    | Rate limiting por IP                         |
| `@google/generative-ai` | SDK oficial Gemini API                       |
| `ajv` + `ajv-formats`   | Validação de JSON Schema (Draft-07)          |
| `dotenv`                | Carregamento de variáveis de ambiente        |

---

## Decisões de Design

**Por que Express e não Fastify?**
Express tem ecossistema mais amplo e integração mais madura com middlewares de segurança como helmet.

**Por que AJV e não Zod?**
AJV é o validador JSON Schema mais rápido do ecossistema Node.js. Como este projeto prevê integração futura com n8n (que usa JSON Schema nativo), AJV mantém consistência.

**Por que temperature=0.2 no Gemini?**
Análise comportamental requer consistência, não criatividade. Temperatura baixa reduz variação aleatória nas métricas entre execuções equivalentes.

**Por que timestamp é sobrescrito no servidor?**
O modelo pode gerar timestamps imprecisos ou fictícios. O servidor é a fonte autoritativa de tempo.
