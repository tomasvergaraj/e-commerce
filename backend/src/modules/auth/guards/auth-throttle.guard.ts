import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

type AuthThrottleKeyMode = 'ip' | 'ip-email' | 'ip-user';

type AuthThrottleOptions = {
  name: string;
  limit: number;
  ttlSeconds: number;
  key: AuthThrottleKeyMode;
};

type BucketState = {
  count: number;
  resetAt: number;
};

const AUTH_THROTTLE_KEY = 'auth_throttle';

export const AuthThrottle = (options: AuthThrottleOptions) => SetMetadata(AUTH_THROTTLE_KEY, options);

@Injectable()
export class AuthThrottleGuard implements CanActivate {
  private static readonly buckets = new Map<string, BucketState>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<AuthThrottleOptions>(AUTH_THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: { sub?: string } }>();
    const now = Date.now();

    this.cleanupExpiredBuckets(now);

    const bucketKey = this.buildBucketKey(request, options);
    const existingBucket = AuthThrottleGuard.buckets.get(bucketKey);

    if (!existingBucket || existingBucket.resetAt <= now) {
      AuthThrottleGuard.buckets.set(bucketKey, {
        count: 1,
        resetAt: now + options.ttlSeconds * 1000,
      });
      return true;
    }

    if (existingBucket.count >= options.limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000));
      throw new HttpException(
        `Demasiados intentos para ${options.name}. Intenta nuevamente en ${retryAfterSeconds} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existingBucket.count += 1;
    AuthThrottleGuard.buckets.set(bucketKey, existingBucket);
    return true;
  }

  private buildBucketKey(
    request: Request & { user?: { sub?: string } },
    options: AuthThrottleOptions,
  ) {
    const keyParts = [options.name, this.getClientIp(request)];

    if (options.key === 'ip-email') {
      const email = typeof request.body?.email === 'string'
        ? request.body.email.trim().toLowerCase()
        : 'anon';
      keyParts.push(email);
    }

    if (options.key === 'ip-user') {
      keyParts.push(request.user?.sub || 'anon');
    }

    return keyParts.join(':');
  }

  private getClientIp(request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
      return forwardedFor.split(',')[0].trim();
    }

    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      return forwardedFor[0];
    }

    return (request.ip || request.socket.remoteAddress || 'unknown').replace(/^::ffff:/, '');
  }

  private cleanupExpiredBuckets(now: number) {
    if (AuthThrottleGuard.buckets.size < 500) {
      return;
    }

    for (const [key, bucket] of AuthThrottleGuard.buckets.entries()) {
      if (bucket.resetAt <= now) {
        AuthThrottleGuard.buckets.delete(key);
      }
    }
  }
}
