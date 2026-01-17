
'use client';

import { useState, useRef, useEffect } from 'react';
import { runSymptomChecker } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Loader, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type SymptomCheckerProps = {
  initialInput?: string;
};

const CHAT_HISTORY_KEY = 'symptom-checker-history';
const MAX_HISTORY = 5;

export default function SymptomChecker({ initialInput }: SymptomCheckerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        setChatHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load chat history from localStorage', error);
    }
  }, []);

  // Save current chat to history
  const saveCurrentChat = () => {
    if (messages.length === 0) return;
    try {
      const newHistory = [messages, ...chatHistory].slice(0, MAX_HISTORY);
      setChatHistory(newHistory);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save chat history to localStorage', error);
    }
  };

  const startNewChat = () => {
    saveCurrentChat();
    setMessages([]);
  };

  const loadChatFromHistory = (chat: Message[]) => {
    saveCurrentChat(); // Save current chat before loading another
    setMessages(chat);
    // Remove the loaded chat from history to avoid duplicates when saving later
    setChatHistory(prev => prev.filter(h => h !== chat));
  };


  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const result = await runSymptomChecker(input, language);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      const assistantMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else if (result.guidance) {
      const assistantMessage: Message = { role: 'assistant', content: result.guidance };
      setMessages((prev) => [...prev, assistantMessage]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <CardHeader className="pt-0 flex-shrink-0 flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Describe your symptoms to get initial guidance. This is not a substitute for professional medical advice.
        </p>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={chatHistory.length === 0}>
                <Clock className="h-4 w-4" />
                <span className="sr-only">Chat History</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {chatHistory.map((chat, index) => (
                <DropdownMenuItem key={index} onClick={() => loadChatFromHistory(chat)}>
                  {chat[0]?.content.substring(0, 30)}... ({chat.length} messages)
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={startNewChat}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">New Chat</span>
          </Button>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Assamese">অসমীয়া (Assamese)</SelectItem>
              <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
              <SelectItem value="Bodo">बोड़ो (Bodo)</SelectItem>
              <SelectItem value="Dogri">डोगरी (Dogri)</SelectItem>
              <SelectItem value="Gujarati">ગુજરાતી (Gujarati)</SelectItem>
              <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="Kannada">ಕನ್ನಡ (Kannada)</SelectItem>
              <SelectItem value="Kashmiri">कॉशुर (Kashmiri)</SelectItem>
              <SelectItem value="Konkani">कोंकणी (Konkani)</SelectItem>
              <SelectItem value="Maithili">मैथिली (Maithili)</SelectItem>
              <SelectItem value="Malayalam">മലയാളം (Malayalam)</SelectItem>
              <SelectItem value="Manipuri">মৈতৈলোন্ (Manipuri)</SelectItem>
              <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
              <SelectItem value="Nepali">नेपाली (Nepali)</SelectItem>
              <SelectItem value="Odia">ଓଡ଼ିଆ (Odia)</SelectItem>
              <SelectItem value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
              <SelectItem value="Sanskrit">संस्कृतम् (Sanskrit)</SelectItem>
              <SelectItem value="Santali">ᱥᱟᱱᱛᱟᱲᱤ (Santali)</SelectItem>
              <SelectItem value="Sindhi">सिन्धी (Sindhi)</SelectItem>
              <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <Bot size={48} className="mb-4" />
                <p>Hi, I am Amrita, your personal Medicine Assistant. I am here to help you find information about medicines. <br /> Ask me about a medicine name or a symptom.</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-accent text-accent-foreground">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      className="prose prose-sm dark:prose-invert"
                      components={{
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User size={18} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-accent text-accent-foreground">
                  <AvatarFallback><Bot size={18} /></AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2 rounded-lg bg-secondary p-3 text-sm">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., What is Dolo 650? or I have a headache..."
            className="flex-1"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </div>
  );
}
