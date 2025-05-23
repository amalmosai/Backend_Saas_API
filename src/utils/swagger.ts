import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "1.0.0",
    info: {
      title: "Backend api",
      description: "Backend  api App",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
          name: "authorization",
        },
      },
    },
    consumes: ["application/json"],
    produces: ["application/json"],
    paths: {},
  },
  apis: ["../routes/*.ts", "../models/*.ts"],
};

const swaggerDocument = swaggerJsdoc(options);
export default swaggerDocument;
