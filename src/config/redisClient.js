
import Redis from "redis";
import dotenv from "dotenv";
dotenv.config();

const client = Redis.createClient({ url: process.env.REDIS_URL });

client.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Connected to Redis");
  }
}

export { client, connectRedis };
