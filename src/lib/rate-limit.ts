import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

export interface RateLimitConfig {
  uniqueTokenPerInterval?: number
  interval?: number
  limit: number
}

export async function rateLimit(config: RateLimitConfig = {
  uniqueTokenPerInterval: 500, // number of unique tokens per interval
  interval: 60, // 60 seconds
  limit: 10 // 10 requests per interval
}) {
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') ?? 'anonymous'
  const tokenKey = `rate-limit:${ip}`

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const [response] = await redis.pipeline()
    .incr(tokenKey)
    .expire(tokenKey, config.interval)
    .exec()

  const currentUsage = response as number

  const isRateLimited = currentUsage > config.limit

  return {
    isRateLimited,
    currentUsage,
    limit: config.limit,
    remaining: isRateLimited ? 0 : config.limit - currentUsage
  }
}