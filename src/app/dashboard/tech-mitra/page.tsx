
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { techMitraChat } from '@/ai/flows/tech-mitra-chatbot';
import { useAppContext } from '@/context/app-context';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function TechMitraPage() {
  const { recommendations, psychometricResults, assessmentData } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { sender: 'bot', text: "Hello! I am TechMitra, your AI mentor for technical skills and career growth. How can I help you today?" }
      ]);
    }
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
        const response = await techMitraChat({ 
          message: inputValue, 
          persona: 'tech-mitra',
          careerPaths: recommendations?.careerPaths?.join(', ') || 'Not available',
          skillGaps: recommendations?.skillGaps?.join(', ') || (psychometricResults?.careerAdvisory) || 'Not available',
          learningRoadmap: recommendations?.learningRoadmap || 'Not available',
          resumeSummary: assessmentData?.resumeText ? 'Available' : 'Not provided',
          assessmentSummary: psychometricResults ? 'Available' : 'Not provided'
        });

        const botMessage: Message = { sender: 'bot', text: response.response };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('TechMitra chatbot error:', error);
      const errorMessage: Message = { sender: 'bot', text: "Sorry, I'm having a little trouble right now. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[85vh] shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg">TechMitra - Your AI Mentor</CardTitle>
        <CardDescription>Get personalized guidance on technical skills, learning paths, and career growth.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.sender === 'bot' && (
              <div className="p-2 bg-muted rounded-full">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none"
               components={{
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />,
                    strong: ({node, ...props}) => <strong {...props} className="font-bold text-primary" />
                }}
              >{message.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-full">
              <Bot className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="bg-muted text-muted-foreground rounded-xl px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="e.g., How do I learn Python?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
