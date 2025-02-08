import { tool } from 'ai';
import { z } from 'zod';

export const find_place = ({ dataStream }: { dataStream: any }) =>
  tool({
    description:
      'Find a place using Google Maps API for forward geocoding and Mapbox for reverse geocoding.',
    parameters: z.object({
      query: z.string().describe('The search query for forward geocoding'),
      coordinates: z
        .array(z.number())
        .describe('Array of [latitude, longitude] for reverse geocoding'),
    }),
    execute: async ({
      query,
      coordinates,
    }: {
      query: string;
      coordinates: number[];
    }) => {
      try {
        const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

        // Forward geocoding (Google)
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            query,
          )}&key=${googleApiKey}`,
        );
        const googleData = await googleResponse.json();

        // Reverse geocoding (Mapbox)
        const [lat, lng] = coordinates;
        const mapboxResponse = await fetch(
          `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${mapboxToken}`,
        );
        const mapboxData = await mapboxResponse.json();

        const features = [];
        // Google
        if (googleData.status === 'OK' && googleData.results.length > 0) {
          features.push(
            ...googleData.results.map((result: any) => ({
              id: result.place_id,
              name: result.formatted_address.split(',')[0],
              formatted_address: result.formatted_address,
              geometry: {
                type: 'Point',
                coordinates: [
                  result.geometry.location.lng,
                  result.geometry.location.lat,
                ],
              },
              feature_type: result.types[0],
              address_components: result.address_components,
              viewport: result.geometry.viewport,
              place_id: result.place_id,
              source: 'google',
            })),
          );
        }

        // Mapbox
        if (mapboxData.features && mapboxData.features.length > 0) {
          features.push(
            ...mapboxData.features.map((feature: any) => ({
              id: feature.id,
              name:
                feature.properties.name_preferred || feature.properties.name,
              formatted_address: feature.properties.full_address,
              geometry: feature.geometry,
              feature_type: feature.properties.feature_type,
              context: feature.properties.context,
              coordinates: feature.properties.coordinates,
              bbox: feature.properties.bbox,
              source: 'mapbox',
            })),
          );
        }

        return {
          features,
          google_attribution: 'Powered by Google Maps Platform',
          mapbox_attribution: 'Powered by Mapbox',
        };
      } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
      }
    },
  });
