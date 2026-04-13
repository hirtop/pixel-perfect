import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: CatalogProduct[];
  timestamp: Date;
}

export interface CatalogProduct {
  id: string;
  category: string;
  title: string;
  brand: string;
  price: number;
  finish: string;
  style_tags?: string[];
  width?: number;
  depth?: number;
  height?: number;
  image_url?: string;
  short_description?: string;
  compatibility_tags?: string[];
}

export function useShoppingAssistant(projectId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const idCounter = useRef(0);

  const makeId = () => `msg-${Date.now()}-${idCounter.current++}`;

  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          toast.error("Please sign in to use the shopping assistant.");
          setIsLoading(false);
          return;
        }

        const conversationHistory = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-shopping-assistant`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              messages: conversationHistory,
              project_id: projectId || null,
            }),
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          const errorMsg = err.error || "Something went wrong";
          if (response.status === 429) {
            toast.error("Too many requests — please wait a moment and try again.");
          } else if (response.status === 402) {
            toast.error("AI credits exhausted. Please add funds in workspace settings.");
          } else {
            toast.error(errorMsg);
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        const assistantMsg: ChatMessage = {
          id: makeId(),
          role: "assistant",
          content: data.message || "I couldn't generate a response. Please try again.",
          products: data.products?.length > 0 ? data.products : undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error("Shopping assistant error:", err);
        toast.error("Failed to reach the assistant. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, projectId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
}
