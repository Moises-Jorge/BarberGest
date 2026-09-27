import express from 'express';
import barbeiroRoutes from './modules/barbeiros/barbeiro.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/barbeiros', barbeiroRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor a rodar em http://localhost:${PORT}`);
});