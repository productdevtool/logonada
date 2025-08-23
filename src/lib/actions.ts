
'use server';

import { generateLayoutSuggestions as generateLayoutSuggestionsFlow, type GenerateLayoutSuggestionsInput, type GenerateLayoutSuggestionsOutput } from "@/ai/flows/generate-layout-suggestions";

export async function generateLayoutSuggestionsAction(input: { iconName: string, brandName: string }): Promise<GenerateLayoutSuggestionsOutput> {
    const aiInput: GenerateLayoutSuggestionsInput = {
      iconName: input.iconName,
      brandName: input.brandName,
    };

    return await generateLayoutSuggestionsFlow(aiInput);
}
