// swagger.js
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.1.0",
    info: { title: "NewsMap API", version: "1.0.0" },
    servers: [{ url: "http://newsmap.today/" }],
  },
  apis: ["./src/api/**/*.js", "./src/Mongoose/**/*.js"], // paths to files with JSDoc @openapi comments
});
