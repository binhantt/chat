import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client!: SupabaseClient;

  onModuleInit(): void {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !serviceKey) {
      this.logger.warn(
        'Supabase not configured — SUPABASE_URL and SUPABASE_SECRET_KEY must be set',
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Ws = (globalThis as any).WebSocket ?? require('ws');
    this.client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: Ws },
    });

    this.logger.log('Supabase client initialized (service role)');
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized — check env vars');
    }
    return this.client;
  }

  /** Execute a query against a table via Supabase Data API */
  from<T = any>(table: string) {
    return this.getClient().from(table) as any;
  }
}
