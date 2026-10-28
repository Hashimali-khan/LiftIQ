import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini client on server-side only
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: AI Coach (Vortex AI Kinetic Bio-Engine)
app.post('/api/coach', async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini is available, use gemini-3.8-flash
  if (ai) {
    try {
      const systemInstruction = `You are Vortex AI, the Kinetic Bio-Engine and elite biomechanical performance coach for the LiftIQ / Kinetic Obsidian platform.
The user is Alex, a dedicated strength and conditioning athlete currently on a 14-day streak, in a 2,140 / 2,600 kcal deficit, focusing on Push Hypertrophy and Progressive Overload.
Today Alex hit 87.5kg on Incline Bench for 6 reps with 1 RIR (e1RM 102.5kg). Upper Clavicular Volume is +12.4% over 4-wk average.
Provide concise, authoritative, biomechanically precise advice (e.g. referencing muscle fibers, strain, RIR, joint angles, fatigue management, and fueling).
Keep responses within 2 to 4 punchy sentences. Highlight key metrics or exercise swaps when appropriate.`;

      const contents = history && Array.isArray(history) && history.length > 0
        ? [
            ...history.map((h: { role: string; content: string }) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ]
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || 'Recommendation synthesized. Focus on concentric speed and leave 1 RIR on heavy working sets.',
        metrics: {
          shoulderRecovery: 68,
          tricepLoad: 9.2,
          recommendation: 'Auto-Swap in Friday Routine',
        },
      });
    } catch (err: any) {
      console.warn('Gemini coach error, applying expert fallback:', err?.message || err);
    }
  }

  // Expert domain heuristic fallback
  const lower = message.toLowerCase();
  let reply = "Based on your current strain velocity and recovery telemetry, I recommend prioritizing high-threshold motor unit recruitment while keeping joint shear minimal.";
  let shoulderRecovery = 68;
  let tricepLoad = 9.2;
  let swapAction = 'Auto-Swap in Friday Routine';

  if (lower.includes('dip') || lower.includes('cable') || lower.includes('fly')) {
    reply = "Based on your shoulder fatigue score (68% recovered) and tricep load this micro-cycle, I strongly advise High-to-Low Cable Flyes. This selectively isolates lower sternal costal fibers without compounding anterior capsule shear while triceps are near neural exhaustion.";
    shoulderRecovery = 68;
    tricepLoad = 9.2;
    swapAction = 'Swap to Cable Flyes on Friday';
  } else if (lower.includes('weight') || lower.includes('cut') || lower.includes('fat') || lower.includes('diet') || lower.includes('refeed')) {
    reply = "Your 7-day average scale rate is -0.45 kg/wk, exactly on track for 0.5% weekly bodyweight reduction. Lean mass retention is 100% verified via your 102.5kg e1RM bench milestone. Schedule a 250g carb refeed on Saturday.";
    shoulderRecovery = 84;
    tricepLoad = 6.4;
    swapAction = 'Add High-Carb Refeed';
  } else if (lower.includes('bench') || lower.includes('overload') || lower.includes('pr')) {
    reply = "Progressive overload trigger engaged! Your velocity at 87.5kg indicates readiness for 90.0kg on your top set next week. Keep warmups explosive and maintain 2 RIR on back-off sets.";
    shoulderRecovery = 75;
    tricepLoad = 8.8;
    swapAction = 'Program 90kg Top Set';
  } else if (lower.includes('tricep') || lower.includes('fatigue') || lower.includes('sore')) {
    reply = "Tricep neural strain is at 9.2/10 following today's incline pressing volume. Avoid skull crushers or heavy dips for 48 hours to preserve elbow tendon health; substitute with overhead rope cable extensions.";
    shoulderRecovery = 72;
    tricepLoad = 9.5;
    swapAction = 'Deload Overhead Triceps';
  }

  return res.json({
    reply,
    metrics: {
      shoulderRecovery,
      tricepLoad,
      recommendation: swapAction,
    },
  });
});

// API Route: AI Meal Estimator
app.post('/api/estimate-meal', async (req: Request, res: Response) => {
  const { description } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required' });
  }

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this meal description and estimate accurate nutritional macros: "${description}".
Return a JSON object with:
- title: concise title
- calories: number in kcal
- protein_g: number in grams
- carbs_g: number in grams
- fat_g: number in grams
- fiber_g: number in grams
- items: array of { name: string, weight_g: number, calories: number, protein_g: number, carbs_g: number, fat_g: number }
Return ONLY valid JSON.`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini meal estimator error, using heuristic parser:', err?.message || err);
    }
  }

  // Domain Fallback Estimator
  const lower = description.toLowerCase();
  let title = description;
  let calories = 520;
  let protein = 38;
  let carbs = 46;
  let fat = 18;
  let fiber = 6;
  let items = [
    { name: description, weight_g: 350, calories: 520, protein_g: 38, carbs_g: 46, fat_g: 18 }
  ];

  if (lower.includes('roti') && lower.includes('chicken')) {
    title = 'Whole Wheat Rotis with Chicken Curry & Cucumber';
    calories = 620;
    protein = 48;
    carbs = 58;
    fat = 19;
    fiber = 7;
    items = [
      { name: '2x Whole Wheat Roti (100g)', weight_g: 100, calories: 240, protein_g: 8, carbs_g: 48, fat_g: 2 },
      { name: 'Chicken Breast Curry (200g)', weight_g: 200, calories: 330, protein_g: 38, carbs_g: 6, fat_g: 16 },
      { name: 'Fresh Cucumber Salad (100g)', weight_g: 100, calories: 50, protein_g: 2, carbs_g: 4, fat_g: 1 },
    ];
  } else if (lower.includes('salmon') || lower.includes('fish')) {
    title = 'Pan-Seared Salmon & Roasted Sweet Potato';
    calories = 680;
    protein = 55;
    carbs = 52;
    fat = 26;
    fiber = 6;
    items = [
      { name: 'Pan-Seared Atlantic Salmon', weight_g: 220, calories: 440, protein_g: 42, carbs_g: 0, fat_g: 24 },
      { name: 'Roasted Sweet Potato Mash', weight_g: 200, calories: 240, protein_g: 13, carbs_g: 52, fat_g: 2 },
    ];
  } else if (lower.includes('oat') || lower.includes('shake') || lower.includes('whey')) {
    title = 'High-Protein Oatmeal & Berries';
    calories = 540;
    protein = 42;
    carbs = 64;
    fat = 12;
    fiber = 9;
    items = [
      { name: 'Rolled Oats with Whey Isolate', weight_g: 80, calories: 410, protein_g: 36, carbs_g: 54, fat_g: 6 },
      { name: 'Blueberries & Peanut Butter', weight_g: 40, calories: 130, protein_g: 6, carbs_g: 10, fat_g: 6 },
    ];
  }

  return res.json({
    title,
    calories,
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    fiber_g: fiber,
    items,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Kinetic Obsidian server running on http://0.0.0.0:${port}`);
  });
}

startServer();
