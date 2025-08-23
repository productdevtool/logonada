'use client';

import type { GenerateLayoutSuggestionsOutput } from '@/ai/flows/generate-layout-suggestions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MoveHorizontal, MoveVertical } from 'lucide-react';

interface LayoutSuggestionsProps {
  suggestions: GenerateLayoutSuggestionsOutput['suggestions'];
  onApply: (suggestion: GenerateLayoutSuggestionsOutput['suggestions'][0]) => void;
  isLoading: boolean;
}

export function LayoutSuggestions({ suggestions, onApply, isLoading }: LayoutSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
        <div className="text-center text-sm text-muted-foreground mt-4 p-4 border border-dashed rounded-lg">
            Click "Generate Suggestions" to get AI-powered layout ideas.
        </div>
    );
  }

  return (
    <ScrollArea className="mt-4 h-72">
      <div className="space-y-3 pr-4">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            {suggestion.layoutType === 'vertical' ? <MoveVertical className="w-4 h-4 text-primary" /> : <MoveHorizontal className="w-4 h-4 text-primary" />}
                            Layout {index + 1}
                        </CardTitle>
                        <CardDescription className="text-xs">{suggestion.font}</CardDescription>
                    </div>
                    <Badge variant="secondary">{suggestion.layoutType}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-2">
              <Button size="sm" className="w-full" onClick={() => onApply(suggestion)}>
                Apply Layout
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
