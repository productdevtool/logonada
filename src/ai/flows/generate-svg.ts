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
1.  Create a root \`<svg>\` element with the correct \`width\`, \`height\`, and \`xmlns="http://www.w3.org/2000/svg"\` attributes.
2.  For each 'text' element, create a \`<text>\` tag.
    -   Set the \`x\` attribute to be the element's x-coordinate plus half its width (\`x + width / 2\`).
    -   Set the \`y\` attribute to be the element's y-coordinate plus half its height, adjusted for baseline (\`y + height / 2 + height / 4\`). This helps with vertical centering.
    -   Use \`text-anchor="middle"\` for horizontal centering.
    -   Apply the font family and fill color.
    -   Set the \`font-size\` attribute to the element's \`height\`.
    -   Import the specified Google Font using a \`<style>\` tag with \`@import url(...);\` inside a \`<defs>\` tag. Example: \`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');\`
3.  For each 'icon' element, you MUST generate the corresponding SVG path data for the specified lucide-react icon. You are an expert at this and know the path data for all lucide icons.
    -   Create a \`<g>\` element and use a \`transform\` attribute to \`translate({{{x}}}, {{{y}}})\` and \`scale({{{width}}}/24, {{{height}}}/24)\`. Lucide icons are on a 24x24 viewport.
    -   Inside the \`<g>\` element, create a \`<path>\` element with the correct \`d\` attribute for the icon.
    -   Apply the \`fill\` color to the \`<path>\` element.
4.  Combine everything into a single, valid SVG string.
5.  CRITICAL: Do NOT include any markdown, comments, or any text other than the raw SVG code in your response. The entire response must be the SVG string.

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
