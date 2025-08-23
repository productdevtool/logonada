'use client';

import React, { useRef } from 'react';
import type { CanvasElement } from './Editor';
import { DraggableResizable } from './DraggableResizable';
import * as LucideIcons from 'lucide-react';
import { icons } from '@/lib/icons';

interface CanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, newProps: Partial<CanvasElement>) => void;
}

export function Canvas({ elements, selectedElementId, onSelectElement, onUpdateElement }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  return (
    <div className="flex-grow h-full flex items-center justify-center bg-gray-200/50 dark:bg-gray-800/20 p-8">
      <div
        ref={canvasRef}
        className="relative w-[600px] h-[600px] bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden"
        onClick={handleCanvasClick}
        style={{ cursor: 'auto' }}
      >
        {elements.map((el) => {
          const IconComponent = el.type === 'icon' 
            ? LucideIcons[icons.find(i => i.name === el.name)?.icon as keyof typeof LucideIcons] 
            : null;

          return (
            <DraggableResizable
              key={el.id}
              id={el.id}
              x={el.x}
              y={el.y}
              width={el.width}
              height={el.height}
              isSelected={el.id === selectedElementId}
              onSelect={onSelectElement}
              onUpdate={(newProps) => onUpdateElement(el.id, newProps)}
            >
              {el.type === 'icon' && IconComponent && (
                <IconComponent
                  className="w-full h-full"
                  color="currentColor"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {el.type === 'text' && (
                <div
                  className="w-full h-full flex items-center justify-center text-center select-none"
                  style={{
                    fontFamily: el.fontFamily,
                    fontSize: `${el.height}px`, // Simple font scaling
                    pointerEvents: 'none',
                    lineHeight: 1,
                  }}
                >
                  {el.name}
                </div>
              )}
            </DraggableResizable>
          );
        })}
      </div>
    </div>
  );
}
