import * as dotenv from "dotenv";
import * as path from "path";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getEnvFileName() {
  return isProduction() ? ".env" : `${process.env.NODE_ENV || "development"}.env`;
}

const envFilePath = path.resolve(__dirname, "..", getEnvFileName());

const result = dotenv.config({ path: envFilePath });

if (result.error) {
  console.error("env load error...", result.error);
  process.exit();
}
