const redis = require("ioredis");

const redisClient = new redis(config.redisUrl);

module.exports = redisClient;