
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Play, Pause, MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  timestamp?: Date;
}

const BACKEND_URL = "http://localhost:3500"

const AI_CHARACTER = {
  name: "Luna",
  role: "AI Assistant",
  personality: "friendly and helpful",
  greeting: "Hi! I'm Luna, your AI companion. I'm here to chat and help you with anything you need. Feel free to speak to me!",
  responses: [
    "That's interesting! Tell me more about it.",
    "I understand what you mean. Here's what I think...",
    "I appreciate you sharing that with me.",
    "Let me help you with that.",
    "That's a great point you've made.",
  ]
};

export function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimText, setInterimText] = useState(''); // Add this state for showing live transcription
  const { toast } = useToast();

  // Add initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'greeting',
        text: AI_CHARACTER.greeting,
        isUser: false,
        timestamp: new Date(),
        audioUrl: '#'
      }]);
    }
  }, []);



  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          toast({
            title: `${AI_CHARACTER.name} is listening...`,
            description: "Start speaking now",
          });
          setInterimText(''); // Clear interim text when starting new recording
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Error",
            description: "Failed to start speech recognition. Please try again.",
            variant: "destructive",
          });
          setIsRecording(false);
          setInterimText(''); // Clear interim text on error
        };

        recognition.onend = () => {
          setIsRecording(false);
          setInterimText(''); // Clear interim text when recording ends
        };

        let finalTranscript = '';
        recognition.onresult = async (event) => {
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update the interim text for live display
          setInterimText(interimTranscript);

          if (finalTranscript) {
           
           const aiJawab = await getAiResponse(finalTranscript)
            // Add user message
            const newMessage: Message = {
              id: Date.now().toString(),
              text: finalTranscript.trim(),
              isUser: true,
              timestamp: new Date()
            };


            setMessages(prev => [...prev, newMessage]);

            // Generate AI response
            const randomResponse = AI_CHARACTER.responses[Math.floor(Math.random() * AI_CHARACTER.responses.length)];
            setTimeout(() => {
              const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: aiJawab.text,
                isUser: false,
                audioUrl: BACKEND_URL + '/'+aiJawab.audio,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, aiResponse]);
            }, 1000);

            finalTranscript = '';
            setInterimText(''); // Clear interim text after message is finalized
          }
        };

        setRecognition(recognition);
      } else {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const startRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    } else {
      toast({
        title: "Error",
        description: "Speech recognition is not available.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };


  async function getAiResponse(message){
    const res = await fetch(BACKEND_URL+'/messages' , {
      method  : "POST",
      headers : {
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({
        message
      })
    })

    const json = await res.json()

    console.log(json)

    return json
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = message.timestamp?.toLocaleDateString() || 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="hidden md:block border-r border-slate-200">
          <SidebarContent className="w-[240px] bg-white">
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Past Conversations</h2>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">{date}</h3>
                  {msgs.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedDate(msg.timestamp)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-sm"
                    >
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      <span className="truncate">{msg.text}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10" />
          <div className="relative p-4">
            <div className="max-w-4xl mx-auto">
              <Card className="backdrop-blur-md bg-white/70 p-6 rounded-2xl shadow-xl border-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <SidebarTrigger className="md:hidden">
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </SidebarTrigger>
                    <div className="text-center flex-1">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-transparent bg-clip-text mb-2">
                        Chat with {AI_CHARACTER.name}
                      </h1>
                      <p className="text-gray-600">Your {AI_CHARACTER.personality} AI companion</p>
                    </div>
                    <div className="w-10" /> {/* Spacer for alignment */}
                  </div>

                  <div className="h-[400px] overflow-y-auto space-y-4 p-4 rounded-lg bg-white/40 backdrop-blur-sm">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "message-container p-4 rounded-2xl max-w-[80%] transition-all",
                          message.isUser 
                            ? "ml-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20" 
                            : "bg-gradient-to-r from-orange-500/20 to-pink-500/20"
                        )}
                      >
                        <p className="text-gray-800">{message.text}</p>
                        {!message.isUser && message.audioUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 hover:bg-white/50"
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
                        <audio src={message.audioUrl} controls ></audio>
                      </div>
                    ))}
                    
                    {/* Show interim text while recording */}
                    {interimText && (
                      <div className="message-container p-4 rounded-2xl max-w-[80%] ml-auto bg-gradient-to-r from-purple-500/10 to-pink-500/10 transition-all">
                        <p className="text-gray-600 italic">{interimText}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {isRecording && (
                      <div className="text-sm text-gray-600 animate-pulse">
                        Speaking...
                      </div>
                    )}
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className={cn(
                        "rounded-full p-6 bg-gradient-to-r",
                        isRecording 
                          ? "from-red-500 to-red-600" 
                          : "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
                        "shadow-lg hover:shadow-xl transition-all duration-200"
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
        </div>
      </div>
    </SidebarProvider>
  );
}
