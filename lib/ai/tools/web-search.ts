import { tool } from 'ai';
import { z } from 'zod';
import { tavily } from '@tavily/core';

// Notre outil web_search adapté pour diffuser l'état de chargement via dataStream
export const web_search = ({ dataStream }: { dataStream: any }) =>
  tool({
    description: 'Search the web for information with multiple queries, max results and search depth.',
    parameters: z.object({
      queries: z.array(z.string().describe('Array of search queries to look up on the web.')),
      maxResults: z.array(z.number().describe('Array of maximum number of results to return per query.')).default([10]),
      topics: z.array(z.enum(['general', 'news']).describe('Array of topic types to search for.')).default(['general']),
      searchDepth: z.array(z.enum(['basic', 'advanced']).describe('Array of search depths to use.')).default(['basic']),
      exclude_domains: z.array(z.string()).describe('A list of domains to exclude from all search results.').default([]),
    }),
    execute: async ({ queries, maxResults, topics, searchDepth, exclude_domains }) => {
      // Dès le début, on notifie le client que la recherche est lancée.
      if (dataStream) {
        dataStream.writeData({
          type: 'tool-loading',
          content: 'Running Web Search...',
        });
      }

      const apiKey = process.env.TAVILY_API_KEY;
      const tvly = tavily({ apiKey });
      const includeImageDescriptions = true;

      console.log('Queries:', queries);
      console.log('Max Results:', maxResults);
      console.log('Topics:', topics);
      console.log('Search Depths:', searchDepth);
      console.log('Exclude Domains:', exclude_domains);

      // Exécuter toutes les recherches en parallèle
      const searchPromises = queries.map(async (query, index) => {
        const data = await tvly.search(query, {
          topic: topics[index] || topics[0] || 'general',
          days: topics[index] === 'news' ? 7 : undefined,
          maxResults: maxResults[index] || maxResults[0] || 10,
          searchDepth: searchDepth[index] || searchDepth[0] || 'basic',
          includeAnswer: true,
          includeImages: true,
          includeImageDescriptions,
          excludeDomains: exclude_domains,
        });
        return {
          query,
          results: data.results.map((obj: any) => ({
            url: obj.url,
            title: obj.title,
            content: obj.content,
            raw_content: obj.raw_content,
            published_date: topics[index] === 'news' ? obj.published_date : undefined,
          })),
          images: includeImageDescriptions
            ? await Promise.all(
                data.images.map(
                  async ({ url, description }: { url: string; description?: string }) => {
                    const sanitizedUrl = url.replace(/\s+/g, '%20');
                    const isValid = await isValidImageUrl(sanitizedUrl);
                    return isValid
                      ? { url: sanitizedUrl, description: description ?? '' }
                      : null;
                  }
                )
              ).then((results) =>
                results.filter(
                  (image): image is { url: string; description: string } => image !== null
                )
              )
            : await Promise.all(
                data.images.map(async ({ url }: { url: string }) => {
                  const sanitizedUrl = url.replace(/\s+/g, '%20');
                  return (await isValidImageUrl(sanitizedUrl)) ? sanitizedUrl : null;
                })
              ).then((results) => results.filter((url): url is string => url !== null)),
        };
      });

      const searchResults = await Promise.all(searchPromises);

      // Signaler la fin du streaming
      if (dataStream) {
        dataStream.writeData({ type: 'finish', content: '' });
      }

      return { searches: searchResults };
    },
  });

// Fonction d’aide pour vérifier si une URL d’image est valide
async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return (
      response.ok &&
      (response.headers.get('content-type')?.startsWith('image/') ?? false)
    );
  } catch {
    return false;
  }
}
