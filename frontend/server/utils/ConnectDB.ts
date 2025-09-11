import mysql from "mysql2/promise";

const config = {
  host: process.env.DATABASE_HOST || "mysql",
  user: process.env.DATABASE_USER || "kci_user",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "kci_db",
  port: Number(process.env.DATABASE_PORT) || 3306,
};

const pool = mysql.createPool(config);

export default pool;
