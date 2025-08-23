'use client';

import React, { useState, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarControls } from './SidebarControls';
import { Canvas } from './Canvas';
import type { GenerateLayoutSuggestionsOutput } from '@/ai/flows/generate-layout-suggestions';
import { generateLayoutSuggestionsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { googleFonts } from '@/lib/fonts';

export interface CanvasElement {
  id: string;
  type: 'icon' | 'text';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string;
  color?: string;
}

export type CanvasOrientation = 'horizontal' | 'vertical';

export function Editor() {
  const [brandName, setBrandName] = useState('Logonada');
  const [selectedIcon, setSelectedIcon] = useState<{ name: string; icon: string } | null>({ name: 'Rocket', icon: 'Rocket' });
  const [font, setFont] = useState(googleFonts[0].family);
  const [layoutSuggestions, setLayoutSuggestions] = useState<GenerateLayoutSuggestionsOutput['suggestions']>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();
  const [canvasOrientation, setCanvasOrientation] = useState<CanvasOrientation>('horizontal');

  const getInitialElements = (orientation: CanvasOrientation): CanvasElement[] => {
    if (orientation === 'vertical') {
        return [
            { id: 'brand-text', type: 'text', name: brandName, x: 100, y: 350, width: 200, height: 50, fontFamily: font },
            { id: 'logo-icon', type: 'icon', name: 'Rocket', x: 130, y: 200, width: 140, height: 140 },
        ];
    }
    // horizontal
    return [
        { id: 'brand-text', type: 'text', name: brandName, x: 350, y: 175, width: 200, height: 50, fontFamily: font },
        { id: 'logo-icon', type: 'icon', name: 'Rocket', x: 150, y: 130, width: 140, height: 140 },
    ];
  };

  const [elements, setElements] = useState<CanvasElement[]>(getInitialElements(canvasOrientation));
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleBrandNameChange = useCallback((newName: string) => {
    setBrandName(newName);
    setElements(prev => prev.map(el => el.id === 'brand-text' ? { ...el, name: newName } : el));
  }, []);

  const handleFontChange = useCallback((newFont: string) => {
    setFont(newFont);
    setElements(prev => prev.map(el => el.id === 'brand-text' ? { ...el, fontFamily: newFont } : el));
  }, []);

  const handleIconSelect = useCallback((icon: { name: string; icon: string }) => {
    setSelectedIcon(icon);
    setElements(prev => prev.map(el => el.id === 'logo-icon' ? { ...el, name: icon.name } : el));
  }, []);

  const handleOrientationChange = useCallback((orientation: CanvasOrientation) => {
    setCanvasOrientation(orientation);
    setElements(getInitialElements(orientation));
  }, [brandName, font]);

  const updateElement = useCallback((id: string, newProps: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...newProps } : el));
  }, []);

  const handleGenerateSuggestions = async () => {
    if (!selectedIcon) {
      toast({ title: "Error", description: "Please select an icon first.", variant: "destructive" });
      return;
    }
    setIsLoadingSuggestions(true);
    setLayoutSuggestions([]);
    try {
      const result = await generateLayoutSuggestionsAction({ iconName: selectedIcon.name, brandName });
      setLayoutSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({ title: "AI Error", description: "Failed to generate layout suggestions.", variant: "destructive" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const applyLayoutSuggestion = (suggestion: GenerateLayoutSuggestionsOutput['suggestions'][0]) => {
    const iconEl = elements.find(el => el.id === 'logo-icon');
    const textEl = elements.find(el => el.id === 'brand-text');

    if (!iconEl || !textEl) return;
    
    const iconSize = 120;
    const textSize = iconSize * suggestion.relativeFontSize;

    let newIconPos = { ...iconEl };
    let newTextPos = { ...textEl };
    
    const canvasWidth = canvasOrientation === 'horizontal' ? 800 : 400;
    const canvasHeight = canvasOrientation === 'horizontal' ? 400 : 600;

    if (suggestion.layoutType === 'vertical') {
        newIconPos = { ...newIconPos, x: canvasWidth/2 - iconSize / 2, y: canvasHeight/2 - iconSize, width: iconSize, height: iconSize };
        newTextPos = { ...newTextPos, x: canvasWidth/2 - textSize / 2, y: canvasHeight/2 + 20, width: textSize, height: textSize/4 };
    } else { // horizontal
        const totalWidth = iconSize + textSize + 20;
        newIconPos = { ...newIconPos, x: canvasWidth/2 - totalWidth / 2, y: canvasHeight/2 - iconSize/2, width: iconSize, height: iconSize };
        newTextPos = { ...newTextPos, x: newIconPos.x + iconSize + 20, y: canvasHeight/2 - textSize/4, width: textSize, height: textSize/2};
    }

    const newFontFamily = googleFonts.find(f => f.name === suggestion.font)?.family || font;
    handleFontChange(newFontFamily);

    setElements([
        {...newIconPos},
        {...newTextPos, fontFamily: newFontFamily, name: brandName}
    ]);

    toast({ title: "Layout Applied", description: `Applied ${suggestion.description}.`});
  };
  
  const handleDownload = (format: 'PNG' | 'JPG' | 'SVG') => {
    toast({
        title: "Download Started",
        description: `Your logo will be downloaded as a ${format} file. (This is a placeholder)`,
    });
  }

  return (
    <SidebarProvider>
      <Sidebar className="z-20">
        <SidebarControls
          brandName={brandName}
          onBrandNameChange={handleBrandNameChange}
          font={font}
          onFontChange={handleFontChange}
          onIconSelect={handleIconSelect}
          onGenerateSuggestions={handleGenerateSuggestions}
          layoutSuggestions={layoutSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          applyLayoutSuggestion={applyLayoutSuggestion}
          onDownload={handleDownload}
          canvasOrientation={canvasOrientation}
          onCanvasOrientationChange={handleOrientationChange}
        />
      </Sidebar>
      <SidebarInset>
        <Canvas
          elements={elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={updateElement}
          orientation={canvasOrientation}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
