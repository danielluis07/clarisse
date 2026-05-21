"use server";

import {
  openai,
  type OpenAILanguageModelResponsesOptions,
} from "@ai-sdk/openai";
import {
  generateText,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  Output,
} from "ai";

import { getCurrentSession } from "@/lib/auth-utils";
import { getCatalogOptions, getOpenAIModel } from "@/modules/products/server-utils";
import { buildPrompt, getImageInput, parseImageDescriptors, sanitizeAnalysis } from "@/modules/products/utils";
import { productImageAnalysisSchema } from "@/modules/products/validations";

export async function analyzeProductImagesAction(formData: FormData) {
  const session = await getCurrentSession();

  if (!session || session.user.role !== "admin") {
    throw new Error("Acesso restrito ao administrador.");
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const descriptors = parseImageDescriptors(formData);
  const [catalogOptions, imageInput] = await Promise.all([
    getCatalogOptions(),
    getImageInput(formData, descriptors),
  ]);

  try {
    const { output } = await generateText({
      model: openai(getOpenAIModel()),
      system: [
        "You are an ecommerce merchandising assistant for Clarisse, a fictional premium Brazilian women's fashion brand.",
        "Analyze product images and return practical product creation form suggestions in Brazilian Portuguese.",
        "Use only visible evidence from the images. If something is uncertain, use neutral, non-specific copy.",
        "Never invent external brand names, exact fabric percentages, prices, costs, discounts, or supplier claims.",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildPrompt(catalogOptions, imageInput) },
            ...imageInput.parts,
          ],
        },
      ],
      output: Output.object({
        name: "clarisse_product_image_analysis",
        description:
          "Suggested Clarisse product form fields inferred from product images.",
        schema: productImageAnalysisSchema,
      }),
      maxOutputTokens: 3500,
      providerOptions: {
        openai: {
          store: false,
        } satisfies OpenAILanguageModelResponsesOptions,
      },
      experimental_include: {
        requestBody: false,
        responseBody: false,
      },
    });

    return sanitizeAnalysis(output, catalogOptions, descriptors);
  } catch (error) {
    if (
      NoObjectGeneratedError.isInstance(error) ||
      NoOutputGeneratedError.isInstance(error)
    ) {
      throw new Error(
        "A IA não conseguiu gerar sugestões válidas para estas imagens.",
      );
    }

    throw error instanceof Error
      ? new Error(error.message)
      : new Error("Não foi possível analisar as imagens.");
  }
}
