'use server';
/**
 * @fileOverview A Genkit flow for generating product images based on hints.
 *
 * - generateProductImage - A function that generates an image for a product.
 * - GenerateProductImageInput - The input type for the generateProductImage function.
 * - GenerateProductImageOutput - The return type for the generateProductImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductImageInputSchema = z.object({
  aiHint: z.string().describe('Keywords describing the product for image generation (e.g., "silk scarf", "moonstone jewelry").'),
});
export type GenerateProductImageInput = z.infer<typeof GenerateProductImageInputSchema>;

const GenerateProductImageOutputSchema = z.object({
  imageDataUri: z.string().nullable().describe('The generated image as a data URI (e.g., data:image/png;base64,...), or null if generation failed.'),
});
export type GenerateProductImageOutput = z.infer<typeof GenerateProductImageOutputSchema>;

export async function generateProductImage(input: GenerateProductImageInput): Promise<GenerateProductImageOutput> {
  return generateProductImageFlow(input);
}

const generateProductImageFlow = ai.defineFlow(
  {
    name: 'generateProductImageFlow',
    inputSchema: GenerateProductImageInputSchema,
    outputSchema: GenerateProductImageOutputSchema,
  },
  async (input) => {
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Explicitly use the image generation model
        prompt: `Generate a high-quality, e-commerce style product photograph of: ${input.aiHint}. The image should be clean, well-lit, and suitable for a product listing. Focus on a single item or a small, tasteful arrangement. Avoid text or watermarks. Ensure the background is neutral or complements the product.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Must provide both
          // Optional: Add safety settings if needed
          // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE'}]
        },
      });

      if (media?.url) {
        return {imageDataUri: media.url};
      }
      console.warn('Image generation did not return a media URL for hint:', input.aiHint);
      return {imageDataUri: null};

    } catch (error) {
      console.error('Error generating product image for hint:', input.aiHint, error);
      return {imageDataUri: null};
    }
  }
);
