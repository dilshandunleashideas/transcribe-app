import { OpenAI } from "openai";

// Initialize with Groq's endpoint
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // Add your gsk_ key to .env
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Using Groq's Whisper Large V3 (Free & Fast)
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
      response_format: "verbose_json",
    });

    // Format into (0:00) text...
    const formattedText = transcription.segments?.map(segment => {
      const timestamp = Math.floor(segment.start);
      const minutes = Math.floor(timestamp / 60);
      const seconds = timestamp % 60;
      const timeLabel = `(${minutes}:${seconds.toString().padStart(2, '0')})`;
      
      return `${timeLabel} ${segment.text}`;
    }).join(" ");

    return Response.json({ text: formattedText });

  } catch (error: any) {
    console.error("Transcription Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}