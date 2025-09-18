require("dotenv").config(); // importa variables del .env
const { DataSource } = require("typeorm");
const Invitation = require("./entity/Invitation.js");
const Response = require("./entity/Response.js");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true, // cuidado: solo en desarrollo, en prod usar migraciones
  logging: ["error", "warn", "schema"], 
  entities: [Invitation, Response],
});

module.exports = AppDataSource;