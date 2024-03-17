import Redis from "ioredis";

const redisClient = new Redis({
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  host: process.env.REDIS_HOST,
  // tls:
  //   process.env.NODE_ENV === "production"
  //     ? { host: process.env.REDIS_HOST }
  //     : undefined,
  // connectTimeout: 30000,
  // db: 0,
  maxRetriesPerRequest: 1,
});

export default redisClient;
