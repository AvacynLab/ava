import { tool } from 'ai';
import { z } from 'zod';

export const track_flight = ({ dataStream }: { dataStream: any }) => tool({
  description: 'Track flight information and status',
  parameters: z.object({
    flight_number: z.string().describe('The flight number to track'),
  }),
  execute: async ({ flight_number }: { flight_number: string }) => {
    try {
      const response = await fetch(
        `https://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATION_STACK_API_KEY}&flight_iata=${flight_number}`,
      );
      return await response.json();
    } catch (error) {
      console.error('Flight tracking error:', error);
      throw error;
    }
  },
});
