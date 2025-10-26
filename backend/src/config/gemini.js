import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ ERROR: GOOGLE_API_KEY no está definida en .env");
  process.exit(1);
}

export const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const GEMINI_MODEL = "gemini-2.0-flash-exp";

export const GEMINI_CONFIG = {
  maxOutputTokens: 2048,
  temperature: 0.7,
};

console.log("✅ Gemini AI conectado");