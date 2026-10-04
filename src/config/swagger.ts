import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gestão de Barbearia - BarberGest',
      version: '1.0.0',
      description: 'API para gerenciamento de barbeiros, clientes e agendamentos.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
    },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts',
         './src/modules/**/*.types.ts',
         './src/modules/**/*.controllers.ts',
         './src/modules/**/*.service.ts',
         './src/modules/**/*.models.ts',
         './src/modules/**/*.repository.ts',
         './src/server.ts'
  ],
};

export const swaggerSpec = swaggerJsdoc(options);