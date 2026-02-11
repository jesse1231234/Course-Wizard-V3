import { NextRequest, NextResponse } from "next/server";
import { generateJSONResponse } from "@/lib/llm/client";
import type { QuestionFeedback } from "@/types";

interface FeedbackLLMResponse {
  feedback: string;
  suggestions?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, questionLabel, answer, feedbackInstructions, contextAnswers } = body;

    if (!questionId || !answer || !feedbackInstructions) {
      return NextResponse.json(
        { error: "Missing required fields: questionId, answer, feedbackInstructions" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a supportive instructional design partner helping a faculty member build their course. Your tone is warm, encouraging, and collaborative — like a knowledgeable colleague, not a critic.

IMPORTANT GUIDELINES:
- ALWAYS begin your feedback by acknowledging something the instructor has done well. Every response must include at least one genuine, specific positive observation.
- Frame suggestions as opportunities or ideas to consider, not corrections. Use language like "You might also consider..." or "One way to build on this..." rather than "You should..." or "This is missing..."
- Keep feedback concise and actionable. Focus on the most impactful 1-2 improvements rather than listing everything that could change.
- Connect suggestions back to the instructor's own stated goals when possible.

CRITICAL: Respond with raw JSON only. No markdown code blocks.`;

    let contextBlock = "";
    if (contextAnswers && Object.keys(contextAnswers).length > 0) {
      const contextEntries = Object.entries(contextAnswers)
        .slice(-8) // Include only the most recent 8 context answers to manage prompt size
        .map(([key, val]) => `- **${key}:** ${Array.isArray(val) ? val.join(", ") : val}`)
        .join("\n");
      contextBlock = `\n\n### Previously Provided Context:\n${contextEntries}`;
    }

    const userPrompt = `## Feedback Task

Provide feedback on the following response for "${questionLabel}".

### Response:
${answer}
${contextBlock}

### Evaluation Instructions:
${feedbackInstructions}

### Required Output Format:
{
  "feedback": "<2-4 sentences: start with what's working well, then offer any suggestions warmly>",
  "suggestions": ["<specific, encouraging suggestion 1>", "<specific, encouraging suggestion 2>"]
}

The suggestions array is optional — only include if there are meaningful improvements to offer. If the response is already strong, just provide positive feedback without suggestions.`;

    const llmResponse = await generateJSONResponse<FeedbackLLMResponse>(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.4, maxTokens: 800 }
    );

    const result: QuestionFeedback = {
      questionId,
      feedback: llmResponse.feedback || "No feedback available.",
      suggestions: llmResponse.suggestions,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ feedback: result });
  } catch (error: unknown) {
    console.error("Feedback error:", error);
    const message = error instanceof Error ? error.message : "Feedback request failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
