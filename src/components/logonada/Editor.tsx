'use client';

import React, { useState, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarControls } from './SidebarControls';
import { Canvas } from './Canvas';
import { useToast } from '@/hooks/use-toast';
import { googleFonts } from '@/lib/fonts';
import { renderToSvgString } from '@/lib/svg-renderer';
import type { CanvasElement as CanvasElementType } from '@/lib/svg-renderer';

export type CanvasElement = CanvasElementType;

export type CanvasOrientation = 'horizontal' | 'vertical';

export function Editor() {
  const [brandName, setBrandName] = useState('Logonada');
  const [selectedIconUrl, setSelectedIconUrl] = useState<string>('https://api.iconfinder.com/v4/icons/211878/downloads/svg?apiKey=X0vjEUN6KRlxbp2DoUkyHeM0VOmxY91rA6BbU5j3Xu6wDodwS0McmilLPBWDUcJ1');
  const [font, setFont] = useState(googleFonts[0].family);
  const { toast } = useToast();
  const [canvasOrientation, setCanvasOrientation] = useState<CanvasOrientation>('horizontal');

  const getCanvasDimensions = (orientation: CanvasOrientation) => {
    return orientation === 'horizontal' ? { width: 800, height: 400 } : { width: 400, height: 600 };
  }

  const getInitialElements = (orientation: CanvasOrientation, iconUrl: string, currentBrandName: string, currentFont: string): CanvasElement[] => {
    const {width, height} = getCanvasDimensions(orientation);
    const iconContent = iconUrl;
    if (orientation === 'vertical') {
        return [
            { id: 'brand-text', type: 'text', content: currentBrandName, x: (width/2) - 100, y: 350, width: 200, height: 50, fontFamily: currentFont, color: 'black' },
            { id: 'logo-icon', type: 'icon', content: iconContent, x: (width/2) - 70, y: 200, width: 140, height: 140 },
        ];
    }
    // horizontal
    return [
        { id: 'brand-text', type: 'text', content: currentBrandName, x: 400, y: 175, width: 200, height: 50, fontFamily: currentFont, color: 'black' },
        { id: 'logo-icon', type: 'icon', content: iconContent, x: 200, y: 130, width: 140, height: 140 },
    ];
  };

  const [elements, setElements] = useState<CanvasElement[]>(getInitialElements(canvasOrientation, selectedIconUrl, brandName, font));
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleBrandNameChange = useCallback((newName: string) => {
    setBrandName(newName);
    setElements(prev => prev.map(el => el.id === 'brand-text' ? { ...el, content: newName } : el));
  }, []);

  const handleFontChange = useCallback((newFont: string) => {
    setFont(newFont);
    setElements(prev => prev.map(el => el.id === 'brand-text' ? { ...el, fontFamily: newFont } : el));
  }, []);

  const handleIconSelect = useCallback((iconUrl: string) => {
    setSelectedIconUrl(iconUrl);
    setElements(prev => prev.map(el => el.id === 'logo-icon' ? { ...el, content: iconUrl } : el));
  }, []);

  const handleOrientationChange = useCallback((orientation: CanvasOrientation) => {
    setCanvasOrientation(orientation);
    setElements(getInitialElements(orientation, selectedIconUrl, brandName, font));
  }, [brandName, font, selectedIconUrl]);

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

  return (
    <SidebarProvider>
      <Sidebar className="z-20 w-[340px] p-[20px]">
        <SidebarControls
          brandName={brandName}
          onBrandNameChange={handleBrandNameChange}
          font={font}
          onFontChange={handleFontChange}
          onIconSelect={handleIconSelect}
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
