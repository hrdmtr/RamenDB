/**
 * Database uploader for restaurant data
 *
 * Handles insertion and updates with duplicate checking
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from './logger';
import { RestaurantData } from './google-places-client';

export interface UploadResult {
  success: boolean;
  isNew: boolean;
  restaurantId?: string;
  error?: string;
}

export class DatabaseUploader {
  private supabase: SupabaseClient;
  private logger: Logger;

  constructor(supabaseUrl: string, supabaseKey: string, logger: Logger) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger = logger;
  }

  /**
   * Upload restaurant data to database
   * Checks for duplicates and updates if exists
   */
  async uploadRestaurant(data: RestaurantData): Promise<UploadResult> {
    try {
      // Check for duplicate (same name and address)
      const { data: existing, error: searchError } = await this.supabase
        .from('restaurants')
        .select('id, name, address')
        .eq('name', data.name)
        .eq('address', data.address)
        .maybeSingle();

      if (searchError) {
        this.logger.error(`Database search error: ${searchError.message}`, { name: data.name });
        return {
          success: false,
          isNew: false,
          error: searchError.message,
        };
      }

      if (existing) {
        // Update existing restaurant
        const { data: updated, error: updateError } = await this.supabase
          .from('restaurants')
          .update({
            latitude: data.latitude,
            longitude: data.longitude,
            phone_number: data.phoneNumber || null,
            website: data.website || null,
            // Note: We're not updating image_url for now as it doesn't exist in current schema
            // TODO: Add google_maps_url and image_url columns to schema
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          this.logger.error(`Database update error: ${updateError.message}`, { name: data.name });
          return {
            success: false,
            isNew: false,
            error: updateError.message,
          };
        }

        this.logger.warning(`Updated existing restaurant: ${data.name}`, {
          id: existing.id,
          address: data.address,
        });

        return {
          success: true,
          isNew: false,
          restaurantId: existing.id,
        };
      } else {
        // Insert new restaurant
        const { data: inserted, error: insertError } = await this.supabase
          .from('restaurants')
          .insert({
            name: data.name,
            name_kana: null, // Will be empty for now
            address: data.address,
            nearest_station: null, // Will be empty for now
            railway: null, // Will be empty for now
            latitude: data.latitude,
            longitude: data.longitude,
            phone_number: data.phoneNumber || null,
            website: data.website || null,
            // TODO: Add google_maps_url and image_url when schema is updated
            average_score: 0,
            review_count: 0,
          })
          .select()
          .single();

        if (insertError) {
          this.logger.error(`Database insert error: ${insertError.message}`, { name: data.name });
          return {
            success: false,
            isNew: true,
            error: insertError.message,
          };
        }

        this.logger.success(`Inserted new restaurant: ${data.name}`, {
          id: inserted.id,
          address: data.address,
        });

        return {
          success: true,
          isNew: true,
          restaurantId: inserted.id,
        };
      }
    } catch (error: any) {
      this.logger.error(`Upload error: ${error.message}`, { name: data.name });
      return {
        success: false,
        isNew: false,
        error: error.message,
      };
    }
  }

  /**
   * Batch upload restaurants
   */
  async uploadBatch(restaurants: RestaurantData[]): Promise<{
    newCount: number;
    updateCount: number;
    errorCount: number;
  }> {
    let newCount = 0;
    let updateCount = 0;
    let errorCount = 0;

    for (const restaurant of restaurants) {
      const result = await this.uploadRestaurant(restaurant);

      if (result.success) {
        if (result.isNew) {
          newCount++;
        } else {
          updateCount++;
        }
      } else {
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { newCount, updateCount, errorCount };
  }
}
