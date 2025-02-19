
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
}

export function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate message for now
    const newMessage: Message = {
      id: Date.now().toString(),
      text: "This is a test message",
      isUser: true
    };
    setMessages(prev => [...prev, newMessage]);
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "This is an AI response",
        isUser: false,
        audioUrl: "#"
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-md bg-white/50 p-6 rounded-2xl shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Voice Chat</h1>
              <p className="text-gray-600">Speak with AI using your voice</p>
            </div>

            <div className="h-[400px] overflow-y-auto space-y-4 p-4 rounded-lg bg-white/30 backdrop-blur-sm">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "message-container p-4 rounded-2xl max-w-[80%]",
                    message.isUser ? "ml-auto bg-primary/10" : "bg-secondary/10"
                  )}
                >
                  <p className="text-gray-800">{message.text}</p>
                  {!message.isUser && message.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Play Response
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className={cn(
                  "rounded-full p-6",
                  isRecording && "recording-animation"
                )}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <StopCircle className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
