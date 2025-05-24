import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "3.1.0",
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
    paths: {
      "/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Authantication"],
          description: "Register a new user with the given email and password",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    fname: {
                      type: "string",
                      description: "The user's first name",
                    },
                    lname: {
                      type: "string",
                      description: "The user's last name",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      description: "The user's email address",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      description: "The user's password",
                    },
                    phone: {
                      type: "number",
                      description: "The user's phone number",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The user's image",
                    },
                    familyBranch: {
                      type: "string",
                      enum: [
                        "branch_1",
                        "branch_2",
                        "branch_3",
                        "branch_4",
                        "branch_5",
                      ],
                      description: "The user's family branch",
                    },
                    familyRelationship: {
                      type: "string",
                      enum: [
                        "son",
                        "daughter",
                        "wife",
                        "husband",
                        "grandchild",
                        "other",
                      ],
                      description: "The user's family relationship",
                    },
                  },
                  required: [
                    "email",
                    "password",
                    "fname",
                    "lname",
                    "phone",
                    "familyRelationship",
                    "familyBranch",
                  ],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "User created successfully",
              headers: {
                "Set-Cookie": {
                  description: "HTTP-only cookie containing the access token.",
                  type: "string",
                  example:
                    "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=3600; SameSite=strict; Secure",
                },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "User Login",
          tags: ["Authantication"],
          description: "Authenticate user and generate a token",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    identifier: {
                      type: "string",
                      description:
                        "The user's email or phone number. Use email format for email or a numeric string for phone.",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      description: "The user's password",
                    },
                  },
                  required: ["email", "identifer"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful login",
              headers: {
                "Set-Cookie": {
                  description: "HTTP-only cookie containing the access token.",
                  type: "string",
                  example:
                    "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=3600; SameSite=strict; Secure",
                },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/logout": {
        post: {
          summary: "User Logout",
          tags: ["Authantication"],
          description: "logout user by deleting token from cookie",
          responses: {
            "200": {
              description: "User successfully logged out",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["../routes/*.ts", "../models/*.ts"],
};

const swaggerDocument = swaggerJsdoc(options);
export default swaggerDocument;
