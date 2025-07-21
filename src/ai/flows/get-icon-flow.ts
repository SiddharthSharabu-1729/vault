'use server';
/**
 * @fileOverview A flow to suggest a lucide-react icon for a given URL.
 *
 * - getIconForUrl - A function that suggests an icon name.
 * - GetIconInput - The input type for the getIconForUrl function.
 * - GetIconOutput - The return type for the getIconForUrl function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as lucide from 'lucide-react';

export const runtime = 'edge';

const GetIconInputSchema = z.object({
  url: z.string().describe('The URL of the service to get an icon for.'),
});
export type GetIconInput = z.infer<typeof GetIconInputSchema>;

const GetIconOutputSchema = z.object({
  iconName: z
    .string()
    .describe('The suggested name of a lucide-react icon.'),
});
export type GetIconOutput = z.infer<typeof GetIconOutputSchema>;

// Get a list of all available icon names from lucide-react, excluding aliases and deprecated icons
const availableIcons = Object.keys(lucide).filter(
  (key) =>
    typeof lucide[key as keyof typeof lucide] === 'object' &&
    key !== 'createLucideIcon' &&
    key !== 'icons' &&
    key[0] === key[0].toUpperCase()
);


export async function getIconForUrl(
  input: GetIconInput
): Promise<GetIconOutput> {
  return getIconFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getIconPrompt',
  input: { schema: GetIconInputSchema },
  output: { schema: GetIconOutputSchema },
  prompt: `You are an expert at selecting the best icon for a web service.
Based on the URL provided, suggest the most appropriate icon name from the following list of available lucide-react icons.
Only return one single icon name from the list. If no specific icon seems to fit, default to "Globe".

URL: {{{url}}}

Available Icons:
${availableIcons.join(', ')}
`,
});

const getIconFlow = ai.defineFlow(
  {
    name: 'getIconFlow',
    inputSchema: GetIconInputSchema,
    outputSchema: GetIconOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    // Validate that the returned icon name is actually in the list
    if (output && availableIcons.includes(output.iconName)) {
        return output;
    }

    // If the model hallucinates or returns an invalid icon, default to Globe
    return { iconName: 'Globe' };
  }
);
