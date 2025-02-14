import { tool } from 'ai';
import { z } from 'zod';
import FirecrawlApp from '@mendable/firecrawl-js';

export const scrape_web = ({ dataStream }: { dataStream: any }) => tool({
  description: 'Retrieve the information from a URL using Firecrawl.',
  parameters: z.object({
    url: z.string().describe('The URL to retrieve the information from.'),
  }),
  execute: async ({ url }: { url: string }) => {
    const app = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY,
    });
    try {
      const content = await app.scrapeUrl(url);
      if (!content.success || !content.metadata) {
        return { error: 'Failed to retrieve content' };
      }
      return {
        results: [
          {
            title: content.metadata.title,
            content: content.markdown,
            url: content.metadata.sourceURL,
            description: content.metadata.description,
            language: content.metadata.language,
          },
        ],
      };
    } catch (error) {
      console.error('Firecrawl API error:', error);
      return { error: 'Failed to retrieve content' };
    }
  },
});
