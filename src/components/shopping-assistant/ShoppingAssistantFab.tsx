import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShoppingAssistant from "./ShoppingAssistant";

/**
 * Floating action button that opens the BOBOX AI Shopping Assistant drawer.
 * Drop this into any project-flow page.
 */
export default function ShoppingAssistantFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 gap-2 rounded-full px-5 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Bot className="h-4.5 w-4.5" />
        <span className="text-sm font-medium">Ask BOBOX AI</span>
      </Button>

      <ShoppingAssistant open={open} onOpenChange={setOpen} />
    </>
  );
}
