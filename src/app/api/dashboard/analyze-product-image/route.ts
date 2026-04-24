import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/server/dashboard-auth";
import { analyzeProductImageFromBuffer } from "@/lib/server/analyze-product-image";

export const runtime = "edge";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireDashboardUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo de imagem (campo image)." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Imagem muito grande (máx. 4 MB)." }, { status: 400 });
    }

    const mime = file.type || "image/jpeg";
    const result = await analyzeProductImageFromBuffer(buffer, mime);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao analisar imagem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
