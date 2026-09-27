import express from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import barbeiroRoutes from './modules/barbeiros/barbeiro.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Rota para a documentação Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Rotas da API
app.use('/barbeiros', barbeiroRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
  console.log(`Servidor a rodar em http://localhost:${PORT}`);
});