import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { sentenceText } = await req.json();
    if (!sentenceText) {
      return NextResponse.json({ error: "sentenceText is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are an expert Old English historical linguist. Analyze the following sentence: "${sentenceText}". Split it into words/tokens and provide detailed linguistic analysis for each word (lemma, part of speech, morphemes split, Leipzig gloss, inflectional features case/number/gender/tense/mood/person, modern English definition, and IPA phonetic spelling if possible).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalWord: { type: Type.STRING },
                  analysis: {
                    type: Type.OBJECT,
                    properties: {
                      lemma: { type: Type.STRING },
                      partOfSpeech: {
                        type: Type.STRING,
                        enum: [
                          "adjective",
                          "adverb",
                          "noun",
                          "verb",
                          "pronoun",
                          "determiner",
                          "preposition",
                          "conjunction",
                        ],
                      },
                      phonetic: { type: Type.STRING },
                      morphemes: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            form: { type: Type.STRING },
                            gloss: { type: Type.STRING },
                          },
                          required: ["form", "gloss"],
                        },
                      },
                      features: {
                        type: Type.OBJECT,
                        properties: {
                          case: { type: Type.STRING, enum: ["nominative", "accusative", "genitive", "dative"] },
                          number: { type: Type.STRING, enum: ["singular", "plural"] },
                          gender: { type: Type.STRING, enum: ["masculine", "feminine", "neuter"] },
                          tense: { type: Type.STRING, enum: ["present", "past"] },
                          mood: { type: Type.STRING, enum: ["indicative", "subjunctive", "imperative", "infinitive"] },
                        },
                      },
                      definition: { type: Type.STRING },
                    },
                    required: ["lemma", "partOfSpeech", "definition", "morphemes", "features"],
                  },
                },
                required: ["originalWord", "analysis"],
              },
            },
          },
          required: ["words"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Failed to analyze";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
