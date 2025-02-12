import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { drawingData } = await req.json();
    console.log("Received drawing data:", drawingData);

    // Send drawingData to OpenAI's image generation API.
    // Note: The drawingData is currently not being used in the prompt.
    // Instead, a fixed prompt is being sent.
    const response = await openai.images.generate({
      prompt: "A clean digital transformation of this hand-drawn sketch.", // Customize this prompt as needed.
      n: 1,
      size: "512x512", // You can change the size.
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image received from OpenAI");
    }

    const imageUrl = response.data[0].url;

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("Error transforming drawing:", error);
    return NextResponse.json(
      { error: "Failed to transform drawing" },
      { status: 500 }
    );
  }
}
