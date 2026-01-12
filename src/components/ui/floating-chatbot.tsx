
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, MessageSquare, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chat } from '@/ai/flows/chatbot';
import type { ChatInput } from '@/ai/schemas/chatbot-schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const personaConfig = {
    'navigator': {
        title: 'Website Navigator',
        description: 'Your guide for navigating the site.',
        initialMessage: "Hello! I am your AI Website Navigator. How can I help you find what you need?",
        placeholder: "e.g., Where can I find jobs?"
    },
}

export const FloatingChatbot = ({ context }: { context: Omit<ChatInput, 'message' | 'persona'> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
            { sender: 'bot', text: personaConfig.navigator.initialMessage }
        ]);
    }
  }, [isOpen, messages.length]);

  // Close chatbox when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatboxRef.current && !chatboxRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-fab="true"]')) {
            setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [chatboxRef]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { sender: 'user' as const, text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chat({ ...context, message: inputValue, persona: 'navigator' });
      const botMessage = { sender: 'bot' as const, text: response.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      let errorMessageText = "Sorry, I'm having a little trouble right now. Please try again later.";
      if (error.message && error.message.includes('blocked')) {
        errorMessageText = "I cannot respond to this question as it may violate my safety policies.";
      }
      const errorMessage = { sender: 'bot' as const, text: errorMessageText };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={chatboxRef}>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="mb-2 w-[400px] h-[60vh] origin-bottom-right"
                >
                    <Card className="flex flex-col h-full shadow-xl border-primary/20 bg-card">
                        <CardHeader className="flex flex-row items-start justify-between bg-muted/50">
                            <div className="space-y-1">
                                <CardTitle className="font-headline text-lg flex items-center gap-2"><Bot className="text-primary"/>{personaConfig.navigator.title}</CardTitle>
                                <CardDescription>{personaConfig.navigator.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
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
                                    ? 'accent-gradient text-white'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none"
                                components={{
                                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />
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
                            placeholder={personaConfig.navigator.placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                            autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="accent-gradient">
                            <Send className="h-4 w-4" />
                            </Button>
                        </form>
                        </CardFooter>
                    </Card>
              </motion.div>
            )}
        </AnimatePresence>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                            size="lg"
                            className="rounded-full w-16 h-16 shadow-lg accent-gradient flex items-center justify-center"
                            onClick={() => setIsOpen(!isOpen)}
                            data-fab="true"
                        >
                            <AnimatePresence mode="wait">
                            <motion.div
                                key={isOpen ? 'x' : 'bot'}
                                initial={{ opacity: 0, rotate: -30, y: 5 }}
                                animate={{ opacity: 1, rotate: 0, y: 0 }}
                                exit={{ opacity: 0, rotate: 30, y: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                            </motion.div>
                            </AnimatePresence>
                            <span className="sr-only">Toggle Chat</span>
                        </Button>
                    </motion.div>
                </TooltipTrigger>
                 <TooltipContent side="left" className="ml-2">
                    <p>Help & Navigation</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
};
