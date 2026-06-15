import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/qnas";
  await mongoose.connect(uri);
  console.log("[backend] MongoDB conectado");
}

export function dbState(): string {
  // 0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando
  return ["disconnected", "connected", "connecting", "disconnecting"][
    mongoose.connection.readyState
  ] ?? "unknown";
}
