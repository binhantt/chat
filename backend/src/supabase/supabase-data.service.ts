import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

type SupabaseQuery = ReturnType<ReturnType<SupabaseService['getClient']>['from']>;

/**
 * Generic data access service using Supabase Data API (PostgREST).
 */
@Injectable()
export class SupabaseDataService {
  private readonly logger = new Logger(SupabaseDataService.name);

  constructor(private readonly supabase: SupabaseService) {}

  private from(table: string): SupabaseQuery {
    return this.supabase.getClient().from(table) as any;
  }

  async findAll<T = any>(
    table: string,
    options?: {
      select?: string;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
      filters?: Record<string, any>;
    },
  ): Promise<T[]> {
    let query = this.from(table).select(options?.select || '*', { count: 'exact' });

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) query = query.eq(key, value);
      }
    }
    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
    }
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 100) - 1);

    const { data, error } = await query;
    if (error) throw new Error(`Supabase findAll error: ${error.message}`);
    return (data || []) as T[];
  }

  async findById<T = any>(table: string, id: string, select = '*'): Promise<T | null> {
    const { data, error } = await this.from(table).select(select).eq('id', id).single();
    if (error && error.code !== 'PGRST116') return null;
    return data as T | null;
  }

  async findOne<T = any>(table: string, filters: Record<string, any>, select = '*'): Promise<T | null> {
    let query = this.from(table).select(select);
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) query = query.eq(key, value);
    }
    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') return null;
    return data as T | null;
  }

  async create<T = any>(table: string, data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await this.from(table).insert(data as any).select().single();
    if (error) throw new Error(`Supabase create error: ${error.message}`);
    return result as T;
  }

  async update<T = any>(table: string, id: string, data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await this.from(table).update(data as any).eq('id', id).select().single();
    if (error) throw new Error(`Supabase update error: ${error.message}`);
    return result as T;
  }

  async updateWhere<T = any>(table: string, filters: Record<string, any>, data: Partial<T>): Promise<T[]> {
    let query = this.from(table).update(data as any);
    for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
    const { data: result, error } = await query.select();
    if (error) throw new Error(`Supabase updateWhere error: ${error.message}`);
    return (result || []) as T[];
  }

  async delete(table: string, id: string): Promise<boolean> {
    const { error } = await this.from(table).delete().eq('id', id);
    if (error) throw new Error(`Supabase delete error: ${error.message}`);
    return true;
  }

  async deleteWhere(table: string, filters: Record<string, any>): Promise<boolean> {
    let query = this.from(table).delete();
    for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
    const { error } = await query;
    if (error) throw new Error(`Supabase deleteWhere error: ${error.message}`);
    return true;
  }

  async count(table: string, filters?: Record<string, any>): Promise<number> {
    let query = this.from(table).select('*', { count: 'exact', head: true });
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) query = query.eq(key, value);
      }
    }
    const { count, error } = await query;
    if (error) throw new Error(`Supabase count error: ${error.message}`);
    return count || 0;
  }

  async rpc<T = any>(fn: string, params?: Record<string, any>): Promise<T> {
    const { data, error } = await this.supabase.getClient().rpc(fn, params);
    if (error) throw new Error(`Supabase rpc error: ${error.message}`);
    return data as T;
  }
}
