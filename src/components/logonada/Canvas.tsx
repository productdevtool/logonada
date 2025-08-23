'use client';

import React, { useRef } from 'react';
import type { CanvasElement, CanvasOrientation } from './Editor';
import { DraggableResizable } from './DraggableResizable';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, newProps: Partial<CanvasElement>) => void;
  orientation: CanvasOrientation;
}

export function Canvas({ elements, selectedElementId, onSelectElement, onUpdateElement, orientation }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  const canvasSize = {
    horizontal: { width: '800px', height: '400px' },
    vertical: { width: '400px', height: '600px' }
  }

  return (
    <div className="flex-grow h-full flex items-center justify-center bg-gray-200/50 dark:bg-gray-800/20 p-8">
      <div
        ref={canvasRef}
        className={cn(
          "relative bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden transition-all duration-300"
        )}
        style={{ ...canvasSize[orientation], cursor: 'auto' }}
        onClick={handleCanvasClick}
      >
        {elements.map((el) => {
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
              {el.type === 'icon' && (
                 <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${el.content})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    pointerEvents: 'none',
                  }}
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
                    color: el.color,
                  }}
                >
                  {el.content}
                </div>
              )}
            </DraggableResizable>
          );
        })}
      </div>
    </div>
  );
}
