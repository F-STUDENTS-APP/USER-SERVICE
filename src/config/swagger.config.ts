import swaggerJsdoc from 'swagger-jsdoc';

import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'User Profile Management Service for Student Points System',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'https://user-service-orpin.vercel.app', // Update with actual URL if known or dynamic
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
    path.join(process.cwd(), 'dist/routes/*.js'),
    path.join(process.cwd(), 'dist/controllers/*.js'),
  ],
};

const specs = swaggerJsdoc(options);

export default specs;
