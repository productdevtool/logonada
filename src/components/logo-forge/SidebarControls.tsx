'use client'

import React, { useState } from 'react';
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { icons } from '@/lib/icons';
import { googleFonts } from '@/lib/fonts';
import * as LucideIcons from 'lucide-react';
import { LayoutSuggestions } from './LayoutSuggestions';
import type { GenerateLayoutSuggestionsOutput } from '@/ai/flows/generate-layout-suggestions';

interface SidebarControlsProps {
  brandName: string;
  onBrandNameChange: (name: string) => void;
  font: string;
  onFontChange: (font: string) => void;
  onIconSelect: (icon: { name: string, icon: string }) => void;
  onGenerateSuggestions: () => void;
  isLoadingSuggestions: boolean;
  layoutSuggestions: GenerateLayoutSuggestionsOutput['suggestions'];
  applyLayoutSuggestion: (suggestion: GenerateLayoutSuggestionsOutput['suggestions'][0]) => void;
  onDownload: (format: 'PNG' | 'JPG' | 'SVG') => void;
}

export function SidebarControls({
  brandName,
  onBrandNameChange,
  font,
  onFontChange,
  onIconSelect,
  onGenerateSuggestions,
  isLoadingSuggestions,
  layoutSuggestions,
  applyLayoutSuggestion,
  onDownload,
}: SidebarControlsProps) {
  const [iconSearch, setIconSearch] = useState('');
  
  const filteredIcons = icons.filter(icon => icon.name.toLowerCase().includes(iconSearch.toLowerCase()));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <LucideIcons.Sparkles className="text-primary w-8 h-8"/>
            <h1 className="text-xl font-semibold">LogoForge</h1>
        </div>
      </SidebarHeader>
      <ScrollArea className="flex-grow">
        <SidebarContent>
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full px-2">
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
                <Input
                  placeholder="Search icons..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="h-48">
                  <div className="grid grid-cols-4 gap-2 pr-4">
                    {filteredIcons.map((icon) => {
                      const IconComponent = LucideIcons[icon.icon as keyof typeof LucideIcons];
                      return (
                        <Button
                          key={icon.name}
                          variant="ghost"
                          className="h-16 flex items-center justify-center flex-col gap-1 border border-transparent hover:border-primary"
                          onClick={() => onIconSelect(icon)}
                        >
                          {IconComponent && <IconComponent className="w-8 h-8" />}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Typography</AccordionTrigger>
              <AccordionContent>
                <Select value={font} onValueChange={onFontChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {googleFonts.map((font) => (
                      <SelectItem key={font.name} value={font.family} style={{ fontFamily: font.family }}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>AI Layouts</AccordionTrigger>
              <AccordionContent>
                 <Button className="w-full" onClick={onGenerateSuggestions} disabled={isLoadingSuggestions}>
                    {isLoadingSuggestions ? <LucideIcons.Loader className="animate-spin mr-2" /> : <LucideIcons.Sparkles className="mr-2 h-4 w-4" />}
                    Generate Suggestions
                </Button>
                <LayoutSuggestions
                    suggestions={layoutSuggestions}
                    onApply={applyLayoutSuggestion}
                    isLoading={isLoadingSuggestions}
                />
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
