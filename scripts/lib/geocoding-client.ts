/**
 * Google Geocoding API client
 *
 * Converts area name to latitude/longitude
 */

import { Client } from '@googlemaps/google-maps-services-js';
import { Logger } from './logger';

export interface AreaCoordinates {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export class GeocodingClient {
  private client: Client;
  private apiKey: string;
  private logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.client = new Client({});
    this.apiKey = apiKey;
    this.logger = logger;
  }

  /**
   * Get coordinates from area name
   */
  async getCoordinates(areaName: string): Promise<AreaCoordinates | null> {
    try {
      this.logger.info(`Geocoding area: ${areaName}`);

      const response = await this.client.geocode({
        params: {
          address: areaName,
          key: this.apiKey,
          language: 'ja',
        },
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        this.logger.error(`Geocoding failed for: ${areaName}`, {
          status: response.data.status,
        });
        return null;
      }

      const result = response.data.results[0];
      const location = result.geometry.location;

      const coordinates: AreaCoordinates = {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
      };

      this.logger.success(`Geocoded: ${areaName} → ${coordinates.formattedAddress}`, {
        lat: coordinates.lat,
        lng: coordinates.lng,
      });

      return coordinates;
    } catch (error: any) {
      this.logger.error(`Geocoding API error: ${error.message}`);
      return null;
    }
  }
}
