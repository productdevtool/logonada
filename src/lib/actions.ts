
'use server';

import { generateSvg } from "@/ai/flows/generate-svg";
import type { GenerateSvgInput } from "@/ai/flows/generate-svg-schemas";

export async function generateSvgAction(input: GenerateSvgInput) {
    const result = await generateSvg(input);
    return result;
}
