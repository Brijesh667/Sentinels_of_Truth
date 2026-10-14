import Redis from "ioredis";

let redisClient = null;
let isReady = false;

export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[Redis] REDIS_URL not configured. Redis features disabled.");
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    });

    redisClient.on("ready", () => {
      isReady = true;
      console.log("[Redis] Connected and ready");
    });

    redisClient.on("connect", () => {
      isReady = true;
    });

    redisClient.on("close", () => {
      isReady = false;
    });

    redisClient.on("error", (err) => {
      isReady = false;
      console.warn(`[Redis] Connection warning: ${err.message}`);
    });

    redisClient.connect().catch((err) => {
      isReady = false;
      console.warn(`[Redis] Initial connection failed: ${err.message}`);
    });
  } catch (error) {
    isReady = false;
    console.warn(`[Redis] Failed to initialize Redis client: ${error.message}`);
    redisClient = null;
  }

  return redisClient;
}

export function isRedisReady() {
  const client = getRedisClient();
  return Boolean(client && isReady && client.status === "ready");
}

export async function waitForRedis(timeoutMs = 2000) {
  const client = getRedisClient();
  if (!client) return false;
  if (isReady && client.status === "ready") return true;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve(Boolean(isReady && client.status === "ready"));
    }, timeoutMs);

    const onReady = () => {
      cleanup();
      resolve(true);
    };

    const onError = () => {
      cleanup();
      resolve(false);
    };

    function cleanup() {
      clearTimeout(timer);
      client.removeListener("ready", onReady);
      client.removeListener("error", onError);
    }

    client.once("ready", onReady);
    client.once("error", onError);
  });
}

export async function redisGet(key) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis unavailable");
  }
  return await client.get(key);
}

export async function redisSet(key, value, ...args) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis unavailable");
  }
  return await client.set(key, value, ...args);
}

export async function redisDel(key) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis unavailable");
  }
  return await client.del(key);
}

export async function redisSAdd(key, ...members) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis unavailable");
  }
  return await client.sadd(key, ...members);
}

export async function redisSRem(key, ...members) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis unavailable");
  }
  return await client.srem(key, ...members);
}

export async function redisSMembers(key) {
  const client = getRedisClient();
  if (!client || !isRedisReady()) {
    throw new Error("Redis unavailable");
  }
  return await client.smembers(key);
}
