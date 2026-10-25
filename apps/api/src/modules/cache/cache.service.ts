import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * خدمة الـ Cache — تدعم Redis وتعود لـ in-memory عند غيابه
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: any = null;
  private readonly memStore = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly config: ConfigService) {
    this.init();
  }

  private async init() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL غير مهيأ — سيُستخدم In-Memory Cache (غير مناسب للإنتاج)');
      return;
    }
    try {
      const { createClient } = await import('redis').catch(() => ({ createClient: null }));
      if (!createClient) { this.logger.warn('حزمة redis غير مثبّتة'); return; }
      this.redis = createClient({ url: redisUrl });
      this.redis.on('error', (e: Error) => this.logger.error(`Redis error: ${e.message}`));
      await this.redis.connect();
      this.logger.log('✅ Redis متصل');
    } catch (e) {
      this.logger.error(`Redis connect error: ${e}`);
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    if (this.redis) {
      const val = await this.redis.get(key).catch(() => null);
      return val ? JSON.parse(val) : null;
    }
    const entry = this.memStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) { this.memStore.delete(key); return null; }
    return JSON.parse(entry.value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.redis) {
      await this.redis.set(key, serialized, { EX: ttlSeconds }).catch(() => {});
      return;
    }
    this.memStore.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    if (this.redis) { await this.redis.del(key).catch(() => {}); return; }
    this.memStore.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.redis) {
      const keys: string[] = await this.redis.keys(pattern).catch(() => []);
      if (keys.length) await this.redis.del(keys).catch(() => {});
      return;
    }
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    for (const k of this.memStore.keys()) {
      if (regex.test(k)) this.memStore.delete(k);
    }
  }

  /** helper: جلب من Cache أو تنفيذ الـ factory وتخزين النتيجة */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async onModuleDestroy() {
    if (this.redis) await this.redis.quit().catch(() => {});
  }
}
