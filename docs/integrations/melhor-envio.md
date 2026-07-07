# Integração Melhor Envio

Guia da integração de frete da Clarisse com o **Melhor Envio**. Cobre tanto o
que já está implementado no código (Fase 1) quanto o **passo a passo sem código**
que o desenvolvedor precisa fazer no site do Melhor Envio.

> **Status:** Fase 1 — cliente de API, OAuth, schema e configuração no admin.
> O cálculo de frete na sacola e a geração de etiquetas no admin são da Fase 2
> (o código já está preparado para isso).

---

## 1. Visão geral do que foi implementado

| Componente | Caminho |
|------------|---------|
| Variáveis de ambiente | [`lib/env.ts`](../../lib/env.ts), [`.env.example`](../../.env.example) |
| Client da API | [`lib/melhor-envio.ts`](../../lib/melhor-envio.ts) |
| Módulo de envio | [`modules/shipping/`](../../modules/shipping/) |
| Router tRPC | [`trpc/routers/shipping/index.ts`](../../trpc/routers/shipping/index.ts) |
| Início do OAuth | [`app/api/oauth/melhor-envio/start/route.ts`](../../app/api/oauth/melhor-envio/start/route.ts) |
| Callback do OAuth | [`app/api/oauth/melhor-envio/callback/route.ts`](../../app/api/oauth/melhor-envio/callback/route.ts) |
| Webhook | [`app/api/webhooks/melhor-envio/route.ts`](../../app/api/webhooks/melhor-envio/route.ts) |
| Admin (configurações) | `/admin/settings/shipping` |
| Dimensões do produto | Campos altura/largura/comprimento no cadastro de produto |

A autenticação é **OAuth2 (authorization code + refresh)**. O token é guardado
na tabela `melhor_envio_integration` e renovado automaticamente, então a loja
**autoriza uma única vez**.

---

## 2. Passo a passo no site do Melhor Envio (sem código)

### 2.1. Crie a conta de testes (sandbox)
1. Acesse **https://sandbox.melhorenvio.com.br** e crie uma conta.
   - O sandbox é **separado** da produção. Toda a homologação é feita aqui.
2. Complete o cadastro básico (dados da empresa/remetente).

### 2.2. Crie o Aplicativo (gera as credenciais)
1. No painel, vá em **Integrações → Área do desenvolvedor (Dev)**.
2. Clique em **Criar aplicativo / Novo app**.
3. Preencha:
   - **Nome do app** (ex.: `Clarisse`) e **e-mail de contato**.
     > Esses dois dados compõem o header `User-Agent` obrigatório nas
     > requisições. Vão em `MELHOR_ENVIO_APP_NAME` e `MELHOR_ENVIO_CONTACT_EMAIL`.
   - **Redirect URI** (URL de retorno do OAuth), exatamente:
     ```
     https://SEU_DOMINIO/api/oauth/melhor-envio/callback
     ```
     Em desenvolvimento use a URL do túnel (ex.: ngrok), pois o Melhor Envio
     **não aceita `localhost`**. O valor precisa bater 100% com o cadastrado.
   - **Escopos/permissões:** marque cotação, carrinho, compra, geração,
     impressão, rastreio e cancelamento de etiquetas (o código já solicita o
     conjunto completo — veja `MELHOR_ENVIO_SCOPES` em `lib/melhor-envio.ts`).
4. Salve e **anote o `Client ID` e o `Client Secret`**.

### 2.3. Configure as variáveis de ambiente
No `.env` da aplicação (veja `.env.example`):
```bash
MELHOR_ENVIO_CLIENT_ID="..."
MELHOR_ENVIO_CLIENT_SECRET="..."
MELHOR_ENVIO_ENVIRONMENT="sandbox"   # produção depois
MELHOR_ENVIO_APP_NAME="Clarisse"
MELHOR_ENVIO_CONTACT_EMAIL="contato@clarisse.com.br"
```
> O `Client Secret` também é usado para validar a assinatura dos webhooks
> (`X-ME-Signature`, HMAC-SHA256).

### 2.4. Autorize a conta (gera o token) — no admin da Clarisse
1. Faça login como **admin** e abra **Configurações → Envio**
   (`/admin/settings/shipping`).
2. Clique em **"Conectar Melhor Envio"**. Você é redirecionado ao Melhor Envio
   para autorizar; ao confirmar, volta para o admin já conectado.
   - O token e o refresh token ficam salvos e são renovados sozinhos.
   - Nada de copiar token manualmente.

### 2.5. Preencha origem e remetente
Ainda em **Configurações → Envio**, informe:
- **CEP de origem** (obrigatório para cotar frete).
- Nome, CPF/CNPJ, telefone e endereço do remetente (usados nas etiquetas).
- **Embalagem padrão** (altura/largura/comprimento/peso) — fallback para
  produtos sem dimensões próprias.
- **Frete grátis**: ligue/desligue e ajuste o limite (default R$ 800,00).

### 2.6. Cadastre o Webhook
1. No painel do Melhor Envio: **Dev → seu app → Webhooks → Novo Webhook**.
2. URL:
   ```
   https://SEU_DOMINIO/api/webhooks/melhor-envio
   ```
3. O Melhor Envio assina cada chamada com `X-ME-Signature`; a aplicação valida
   automaticamente usando o `Client Secret`.
   > Webhooks só disparam para etiquetas criadas **pelo mesmo app** onde o
   > webhook está cadastrado.

### 2.7. Dimensões dos produtos
No cadastro de cada produto (admin), preencha **altura, largura e comprimento
(cm)**. O **peso** continua por variante (campo "Peso g"). Sem dimensões, a
cotação usa a embalagem padrão das configurações.

---

## 3. Ir para produção (go-live)

1. Crie a conta de **produção** em https://www.melhorenvio.com.br e repita a
   criação do **Aplicativo** lá (novo `Client ID`/`Client Secret`, mesmos
   Redirect URI e Webhook apontando para o domínio de produção).
2. No `.env` de produção:
   ```bash
   MELHOR_ENVIO_ENVIRONMENT="production"
   MELHOR_ENVIO_CLIENT_ID="...prod..."
   MELHOR_ENVIO_CLIENT_SECRET="...prod..."
   ```
3. **Reconecte** o OAuth no admin (o token de sandbox não vale em produção).
4. **Saldo:** comprar etiquetas (Fase 2) exige saldo na carteira do Melhor
   Envio ou cartão cadastrado.

---

## 4. Notas técnicas

- **Base URLs:** sandbox `https://sandbox.melhorenvio.com.br`, produção
  `https://www.melhorenvio.com.br`. Resolvido por `getMelhorEnvioBaseUrl()`.
- **Cotação:** `POST /api/v2/me/shipment/calculate` via
  `calculateQuote()` em `modules/shipping/server-utils.ts`. Dimensões em **cm**,
  peso em **kg** (convertido de gramas), valor segurado a partir do preço.
- **Token:** renovado quando falta menos de 1h para expirar
  (`getValidAccessToken()`).
- **Webhook → pedido:** eventos `order.posted`/`order.delivered` atualizam
  `fulfillmentStatus`, `trackingCode` e `shippingStatus` do pedido pelo
  `melhorEnvioOrderId`.

### Fase 2 (preparada, não ativada)
- Seleção da transportadora na sacola/checkout (router `shipping.quote` pronto).
- No admin: adicionar ao carrinho do ME → comprar → gerar → imprimir etiqueta
  (métodos já existem em `lib/melhor-envio.ts`).
- Colunas de envio já existem em `orders` (sem nova migração necessária).
