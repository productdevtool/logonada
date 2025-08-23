'use server';

/**
 * @fileOverview Generates an SVG representation of a logo design.
 *
 * - generateSvg - A function that generates an SVG from canvas elements.
 */

import {ai} from '@/ai/genkit';
import { GenerateSvgInputSchema, GenerateSvgOutputSchema, type GenerateSvgInput, type GenerateSvgOutput } from './generate-svg-schemas';


export async function generateSvg(input: GenerateSvgInput): Promise<GenerateSvgOutput> {
  return generateSvgFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSvgPrompt',
  input: {schema: GenerateSvgInputSchema},
  output: {schema: GenerateSvgOutputSchema},
  prompt: `You are an expert SVG generator. Your task is to create a complete SVG string based on a list of canvas elements.

Canvas Dimensions:
- Width: {{{canvasWidth}}}
- Height: {{{canvasHeight}}}

Elements:
{{#each elements}}
- Type: {{type}}
- Name: {{name}}
- Position: (x: {{x}}, y: {{y}})
- Size: (width: {{width}}, height: {{height}})
- Color: {{color}}
{{#if fontFamily}}
- Font Family: {{fontFamily}}
{{/if}}
{{/each}}

Instructions:
1. Create a root <svg> element with the correct width, height, and xmlns attributes.
2. For each 'text' element, create a <text> tag.
   - Use the x, y, width, and height properties to position and size the text. Adjust the 'y' attribute for vertical centering if needed. Use 'text-anchor="middle"' for horizontal centering.
   - Apply the font family and fill color. Use the 'font-size' attribute, which should be derived from the element's height.
   - Import the specified Google Font using a <style> tag with @import url(...); inside the <defs> tag. Example: @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
3. For each 'icon' element, you must generate the corresponding SVG path data for the specified lucide-react icon. You are an expert at this and know the path data for all lucide icons. Create a <path> element with the correct 'd' attribute.
   - Place the icon path inside a <g> element and use a 'transform' attribute to position (translate) and scale it correctly based on the x, y, width, and height.
   - Apply the fill color.
4. Combine everything into a single, valid SVG string. Do not include any comments in the SVG.

Return only the raw SVG string in the 'svgString' field of the JSON response.`,
});

const generateSvgFlow = ai.defineFlow(
  {
    name: 'generateSvgFlow',
    inputSchema: GenerateSvgInputSchema,
    outputSchema: GenerateSvgOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
