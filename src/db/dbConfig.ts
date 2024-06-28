export const dbConfig = {
  host: process.env.ACT_MYSQL_HOST,
  port: parseInt(process.env.ACT_MYSQL_PORT) ?? 3306,
  user: process.env.ACT_MYSQL_USER,
  password: process.env.ACT_MYSQL_PASSWORD,
  database: process.env.ACT_MYSQL_DATABASE
};