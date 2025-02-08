// /components/tools/TranslationTool.tsx
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Wave } from "@foobar404/wave";
import { toast } from "sonner";

interface TranslationToolProps {
  toolInvocation: any;
  result: any;
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function generateSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = "alloy") {

  const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb' // This is the ID for the "George" voice. Replace with your preferred voice ID.
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`
  const method = 'POST'

  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not defined');
  }

  const headers = {
    Accept: 'audio/mpeg',
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json',
  }

  const data = {
    text,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  }

  const body = JSON.stringify(data)

  const input = {
    method,
    headers,
    body,
  }

  const response = await fetch(url, input)

  const arrayBuffer = await response.arrayBuffer();

  const base64Audio = Buffer.from(arrayBuffer).toString('base64');

  return {
    audio: `data:audio/mp3;base64,${base64Audio}`,
  };
}


const TranslationTool: React.FC<TranslationToolProps> = ({ toolInvocation, result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveRef = useRef<Wave | null>(null);

  useEffect(() => {
    const _audioRef = audioRef.current;
    return () => {
      if (_audioRef) {
        _audioRef.pause();
        _audioRef.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (audioUrl && audioRef.current && canvasRef.current) {
      waveRef.current = new Wave(audioRef.current, canvasRef.current);
      waveRef.current.addAnimation(
        new waveRef.current.animations.Lines({
          lineColor: "rgb(203, 113, 93)",
          lineWidth: 2,
          mirroredY: true,
          count: 100,
        })
      );
    }
  }, [audioUrl]);

  const handlePlayPause = async () => {
    if (!audioUrl && !isGeneratingAudio) {
      setIsGeneratingAudio(true);
      try {
        // Assurez-vous d'importer et d'appeler generateSpeech correctement
        const { audio } = await generateSpeech(result.translatedText, "alloy");
        setAudioUrl(audio);
        setIsGeneratingAudio(false);
      } catch (error) {
        console.error("Error generating speech:", error);
        setIsGeneratingAudio(false);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (!result) {
    return (
      <Card className="w-full my-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
        <CardContent className="flex items-center justify-center h-24">
          <p>Generating translation...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full my-4 shadow-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="w-full h-24 bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden">
            <canvas ref={canvasRef} width="800" height="200" className="w-full h-full" />
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Button
              onClick={handlePlayPause}
              disabled={isGeneratingAudio}
              variant="outline"
              size="sm"
              className="w-24"
            >
              {isGeneratingAudio ? (
                "Generating..."
              ) : isPlaying ? (
                <>
                  <Pause className="mr-1 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-1 h-4 w-4" /> Play
                </>
              )}
            </Button>
            <div className="text-sm text-neutral-800 dark:text-neutral-200">
              The phrase{" "}
              <span className="font-semibold">{toolInvocation.args.text}</span> translates
              from <span className="font-semibold">{result.detectedLanguage}</span> to{" "}
              <span className="font-semibold">{toolInvocation.args.to}</span> as{" "}
              <span className="font-semibold">{result.translatedText}</span>.
            </div>
          </div>
        </div>
      </CardContent>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            handleReset();
          }}
        />
      )}
    </Card>
  );
};

export default TranslationTool;
