import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseDataService } from './supabase-data.service';

@Global()
@Module({
  providers: [SupabaseService, SupabaseDataService],
  exports: [SupabaseService, SupabaseDataService],
})
export class SupabaseModule {}
