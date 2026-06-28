// Extrai produtos (nome, ref, preço) de uma ou mais imagens usando Lovable AI Gateway (Gemini visão)
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um extrator de tabelas de produtos. Receberá imagens de catálogos/tabelas de preços brasileiras.
Extraia TODOS os produtos visíveis. Para cada um identifique:
- nome: nome/descrição do produto (em maiúsculas)
- ref: código ou referência (apenas dígitos/letras, sem espaços). Se houver vários códigos, use o principal/CÓDIGO interno.
- preco: valor em reais como número decimal (use ponto, ex: 12.50). Aceite formatos "R$ 12,50", "12,50", "1.234,56".
- categoria: categoria curta sugerida (Cozinha, Elétrica, Pesca, Ferramentas, Cosmético, Limpeza, Brinquedo, Geral, etc).
Responda SOMENTE com JSON válido, sem markdown, sem comentários, sem texto antes/depois, no formato:
{"products":[{"nome":"...","ref":"...","preco":0.00,"categoria":"..."}]}
Se não encontrar produtos, retorne {"products":[]}.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { images } = await req.json();
    if (!Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "Envie ao menos uma imagem em 'images' (data URLs)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (images.length > 8) {
      return new Response(JSON.stringify({ error: "Máximo 8 imagens por chamada" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userContent: Array<Record<string, unknown>> = [
      { type: "text", text: "Extraia todos os produtos das imagens a seguir." },
    ];
    for (const img of images) {
      if (typeof img !== "string" || !img.startsWith("data:image/")) continue;
      userContent.push({ type: "image_url", image_url: { url: img } });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI Gateway error:", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro no serviço de IA", details: errText.slice(0, 500) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";

    // Extrair bloco JSON
    let products: Array<{ nome: string; ref: string; preco: number; categoria?: string }> = [];
    const cleaned = text.replace(/```json|```/gi, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed?.products)) products = parsed.products;
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          const parsed = JSON.parse(m[0]);
          if (Array.isArray(parsed?.products)) products = parsed.products;
        } catch (e) {
          console.error("JSON parse error:", e);
        }
      }
    }

    // Normalizar saída
    const normalized = products
      .map((p) => {
        const nome = String(p?.nome ?? "").trim().toUpperCase();
        const ref = String(p?.ref ?? "").trim();
        let preco = p?.preco;
        if (typeof preco === "string") {
          preco = parseFloat(
            preco.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}(?:[.,]|$))/g, "").replace(",", "."),
          );
        }
        const precoNum = typeof preco === "number" && isFinite(preco) ? preco : 0;
        const categoria = String(p?.categoria ?? "Geral").trim() || "Geral";
        return { nome, ref, preco: precoNum, categoria };
      })
      .filter((p) => p.nome.length > 0 && p.preco > 0);

    return new Response(JSON.stringify({ products: normalized }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-products-from-image error:", e);
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});