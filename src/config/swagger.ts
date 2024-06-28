import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blogging App API',
      version: '1.0.0',
      description: 'API documentation for the Blogging App',
    },
    servers: [
      {
         url: 'https://blogging-app-api-jpux.onrender.com', //deployed URL
      },
      {
        url: 'http://localhost:5000', //local URL
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'country', 'city', 'role'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            country: { type: 'string' },
            city: { type: 'string' },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              default: 'user',
            },
          },
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        UserUpdate: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            country: { type: 'string' },
            city: { type: 'string' },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
            },
          },
        },
        Post: {
          type: 'object',
          required: ['title', 'content', 'author'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            author: { type: 'string' },
            date: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Comment: {
          type: 'object',
          required: ['content', 'author', 'post'],
          properties: {
            content: { type: 'string' },
            author: { type: 'string' },
            post: { type: 'string' },
            date: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      authAction: {
        BearerAuth: {
          name: "BearerAuth",
          schema: {
            type: "apiKey",
            in: "header",
            name: "Authorization",
            description: ""
          },
          value: "Bearer <JWT>"
        }
      }
    }
  }));
};

export default swaggerSpec;
