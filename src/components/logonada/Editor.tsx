'use client';

import React, { useState, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarControls } from './SidebarControls';
import { Canvas } from './Canvas';
import { useToast } from '@/hooks/use-toast';
import { googleFonts, type GoogleFont } from '@/lib/fonts';
import { renderToSvgString } from '@/lib/svg-renderer';
import type { CanvasElement as CanvasElementType } from '@/lib/svg-renderer';

export type CanvasElement = Omit<CanvasElementType, 'fontWeight'> & {
  fontWeight?: string;
};

export type CanvasOrientation = 'horizontal' | 'vertical';

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const placeholderSvgDataUrl = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;


export function Editor() {
  const [brandName, setBrandName] = useState('Logonada');
  const [selectedIconUrl, setSelectedIconUrl] = useState<string>(placeholderSvgDataUrl);
  const [font, setFont] = useState<GoogleFont>(googleFonts.find(f => f.name === 'Inter') || googleFonts[0]);
  const [fontWeight, setFontWeight] = useState('400');
  const { toast } = useToast();
  const [canvasOrientation, setCanvasOrientation] = useState<CanvasOrientation>('horizontal');
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>('#FFFFFF');

  const getCanvasDimensions = (orientation: CanvasOrientation) => {
    return orientation === 'horizontal' ? { width: 800, height: 400 } : { width: 400, height: 600 };
  }

  const getInitialElements = (orientation: CanvasOrientation, iconUrl: string, currentBrandName: string, currentFont: typeof font, currentWeight: string): CanvasElement[] => {
    const {width, height} = getCanvasDimensions(orientation);
    const iconContent = iconUrl;
    if (orientation === 'vertical') {
        return [
            { id: 'brand-text', type: 'text', content: currentBrandName, x: (width/2) - 100, y: 350, width: 200, height: 50, fontFamily: currentFont.family, fontWeight: currentWeight, color: '#000000' },
            { id: 'logo-icon', type: 'icon', content: iconContent, x: (width/2) - 70, y: 200, width: 140, height: 140, color: '#000000' },
        ];
    }
    // horizontal
    return [
        { id: 'brand-text', type: 'text', content: currentBrandName, x: 400, y: 175, width: 200, height: 50, fontFamily: currentFont.family, fontWeight: currentWeight, color: '#000000' },
        { id: 'logo-icon', type: 'icon', content: iconContent, x: 200, y: 130, width: 140, height: 140, color: '#000000' },
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
    
    // Reset weight if not available in the new font
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
    setCanvasOrientation(orientation);
    setElements(getInitialElements(orientation, selectedIconUrl, brandName, font, fontWeight));
  }, [brandName, font, fontWeight, selectedIconUrl]);

  const updateElement = useCallback((id: string, newProps: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...newProps } : el));
  }, []);

  const handleDownload = async (format: 'PNG' | 'JPG' | 'SVG') => {
    if (format === 'SVG') {
        const { width, height } = getCanvasDimensions(canvasOrientation);
        try {
            toast({ title: 'Generating SVG...', description: 'Your download will begin shortly.' });
            
            const svgString = await renderToSvgString({ elements, canvasWidth: width, canvasHeight: height });
            
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-logo.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);

            toast({ title: 'SVG Download Started!', description: 'Check your downloads folder.' });

        } catch (error) {
            console.error('SVG Generation Error:', error);
            toast({ title: 'SVG Generation Failed', description: 'There was an error generating your SVG.', variant: 'destructive' });
        }

    } else {
        toast({
            title: "Format Not Supported Yet",
            description: `We're working on ${format} exports. For now, please use SVG.`,
            variant: "destructive"
        });
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
