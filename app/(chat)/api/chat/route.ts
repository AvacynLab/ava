import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { web_search } from '@/lib/ai/tools/web-search';
import { x_search } from '@/lib/ai/tools/x-search';
import { tmdb_search } from '@/lib/ai/tools/tmdb-search';
import { trending_movies } from '@/lib/ai/tools/trending-movies';
import { trending_tv } from '@/lib/ai/tools/trending-tv';
import { academic_search } from '@/lib/ai/tools/academic-search';
import { youtube_search } from '@/lib/ai/tools/youtube-search';
import { scrape_web } from '@/lib/ai/tools/scrape-web';
import { find_place } from '@/lib/ai/tools/find-place';
import { text_search } from '@/lib/ai/tools/text-search';
import { nearby_search } from '@/lib/ai/tools/nearby-search';
import { track_flight } from '@/lib/ai/tools/track-flight';

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ selectedChatModel }),
        messages,
        maxSteps: 5,
        experimental_activeTools: [
                'getWeather',
                'createDocument',
                'updateDocument',
                'requestSuggestions',
                'web_search', //Vérifié
                'x_search', //Vérifié
                'tmdb_search', //Vérifié
                'trending_movies', //Vérifié
                'trending_tv', //Vérifié
                'academic_search', //Vérifié
                'youtube_search', //Vérifié
                'scrape_web', //Vérifié
                'find_place', //Vérifié
                'text_search', //Vérifié
                'nearby_search', //Vérifié
                'track_flight', //Vérifié
              ],
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        
        tools: {
          getWeather,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({
            session,
            dataStream,
          }),
          web_search: web_search({ dataStream }),
          x_search: x_search({ dataStream }),
          tmdb_search: tmdb_search({ dataStream }),
          trending_movies: trending_movies({ dataStream }),
          trending_tv: trending_tv({ dataStream }),
          academic_search: academic_search({ dataStream }),
          youtube_search: youtube_search({ dataStream }),
          scrape_web: scrape_web({ dataStream }),
          find_place: find_place({ dataStream }),
          text_search: text_search({ dataStream }),
          nearby_search: nearby_search({ dataStream }),
          track_flight: track_flight({ dataStream }),
        },
        onFinish: async ({ response, reasoning }) => {
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });

              await saveMessages({
                messages: sanitizedResponseMessages.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  };
                }),
              });
            } catch (error) {
              console.error('Failed to save chat');
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return 'Oops, an error occured!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
