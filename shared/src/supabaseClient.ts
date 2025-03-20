import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ClipboardItem } from './types';

export class SupabaseService {
  private supabase: SupabaseClient;
  private static instance: SupabaseService;

  private constructor(url: string, key: string) {
    this.supabase = createClient(url, key);
  }

  public static getInstance(url: string, key: string): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService(url, key);
    }
    return SupabaseService.instance;
  }

  /**
   * Subscribe to real-time clipboard changes for a specific pair ID
   */
  public subscribeToClipboard(
    pairId: string, 
    callback: (item: ClipboardItem) => void
  ): { unsubscribe: () => void } {
    const channel = this.supabase
      .channel(`clipboard:${pairId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clipboard_items',
          filter: `pair_id=eq.${pairId}`
        },
        (payload) => {
          callback(payload.new as ClipboardItem);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        channel.unsubscribe();
      }
    };
  }

  /**
   * Add a new clipboard item
   */
  public async addClipboardItem(item: Omit<ClipboardItem, 'id' | 'created_at'>): Promise<ClipboardItem | null> {
    const { data, error } = await this.supabase
      .from('clipboard_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Error adding clipboard item:', error);
      return null;
    }

    return data as ClipboardItem;
  }

  /**
   * Fetch clipboard history for a pair
   */
  public async getClipboardHistory(
    pairId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ClipboardItem[]> {
    const { data, error } = await this.supabase
      .from('clipboard_items')
      .select('*')
      .eq('pair_id', pairId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching clipboard history:', error);
      return [];
    }

    return data as ClipboardItem[];
  }
}
