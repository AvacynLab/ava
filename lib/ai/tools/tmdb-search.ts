import { tool } from 'ai';
import { z } from 'zod';

export const tmdb_search = ({ dataStream }: { dataStream: any }) => tool({
  description: 'Search for a movie or TV show using TMDB API',
  parameters: z.object({
    query: z.string().describe('The search query for movies/TV shows'),
  }),
  execute: async ({ query }: { query: string }) => {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

    try {
      const searchResponse = await fetch(
        `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=true&language=en-US&page=1`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            accept: 'application/json',
          },
        },
      );
      const searchResults = await searchResponse.json();
      const firstResult = searchResults.results.find(
        (result: any) => result.media_type === 'movie' || result.media_type === 'tv',
      );
      if (!firstResult) {
        return { result: null };
      }
      const detailsResponse = await fetch(
        `${TMDB_BASE_URL}/${firstResult.media_type}/${firstResult.id}?language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            accept: 'application/json',
          },
        },
      );
      const details = await detailsResponse.json();
      const creditsResponse = await fetch(
        `${TMDB_BASE_URL}/${firstResult.media_type}/${firstResult.id}/credits?language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            accept: 'application/json',
          },
        },
      );
      const credits = await creditsResponse.json();
      const resultData = {
        ...details,
        media_type: firstResult.media_type,
        credits: {
          cast:
            credits.cast?.slice(0, 5).map((person: any) => ({
              ...person,
              profile_path: person.profile_path
                ? `https://image.tmdb.org/t/p/original${person.profile_path}`
                : null,
            })) || [],
          director: credits.crew?.find((person: any) => person.job === 'Director')?.name,
          writer: credits.crew?.find(
            (person: any) => person.job === 'Screenplay' || person.job === 'Writer',
          )?.name,
        },
        poster_path: details.poster_path
          ? `https://image.tmdb.org/t/p/original${details.poster_path}`
          : null,
        backdrop_path: details.backdrop_path
          ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
          : null,
      };
      return { result: resultData };
    } catch (error) {
      console.error('TMDB search error:', error);
      throw error;
    }
  },
});
