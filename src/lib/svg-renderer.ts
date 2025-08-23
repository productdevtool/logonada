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

// Helper function to fetch and Base64-encode a resource
async function encodeResourceAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch resource at ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/svg+xml';
  return `data:${contentType};base64,${base64}`;
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

  let fontCss = '';
  if (uniqueFonts.size > 0) {
    const fontFamilies = Array.from(uniqueFonts.keys());
    const googleFontUrl = 'https://fonts.googleapis.com/css2?' + fontFamilies.map(family => {
        const fontName = family.split(',')[0].replace(/'/g, '').replace(/\s/g, '+');
        const fontData = googleFonts.find(f => f.family === family);
        const weights = fontData ? Array.from(uniqueFonts.get(family) || ['400']).join(';') : '400';
        return `family=${fontName}:wght@${weights}`;
    }).join('&');

    const cssResponse = await fetch(googleFontUrl, {
      headers: {
        // A more robust user-agent to mimic a browser
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });
    if (cssResponse.ok) {
        let cssText = await cssResponse.text();
        const fontUrlRegex = /url\((https?:\/\/[^)]+)\)/g;
        const fontUrlMatches = Array.from(cssText.matchAll(fontUrlRegex));
        
        const encodedUrls = await Promise.all(
          fontUrlMatches.map(match => encodeResourceAsBase64(match[1]))
        );

        let i = 0;
        fontCss = cssText.replace(fontUrlRegex, () => `url(${encodedUrls[i++]})`);
    }
  }


  const backgroundRect = backgroundColor && backgroundColor !== 'transparent'
    ? `<rect width="100%" height="100%" fill="${backgroundColor}" />`
    : '';

  const elementSvgs = await Promise.all(elements.map(async (el) => {
    if (el.type === 'text') {
      return `<text x="${el.x + el.width / 2}" y="${el.y + el.height / 2}" font-family="${el.fontFamily}" font-weight="${el.fontWeight || '400'}" font-size="${el.height}" fill="${el.color || 'black'}" text-anchor="middle" dominant-baseline="central">${el.content}</text>`;
    }
    if (el.type === 'icon') {
        // Let's check if the content is already a data URL
        if (el.content.startsWith('data:image/svg+xml;base64,')) {
          return `<image href="${el.content}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" />`;
        }

        // Otherwise, fetch and encode it.
        const iconSvgContent = await getIconSvgAction(el.content);
        const coloredSvg = iconSvgContent.replace('<svg ', `<svg fill="${el.color || 'black'}" `);
        const base64Icon = Buffer.from(coloredSvg).toString('base64');
        const dataUrl = `data:image/svg+xml;base64,${base64Icon}`;

        return `<image href="${dataUrl}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" />`;
    }
    return '';
  }));

  return `
    <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style type="text/css">
          <![CDATA[
            ${fontCss}
          ]]>
        </style>
      </defs>
      ${backgroundRect}
      ${elementSvgs.join('\n')}
    </svg>
  `;
}