type VisionResult = {
  suggestedTitle: string;
  suggestedTags: string[];
  notes?: string;
};

const fallback: VisionResult = {
  suggestedTitle: "Custom manufactured part",
  suggestedTags: ["3d printing", "laser cutting", "usa", "custom order"]
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(slice) as number[]);
  }
  return btoa(binary);
}

export async function analyzeProductImageFromBuffer(buffer: ArrayBuffer, mimeType: string): Promise<VisionResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  const base64 = arrayBufferToBase64(buffer);
  const dataUrl = `data:${mimeType || "image/jpeg"};base64,${base64}`;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an e-commerce SEO specialist for the US market (3D printing & laser cutting).
Look at the product photo and return ONLY valid JSON:
{"suggestedTitle":"...","suggestedTags":["tag1","tag2",...],"notes":"optional short note"}

Rules:
- suggestedTitle: concise English, Title Case, max 70 chars, good for Amazon/Etsy style US search.
- suggestedTags: 6-12 lowercase tags, US English, mix of material/process/use-case (e.g. petg, laser engraved, desk organizer).
- No markdown, no extra keys.`
            },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "low" }
            }
          ]
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<VisionResult>;
    if (!parsed.suggestedTitle || !Array.isArray(parsed.suggestedTags)) {
      return fallback;
    }

    return {
      suggestedTitle: parsed.suggestedTitle.slice(0, 120),
      suggestedTags: parsed.suggestedTags.map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 16),
      notes: parsed.notes
    };
  } catch {
    return fallback;
  }
}
