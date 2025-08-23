/**
 * @fileOverview Renders canvas elements to an SVG string deterministically.
 */

import { getIconSvgAction } from './actions';

export interface CanvasElement {
  id: string;
  type: 'icon' | 'text';
  content: string; // For text, this is the string. For icons, it's the SVG URL.
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

export async function renderToSvgString({ elements, canvasWidth, canvasHeight }: RenderSvgInput): Promise<string> {
  const googleFonts = elements
    .filter(el => el.type === 'text' && el.fontFamily)
    .map(el => el.fontFamily)
    .filter((font, index, self) => font && self.indexOf(font) === index)
    .map(font => font?.split(',')[0].replace(/'/g, '').replace(/\s/g, '+'))
    .join('&family=');

  const fontImport = googleFonts ? `@import url('https://fonts.googleapis.com/css2?family=${googleFonts}:wght@400;700');` : '';

  const elementSvgs = await Promise.all(elements.map(async (el) => {
    if (el.type === 'text') {
      return `<text x="${el.x + el.width / 2}" y="${el.y + el.height / 2}" font-family="${el.fontFamily}" font-size="${el.height}" fill="${el.color || 'black'}" text-anchor="middle" dominant-baseline="central">${el.content}</text>`;
    }
    if (el.type === 'icon') {
        let iconSvgContent = await getIconSvgAction(el.content);

        const viewBoxMatch = iconSvgContent.match(/viewBox="(\d+)\s(\d+)\s(\d+)\s(\d+)"/);
        const originalWidth = viewBoxMatch ? parseFloat(viewBoxMatch[3]) : 24;
        const originalHeight = viewBoxMatch ? parseFloat(viewBoxMatch[4]) : 24;
        
        // a regex to extract the content from the <svg> tag
        iconSvgContent = iconSvgContent.replace(/<\?xml[^>]*\?>/g, '');
        const svgContentMatch = iconSvgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
        iconSvgContent = svgContentMatch ? svgContentMatch[1] : '';

        const scaleX = el.width / originalWidth;
        const scaleY = el.height / originalHeight;

        // Wrap in a group to apply transforms and color
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
      ${elementSvgs.join('\n')}
    </svg>
  `;
}