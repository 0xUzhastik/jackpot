"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { userGifs } from "@/lib/mock-data";
import { EmojiPicker } from "@/components/EmojiPicker";
import { parseMessageWithEmojis, getEmojiCodeByUrl } from "@/lib/emoji-map";
import { ArrowRightIcon } from "lucide-react";
import { usePrivy } from '@privy-io/react-auth';
import { WalletConnect } from './WalletConnect';

interface ChatSectionProps {
  messages: ChatMessage[];
}

const mockResponses = [
  "LFG! 🚀",
  "To the moon!",
  "gm",
  "This pot is getting huge",
  "I'm feeling lucky",
  "Another deposit incoming",
  "Can't wait for the draw",
  "Who's winning this one?",
  "Best lottery ever",
  "Love this community"
];

export function ChatSection({ messages: initialMessages }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { authenticated } = usePrivy();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    const users = Object.keys(userGifs);
    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMessage = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const randomGif = userGifs[randomUser][Math.floor(Math.random() * userGifs[randomUser].length)];
      
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: randomUser,
        message: randomMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        gif: randomGif
      };

      setMessages(prev => [...prev.slice(-19), newMsg]);
      setTimeout(scrollToBottom, 100);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initial scroll to bottom when component loads
    scrollToBottom();
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Parse message into segments for inline emoji display
    const messageSegments = parseMessageWithEmojis(newMessage);
    
    // Create a new message with segments
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: newMessage, // Store original message for reference
      messageSegments, // Store the parsed segments for rendering
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev.slice(-19), userMessage]);
    setNewMessage("");
    // Ensure emoji picker is closed after sending
    setIsEmojiPickerOpen(false);
    setTimeout(scrollToBottom, 100);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  return (
    <div className="h-full">
      <Card className="ticket-box overflow-hidden p-0 border-4 border-[#FFD700] bg-[#D50000] h-full flex flex-col">
        <div className="p-2 bg-[#D50000] flex justify-center shrink-0">
          <CardTitle 
            className="text-3xl font-bold uppercase text-center tracking-wider text-[#FFD700]" 
            style={{ 
              fontFamily: "Impact, Arial Black, sans-serif",
              fontWeight: 900,
              position: "relative",
              zIndex: 3,
              WebkitTextStroke: "0px var(--ticket-red)",
              textShadow: `
                0 1px 0 #FFE866,
                0 2px 0 #FFE866,
                0 3px 0 #B39700,
                0 4px 0 #B39700,
                0 5px 0 #B39700,
                0 6px 8px rgba(0, 0, 0, 0.9)
              `
            }}
          >
            Chat
          </CardTitle>
        </div>
  
        <div className="flex-1 overflow-hidden">
          <ScrollArea 
            className="h-[370px] bg-[#F5E9C9]" 
            ref={scrollAreaRef}
          >
            <div className="p-3 space-y-2">
              {messages.map((message, index) => (
                <motion.div 
                  key={message.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative text-black pr-14"
                >
                  <div className="text-black">
                    <span className="font-bold text-[#8A2BE2]">{message.user}: </span>
                    {/* Handle messages with inline emoji segments */}
                    {message.messageSegments ? (
                      message.messageSegments.map((segment, i) => (
                        segment.type === 'text' ? (
                          <span key={i}>{segment.content}</span>
                        ) : (
                          <img 
                            key={i}
                            src={segment.content} 
                            alt="emoji" 
                            className="inline-block mx-1"
                            style={{ height: "1.2em", verticalAlign: "middle" }}
                            title={getEmojiCodeByUrl(segment.content) || "emoji"}
                          />
                        )
                      ))
                    ) : (
                      // Legacy message display for messages without segments
                      <>
                        <span>{message.message}</span>
                        {message.gif && (
                          <img 
                            src={message.gif} 
                            alt="emoji" 
                            className="inline-block mx-1"
                            style={{ height: "1.2em", verticalAlign: "middle" }}
                            title={getEmojiCodeByUrl(message.gif) || "emoji"}
                          />
                        )}
                      </>
                    )}
                    <span className="text-gray-600 text-xs absolute right-0 top-0">{message.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <CardFooter className="bg-[#F5E9C9] shrink-0 p-0">
          {authenticated ? (
            <form onSubmit={handleSend} className="w-full flex items-center">
              <EmojiPicker 
                onEmojiSelect={handleEmojiSelect} 
                isOpen={isEmojiPickerOpen}
                setIsOpen={setIsEmojiPickerOpen}
              />
              <div className="flex-1">
                <div className="relative w-full">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full bg-[##f9f2df] border-0 text-black rounded-md pr-[40px]"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-0 top-0 bottom-0 bg-[#FFD700] text-black hover:bg-[#FFD700]/90 font-bold rounded-r-md border-l-2 border-[#D50000] flex items-center justify-center"
                    style={{ width: "40px" }}
                  >
                    <ArrowRightIcon className="h-5 w-5" style={{ 
                      filter: "drop-shadow(1px 1px 0 #000)",
                      transition: "transform 0.2s ease",
                    }} />
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <WalletConnect />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}