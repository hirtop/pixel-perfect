import { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useShoppingAssistant } from "@/hooks/useShoppingAssistant";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";

interface ShoppingAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShoppingAssistant({ open, onOpenChange }: ShoppingAssistantProps) {
  const { project } = useProject();
  const { user, loading: authLoading } = useAuth();
  const projectId = project.id;
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    savedProducts,
    refreshSavedProducts,
  } = useShoppingAssistant(projectId);
  const [input, setInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const savedProductIds = new Set(savedProducts.map((product) => product.product_id));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSaveProduct = async (productId: string) => {
    if (authLoading) return;

    if (!user) {
      toast.error("Please sign in to save products to your project.");
      return;
    }

    if (!project.id) {
      toast.error("Save your project first to add products.");
      return;
    }

    if (savedProductIds.has(productId)) {
      toast.info("Already saved to this project", {
        description: "This product is already in your project.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.rpc("save_product_to_project", {
        p_project_id: project.id,
        p_product_id: productId,
        p_source: "ai_recommended",
        p_notes: "Saved from AI Shopping Assistant",
      });
      if (error) throw error;
      await refreshSavedProducts();
      toast.success("Product saved to your project!");
    } catch (err: unknown) {
      console.error("Save error:", err);
      toast.error("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  const quickPrompts = [
    "What vanities fit my bathroom?",
    "Show me mirrors that match",
    "Find a budget-friendly faucet",
    "What lights work for my style?",
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-sm">BOBOX Shopping Assistant</SheetTitle>
                <p className="text-xs text-muted-foreground">Bathroom V1 • Internal Catalog</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat} title="Clear chat">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Ask BOBOX AI</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  I can help you find vanities, mirrors, faucets, and lights from our curated catalog
                  that fit your bathroom project.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-[280px]">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                    className="text-xs text-left px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onSaveProduct={project.id ? handleSaveProduct : undefined}
                isSaving={isSaving}
                savedProductIds={savedProductIds}
              />
            ))
          )}

          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="rounded-lg bg-secondary px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-border p-3">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about vanities, mirrors, faucets, or lights..."
              className="min-h-[40px] max-h-[100px] resize-none text-sm"
              rows={1}
            />
            <Button
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {projectId && (
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Recommendations based on your project context
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
