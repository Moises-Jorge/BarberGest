#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

echo -e "${BLUE}=== Iniciando o ambiente BarberGest API ===${NC}"

# 1. Verificar se o Docker está a rodar
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Erro: O Docker não está a rodar. Por favor, inicia o serviço do Docker primeiro.${NC}"
  exit 1
fi

# 2. Subir o container do PostgreSQL
echo -e "${BLUE}[1/4] Subindo a base de dados PostgreSQL no Docker...${NC}"
docker compose up -d

# 3. Garantir que a pasta de uploads existe
echo -e "${BLUE}[2/4] Verificando pasta de uploads...${NC}"
mkdir -p uploads

# 4. Executar as migrações do Prisma
echo -e "${BLUE}[3/4] Sincronizando migrações do banco de dados...${NC}"
npx prisma migrate dev

# 5. Iniciar o servidor Express
echo -e "${GREEN}[4/4] Servidor pronto! Iniciando a aplicação...${NC}"
echo -e "${GREEN}API disponível em: http://localhost:3000${NC}"
echo -e "${GREEN}Swagger UI em:    http://localhost:3000/docs${NC}"
echo -e "--------------------------------------------------"

npm run dev