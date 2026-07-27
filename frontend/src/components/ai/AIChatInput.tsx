"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface AIChatInputProps {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function AIChatInput({
  value,
  loading,
  onChange,
  onSubmit,
}: AIChatInputProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="space-y-8">

        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Community AI Assistant
          </h1>

          <p className="mx-auto max-w-2xl text-muted-foreground">
            Search across community discussions using AI.
            Get accurate answers grounded in real conversations.
          </p>
        </div>

        <div className="space-y-4">
          <Textarea
            value={value}
            placeholder="Ask anything about React, Next.js, Docker..."
            className="min-h-28 resize-none text-base"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
               }
             }}
           />

          <div className="flex justify-end sm:justify-end">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={loading || value.trim().length < 3}
              onClick={onSubmit}
             >
               {loading ? "Thinking..." : "Ask AI"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}