'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { CanvasElement, CanvasOrientation } from './Editor';
import { DraggableResizable } from './DraggableResizable';
import { cn } from '@/lib/utils';
import { IconRenderer } from './IconRenderer';

interface CanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, newProps: Partial<CanvasElement>) => void;
  orientation: CanvasOrientation;
}

export function Canvas({ elements, selectedElementId, onSelectElement, onUpdateElement, orientation }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const canvasSize = {
    horizontal: { width: 800, height: 400 },
    vertical: { width: 400, height: 600 }
  };

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
        const { width: canvasWidth, height: canvasHeight } = canvasSize[orientation];
        
        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;
        
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };
    
    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    
    return () => {
        if (containerRef.current) {
            resizeObserver.unobserve(containerRef.current);
        }
    }
  }, [orientation]);


  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };


  return (
    <div ref={containerRef} className="flex-grow h-full flex items-center justify-center p-4 md:p-8">
        <div 
            style={{
                width: `${canvasSize[orientation].width}px`,
                height: `${canvasSize[orientation].height}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
            }}
        >
            <div
                ref={canvasRef}
                className={cn(
                "relative bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden transition-all duration-300 w-full h-full"
                )}
                style={{ cursor: 'auto' }}
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
                    {el.type === 'icon' ? (
                        <IconRenderer url={el.content} color={el.color} />
                    ) : null}

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
    </div>
  );
}
