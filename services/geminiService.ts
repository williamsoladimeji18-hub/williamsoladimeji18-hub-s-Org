import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, Outfit, ClothingItem, UserProfile, StyleIndexBreakdown, MarketSuggestion, TrendReport } from "../types";

export class GeminiService {
  constructor() {}

  private createClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateOutfitVisual(
    description: string, 
    userProfile?: UserProfile | null, 
    personaItems: ClothingItem[] = [],
    isMannequin: boolean = false
  ): Promise<string | null> {
    try {
      const client = this.createClient();
      const skinToneContext = userProfile?.skin_tone ? `Subject tone: ${userProfile.skin_tone}.` : "";
      const bodyContext = userProfile?.body_type ? `Body: ${userProfile.body_type}.` : "";
      const renderingStyle = isMannequin 
        ? `Full-body runway shot of a high-fashion model standing in a minimalist studio.` 
        : `Professional editorial flat-lay on a clean textured background.`;

      const prompt = `${renderingStyle} Outfit: ${description}. ${skinToneContext} ${bodyContext} Ultra-realistic textures, high fashion boutique aesthetic.`;
      
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "3:4" } },
      });
      
      const candidates = response.candidates || [];
      if (candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (e) {
      console.error("Error generating visual:", e);
      return null;
    }
  }

  async analyzeClothingImage(base64: string): Promise<any> {
    try {
      const client = this.createClient();
      const systemInstruction = `You are Teola’s Wardrobe Assistant. 
      Analyze this garment image and return JSON.
      
      AUTO-CATEGORY RULES:
      Sort into exactly one: [Tops, Bottoms, Shoes, Outerwear, Accessories].
      
      SMART TAGGING RULES:
      Assign applicable tags ONLY from this set: [Casual, Sporty, Party, Work, Cold weather].
      
      Schema: 
      {
        "category": "Tops | Bottoms | Shoes | Outerwear | Accessories",
        "type": string,
        "color": string,
        "styleTags": string[],
        "brand": string,
        "missingDetails": string[]
      }`;

      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { 
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64.split(',')[1] || base64 } }, 
            { text: "Analyze this garment for the Maison archive. Apply smart tagging for Casual, Sporty, Party, Work, or Cold weather." }
          ] 
        },
        config: { systemInstruction, responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) { return {}; }
  }

  async analyzeBodyMetrics(base64: string): Promise<any> {
    try {
      const client = this.createClient();
      const systemInstruction = `You are Teola's Biometric Analyst.
      Analyze this full-body photo and estimate physical attributes for high-fashion modeling.
      Be accurate but respectful. 
      Return JSON only.
      
      Fields:
      - height: estimated height in cm (string, e.g. "175cm")
      - shoe_size: estimated EU shoe size (string, e.g. "42")
      - body_type: Rectangle | Hourglass | Pear | Inverted Triangle | Apple | Athletic
      - skin_tone: descriptive tone (e.g. Fair, Olive, Deep, etc.)
      - face_shape: Oval | Round | Square | Heart | Diamond
      - summary: A short professional summary of the silhouette.`;

      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { 
          parts: [
            { inlineData: { mimeType: 'image/png', data: base64.split(',')[1] || base64 } }, 
            { text: "Extract physical biometric metrics for silhouette calibration." }
          ] 
        },
        config: { systemInstruction, responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) { return {}; }
  }

  async analyzeGarmentDescription(text: string): Promise<any> {
    try {
      const client = this.createClient();
      const systemInstruction = `You are Teola’s Wardrobe Assistant.
      Parse the user's manual garment description and return JSON.
      
      AUTO-CATEGORY RULES:
      Sort into exactly one: [Tops, Bottoms, Shoes, Outerwear, Accessories].
      
      SMART TAGGING RULES:
      Identify tags ONLY from: [Casual, Sporty, Party, Work, Cold weather].
      
      MANUAL ADD FLOW:
      If any of [type, color, style] are missing, list them in "missingDetails".
      Style refers to whether it is Casual, Sporty, Party, Work, or for Cold weather.
      
      Schema:
      {
        "category": "Tops | Bottoms | Shoes | Outerwear | Accessories",
        "type": string,
        "color": string,
        "styleTags": string[],
        "missingDetails": string[],
        "assistantMessage": string
      }`;

      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: { systemInstruction, responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) { return {}; }
  }

  async getStylingAdvice(
    history: Message[], 
    userItems: ClothingItem[], 
    prompt: string, 
    userProfile: UserProfile | null,
    mode: 'wardrobe' | 'market' = 'wardrobe',
    context?: { styleLevel?: string; budgetLevel?: string }
  ): Promise<any> {
    const modePrefix = mode === 'wardrobe' ? 'I will use only the clothes you already have.' : 'I can suggest new clothes you may want to buy.';

    const systemInstruction = `You are Teola, a master AI fashion architect.
    
    PLANNER RESPONSE STRUCTURE:
    Respond in this 7-point order:
    1. Date and day
    2. Event
    3. Outfit (clothes)
    4. Shoes
    5. Accessories
    6. Save confirmation: "Your outfit has been saved for this day."
    7. Notification confirmation: "I will remind you about this outfit."

    MANDATORY MODE PREFIX: Always start your message with: "${modePrefix}"
    
    If the user's request is a normal question, respond conversationally while adhering to the mode prefix. 
    If you provide a structured outfit, also include a JSON block at the end of your response with the 'outfits' array.`;

    try {
      const client = this.createClient();
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model' as any, parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: { systemInstruction, tools: [{ googleSearch: {} }] },
      });
      
      const text = response.text || "";
      let data: any = { text: text };
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          data = { ...data, ...parsed };
        }
      } catch (err) {
        console.warn("Could not parse JSON from stylist response", err);
      }

      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      return { ...data, grounding };
    } catch (e) { 
      console.error("Gemini Error:", e);
      return { text: "Connection to the Maison was interrupted. I am re-calibrating." }; 
    }
  }

  async planSingleDay(
    date: string,
    event: string,
    style: string,
    userItems: ClothingItem[],
    userProfile: UserProfile | null,
    mode: 'wardrobe' | 'market' = 'wardrobe'
  ): Promise<any> {
    const client = this.createClient();
    const systemInstruction = `Return a JSON object for a single planned fashion day.
    Schema:
    {
      "text": "Assistant description",
      "outfits": [{ "id": string, "name": string, "description": string, "items": string[], "occasion": string }]
    }`;
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Plan for ${date}. Event: ${event}. Style: ${style}. Wardrobe: ${JSON.stringify(userItems)}. Mode: ${mode}.`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }

  async architectBatchRotation(startDate: Date, durationWeeks: number, items: ClothingItem[], profile: UserProfile | null, mood: string, isPacking: boolean, mode: 'wardrobe' | 'market' = 'wardrobe'): Promise<any> {
    const client = this.createClient();
    const systemInstruction = `You are a Rotation Architect. Create a wardrobe rotation plan for ${durationWeeks} weeks starting from ${startDate.toDateString()}.
    The user's goal is: ${mood}.
    
    Return JSON schema:
    {
      "plan": {
        "DateString": {
           "event": string,
           "text": string,
           "outfits": [{ "id": string, "name": string, "description": string, "items": string[], "occasion": string }]
        }
      }
    }`;
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Batch plan from ${startDate.toDateString()}. Mood: ${mood}. Items provided: ${JSON.stringify(items)}. Mode: ${mode}.`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }

  async refineRotation(rotation: any, prompt: string, items: ClothingItem[]): Promise<any> {
    const client = this.createClient();
    const systemInstruction = `You are a Rotation Architect. Modify the provided rotation plan based on user feedback.
    The feedback might include shifting days (e.g., "move Monday to Tuesday") or improving specific outfits.
    Maintain the JSON structure. Return updated JSON.`;
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Existing plan: ${JSON.stringify(rotation)}. User request: ${prompt}. Available wardrobe: ${JSON.stringify(items)}.`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }

  async architectDNARefinement(step: number, input: string, profile: UserProfile | null, wardrobe: ClothingItem[]): Promise<any> {
    const client = this.createClient();
    const systemInstruction = `You are Teola's Style Architect. Conduct a high-fidelity DNA calibration.
    Calibration Steps:
    1. Body Geometry (Fit, proportions)
    2. Personality Archetype (Vibe, aesthetic)
    3. Occasion Mapping (Where do they go?)
    4. Palette & Commandment (Colors, do's/don'ts)
    5. Synthesis.
    
    Return JSON with:
    - acknowledgment: A supportive, professional response.
    - partialUpdates: Object with user profile fields.
    - isComplete: boolean.
    - finalSummary: {
        hybridAesthetic: string,
        hybridDescription: string,
        archetypes: string[],
        proportionRules: string[],
        keyRules: { dos: string[], donts: string[] },
        occasionMapping: { work: number, social: number, formal: number }
      }`;

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Step: ${step}. User Input: ${input}. Profile: ${JSON.stringify(profile)}.`,
      config: { systemInstruction, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }

  async analyzeVisualDNA(base64: string, profile: UserProfile | null): Promise<any> {
    const client = this.createClient();
    const systemInstruction = `Analyze this image for Style DNA. Extract aesthetic signatures, color palette, and proportion logic. Return JSON.`;
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { mimeType: 'image/png', data: base64.split(',')[1] || base64 } }, { text: "Visual DNA extraction." }] },
      config: { systemInstruction, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }

  async getDeepWardrobeInsights(wardrobe: ClothingItem[], profile: UserProfile | null): Promise<any[]> {
    const client = this.createClient();
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: "Wardrobe insights.",
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  }

  async generateHighResVisual(description: string, imageConfig: any, userProfile?: UserProfile | null): Promise<string | null> {
    const client = this.createClient();
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: description }] },
      config: { imageConfig },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  }

  async fetchTrendingRunwayLooks(userProfile: UserProfile | null): Promise<TrendReport[]> {
    const client = this.createClient();
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: "Trends.",
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    return JSON.parse(response.text || "[]");
  }

  async generateRunwayVideo(prompt: string): Promise<string | null> {
    const client = this.createClient();
    let operation = await client.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });
    while (!operation.done) {
      await new Promise(r => setTimeout(r, 10000));
      operation = await client.operations.getVideosOperation({ operation: operation });
    }
    const link = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (link) {
      const res = await fetch(`${link}&key=${process.env.API_KEY}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  }
}

export const gemini = new GeminiService();