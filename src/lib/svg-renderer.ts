/**
 * @fileOverview Renders canvas elements to an SVG string deterministically.
 */

import { getIconSvgAction } from './actions';
import { googleFonts } from './fonts';

export interface CanvasElement {
  id: string;
  type: 'icon' | 'text';
  content: string; // For text, this is the string. For icons, it's the SVG URL.
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
}

export interface RenderSvgInput {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor?: string;
}

export async function renderToSvgString({ elements, canvasWidth, canvasHeight, backgroundColor }: RenderSvgInput): Promise<string> {
  const uniqueFonts = elements
    .filter(el => el.type === 'text' && el.fontFamily)
    .reduce((acc, el) => {
      if (el.fontFamily && !acc.has(el.fontFamily)) {
        acc.set(el.fontFamily, new Set());
      }
      if (el.fontFamily && el.fontWeight) {
        acc.get(el.fontFamily)?.add(el.fontWeight);
      }
      return acc;
    }, new Map<string, Set<string>>());

  const fontFamilies = Array.from(uniqueFonts.keys());

  const googleFontUrl = fontFamilies.length > 0
    ? 'https://fonts.googleapis.com/css2?' + fontFamilies.map(family => {
        const fontName = family.split(',')[0].replace(/'/g, '').replace(/\s/g, '+');
        const fontData = googleFonts.find(f => f.family === family);
        const weights = fontData ? Array.from(uniqueFonts.get(family) || []).join(';') : '400';
        return `family=${fontName}:wght@${weights}`;
    }).join('&')
    : '';

  const fontImport = googleFontUrl ? `@import url('${googleFontUrl}');` : '';

  const backgroundRect = backgroundColor && backgroundColor !== 'transparent'
    ? `<rect width="100%" height="100%" fill="${backgroundColor}" />`
    : '';

  const elementSvgs = await Promise.all(elements.map(async (el) => {
    if (el.type === 'text') {
      return `<text x="${el.x + el.width / 2}" y="${el.y + el.height / 2}" font-family="${el.fontFamily}" font-weight="${el.fontWeight || '400'}" font-size="${el.height}" fill="${el.color || 'black'}" text-anchor="middle" dominant-baseline="central">${el.content}</text>`;
    }
    if (el.type === 'icon') {
        let iconSvgContent = await getIconSvgAction(el.content);

        const viewBoxMatch = iconSvgContent.match(/viewBox="([0-9\s\.]+)"/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1].split(' ').map(parseFloat) : [0, 0, 24, 24];
        const originalWidth = viewBox[2];
        const originalHeight = viewBox[3];
        
        iconSvgContent = iconSvgContent.replace(/<\?xml[^>]*\?>/g, '');
        const svgContentMatch = iconSvgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
        iconSvgContent = svgContentMatch ? svgContentMatch[1] : '';

        const scaleX = el.width / originalWidth;
        const scaleY = el.height / originalHeight;

        return `<g transform="translate(${el.x}, ${el.y}) scale(${scaleX} ${scaleY})" fill="${el.color || 'black'}">${iconSvgContent}</g>`;
    }
    return '';
  }));

  return `
    <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style type="text/css">
          <![CDATA[
            ${fontImport}
          ]]>
        </style>
      </defs>
      ${backgroundRect}
      ${elementSvgs.join('\n')}
    </svg>
  `;
}