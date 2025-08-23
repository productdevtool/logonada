/**
 * @fileOverview Schemas and types for the generate-svg flow.
 */

import { z } from 'genkit';

export const CanvasElementSchema = z.object({
  id: z.string(),
  type: z.enum(['icon', 'text']),
  name: z.string().describe('For icons, the lucide-react icon name. For text, the content of the text.'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fontFamily: z.string().optional().describe('The font family for text elements.'),
  color: z.string().optional().default('black'),
});
export type CanvasElement = z.infer<typeof CanvasElementSchema>;

export const GenerateSvgInputSchema = z.object({
  elements: z.array(CanvasElementSchema).describe('An array of elements on the canvas.'),
  canvasWidth: z.number(),
  canvasHeight: z.number(),
});
export type GenerateSvgInput = z.infer<typeof GenerateSvgInputSchema>;

export const GenerateSvgOutputSchema = z.object({
  svgString: z.string().describe('The complete SVG code as a string.'),
});
export type GenerateSvgOutput = z.infer<typeof GenerateSvgOutputSchema>;
