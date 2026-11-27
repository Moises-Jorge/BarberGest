# BarberGest API

API backend desenvolvida com **Node.js, Express, TypeScript, Prisma ORM e PostgreSQL**, utilizando **Docker** para executar a base de dados.

A API conta com documentação interativa Swagger, autenticação com JWT, encriptação de senhas com `bcryptjs`, validação de dados com Zod e upload de imagens com validação por *magic bytes* (`file-type`).

Este documento orienta a equipa de front-end no uso da API durante o desenvolvimento do sistema **BarberGest**.

---

## Pré-requisitos

* [Node.js](https://nodejs.org/) (v20 ou superior)
* [Docker](https://www.docker.com/) com Docker Compose ativo

---

## Como rodar o projeto localmente

Primeiro, clona o repositório, instala as dependências e cria o `.env`:

```bash
git clone <URL_DO_TEU_REPOSITORIO>
cd BarberGest
npm install
cp .env.example .env
```

Preenche o `.env` (ver [Variáveis de ambiente](#variáveis-de-ambiente)) e escolhe um dos modos.

### Modo rápido (recomendado)

O script `start.sh` verifica o Docker, sobe o PostgreSQL, cria a pasta `uploads/`, aplica as migrações, cria o administrador inicial e inicia o servidor.

```bash
chmod +x start.sh
./start.sh
```

### Modo manual

```bash
docker compose up -d      # base de dados
npx prisma migrate dev    # migrações e Prisma Client
npx prisma db seed        # administrador inicial (só se ainda não existir nenhum)
npm run dev               # servidor de desenvolvimento
```

### Produção

```bash
npm run build
npm start
```

| Recurso      | URL                              |
| ------------ | -------------------------------- |
| API          | `http://localhost:4000/api`      |
| Swagger UI   | `http://localhost:4000/api-docs` |
| Imagens      | `http://localhost:4000/files/`   |

A porta é `4000` por omissão e pode ser alterada com a variável `PORT`.

---

## Autenticação

As rotas protegidas exigem o cabeçalho:

```text
Authorization: Bearer <accessToken>
```

* O **access token** é de curta duração (`JWT_EXPIRES_IN`).
* O **refresh token** serve para obter um novo par de tokens e é válido por 7 dias.
* Cada utilizador tem **uma sessão**: um novo login ou refresh invalida o refresh token anterior. Guarda sempre o mais recente.
* O logout revoga o refresh token. O access token já emitido continua válido até expirar.
* Contas apagadas deixam de ter acesso de imediato.
* Barbeiros **inativos** não conseguem fazer login, renovar a sessão nem usar um token já emitido (`403`).
* Após **10 logins falhados em 15 minutos** (mesmo IP e telefone), a API responde `429`.

### Resposta do login

```json
{
  "user": {
    "id": "uuid",
    "nome": "Administrador Geral",
    "telefone": "900000000",
    "imagemUrl": null,
    "role": "BARBEIRO",
    "isAdmin": true
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

No login de cliente, `role` é `CLIENTE` e não existe `isAdmin`.

### Resposta do registo de cliente

O registo já inicia a sessão. Os tokens vêm **junto** dos dados do cliente, num formato diferente do login:

```json
{
  "id": "uuid",
  "nome": "João Silva",
  "telefone": "923123456",
  "imagemUrl": null,
  "created_at": "2026-01-01T10:00:00.000Z",
  "updated_at": "2026-01-01T10:00:00.000Z",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

Se a conta for criada mas a sessão falhar, a resposta é `201` sem os tokens. Nesse caso, encaminha o utilizador para o login.

---

## Endpoints

### Autenticação

| Método | Rota                       | Acesso      | Descrição                                       | Sucesso |
| ------ | -------------------------- | ----------- | ----------------------------------------------- | ------- |
| `POST` | `/api/auth/login/cliente`  | Público     | Login de clientes (`telefone`, `senha`)         | 200     |
| `POST` | `/api/auth/login/barbeiro` | Público     | Login de barbeiros e admins (`telefone`, `senha`) | 200   |
| `POST` | `/api/auth/refresh`        | Público     | Novo par de tokens (`refreshToken`)             | 200     |
| `POST` | `/api/auth/logout`         | Público     | Revoga o refresh token (`refreshToken`)         | 204     |
| `GET`  | `/api/auth/me`             | Autenticado | Perfil do utilizador com sessão iniciada        | 200     |

### Clientes

| Método   | Rota                       | Acesso               | Descrição                  | Sucesso |
| -------- | -------------------------- | -------------------- | -------------------------- | ------- |
| `POST`   | `/api/clientes`            | Público              | Registar cliente           | 201     |
| `GET`    | `/api/clientes`            | Admin                | Listar clientes            | 200     |
| `GET`    | `/api/clientes/:id`        | O próprio ou admin   | Buscar cliente por ID      | 200     |
| `PUT`    | `/api/clientes/:id`        | O próprio ou admin   | Atualizar dados            | 200     |
| `PATCH`  | `/api/clientes/:id/imagem` | O próprio ou admin   | Atualizar a imagem         | 200     |
| `DELETE` | `/api/clientes/:id`        | O próprio ou admin   | Remover cliente            | 204     |

### Barbeiros

| Método   | Rota                        | Acesso             | Descrição                | Sucesso |
| -------- | --------------------------- | ------------------ | ------------------------ | ------- |
| `POST`   | `/api/barbeiros`            | Admin              | Registar barbeiro        | 201     |
| `GET`    | `/api/barbeiros`            | Autenticado        | Listar barbeiros         | 200     |
| `GET`    | `/api/barbeiros/:id`        | Autenticado        | Buscar barbeiro por ID   | 200     |
| `PUT`    | `/api/barbeiros/:id`        | O próprio ou admin | Atualizar dados          | 200     |
| `PATCH`  | `/api/barbeiros/:id/imagem` | O próprio ou admin | Atualizar a imagem       | 200     |
| `DELETE` | `/api/barbeiros/:id`        | O próprio ou admin | Remover barbeiro         | 204     |

* Só um administrador pode enviar o campo `isAdmin` na atualização.
* O **último administrador ativo** não pode ser removido nem despromovido (`409`).
* A API não tem, por agora, forma de ativar ou desativar contas.

### Serviços

| Método   | Rota                       | Acesso      | Descrição              | Sucesso |
| -------- | -------------------------- | ----------- | ---------------------- | ------- |
| `POST`   | `/api/servicos`            | Admin       | Registar serviço       | 201     |
| `GET`    | `/api/servicos`            | Autenticado | Listar serviços        | 200     |
| `GET`    | `/api/servicos/:id`        | Autenticado | Buscar serviço por ID  | 200     |
| `PUT`    | `/api/servicos/:id`        | Admin       | Atualizar dados        | 200     |
| `PATCH`  | `/api/servicos/:id/imagem` | Admin       | Atualizar a imagem     | 200     |
| `DELETE` | `/api/servicos/:id`        | Admin       | Remover serviço        | 204     |

A listagem inclui os serviços ativos e inativos.

---

## Campos e validações

Os campos desconhecidos são **rejeitados**. Todos os `:id` têm de ser UUID.

### Clientes e barbeiros

| Campo       | Regra | Criação | Atualização |
| ----------- | ----- | ------- | ----------- |
| `nome`      | 2 a 40 caracteres: letras separadas por um espaço, hífen ou apóstrofo | Obrigatório | Opcional |
| `telefone`  | 9 dígitos, começa por `9` (os espaços são removidos); único em cada tipo de conta | Obrigatório | Opcional |
| `senha`     | 8 a 64 caracteres, sem espaços, com maiúscula, minúscula e número | Obrigatório | Opcional |
| `imagemUrl` | URL `http` ou `https` | Opcional | Não aceite |

No **login**, a `senha` só não pode estar vazia.

Apenas para barbeiros:

| Campo       | Regra | Criação | Atualização |
| ----------- | ----- | ------- | ----------- |
| `h_entrada` | Formato `HH:mm` | Obrigatório | Opcional |
| `h_saida`   | Formato `HH:mm`, posterior à entrada | Obrigatório | Opcional |
| `isAdmin`   | `true` ou `false` | Opcional | Opcional (só admin) |

### Serviços

| Campo       | Regra | Criação | Atualização |
| ----------- | ----- | ------- | ----------- |
| `nome`      | 2 a 60 caracteres | Obrigatório | Opcional |
| `descricao` | Até 255 caracteres | Opcional | Opcional |
| `preco`     | Maior que 0, até 10 000 000 | Obrigatório | Opcional |
| `duracao`   | Minutos, inteiro de 1 a 1440 | Obrigatório | Opcional |
| `ativo`     | `true` ou `false` (`true` por omissão) | Opcional | Opcional |
| `imagemUrl` | URL `http` ou `https` | Opcional | Não aceite |

---

## Erros

Os erros são devolvidos em JSON:

```json
{ "error": "Já existe um cliente com este telefone." }
```

Os erros de validação indicam os campos:

```json
{
  "error": "Dados de entrada inválidos.",
  "detalhes": [
    { "campo": "telefone", "mensagem": "O número de telefone é obrigatório" }
  ]
}
```

| Código | Significado |
| ------ | ----------- |
| 400    | Dados, JSON ou ficheiro inválidos |
| 401    | Sem token, token inválido ou credenciais erradas |
| 403    | Sem permissão ou conta inativa |
| 404    | Registo não encontrado |
| 409    | Telefone já registado ou último administrador |
| 413    | Corpo do pedido demasiado grande |
| 429    | Demasiadas tentativas de login |
| 500    | Erro interno do servidor |

---

## Upload de imagens

* Envia o pedido como `multipart/form-data`, com o ficheiro no campo `imagem`.
* O ficheiro pode ser enviado na **criação** (`POST`) ou pela rota `PATCH .../imagem`. O `PUT` não recebe ficheiros.
* Um ficheiro por pedido, até **5 MB**, em **JPG, PNG ou WEBP**.
* O conteúdo real é verificado, e o nome e a extensão são gerados pelo servidor.
* Quando uma imagem é substituída, ou o registo é removido, o ficheiro antigo é apagado se mais nenhum registo o usar.

```bash
curl http://localhost:4000/api/clientes \
  -F "nome=João Silva" \
  -F "telefone=923123456" \
  -F "senha=Senha1234" \
  -F "imagem=@/caminho/para/foto.jpg"
```

As imagens ficam na pasta `uploads/` e são públicas. O `imagemUrl` devolvido começa pelo valor de `PUBLIC_URL`. Para abrir imagens noutro dispositivo (por exemplo, um telemóvel), usa o IP da máquina em vez de `localhost`.

---

## Variáveis de ambiente

| Variável                   | Descrição |
| -------------------------- | --------- |
| `PORT`                     | Porta da API (opcional, `4000` por omissão) |
| `PUBLIC_URL`               | URL público da API, usado nos links das imagens |
| `DATABASE_URL`             | Ligação ao PostgreSQL (porta `5430` com o Docker do projeto) |
| `POSTGRES_USER`            | Utilizador da base de dados |
| `POSTGRES_PASSWORD`        | Senha da base de dados |
| `POSTGRES_DB`              | Nome da base de dados |
| `JWT_SECRET`               | Segredo do access token |
| `JWT_EXPIRES_IN`           | Validade do access token (`12m` por omissão) |
| `REFRESH_TOKEN_SECRET`     | Segredo do refresh token |
| `REFRESH_TOKEN_EXPIRES_IN` | Validade do refresh token (`7d` por omissão; a sessão guardada expira sempre aos 7 dias) |
| `ADMIN_NAME`               | Nome do administrador inicial |
| `ADMIN_PHONE`              | Telefone do administrador inicial |
| `ADMIN_PASSWORD`           | Senha do administrador inicial |

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5430/DATABASE"
```

> **Importante:** nunca coloques credenciais reais no `.env.example` nem faças commit do `.env`.

---

## Docker

```bash
docker compose up -d     # iniciar
docker compose ps        # verificar
docker compose logs      # ver os logs
docker compose down      # parar
```

---

## Comandos úteis

```bash
npm install                                          # instalar dependências
npm run dev                                          # servidor de desenvolvimento
npm run build                                        # compilar
npm start                                            # servidor compilado
npx prisma migrate dev --name nome_da_migration      # criar uma migração
npx prisma generate                                  # gerar o Prisma Client
npx prisma studio                                    # interface gráfica da base de dados
```

---

## Estrutura do projeto

```text
BarberGest/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── @types/             # extensões de tipos do Express
│   ├── config/             # Swagger, uploads e URL das imagens
│   ├── database/           # Prisma Client
│   ├── middlewares/        # autenticação, permissões, validação e erros
│   ├── modules/
│   │   ├── auth/
│   │   ├── barbeiros/      # routes, controller, service, repository, schema e types
│   │   ├── clientes/
│   │   └── servicos/
│   ├── shared/             # erros e validadores comuns
│   ├── utils/
│   └── server.ts
├── .env.example
├── docker-compose.yml
├── package.json
├── start.sh
└── tsconfig.json
```

---

## Tecnologias

* **Node.js**: runtime JavaScript
* **Express**: framework HTTP
* **TypeScript**: tipagem estática
* **Prisma ORM**: acesso à base de dados
* **PostgreSQL**: base de dados
* **Zod**: validação de dados
* **JWT**: autenticação
* **Multer**: upload de ficheiros
* **Docker**: base de dados em container
* **Swagger**: documentação da API
