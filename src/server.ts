import express from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import authRouter from './modules/auth/auth.routes.js'
import barbeiroRoutes from './modules/barbeiros/barbeiro.routes.js';
import clienteRoutes from './modules/clientes/cliente.routes.js';
import servicoRoutes from './modules/servicos/servico.routes.js';
import fs from "fs";
import { UPLOADS_FOLDER } from './config/upload.js';

const app = express();
const PORT = process.env.PORT || 4000;

//Garantir que a pasta 'uploads' existe
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

app.use(cors());
app.use(express.json());

//Rota para a documentação Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//Rota para aceder as imagens salvas
app.use("/files", express.static(UPLOADS_FOLDER));

// Rotas da API


//EndPoint Autenticação
app.use("/api/auth", authRouter);
// EndPoint Barbeiros
app.use('/api/barbeiros', barbeiroRoutes);
//EndPoint Clientes
app.use('/api/clientes', clienteRoutes); 
//EndPoint Servicos
app.use('/api/servicos', servicoRoutes); 


app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
  console.log(`Servidor a rodar em http://localhost:${PORT}`);
});