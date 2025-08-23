'use client'

import React, { useState, useTransition } from 'react';
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { googleFonts, type GoogleFont } from '@/lib/fonts';
import * as LucideIcons from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RectangleHorizontal, RectangleVertical, Loader } from 'lucide-react';
import type { CanvasOrientation } from './Editor';
import { searchIconsAction, type IconifySearchResponse } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { Label } from '@/components/ui/label';


interface SidebarControlsProps {
  brandName: string;
  onBrandNameChange: (name: string) => void;
  font: GoogleFont;
  onFontChange: (font: string) => void;
  fontWeight: string;
  onFontWeightChange: (weight: string) => void;
  onIconSelect: (url: string) => void;
  onDownload: (format: 'PNG' | 'JPG' | 'SVG') => void;
  canvasOrientation: CanvasOrientation;
  onCanvasOrientationChange: (orientation: CanvasOrientation) => void;
  iconColor: string;
  onIconColorChange: (color: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
}

export function SidebarControls({
  brandName,
  onBrandNameChange,
  font,
  onFontChange,
  fontWeight,
  onFontWeightChange,
  onIconSelect,
  onDownload,
  canvasOrientation,
  onCanvasOrientationChange,
  iconColor,
  onIconColorChange,
  textColor,
  onTextColorChange,
}: SidebarControlsProps) {
  const [iconSearch, setIconSearch] = useState('rocket');
  const [isSearching, startSearchTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<IconifySearchResponse | null>(null);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!iconSearch) {
        setSearchResults(null);
        return;
    };
    startSearchTransition(async () => {
        try {
            const results = await searchIconsAction(iconSearch);
            setSearchResults(results);
        } catch (error) {
            toast({
                title: 'Error searching for icons',
                description: 'Could not fetch icons from Iconfinder. Please try again later.',
                variant: 'destructive'
            })
        }
    })
  }

  React.useEffect(() => {
    // initial search
    startSearchTransition(async () => {
        const results = await searchIconsAction(iconSearch);
        setSearchResults(results);
    });
  }, []);

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <LucideIcons.Sparkles className="text-primary w-8 h-8"/>
            <h1 className="text-xl font-semibold">Logonada</h1>
        </div>
      </SidebarHeader>
      <ScrollArea className="flex-grow">
        <SidebarContent>
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full px-5">
            <AccordionItem value="item-5">
                <AccordionTrigger>Canvas</AccordionTrigger>
                <AccordionContent>
                    <ToggleGroup 
                        type="single" 
                        className="w-full"
                        value={canvasOrientation}
                        onValueChange={(value: CanvasOrientation) => value && onCanvasOrientationChange(value)}
                    >
                        <ToggleGroupItem value="horizontal" aria-label="Horizontal" className="flex-1">
                            <RectangleHorizontal className="h-4 w-4 mr-2" />
                            Horizontal
                        </ToggleGroupItem>
                        <ToggleGroupItem value="vertical" aria-label="Vertical" className="flex-1">
                            <RectangleVertical className="h-4 w-4 mr-2" />
                            Vertical
                        </ToggleGroupItem>
                    </ToggleGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-1">
              <AccordionTrigger>Brand Name</AccordionTrigger>
              <AccordionContent>
                <Input
                  placeholder="Your Brand Name"
                  value={brandName}
                  onChange={(e) => onBrandNameChange(e.target.value)}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Icon</AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                    <Input
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    />
                    <Button type="submit" disabled={isSearching}>
                        {isSearching ? <Loader className="animate-spin" /> : <LucideIcons.Search />}
                    </Button>
                </form>
                <ScrollArea className="h-48">
                  <div className="grid grid-cols-4 gap-2 pr-4">
                    {isSearching ? (
                        [...Array(12)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : searchResults && searchResults.icons.length > 0 ? (
                        searchResults.icons.map((icon) => {
                            const svgFormat = icon.vector_sizes[0]?.formats.find(f => f.format === 'svg');
                            if (!svgFormat) return null;
                            const rasterPreview = icon.raster_sizes.find(r => r.size === 64)?.formats[0]?.preview_url
                            return (
                                <Button
                                key={icon.icon_id}
                                variant="ghost"
                                className="h-16 flex items-center justify-center p-2 border border-transparent hover:border-primary"
                                onClick={() => onIconSelect(svgFormat.download_url)}
                                >
                                {rasterPreview ? (
                                    <Image src={rasterPreview} alt="" width={48} height={48} className="w-12 h-12" style={{height: 'auto', width: 'auto'}} />
                                ): <Skeleton className="h-12 w-12" />}
                                </Button>
                            );
                        })
                    ) : (
                        <p className="col-span-4 text-center text-sm text-muted-foreground">No icons found.</p>
                    )}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Typography</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <Select value={font.name} onValueChange={onFontChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {googleFonts.map((f) => (
                      <SelectItem key={f.name} value={f.name} style={{ fontFamily: f.family }}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={fontWeight} onValueChange={onFontWeightChange} disabled={font.weights.length <= 1}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a weight" />
                    </SelectTrigger>
                    <SelectContent>
                        {font.weights.map((weight) => (
                        <SelectItem key={weight} value={weight} style={{ fontFamily: font.family, fontWeight: weight }}>
                            {weight}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger>Colors</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="icon-color">Icon Color</Label>
                    <Input id="icon-color" type="color" value={iconColor} onChange={e => onIconColorChange(e.target.value)} className="w-24 p-1"/>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="text-color">Text Color</Label>
                    <Input id="text-color" type="color" value={textColor} onChange={e => onTextColorChange(e.target.value)} className="w-24 p-1"/>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter>
        <SidebarGroup>
            <SidebarGroupLabel>Export</SidebarGroupLabel>
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => onDownload('PNG')}>PNG</Button>
                <Button variant="outline" className="flex-1" onClick={() => onDownload('JPG')}>JPG</Button>
                <Button variant="outline" className="flex-1" onClick={() => onDownload('SVG')}>SVG</Button>
            </div>
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}
