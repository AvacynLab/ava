import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

export const x_search = ({ dataStream }: { dataStream: any }) => tool({
  description: 'Search X (formerly Twitter) posts.',
  parameters: z.object({
    query: z.string().describe('The search query'),
    startDate: z.string().optional().describe('The start date for the search in YYYY-MM-DD format'),
    endDate: z.string().optional().describe('The end date for the search in YYYY-MM-DD format'),
  }),
  execute: async ({ query, startDate, endDate }: { query: string; startDate?: string; endDate?: string; }) => {
    try {
      const exa = new Exa(process.env.EXA_API_KEY as string);
      const start = startDate
        ? new Date(startDate).toISOString()
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate ? new Date(endDate).toISOString() : new Date().toISOString();

      const result = await exa.searchAndContents(query, {
        type: 'keyword',
        numResults: 10,
        text: true,
        highlights: true,
        includeDomains: ['twitter.com', 'x.com'],
      });

      const extractTweetId = (url: string): string | null => {
        const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
        return match ? match[1] : null;
      };

      const processedResults = result.results.reduce<Array<any>>((acc, post) => {
        const tweetId = extractTweetId(post.url);
        if (tweetId) {
          acc.push({ ...post, tweetId, title: post.title || '' });
        }
        return acc;
      }, []);

      return processedResults;
    } catch (error) {
      console.error('X search error:', error);
      throw error;
    }
  },
});
