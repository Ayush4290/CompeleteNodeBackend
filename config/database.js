import mysql, { createPool } from "mysql2";
import { logger } from "../utils/logger.js";

let connection;
const connectDB = async () => {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: "utf8mb4",
    });
    logger.info("Database connected successfully ");
  } catch (error) {
    logger.info("MYSQL database are  not connected error:", error.message);
    process.exit(1);
  }
};


const getConnection=()=>{
    if(!connection){
        throw new Error('Database are  not connected');
    }
    return connection;
}

export {connectDB,getConnection};