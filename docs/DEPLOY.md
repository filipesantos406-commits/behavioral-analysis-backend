# Guia de Deploy

## Deploy Local

### Requisitos
- Node.js 18+
- `GEMINI_API_KEY` válida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
copy .env.example .env
# Editar .env com sua GEMINI_API_KEY

# 3. Iniciar
npm start
# Servidor: http://localhost:3000
```

---

## Deploy em Nuvem

### Render.com (recomendado para início)

1. Crie conta em [render.com](https://render.com)
2. **New > Web Service** → conecte o repositório Git
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Em **Environment Variables** adicione:
   ```
   GEMINI_API_KEY = sua_chave
   NODE_ENV = production
   ENGINE_VERSION = 1.0.0
   ```
5. Deploy automático a cada push no repositório

URL gerada: `https://seu-projeto.onrender.com`

---

### Railway.app

```bash
# Instalar CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

Adicione as variáveis de ambiente no dashboard do Railway.

---

### Google Cloud Run

```bash
# Build da imagem Docker
docker build -t behavioral-analysis-backend .

# Tag e push para Google Container Registry
docker tag behavioral-analysis-backend gcr.io/SEU_PROJECT_ID/behavioral-analysis-backend
docker push gcr.io/SEU_PROJECT_ID/behavioral-analysis-backend

# Deploy no Cloud Run
gcloud run deploy behavioral-analysis-backend \
  --image gcr.io/SEU_PROJECT_ID/behavioral-analysis-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=sua_chave,NODE_ENV=production
```

#### Dockerfile (para Cloud Run)

Crie `Dockerfile` na raiz:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/server.js"]
```

---

## Integração com n8n

Para usar como substituto do Code Node no n8n:

1. Deploy em qualquer plataforma acima
2. No n8n: **HTTP Request Node**
   - Method: `POST`
   - URL: `https://seu-servidor/analisar`
   - Body: JSON com campo `mensagem`
3. A resposta JSON pode ser usada diretamente nos próximos nodes

---

## Variáveis de Ambiente — Produção

| Variável             | Obrigatório | Padrão             | Descrição                          |
|----------------------|-------------|--------------------|------------------------------------|
| `GEMINI_API_KEY`     | ✅ Sim      | —                  | Chave da API Gemini                |
| `NODE_ENV`           | Recomendado | `development`      | `production` suprime stack traces  |
| `PORT`               | Não         | `3000`             | Porta do servidor                  |
| `GEMINI_MODEL`       | Não         | `gemini-1.5-flash` | Modelo Gemini                      |
| `GEMINI_TIMEOUT_MS`  | Não         | `30000`            | Timeout da API em ms               |
| `MAX_MESSAGE_LENGTH` | Não         | `10000`            | Limite de caracteres da mensagem   |
| `ENGINE_VERSION`     | Não         | `1.0.0`            | Versão do motor (aparece no JSON)  |

---

## Verificação Pós-Deploy

```bash
# Health check
curl https://seu-servidor/health

# Teste completo
curl -X POST https://seu-servidor/analisar \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Ele diz que me ama mas nunca está presente."}'
```

Resultado esperado: HTTP 200 com JSON contendo `analise`, `metricas`, `justificativa`.
