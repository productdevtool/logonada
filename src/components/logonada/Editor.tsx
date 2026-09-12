'use client';

import React, { useState, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarControls } from './SidebarControls';
import { Canvas } from './Canvas';
import { useToast } from '@/hooks/use-toast';
import { googleFonts, type GoogleFont } from '@/lib/fonts';
import { renderToSvgString } from '@/lib/svg-renderer';
import type { CanvasElement as CanvasElementType } from '@/lib/svg-renderer';
import { usePostHog } from 'posthog-js/react';
import { generateLayoutSuggestions, type GenerateLayoutSuggestionsOutput } from '@/ai/flows/generate-layout-suggestions';

export type CanvasElement = Omit<CanvasElementType, 'fontWeight'> & {
  fontWeight?: string;
};

export type CanvasOrientation = 'horizontal' | 'vertical';

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const placeholderSvgDataUrl = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;

export function Editor() {
  const posthog = usePostHog();
  const [brandName, setBrandName] = useState('Logonada');
  const [selectedIconUrl, setSelectedIconUrl] = useState<string>(placeholderSvgDataUrl);
  const [font, setFont] = useState<GoogleFont>(googleFonts.find(f => f.name === 'Inter') || googleFonts[0]);
  const [fontWeight, setFontWeight] = useState('400');
  const { toast } = useToast();
  const [canvasOrientation, setCanvasOrientation] = useState<CanvasOrientation>('horizontal');
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>('#FFFFFF');
  
  // AI Suggestions state
  const [suggestions, setSuggestions] = useState<GenerateLayoutSuggestionsOutput['suggestions']>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const getCanvasDimensions = (orientation: CanvasOrientation) => {
    return orientation === 'horizontal' ? { width: 800, height: 400 } : { width: 400, height: 600 };
  }

  const getInitialElements = (orientation: CanvasOrientation, iconUrl: string, currentBrandName: string, currentFont: typeof font, currentWeight: string): CanvasElement[] => {
    const {width, height} = getCanvasDimensions(orientation);
    if (orientation === 'vertical') {
        return [
            { id: 'brand-text', type: 'text', content: currentBrandName, x: (width/2) - 100, y: 350, width: 200, height: 50, fontFamily: currentFont.family, fontWeight: currentWeight, color: '#000000' },
            { id: 'logo-icon', type: 'icon', content: iconUrl, x: (width/2) - 70, y: 200, width: 140, height: 140, color: '#000000' },
        ];
    }
    // horizontal
    return [
        { id: 'brand-text', type: 'text', content: currentBrandName, x: 400, y: 175, width: 200, height: 50, fontFamily: currentFont.family, fontWeight: currentWeight, color: '#000000' },
        { id: 'logo-icon', type: 'icon', content: iconUrl, x: 200, y: 130, width: 140, height: 140, color: '#000000' },
    ];
  };

  const [elements, setElements] = useState<CanvasElement[]>(getInitialElements(canvasOrientation, selectedIconUrl, brandName, font, fontWeight));
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleBrandNameChange = useCallback((newName: string) => {
    setBrandName(newName);
    setElements(prev => prev.map(el => el.id === 'brand-text' ? { ...el, content: newName } : el));
  }, []);

  const handleFontChange = useCallback((fontName: string) => {
    const newFont = googleFonts.find(f => f.name === fontName) || font;
    setFont(newFont);
    const newWeight = newFont.weights.includes(fontWeight as any) ? fontWeight : newFont.weights[0];
    setFontWeight(newWeight);
    setElements(prev => prev.map(el => el.id === 'brand-text' ? { ...el, fontFamily: newFont.family, fontWeight: newWeight } : el));
  }, [font, fontWeight]);
  
  const handleFontWeightChange = useCallback((newWeight: string) => {
    setFontWeight(newWeight);
    setElements(prev => prev.map(el => el.id === 'brand-text' ? { ...el, fontWeight: newWeight } : el));
  }, []);

  const handleIconSelect = useCallback((iconUrl: string) => {
    setSelectedIconUrl(iconUrl);
    setElements(prev => prev.map(el => el.id === 'logo-icon' ? { ...el, content: iconUrl } : el));
  }, []);

  const handleOrientationChange = useCallback((orientation: CanvasOrientation) => {
    posthog.capture('Orientation Changed', { orientation: orientation });
    setCanvasOrientation(orientation);
    setElements(getInitialElements(orientation, selectedIconUrl, brandName, font, fontWeight));
  }, [brandName, font, fontWeight, selectedIconUrl, posthog]);

  const updateElement = useCallback((id: string, newProps: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...newProps } : el));
  }, []);

  const handleGenerateSuggestions = async () => {
    if (!brandName) return;
    setIsLoadingSuggestions(true);
    try {
        const iconElement = elements.find(el => el.type === 'icon');
        // Extracting icon name from URL if possible, otherwise just use brand name context
        const iconName = iconElement?.id || 'logo';
        const result = await generateLayoutSuggestions({ brandName, iconName });
        setSuggestions(result.suggestions);
        posthog.capture('AI Suggestions Generated', { brandName });
    } catch (error) {
        console.error('Failed to generate suggestions:', error);
        toast({ title: 'AI Generation Failed', description: 'Could not generate layout suggestions.', variant: 'destructive' });
    } finally {
        setIsLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: GenerateLayoutSuggestionsOutput['suggestions'][0]) => {
    const newOrientation = suggestion.layoutType as CanvasOrientation;
    const newFont = googleFonts.find(f => f.name === suggestion.font) || font;
    
    setCanvasOrientation(newOrientation);
    setFont(newFont);
    
    const { width, height } = getCanvasDimensions(newOrientation);
    const iconSize = 140;
    const textSize = iconSize * suggestion.relativeFontSize;
    
    let newElements: CanvasElement[] = [];
    if (newOrientation === 'vertical') {
        newElements = [
            { id: 'brand-text', type: 'text', content: brandName, x: (width/2) - (textSize*2), y: 350, width: textSize*4, height: textSize, fontFamily: newFont.family, fontWeight: '400', color: elements.find(e => e.id === 'brand-text')?.color || '#000000' },
            { id: 'logo-icon', type: 'icon', content: selectedIconUrl, x: (width/2) - (iconSize/2), y: 150, width: iconSize, height: iconSize, color: elements.find(e => e.id === 'logo-icon')?.color || '#000000' },
        ];
    } else {
        newElements = [
            { id: 'brand-text', type: 'text', content: brandName, x: 400, y: 175, width: textSize*4, height: textSize, fontFamily: newFont.family, fontWeight: '400', color: elements.find(e => e.id === 'brand-text')?.color || '#000000' },
            { id: 'logo-icon', type: 'icon', content: selectedIconUrl, x: 200, y: 130, width: iconSize, height: iconSize, color: elements.find(e => e.id === 'logo-icon')?.color || '#000000' },
        ];
    }
    setElements(newElements);
    posthog.capture('AI Suggestion Applied', { suggestion });
  };

  const triggerDownload = (href: string, filename: string) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = href;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  const handleDownload = async (format: 'PNG' | 'JPG' | 'SVG') => {
    posthog.capture('Download Clicked', { format: format });
    const { width, height } = getCanvasDimensions(canvasOrientation);
    const filename = `${brandName.toLowerCase().replace(/\s+/g, '-')}-logo`;
    
    toast({ title: `Generating ${format}...`, description: 'Your download will begin shortly.' });

    try {
        if (format === 'SVG') {
            const svgString = await renderToSvgString({ elements, canvasWidth: width, canvasHeight: height, backgroundColor: canvasBackgroundColor });
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            triggerDownload(svgUrl, `${filename}.svg`);
            URL.revokeObjectURL(svgUrl);
        } else {
            // High quality PNG/JPG export with 3x scale
            const scale = 3;
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;
            
            const scaledElements = elements.map(el => ({
                ...el,
                x: el.x * scale,
                y: el.y * scale,
                width: el.width * scale,
                height: el.height * scale,
            }));

            const svgString = await renderToSvgString({ 
                elements: scaledElements, 
                canvasWidth: scaledWidth, 
                canvasHeight: scaledHeight, 
                backgroundColor: canvasBackgroundColor 
            });
            
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
            
            const canvas = document.createElement('canvas');
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            const img = new Image();
            img.onload = () => {
                if (format === 'JPG') {
                    ctx.fillStyle = canvasBackgroundColor === 'transparent' ? '#FFFFFF' : canvasBackgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                const mimeType = format === 'JPG' ? 'image/jpeg' : 'image/png';
                const dataUrl = canvas.toDataURL(mimeType, 0.9);
                triggerDownload(dataUrl, `${filename}.${format.toLowerCase()}`);
            };
            img.src = svgDataUrl;
        }
        toast({ title: `${format} Download Started!` });
    } catch (error) {
        console.error(`${format} Generation Error:`, error);
        toast({ title: `${format} Generation Failed`, variant: 'destructive' });
    }
  }

  const handleColorChange = (id: string, color: string) => {
    updateElement(id, { color });
  };
  
  const iconElement = elements.find(el => el.type === 'icon');
  const textElement = elements.find(el => el.type === 'text');

  return (
    <SidebarProvider>
      <Sidebar className="z-20 w-[340px] p-[20px]">
        <SidebarControls
          brandName={brandName}
          onBrandNameChange={handleBrandNameChange}
          font={font}
          onFontChange={handleFontChange}
          fontWeight={fontWeight}
          onFontWeightChange={handleFontWeightChange}
          onIconSelect={handleIconSelect}
          onDownload={handleDownload}
          canvasOrientation={canvasOrientation}
          onCanvasOrientationChange={handleOrientationChange}
          iconColor={iconElement?.color || '#000000'}
          onIconColorChange={(color) => handleColorChange('logo-icon', color)}
          textColor={textElement?.color || '#000000'}
          onTextColorChange={(color) => handleColorChange('brand-text', color)}
          canvasBackgroundColor={canvasBackgroundColor}
          onCanvasBackgroundColorChange={setCanvasBackgroundColor}
          suggestions={suggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          onGenerateSuggestions={handleGenerateSuggestions}
          onApplySuggestion={handleApplySuggestion}
        />
      </Sidebar>
      <SidebarInset>
        <Canvas
          elements={elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={updateElement}
          orientation={canvasOrientation}
          backgroundColor={canvasBackgroundColor}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
