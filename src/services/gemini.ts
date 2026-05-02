import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BallPosition {
  type: 'cue' | 'solid' | 'stripe' | '8ball';
  x: number;
  y: number;
}

export interface ShotAnalysis {
  balls: BallPosition[];
  trajectory: {
    cue_x: number;
    cue_y: number;
    target_x: number;
    target_y: number;
    pocket_x: number;
    pocket_y: number;
  };
  explanation: string;
}

export async function analyzeShot(file: File, team: 'stripes' | 'solids'): Promise<ShotAnalysis> {
  const base64Str = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const base64Data = base64Str.split(',')[1];

  const prompt = `You are a professional billiards coach and computer vision expert.
I am playing as the "${team}" team.
Analyze this photo of a pool table and translate the 3D scene into a perfect top-down 2D map.
Assume the table is a perfect 1:2 rectangle oriented vertically.
- X-axis (0-100): 0 is the left long rail, 100 is the right long rail.
- Y-axis (0-200): 0 is the top short rail, 200 is the bottom short rail.
The six pockets are located at exactly: (0,0), (100,0), (0,100), (100,100), (0,200), (100,200).

1. Identify EVERY visible ball on the table and estimate its exact (X,Y) coordinates on this top-down grid. 
   - Label each ball as 'cue', 'solid', 'stripe', or '8ball'.
2. Determine the best, most realistic next shot for the "${team}" team.
3. Provide the trajectory exact coordinates for this specific shot:
   - The cue ball's starting point (cue_x, cue_y)
   - The exact target impact point on the target ball (target_x, target_y)
   - The pocket intended for the target ball (pocket_x, pocket_y).
   Make sure the target ball is one of the "${team}" balls or the 8ball if it is your last shot.
4. Provide a brief expert explanation of the strategy, desired power, and english/spin.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: base64Data } }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          balls: {
            type: Type.ARRAY,
            description: "Array of all visible balls on the table",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Type of ball: 'cue', 'solid', 'stripe', '8ball'" },
                x: { type: Type.NUMBER, description: "X coordinate (0-100)" },
                y: { type: Type.NUMBER, description: "Y coordinate (0-200)" }
              },
              required: ["type", "x", "y"]
            }
          },
          trajectory: {
            type: Type.OBJECT,
            description: "The optimal shot trajectory",
            properties: {
              cue_x: { type: Type.NUMBER, description: "X coordinate (0-100) of cue ball" },
              cue_y: { type: Type.NUMBER, description: "Y coordinate (0-200) of cue ball" },
              target_x: { type: Type.NUMBER, description: "X coordinate (0-100) of target ball" },
              target_y: { type: Type.NUMBER, description: "Y coordinate (0-200) of target ball" },
              pocket_x: { type: Type.NUMBER, description: "X coordinate (0-100) of intended pocket" },
              pocket_y: { type: Type.NUMBER, description: "Y coordinate (0-200) of intended pocket" }
            },
            required: ["cue_x", "cue_y", "target_x", "target_y", "pocket_x", "pocket_y"]
          },
          explanation: { type: Type.STRING, description: "Detailed explanation of the shot" }
        },
        required: ["balls", "trajectory", "explanation"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as ShotAnalysis;
}
