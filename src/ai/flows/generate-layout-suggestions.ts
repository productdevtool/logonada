'use server';

/**
 * @fileOverview Generates AI-powered layout suggestions for logo designs.
 *
 * - generateLayoutSuggestions - A function that generates layout suggestions based on the chosen icon and brand name.
 * - GenerateLayoutSuggestionsInput - The input type for the generateLayoutSuggestions function.
 * - GenerateLayoutSuggestionsOutput - The return type for the generateLayoutSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLayoutSuggestionsInputSchema = z.object({
  iconName: z.string().describe('The name of a lucide-react icon to use for the logo.'),
  brandName: z.string().describe('The brand name for the logo.'),
});
export type GenerateLayoutSuggestionsInput = z.infer<typeof GenerateLayoutSuggestionsInputSchema>;

const GenerateLayoutSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      layoutType: z.enum(['vertical', 'horizontal']).describe('The type of layout suggestion.'),
      font: z.string().describe('The suggested font for the brand name.'),
      relativeFontSize: z
        .number()
        .describe('The relative font size for the brand name compared to the icon.'),
      description: z.string().describe('A description of the layout suggestion.'),
    })
  ).describe('An array of layout suggestions.'),
});
export type GenerateLayoutSuggestionsOutput = z.infer<typeof GenerateLayoutSuggestionsOutputSchema>;

export async function generateLayoutSuggestions(
  input: GenerateLayoutSuggestionsInput
): Promise<GenerateLayoutSuggestionsOutput> {
  return generateLayoutSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLayoutSuggestionsPrompt',
  input: {schema: GenerateLayoutSuggestionsInputSchema},
  output: {schema: GenerateLayoutSuggestionsOutputSchema},
  prompt: `You are a logo design expert. Given a lucide-react icon name and a brand name, you will generate several layout suggestions for a logo.

Each layout suggestion should include:
- layoutType: Whether the layout is vertical or horizontal.
- font: A Google Font to use for the brand name.
- relativeFontSize: The relative font size for the brand name compared to the icon (e.g., 1.2 means the brand name is 20% larger than the icon).
- description: A brief description of the layout suggestion.

Lucide Icon Name: {{{iconName}}}
Brand Name: {{{brandName}}}

Please provide 3 distinct logo layout suggestions. Return the array of suggestions as JSON. Ensure valid JSON is returned.

Remember, you must respond with a valid JSON object that matches the GenerateLayoutSuggestionsOutputSchema schema including descriptions for each field. The descriptions are critical, so do not omit them!`,
});

const generateLayoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateLayoutSuggestionsFlow',
    inputSchema: GenerateLayoutSuggestionsInputSchema,
    outputSchema: GenerateLayoutSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
