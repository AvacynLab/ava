import { tool } from 'ai'
import { z } from 'zod'

/**
 * text_search
 * Migré vers Mapbox Search Box API (v6) => /search/searchbox/v1/forward
 * Renvoie un tableau de { name, location: { lat, lng }, vicinity?: string }.
 */
export const text_search = ({ dataStream }: { dataStream: any }) =>
  tool({
    description: 'Perform a text-based search using Mapbox Search Box API (Geocoding v6).',
    parameters: z.object({
      query: z.string().describe("The text to search (e.g. '123 main street')."),
      location: z
        .string()
        .describe("Optional lat,lng to center the search (e.g. '42.3675294,-71.186966').")
        .optional(),
      radius: z
        .number()
        .describe('Optional search radius in meters (max 50000).')
        .optional(),
    }),
    async execute({
      query,
      location,
      radius,
    }: {
      query: string
      location?: string
      radius?: number
    }) {
      const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN
      if (!mapboxToken) {
        throw new Error('Missing Mapbox token in MAPBOX_ACCESS_TOKEN')
      }

      try {
        // Base URL v6
        const baseUrl = 'https://api.mapbox.com/search/searchbox/v1/forward'
        const url = new URL(baseUrl)
        url.searchParams.set('access_token', mapboxToken)
        url.searchParams.set('q', query)
        // On peut monter "limit" jusqu'à 10 si besoin
        url.searchParams.set('limit', '5')
        // Types possibles: address, street, place, region, country, poi, etc.
        url.searchParams.set(
          'types',
          'country,region,place,locality,neighborhood,street,address,poi'
        )

        // Proximity => "lng,lat"
        if (location) {
          const [lat, lng] = location.split(',').map(Number)
          url.searchParams.set('proximity', `${lng},${lat}`)

          // Si radius => bounding box = [minLng,minLat,maxLng,maxLat]
          if (radius && radius > 0) {
            // 1° ~ 111_320 m
            const deg = radius / 111_320
            const minLat = lat - deg
            const maxLat = lat + deg
            const minLng = lng - deg
            const maxLng = lng + deg
            url.searchParams.set('bbox', `${minLng},${minLat},${maxLng},${maxLat}`)
          }
        }

        const response = await fetch(url.toString())
        if (!response.ok) {
          const errorBody = await response.text()
          throw new Error(`Mapbox v6 error: ${response.status} - ${errorBody}`)
        }
        const data = await response.json()

        // data.features est un array de "Feature"
        const features = data.features || []
        // On construit le tableau final { name, location, vicinity? }
        const results = features.map((feature: any) => {
          const coords = feature.geometry.coordinates // [lng, lat]
          const props = feature.properties || {}
          return {
            name: props.name,
            location: {
              lat: coords[1],
              lng: coords[0],
            },
            // "vicinity" pour la Map. On peut y mettre l'adresse
            vicinity: props.full_address || props.place_formatted || props.name,
          }
        })

        return { results }
      } catch (error) {
        console.error('text_search v6 error:', error)
        throw error
      }
    },
  })
