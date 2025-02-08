import { tool } from 'ai';
import { z } from 'zod';

export const nearby_search = ({ dataStream }: { dataStream: any }) => tool({
  description: 'Search for nearby places, such as restaurants or hotels based on the details given.',
  parameters: z.object({
    location: z.string().describe('The location name given by user.'),
    latitude: z.number().describe('The latitude of the location.'),
    longitude: z.number().describe('The longitude of the location.'),
    type: z.string().describe('The type of place to search for (restaurants, hotels, attractions, geos).'),
    radius: z.number().default(6000).describe('The radius in meters (max 50000, default 6000).'),
  }),
  execute: async ({ location, latitude, longitude, type, radius }: { latitude: number; longitude: number; location: string; type: string; radius: number; }) => {
    const apiKey = process.env.TRIPADVISOR_API_KEY;
    let finalLat = latitude;
    let finalLng = longitude;
    try {
      const geocodingData = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      );
      const geocoding = await geocodingData.json();
      if (geocoding.results?.[0]?.geometry?.location) {
        let trimmedLat = geocoding.results[0].geometry.location.lat.toString().split('.');
        finalLat = parseFloat(trimmedLat[0] + '.' + trimmedLat[1].slice(0, 6));
        let trimmedLng = geocoding.results[0].geometry.location.lng.toString().split('.');
        finalLng = parseFloat(trimmedLng[0] + '.' + trimmedLng[1].slice(0, 6));
        console.log('Using geocoded coordinates:', finalLat, finalLng);
      } else {
        console.log('Using provided coordinates:', finalLat, finalLng);
      }
      const nearbyResponse = await fetch(
        `https://api.content.tripadvisor.com/api/v1/location/nearby_search?latLong=${finalLat},${finalLng}&category=${type}&radius=${radius}&language=en&key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            origin: 'http://dev.avacyn.fr',
            referer: 'http://dev.avacyn.fr',
          },
        },
      );
      if (!nearbyResponse.ok) {
        throw new Error(`Nearby search failed: ${nearbyResponse.status}`);
      }
      const nearbyData = await nearbyResponse.json();
      if (!nearbyData.data || nearbyData.data.length === 0) {
        console.log('No nearby places found');
        return { results: [], center: { lat: finalLat, lng: finalLng } };
      }
      const detailedPlaces = await Promise.all(
        nearbyData.data.map(async (place: any) => {
          try {
            if (!place.location_id) {
              console.log(`Skipping place "${place.name}": No location_id`);
              return null;
            }
            const detailsResponse = await fetch(
              `https://api.content.tripadvisor.com/api/v1/location/${place.location_id}/details?language=en&currency=USD&key=${apiKey}`,
              {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  origin: 'http://dev.avacyn.fr',
                  referer: 'http://dev.avacyn.fr',
                },
              },
            );
            if (!detailsResponse.ok) {
              console.log(`Failed to fetch details for "${place.name}"`);
              return null;
            }
            const details = await detailsResponse.json();
            console.log(`Place details for "${place.name}":`, details);
            let photos = [];
            try {
              const photosResponse = await fetch(
                `https://api.content.tripadvisor.com/api/v1/location/${place.location_id}/photos?language=en&key=${apiKey}`,
                {
                  method: 'GET',
                  headers: {
                    Accept: 'application/json',
                    origin: 'http://dev.avacyn.fr',
                    referer: 'http://dev.avacyn.fr',
                  },
                },
              );
              if (photosResponse.ok) {
                const photosData = await photosResponse.json();
                photos =
                  photosData.data
                    ?.map((photo: any) => ({
                      thumbnail: photo.images?.thumbnail?.url,
                      small: photo.images?.small?.url,
                      medium: photo.images?.medium?.url,
                      large: photo.images?.large?.url,
                      original: photo.images?.original?.url,
                      caption: photo.caption,
                    }))
                    .filter((photo: any) => photo.medium) || [];
              }
            } catch (error) {
              console.log(`Photo fetch failed for "${place.name}":`, error);
            }
            const tzResponse = await fetch(
              `https://maps.googleapis.com/maps/api/timezone/json?location=${details.latitude},${details.longitude}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
            );
            const tzData = await tzResponse.json();
            const timezone = tzData.timeZoneId || 'UTC';
            const localTime = new Date(
              new Date().toLocaleString('en-US', {
                timeZone: timezone,
              }),
            );
            const currentDay = localTime.getDay();
            const currentHour = localTime.getHours();
            const currentMinute = localTime.getMinutes();
            const currentTime = currentHour * 100 + currentMinute;
            let is_closed = true;
            let next_open_close = null;
            let next_day = currentDay;
            if (details.hours?.periods) {
              const sortedPeriods = [...details.hours.periods].sort((a, b) => {
                if (a.open.day !== b.open.day) return a.open.day - b.open.day;
                return parseInt(a.open.time) - parseInt(b.open.time);
              });
              for (let i = 0; i < sortedPeriods.length; i++) {
                const period = sortedPeriods[i];
                const openTime = parseInt(period.open.time);
                const closeTime = period.close ? parseInt(period.close.time) : 2359;
                const periodDay = period.open.day;
                if (closeTime < openTime) {
                  if (currentDay === periodDay && currentTime < closeTime) {
                    is_closed = false;
                    next_open_close = period.close.time;
                    break;
                  }
                  if (currentDay === periodDay && currentTime >= openTime) {
                    is_closed = false;
                    next_open_close = period.close.time;
                    next_day = (periodDay + 1) % 7;
                    break;
                  }
                } else {
                  if (currentDay === periodDay && currentTime >= openTime && currentTime < closeTime) {
                    is_closed = false;
                    next_open_close = period.close.time;
                    break;
                  }
                }
                if (is_closed) {
                  if (periodDay > currentDay || (periodDay === currentDay && openTime > currentTime)) {
                    next_open_close = period.open.time;
                    next_day = periodDay;
                    break;
                  }
                }
              }
            }
            return {
              name: place.name || 'Unnamed Place',
              location: {
                lat: parseFloat(details.latitude || place.latitude || finalLat),
                lng: parseFloat(details.longitude || place.longitude || finalLng),
              },
              timezone,
              place_id: place.location_id,
              vicinity: place.address_obj?.address_string || '',
              distance: parseFloat(place.distance || '0'),
              bearing: place.bearing || '',
              type: type,
              rating: parseFloat(details.rating || '0'),
              price_level: details.price_level || '',
              cuisine: details.cuisine?.[0]?.name || '',
              description: details.description || '',
              phone: details.phone || '',
              website: details.website || '',
              reviews_count: parseInt(details.num_reviews || '0'),
              is_closed,
              hours: details.hours?.weekday_text || [],
              next_open_close,
              next_day,
              periods: details.hours?.periods || [],
              photos,
              source: details.source?.name || 'TripAdvisor',
            };
          } catch (error) {
            console.log(`Failed to process place "${place.name}":`, error);
            return null;
          }
        }),
      );
      const validPlaces = detailedPlaces
        .filter((place) => place !== null)
        .sort((a, b) => (a?.distance || 0) - (b?.distance || 0));
      return { results: validPlaces, center: { lat: finalLat, lng: finalLng } };
    } catch (error) {
      console.error('Nearby search error:', error);
      throw error;
    }
  },
});
