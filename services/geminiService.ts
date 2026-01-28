
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse, DishAnalysis, GroundingSource } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeFoodImage = async (
  base64Image: string, 
  location?: { latitude: number, longitude: number }
): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const locationContext = location 
    ? `Kullanıcının koordinatları: Lat ${location.latitude}, Lng ${location.longitude}. Bu bölgedeki (İstanbul/Ankara/İzmir vb. semt bazlı) gerçek restoran fiyatlarını bul.`
    : "Türkiye genelindeki popüler bölgeleri ve restoran zincirlerini baz al.";

  const prompt = `Sen profesyonel bir şef ve Türkiye mutfak piyasası analistisin. 
Bu yemek görselini analiz et ve detaylı bir maliyet/piyasa raporu oluştur. SADECE geçerli bir JSON döndür.

Görevler:
1. Yemek adını ve iştah açıcı kısa bir açıklama yaz.
2. Görünür her malzeme için: Gramaj, KG birim fiyatı (güncel TL) ve bu porsiyondaki maliyetini hesapla.
3. ${locationContext} Yakındaki restoranlarda bu yemeğin GÜNCEL SATIŞ FİYATLARINI araştır.
4. Toplam hammadde maliyetini ve ortalama piyasa satış fiyatını belirle.

JSON Formatı:
{
  "dish": "Yemek Adı",
  "description": "Kısa açıklama",
  "portion_size": "normal",
  "detailed_ingredients": [
    {
      "name": "Malzeme Adı",
      "weight_grams": 150,
      "unit_price_try_per_kg": 450,
      "total_item_cost_try": 67.5
    }
  ],
  "estimated_total_cost_try": 120,
  "estimated_market_price_try": 350,
  "nearby_restaurants": [
    {"name": "Restoran Adı", "dish_name": "Yemek Adı", "price_try": 320, "location": "Kadıköy"}
  ]
}`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      // Gemini 3 Flash modelinde googleMaps desteklenmediği için kaldırıldı. 
      // Fiyat araştırması için googleSearch yeterli olacaktır.
      tools: [{ googleSearch: {} }]
    },
  });

  const text = response.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const cleanJson = jsonMatch ? jsonMatch[0] : text;

  try {
    const data: DishAnalysis = JSON.parse(cleanJson);
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      });
    }
    return { data, sources };
  } catch (error) {
    throw new Error("Analiz verisi oluşturulamadı. Lütfen tekrar deneyin.");
  }
};
