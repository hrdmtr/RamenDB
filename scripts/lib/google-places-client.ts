/**
 * Google Places API client
 *
 * Search for restaurants and get details
 */

import { Client, PlaceData } from '@googlemaps/google-maps-services-js';
import { Logger } from './logger';

export interface RestaurantData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  website?: string;
  googleMapsUrl?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
}

export class GooglePlacesClient {
  private client: Client;
  private apiKey: string;
  private logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.client = new Client({});
    this.apiKey = apiKey;
    this.logger = logger;
  }

  /**
   * Search for restaurants near a location (with pagination support)
   */
  async searchNearby(
    lat: number,
    lng: number,
    query: string,
    radius: number = 5000
  ): Promise<PlaceData[]> {
    try {
      this.logger.info(`Searching for: "${query}" near (${lat}, ${lng}), radius: ${radius}m`);

      let allResults: PlaceData[] = [];
      let nextPageToken: string | undefined = undefined;
      let pageCount = 0;
      const maxPages = 3; // Google Places API supports up to 3 pages (60 results total)

      do {
        // Wait before fetching next page (required by Google Places API)
        if (nextPageToken) {
          this.logger.info(`Waiting 2 seconds before fetching next page...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const response = await this.client.textSearch({
          params: {
            query: query,
            location: { lat, lng },
            radius: radius,
            key: this.apiKey,
            language: 'ja',
            pagetoken: nextPageToken,
          },
        });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
          this.logger.error(`Places API search failed`, {
            status: response.data.status,
          });
          break;
        }

        const results = response.data.results || [];
        allResults = allResults.concat(results);
        pageCount++;

        this.logger.success(`Page ${pageCount}: Found ${results.length} restaurants (Total: ${allResults.length})`);

        nextPageToken = response.data.next_page_token;

        // Continue if there's a next page token and we haven't reached max pages
      } while (nextPageToken && pageCount < maxPages);

      this.logger.success(`Search complete: ${allResults.length} restaurants found across ${pageCount} page(s)`);

      return allResults;
    } catch (error: any) {
      this.logger.error(`Places API search error: ${error.message}`);
      return [];
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId: string): Promise<RestaurantData | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          language: 'ja',
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'formatted_phone_number',
            'website',
            'url',
            'photos',
            'rating',
            'user_ratings_total',
            'opening_hours',
          ],
        },
      });

      if (response.data.status !== 'OK' || !response.data.result) {
        this.logger.warning(`Place details not found for: ${placeId}`);
        return null;
      }

      const place = response.data.result;

      // Get photo URL if available
      let imageUrl: string | undefined;
      if (place.photos && place.photos.length > 0) {
        const photoReference = place.photos[0].photo_reference;
        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${this.apiKey}`;
      }

      // Format opening hours
      let openingHours: string | undefined;
      if (place.opening_hours?.weekday_text) {
        openingHours = place.opening_hours.weekday_text.join('\n');
      }

      const restaurantData: RestaurantData = {
        name: place.name || '',
        address: place.formatted_address || '',
        latitude: place.geometry?.location?.lat || 0,
        longitude: place.geometry?.location?.lng || 0,
        phoneNumber: place.formatted_phone_number,
        website: place.website,
        googleMapsUrl: place.url,
        imageUrl: imageUrl,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        openingHours: openingHours,
      };

      return restaurantData;
    } catch (error: any) {
      this.logger.error(`Place details API error: ${error.message}`, { placeId });
      return null;
    }
  }

  /**
   * Retry wrapper for API calls
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (attempt === maxRetries) {
          this.logger.error(`Operation failed after ${maxRetries} attempts: ${error.message}`);
          return null;
        }

        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        this.logger.warning(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return null;
  }
}
