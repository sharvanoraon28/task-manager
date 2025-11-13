
import { GoogleGenAI, Type } from '@google/genai';

// Assume process.env.API_KEY is available
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // maybe by disabling the AI features.
  console.warn("API_KEY environment variable is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const breakDownTask = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  if (!API_KEY) {
    return ["AI features are disabled. Please configure your API key."];
  }

  try {
    const prompt = `
      As an expert academic planner, break down the following student task into a series of smaller, manageable sub-tasks.
      Task Title: "${taskTitle}"
      Task Description: "${taskDescription}"

      Provide a list of concise, actionable steps a student should take to complete this task.
      Return the response as a JSON array of strings. For example: ["Research topic", "Create outline", "Write first draft"].
      Do not include any other text, explanations, or markdown formatting outside of the JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: 'A single, actionable sub-task.'
          }
        }
      }
    });

    const jsonString = response.text.trim();
    const subTasks = JSON.parse(jsonString);

    if (!Array.isArray(subTasks) || !subTasks.every(item => typeof item === 'string')) {
       throw new Error("AI response is not a valid array of strings.");
    }
    
    return subTasks;

  } catch (error) {
    console.error("Error breaking down task with Gemini:", error);
    return ["Failed to break down task with AI. Please check your connection or API key."];
  }
};
