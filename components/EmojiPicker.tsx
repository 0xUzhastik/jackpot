"use client";

import { useState, useRef, useEffect } from "react";
import { emojiMap } from "@/lib/emoji-map";
import { SmileIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function EmojiPicker({ onEmojiSelect, isOpen: controlledIsOpen, setIsOpen: setControlledIsOpen }: EmojiPickerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're in controlled mode (props provide isOpen/setIsOpen)
  const isControlled = controlledIsOpen !== undefined && setControlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? setControlledIsOpen : setInternalIsOpen;

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Handle clicks outside the picker to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button" // Explicitly set to button to prevent form submission
        onClick={togglePicker}
        className="p-2 rounded-full hover:bg-[#FFD700]/20 transition-colors"
        aria-label="Open emoji picker"
      >
        <SmileIcon className="h-5 w-5 text-black" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full left-0 mb-2 bg-[#F5E9C9] border-2 border-[#D50000] rounded-md shadow-lg p-2 z-20 w-64"
          >
            <div className="p-1 flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {Object.entries(emojiMap).map(([code, url]) => (
                <button
                  key={code}
                  type="button" // Explicitly set to button to prevent form submission
                  onClick={(e) => {
                    e.preventDefault();
                    onEmojiSelect(`:${code}:`);
                    setIsOpen(false);
                  }}
                  className="p-1 hover:bg-[#FFD700]/30 rounded cursor-pointer transition-colors flex items-center justify-center"
                  title={`:${code}:`}
                >
                  <img 
                    src={url} 
                    alt={code} 
                    className="h-6 w-auto"
                    title={`:${code}:`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[#D50000] text-xs text-center">
              <span className="text-[#D50000] font-bold">Tip: </span>
              <span className="text-black">Type <code>:code:</code> to add an emoji</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}