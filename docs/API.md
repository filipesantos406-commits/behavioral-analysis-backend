# API Reference

## Endpoint: POST /analisar

Analisa um texto comportamental e retorna JSON estruturado com análise qualitativa e métricas quantitativas.

---

### Request

```
POST /analisar
Content-Type: application/json
```

#### Body

| Campo      | Tipo   | Obrigatório | Limite       | Descrição                     |
|------------|--------|-------------|--------------|-------------------------------|
| `mensagem` | string | ✅ Sim      | 10.000 chars | Texto bruto para análise      |

```json
{
  "mensagem": "string"
}
```

---

### Response — Sucesso (200)

```json
{
  "analise": {
    "fatos": [
      "Afirmação explicitamente declarada no texto."
    ],
    "inferencias": [
      {
        "afirmacao": "Conclusão razoável baseada no texto.",
        "justificativa": "Referência ao trecho específico que sustenta a inferência."
      }
    ],
    "hipoteses": [
      "Possibilidade especulativa sem base direta no texto."
    ]
  },
  "metricas": {
    "risco_emocional": 6.5,
    "indice_manipulacao": 5.0,
    "ambivalencia": 7.8,
    "coerencia_interna": 3.5
  },
  "justificativa": "Explicação geral do raciocínio analítico aplicado.",
  "timestamp": "2026-02-20T10:00:00.000Z",
  "engine_version": "1.0.0"
}
```

#### Descrição das Métricas

| Métrica              | Escala | Descrição                                                            |
|----------------------|--------|----------------------------------------------------------------------|
| `risco_emocional`    | 0–10   | Intensidade de sofrimento emocional perceptível                      |
| `indice_manipulacao` | 0–10   | Presença de padrões de manipulação ou coerção comunicativa           |
| `ambivalencia`       | 0–10   | Contradição ou inconsistência entre sentimentos/declarações          |
| `coerencia_interna`  | 0–10   | Consistência lógica entre as partes do discurso                      |

`0.0` = ausência total | `10.0` = intensidade máxima

---

### Responses — Erros

#### 400 — Validação de Entrada

```json
{
  "error": "ValidationError",
  "code": 400,
  "message": "Campo obrigatório ausente: \"mensagem\".",
  "details": {
    "campo": "mensagem",
    "tipo": "missing_field"
  }
}
```

Causas possíveis:
- Campo `mensagem` ausente
- Campo `mensagem` não é string
- Campo `mensagem` vazio após trim
- Mensagem excede `MAX_MESSAGE_LENGTH` (padrão: 10.000 chars)

#### 422 — Resposta Interna Inválida

```json
{
  "error": "SchemaError",
  "code": 422,
  "message": "Resposta interna não atende ao schema de validação.",
  "details": {
    "tipo": "schema_validation_failed",
    "erros": ["/metricas/risco_emocional: must be number"]
  }
}
```

Causa: A Gemini retornou JSON que não pôde ser normalizado/validado.

#### 429 — Rate Limit

```json
{
  "error": "TooManyRequests",
  "code": 429,
  "message": "Limite de requisições atingido. Tente novamente em alguns minutos."
}
```

Limite: 60 requisições por IP a cada 15 minutos.

#### 502 — Erro na Gemini API

```json
{
  "error": "GeminiError",
  "code": 502,
  "message": "Timeout atingido após 30000ms na chamada à Gemini API."
}
```

Causas possíveis:
- `GEMINI_API_KEY` ausente ou inválida
- Timeout (configurável via `GEMINI_TIMEOUT_MS`)
- Falha na API do Google

#### 500 — Erro Interno

```json
{
  "error": "InternalServerError",
  "code": 500,
  "message": "Erro interno do servidor. Tente novamente."
}
```

---

## Endpoint: GET /health

Health check para monitoramento e deploy.

```
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "engine_version": "1.0.0",
  "timestamp": "2026-02-20T10:00:00.000Z"
}
```

---

## Exemplos de Uso

### cURL

```bash
curl -X POST http://localhost:3000/analisar \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Ela sempre faz tudo errado e depois chora para que eu me sinta culpado."}'
```

### JavaScript (fetch)

```javascript
const resposta = await fetch('http://localhost:3000/analisar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mensagem: 'Ela sempre faz tudo errado e depois chora para que eu me sinta culpado.'
  })
});

const analise = await resposta.json();
console.log(analise.metricas.indice_manipulacao);
```

### n8n HTTP Request Node

- **Method:** POST
- **URL:** `http://seu-servidor/analisar`
- **Body Content Type:** JSON
- **Body:** `{ "mensagem": "{{ $json.body.mensagem }}" }`
