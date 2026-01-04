
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBattleDialogue = async (fighter1: string, fighter2: string, event: 'start' | 'hit' | 'win') => {
  try {
    const prompt = `Two flimsy, bean-like characters named ${fighter1} and ${fighter2} are in a funny physics-based fight. 
    Generate a short, hilarious piece of dialogue (1 sentence) for the context: ${event}. 
    Make it sound like "Human Fall Flat" meets "Tekken".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 50,
        temperature: 0.9,
      }
    });

    return response.text || "...wobble...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Oof! My jelly bones!";
  }
};

export const generateCharacterBio = async (name: string, color: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a funny, short backstory (2 sentences) for a fighting game character named ${name} who is the color ${color}. 
      They are very flimsy and look like a jelly bean. Include a ridiculous catchphrase.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING },
            catchphrase: { type: Type.STRING }
          },
          required: ["bio", "catchphrase"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    return { 
      bio: "A mysterious blob from the Great Gelatin Sea.",
      catchphrase: "Prepare to be wobbled!"
    };
  }
};
