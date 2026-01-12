
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { abroadChat } from '@/ai/flows/abroad-chatbot';
import { useAppContext } from '@/context/app-context';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function AbroadPage() {
  const { assessmentData, psychometricResults } = useAppContext();
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
    // Initial message from the bot
    if (messages.length === 0) {
      setIsLoading(true);
      const initialHistory = "AI: Hello! I'm here to help you with your dream of going abroad. Based on your profile, are you looking for advice on finding a **college** or a **job**?";
      const initialMessage = "Hello! I'm here to help you with your dream of going abroad. Based on your profile, are you looking for advice on finding a **college** or a **job**?";

      const plainHistory = "AI: Hello! I'm here to help you with your dream of going abroad. Are you looking for advice on finding a **college** or a **job**?";
      const plainMessage = "Hello! I'm here to help you with your dream of going abroad. Are you looking for advice on finding a **college** or a **job**?";

      const hasProfile = assessmentData?.resumeText || psychometricResults;

      setMessages([
        { sender: 'bot', text: hasProfile ? initialMessage : plainMessage }
      ]);
      setIsLoading(false);
    }
  }, [assessmentData, psychometricResults, messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
        const history = newMessages.map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
        
        const response = await abroadChat({ 
          message: inputValue, 
          history: history,
          resumeSummary: assessmentData?.resumeText ? 'Available' : undefined,
          assessmentSummary: psychometricResults ? 'Available' : undefined,
        });

        const botMessage: Message = { sender: 'bot', text: response.response };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Abroad chatbot error:', error);
      const errorMessage: Message = { sender: 'bot', text: "Sorry, I'm having a little trouble right now. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[85vh] shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Abroad Career & Education Advisor</CardTitle>
        <CardDescription>Get personalized advice for your international journey.</CardDescription>
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
            placeholder="Type your message..."
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
