import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

export const academic_search = ({ dataStream }: { dataStream: any }) => tool({
  description: 'Search academic papers and research.',
  parameters: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      const exa = new Exa(process.env.EXA_API_KEY as string);
      const result = await exa.searchAndContents(query, {
        type: 'auto',
        numResults: 20,
        category: 'research paper',
        summary: {
          query: 'Abstract of the Paper',
        },
      });
      const processedResults = result.results.reduce((acc: any[], paper: any) => {
        // Éliminer les doublons et ignorer les résultats sans résumé
        if (acc.some((p) => p.url === paper.url) || !paper.summary) return acc;
        // Nettoyer le résumé et le titre
        const cleanSummary = paper.summary.replace(/^Summary:\s*/i, '');
        const cleanTitle = paper.title?.replace(/\s\[.*?\]$/, '');
        acc.push({
          ...paper,
          title: cleanTitle || '',
          summary: cleanSummary,
        });
        return acc;
      }, []);
      // Limiter aux 10 premiers résultats uniques
      const limitedResults = processedResults.slice(0, 10);
      return { results: limitedResults };
    } catch (error) {
      console.error('Academic search error:', error);
      throw error;
    }
  },
});
