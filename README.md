# Backend de Análise Comportamental — Gemini API

Motor analítico modular para análise comportamental de texto via webhook.
Recebe texto em português, processa via Gemini API e retorna JSON estruturado com análise de FATOS, INFERÊNCIAS, HIPÓTESES e quatro métricas quantitativas.

---

## Pré-requisitos

- **Node.js 18+** (`node --version`)
- **Chave de API do Gemini** — obtenha em [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## Setup Local

### 1. Instalar dependências

```bash
# Dentro da pasta do projeto:
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar o template:
copy .env.example .env      # Windows
cp .env.example .env        # Linux/macOS

# Editar .env e preencher:
GEMINI_API_KEY=sua_chave_real_aqui
```

### 3. Iniciar o servidor

```bash
# Produção:
npm start

# Desenvolvimento (com hot-reload nativo Node 18+):
npm run dev
```

O servidor sobe em `http://localhost:3000` por padrão.

---

## Endpoints

| Método | Rota       | Descrição                          |
|--------|------------|------------------------------------|
| POST   | /analisar  | Analisa texto comportamental       |
| GET    | /health    | Health check para deploy/monitoring|

### POST /analisar

**Requisição:**
```json
{
  "mensagem": "Ele nunca me escuta mas diz que me ama muito."
}
```

**Resposta de sucesso (200):**
```json
{
  "analise": {
    "fatos": [
      "O sujeito diz que ama muito a pessoa."
    ],
    "inferencias": [
      {
        "afirmacao": "Existe uma contradição entre o comportamento (não escutar) e a declaração afetiva (amor).",
        "justificativa": "O texto explicita ambos os elementos em oposição direta."
      }
    ],
    "hipoteses": [
      "O sujeito pode usar declarações de amor como mecanismo de regulação do conflito."
    ]
  },
  "metricas": {
    "risco_emocional": 6.5,
    "indice_manipulacao": 5.0,
    "ambivalencia": 7.8,
    "coerencia_interna": 3.5
  },
  "justificativa": "O texto apresenta ambivalência clara entre ação (não escutar) e declaração (amor). A inferência de padrão manipulativo é possível mas não confirmada — classificada como hipótese.",
  "timestamp": "2026-02-20T07:00:00.000Z",
  "engine_version": "1.0.0"
}
```

**Resposta de erro — campo ausente (400):**
```json
{
  "error": "ValidationError",
  "code": 400,
  "message": "Campo obrigatório ausente: \"mensagem\".",
  "details": { "campo": "mensagem", "tipo": "missing_field" }
}
```

---

## Arquitetura

```
POST /analisar
  ↓
inputParser      — valida + sanitiza entrada
  ↓
promptBuilder    — constrói prompt estruturado
  ↓
geminiClient     — chama Gemini API (com timeout)
  ↓
metricsCalculator — parseia JSON + normaliza métricas
  ↓
responseSchema   — valida estrutura final (AJV)
  ↓
JSON Response
```

Ver `docs/ARCHITECTURE.md` para diagrama completo.

---

## Deploy

Ver `docs/DEPLOY.md` para instruções de deploy em Render, Railway e Cloud Run.

---

## Expansão Futura

Os módulos em `src/future/` são stubs documentados para:

| Arquivo                 | Função                                  | Versão Prevista |
|-------------------------|-----------------------------------------|-----------------|
| `chatFileParser.js`     | Parse de `_chat.txt` do WhatsApp        | v2.0.0          |
| `svgGenerator.js`       | Geração de SVG emocional (radar chart)  | v2.0.0          |
| `responseTimeCalc.js`   | Cálculo de tempo médio de resposta      | v2.0.0          |

---

## Regras do Sistema

> ⚠️ Este motor **não** gera aconselhamento psicológico nem diagnóstico clínico.
> Todas as inferências são justificadas com referência ao texto original.
> Hipóteses são claramente diferenciadas de fatos verificáveis.
