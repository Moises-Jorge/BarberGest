#!/bin/bash


GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Iniciando o ambiente BarberGest API ===${NC}"

if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Erro: O Docker não está a rodar. Por favor, inicia o serviço do Docker primeiro.${NC}"
  exit 1
fi

echo -e "${BLUE}[1/4] Subindo a base de dados PostgreSQL no Docker...${NC}"
docker compose up -d

echo -e "${BLUE}[2/4] Verificando pasta de uploads...${NC}"
mkdir -p uploads

echo -e "${BLUE}[3/4] Sincronizando migrações do banco de dados...${NC}"
npx prisma migrate dev

echo -e "${GREEN}[4/4] Servidor pronto! Iniciando a aplicação...${NC}"
echo -e "${GREEN}API disponível em: http://localhost:3000${NC}"
echo -e "${GREEN}Swagger UI em:    http://localhost:3000/api-docs${NC}"
echo -e "--------------------------------------------------"

npm run dev