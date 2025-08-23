'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DraggableResizableProps {
  children: React.ReactNode;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (newProps: { x: number; y: number; width: number; height: number }) => void;
}

export function DraggableResizable({
  children,
  id,
  x,
  y,
  width,
  height,
  isSelected,
  onSelect,
  onUpdate,
}: DraggableResizableProps) {
  const ref = useRef<HTMLDivElement>(null);

  const interactionRef = useRef({
    isDragging: false,
    isResizing: false,
    resizeDirection: '',
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id);

    const target = e.target as HTMLElement;
    interactionRef.current.isDragging = !target.dataset.resize;
    interactionRef.current.isResizing = !!target.dataset.resize;
    interactionRef.current.resizeDirection = target.dataset.resize || '';
    interactionRef.current.startX = e.clientX;
    interactionRef.current.startY = e.clientY;
    interactionRef.current.startLeft = x;
    interactionRef.current.startTop = y;
    interactionRef.current.startWidth = width;
    interactionRef.current.startHeight = height;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { isDragging, isResizing, resizeDirection, startX, startY, startLeft, startTop, startWidth, startHeight } = interactionRef.current;
    
    let newX = x;
    let newY = y;
    let newWidth = width;
    let newHeight = height;

    if (isDragging) {
      newX = startLeft + e.clientX - startX;
      newY = startTop + e.clientY - startY;
    }

    if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (resizeDirection.includes('right')) newWidth = Math.max(20, startWidth + dx);
        if (resizeDirection.includes('left')) {
            newWidth = Math.max(20, startWidth - dx);
            newX = startLeft + dx;
        }
        if (resizeDirection.includes('bottom')) newHeight = Math.max(20, startHeight + dy);
        if (resizeDirection.includes('top')) {
            newHeight = Math.max(20, startHeight - dy);
            newY = startTop + dy;
        }
    }

    if(ref.current) {
        ref.current.style.transform = `translate(${newX}px, ${newY}px)`;
        ref.current.style.width = `${newWidth}px`;
        ref.current.style.height = `${newHeight}px`;
    }

  }, [x, y, width, height]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    const { isDragging, isResizing, resizeDirection, startX, startY, startLeft, startTop, startWidth, startHeight } = interactionRef.current;
    
    let finalX = x;
    let finalY = y;
    let finalWidth = width;
    let finalHeight = height;

    if (isDragging) {
        finalX = startLeft + e.clientX - startX;
        finalY = startTop + e.clientY - startY;
    }
    
    if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (resizeDirection.includes('right')) finalWidth = Math.max(20, startWidth + dx);
        if (resizeDirection.includes('left')) {
            finalWidth = Math.max(20, startWidth - dx);
            finalX = startLeft + dx;
        }
        if (resizeDirection.includes('bottom')) finalHeight = Math.max(20, startHeight + dy);
        if (resizeDirection.includes('top')) {
            finalHeight = Math.max(20, startHeight - dy);
            finalY = startTop + dy;
        }
    }

    onUpdate({ x: finalX, y: finalY, width: finalWidth, height: finalHeight });
    interactionRef.current.isDragging = false;
    interactionRef.current.isResizing = false;
  }, [x, y, width, height, handleMouseMove, onUpdate]);

  const resizeHandles = [
    { pos: 'top-left', cursor: 'nwse-resize' }, { pos: 'top-right', cursor: 'nesw-resize' },
    { pos: 'bottom-left', cursor: 'nesw-resize' }, { pos: 'bottom-right', cursor: 'nwse-resize' },
    { pos: 'top-center', cursor: 'ns-resize' }, { pos: 'bottom-center', cursor: 'ns-resize' },
    { pos: 'middle-left', cursor: 'ew-resize' }, { pos: 'middle-right', cursor: 'ew-resize' },
  ];

  return (
    <div
      ref={ref}
      className={cn('absolute cursor-move transition-all duration-100', isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background z-10')}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {isSelected && (
        <>
            {resizeHandles.map(handle => {
                const directions = handle.pos.split('-');
                const directionClasses: {[key: string]: string} = {
                    'top': '-top-1.5', 'middle': 'top-1/2 -translate-y-1/2', 'bottom': '-bottom-1.5',
                    'left': '-left-1.5', 'center': 'left-1/2 -translate-x-1/2', 'right': '-right-1.5',
                }
                const classes = directions.map(d => directionClasses[d]).join(' ');

                return (
                    <div
                        key={handle.pos}
                        data-resize={handle.pos.replace('-center','').replace('middle-','')}
                        className={cn(
                            'absolute w-3 h-3 bg-white border-2 border-primary rounded-full',
                             classes
                        )}
                        style={{ cursor: handle.cursor }}
                    />
                )
            })}
        </>
      )}
    </div>
  );
}
