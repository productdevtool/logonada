'use client';

import React, { useState, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarControls } from './SidebarControls';
import { Canvas } from './Canvas';
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
