/**
 * @fileOverview Renders canvas elements to an SVG string deterministically.
 */
import * as lucideIcons from 'lucide-react';
import { icons } from './icons';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

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

export interface RenderSvgInput {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
}

// This function is a simple way to get the path data from lucide-react icons.
// In a real-world scenario, you might have a more direct way to access SVG paths.
const getIconSvg = (iconName: string, props: any) => {
  const IconComponent = lucideIcons[icons.find(i => i.name === iconName)?.icon as keyof typeof lucideIcons];
  if (!IconComponent) return '';
  // Use react-dom/server to render the component to a string, then extract the path.
  // This is a workaround to get the path data without having access to the raw SVG files.
  const iconHtml = renderToStaticMarkup(React.createElement(IconComponent, props));
  return iconHtml;
};


export async function renderToSvgString({ elements, canvasWidth, canvasHeight }: RenderSvgInput): Promise<string> {
  const googleFonts = elements
    .map(el => el.fontFamily)
    .filter((font, index, self) => font && self.indexOf(font) === index)
    .map(font => font?.split(',')[0].replace(/'/g, '').replace(' ', '+'))
    .join('|');

  const fontImport = googleFonts ? `@import url('https://fonts.googleapis.com/css2?family=${googleFonts}:wght@400;700&display=swap');` : '';

  const elementSvgs = elements.map(el => {
    if (el.type === 'text') {
      return `<text x="${el.x + el.width / 2}" y="${el.y + el.height / 2}" font-family="${el.fontFamily}" font-size="${el.height}" fill="${el.color || 'black'}" text-anchor="middle" dominant-baseline="central">${el.name}</text>`;
    }
    if (el.type === 'icon') {
        const iconHtml = getIconSvg(el.name, {});
        // Wrap in a group to apply transforms
        return `<g transform="translate(${el.x}, ${el.y}) scale(${el.width / 24}, ${el.height / 24})" fill="${el.color || 'black'}">${iconHtml}</g>`;
    }
    return '';
  }).join('\n');

  return `
    <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style type="text/css">
          ${fontImport}
        </style>
      </defs>
      ${elementSvgs}
    </svg>
  `;
}
