# BarberGest API

API backend desenvolvida com **Node.js, Express, TypeScript, Prisma ORM e PostgreSQL**, utilizando **Docker** para executar a base de dados.

A API conta com documentação interativa Swagger, encriptação de senhas com `bcryptjs` e upload seguro de ficheiros de mídia (imagens) com validação por Magic Bytes (`file-type`).

---

## Pré-requisitos

Garante que tens as seguintes ferramentas instaladas na tua máquina:

* [Node.js](https://nodejs.org/) (v20 ou superior)
* [Docker](https://www.docker.com/) com Docker Compose ativo

---

## Como Rodar o Projeto Localmente - 1

### Modo Rápido (Recomendado)

O projeto conta com um script de automação (`start.sh`) que verifica o estado do Docker, sobe o container do PostgreSQL em segundo plano, garante a criação da pasta de `uploads/`, aplica todas as migrações da base de dados e inicia o servidor Express num único comando.

1. **Clonar e configurar o ambiente:**
   ```bash
   git clone <URL_DO_TEU_REPOSITORIO>
   cd BarberGest
   cp .env.example .env
   npm install

2. **Dar permissão ao script:**
   ```bash
   chmod +x start.sh

3. **Colocar o servidor:**
   ```bash
   ./start.sh


## Como Rodar o Projeto Localmente - 2

### 1. Clonar o Repositório

```bash
git clone <URL_DO_TEU_REPOSITORIO>
cd BarberGest
```

### 2. Configurar Variáveis de Ambiente

Cria o ficheiro `.env` com base no `.env.example`:

```bash
cp .env.example .env
```

Depois, verifica se as variáveis de ambiente estão corretamente configuradas.

### 3. Subir a Base de Dados no Docker

Inicia o container do PostgreSQL em segundo plano:

```bash
docker compose up -d
```

Para verificar se o container está em execução:

```bash
docker compose ps
```

### 4. Instalar as Dependências

Instala as dependências do projeto:

```bash
npm install
```

### 5. Sincronizar as Migrações da Base de Dados

Aplica as migrações à base de dados PostgreSQL e gera o Prisma Client:

```bash
npx prisma migrate dev
npx prisma db seed
```

### 6. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3000
```

---

## Principais Endpoints

### Módulo Autenticação

| Método    | Rota                   |  Proteção | Descrição                      |
| --------  | ---------------------- | --------- | ------------------------------ |
| `POST`    | `/auth/login/cliente`  |  Pública  | Login de Clientes              |
| `POST`    | `/auth/login/barbeiro` |  Pública  | Listar de Barbeiros            |
| `POST`    | `/auth/refresh`        |  Pública  | Renova o accessToken e roda o refreshToken         |
| `POST`    | `/auth/logout`         |  Pública  | Invalida o refreshToken        |

### Módulo Clientes

| Método   | Rota             | Descrição                      |
| -------- | ---------------- | ------------------------------ |
| `POST`   | `/barbeiros`     | Registar um novo barbeiro      |
| `GET`    | `/barbeiros`     | Listar todos os barbeiros      |
| `GET`    | `/barbeiros/:id` | Buscar barbeiro por ID         |
| `PUT`    | `/barbeiros/:id` | Atualizar dados de um barbeiro |
| `PATCH`  | `/barbeiros/:id/imagem` | Atualizar/Upload da imagem de perfil do barbeiro |
| `DELETE` | `/barbeiros/:id` | Remover um barbeiro            |

### Módulo Barbeiros

| Método   | Rota             | Descrição                      |
| -------- | ---------------- | ------------------------------ |
| `POST`   | `/clientes`     | Registar um novo cliente      |
| `GET`    | `/clientes`     | Listar todos os clientes      |
| `GET`    | `/clientes/:id` | Buscar cliente por ID         |
| `PUT`    | `/clientes/:id` | Atualizar dados de um cliente |
| `PATCH`  | `/clientes/:id/imagem` | Atualizar/Upload da imagem de perfil do cliente |
| `DELETE` | `/clientes/:id` | Remover um cliente            |

### Módulo Serviços

| Método   | Rota             | Descrição                      |
| -------- | ---------------- | ------------------------------ |
| `POST`   | `/servicos`     | Registar um novo serviço      |
| `GET`    | `/servicos`     | Listar todos os serviços      |
| `GET`    | `/servicos/:id` | Buscar serviço por ID         |
| `PUT`    | `/servicos/:id` | Atualizar dados de um serviço |
| `PATCH`  | `/servicos/:id/imagem` | Atualizar/Upload da imagem de perfil do serviço |
| `DELETE` | `/servicos/:id` | Remover um serviço            |


> **Nota:** Podes acessar a documentação iterativa em:
>
> `http://localhost:3000/api-docs`

---

## Uploads de Imagens

Durante o desenvolvimento, as imagens enviadas via multipart/form-data nos endpoints de upload são salvas localmente no diretório uploads/ e validadas rigorosamente:

`Limite por imagem`: 5MB.

`Formatos permitidos`: JPG, PNG e WEBP.

`Segurança de Mídia`: Validação do buffer real por Magic Bytes via file-type (impede renomeação maliciosa de ficheiros).

## Prisma

### Prisma Studio

Para abrir a interface gráfica da base de dados:

```bash
npx prisma studio
```

---

## Docker

### Iniciar os containers

```bash
docker compose up -d
```

### Verificar os containers

```bash
docker compose ps
```

### Ver os logs

```bash
docker compose logs
```

### Parar os containers

```bash
docker compose down
```

---

## Comandos Úteis

### Instalar dependências

```bash
npm install
```

### Executar o servidor em desenvolvimento

```bash
npm run dev
```

### Criar uma nova migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Gerar o Prisma Client

```bash
npx prisma generate
```

### Abrir o Prisma Studio

```bash
npx prisma studio
```

---

## Estrutura do Projeto

```text
BarberGest/
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── database/
│   │   └── prisma.ts
│   │
│   ├── modules/
│   │   └── barbeiros/
│   │       ├── controllers/
│   │       ├── repositories/
│   │       ├── services/
│   │       ├── models/
│   │       ├── routes/
│   │       └── types/
│   │
│   └── generated/
│       └── prisma/
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurar a ligação à base de dados.

Exemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE?schema=public"
```

> **Importante:** nunca coloques credenciais reais no `.env.example` nem faças commit do `.env` para o repositório.

---

## Tecnologias

* **Node.js** — Runtime JavaScript
* **Express** — Framework HTTP
* **TypeScript** — Tipagem estática
* **Prisma ORM** — ORM para acesso à base de dados
* **PostgreSQL** — Sistema de gestão de base de dados
* **Docker** — Containerização da base de dados
* **Swagger** — Documentação da API

---

## Licença

Este documento foi feito para o time do front-end ter uma orientação no uso da API durante o desenvolvimento do sistema **BarberGest**.
