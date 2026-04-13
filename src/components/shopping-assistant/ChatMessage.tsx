import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import ProductCard from "./ProductCard";
import type { ChatMessage as ChatMessageType } from "@/hooks/useShoppingAssistant";

interface ChatMessageProps {
  message: ChatMessageType;
  onSaveProduct?: (productId: string) => void;
  isSaving?: boolean;
}

export default function ChatMessage({ message, onSaveProduct, isSaving }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      <div className={`min-w-0 max-w-[85%] space-y-2 ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {message.products && message.products.length > 0 && (
          <div className="space-y-2">
            {message.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSave={onSaveProduct}
                isSaving={isSaving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
