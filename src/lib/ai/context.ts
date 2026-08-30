import { Farmer, IFarmer } from '@/models/Farmer';
import { Farm, IFarm } from '@/models/Farm';
import { getWeather } from '@/lib/weather';

export interface AIContext {
  farmer: {
    name: string;
    language: string;
  };
  farm: {
    locationSet: boolean;
    state?: string;
    district?: string;
    village?: string;
    crop?: string;
    cropVariety?: string;
    farmArea?: number;
    farmAreaUnit?: string;
    cropAge?: number;
    growthStage?: string;
    irrigationMethod?: string;
    soilType?: string;
    plantingDate?: string;
    previousDiseases?: string[];
  };
  weather?: {
    current: any;
    forecast: any;
    error?: string;
  };
}

export async function buildFarmerContext(farmerId: string): Promise<AIContext> {
  const farmer = await Farmer.findById(farmerId).lean() as IFarmer | null;
  const farm = await Farm.findOne({ farmerId }).lean() as IFarm | null;

  if (!farmer) {
    throw new Error('Farmer not found for AI context');
  }

  const context: AIContext = {
    farmer: {
      name: farmer.name || 'Farmer',
      language: farmer.language || 'en',
    },
    farm: {
      locationSet: false,
    }
  };

  if (farm) {
    // Populate farm details from MongoDB
    context.farm.state = farm.location?.state || undefined;
    context.farm.district = farm.location?.district || undefined;
    context.farm.village = farm.location?.village || undefined;
    context.farm.crop = farm.crop || undefined;
    context.farm.cropVariety = farm.cropVariety || undefined;
    context.farm.farmArea = farm.farmArea || undefined;
    context.farm.farmAreaUnit = farm.farmAreaUnit || undefined;
    context.farm.cropAge = farm.cropAge || undefined;
    context.farm.growthStage = farm.growthStage || undefined;
    context.farm.irrigationMethod = farm.irrigationMethod || undefined;
    context.farm.soilType = farm.soilType || undefined;
    context.farm.plantingDate = farm.plantingDate ? new Date(farm.plantingDate).toISOString().split('T')[0] : undefined;
    context.farm.previousDiseases = farm.previousDiseases?.length ? farm.previousDiseases : undefined;

    // GPS coordinates are stored directly on location, NOT on location.coordinates
    const lat = farm.location?.latitude;
    const lng = farm.location?.longitude;

    if (typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
      context.farm.locationSet = true;
      try {
        const weatherData = await getWeather(lat, lng);
        context.weather = {
          current: weatherData.current,
          forecast: weatherData.forecast?.slice(0, 5), // Next ~15 hours of forecast
        };
      } catch (err: any) {
        console.error('[AI CONTEXT WEATHER ERROR]', err?.message || err);
        context.weather = {
          current: null,
          forecast: null,
          error: 'Live weather is temporarily unavailable. Do not invent weather data.',
        };
      }
    }
  }

  return context;
}

export function generateSystemPrompt(context: AIContext): string {
  const langInstruct = context.farmer.language === 'hi'
    ? 'You MUST respond entirely in simple Hindi (Devanagari script). Use easily understood agricultural terminology. Do not mix in English unless there is no Hindi equivalent for a technical term.'
    : 'You MUST respond in simple, practical English.';

  let prompt = `You are a helpful, expert Agricultural Copilot assisting a farmer named ${context.farmer.name}.
Your goal is to provide practical, safe, and context-aware agricultural advice.
${langInstruct}

STRICT RULES:
1. NEVER invent, fabricate, or hallucinate weather data. Use ONLY the weather data supplied below. If no weather data is provided, clearly state it is unavailable.
2. NEVER invent farm details. Use ONLY what is provided below.
3. Keep explanations simple and practical. Avoid overly technical jargon.
4. Distinguish facts from suggestions. If diagnosing a disease from a description, clarify it is an estimate.
5. Provide actionable steps. Do not make dangerous chemical pesticide recommendations without appropriate caution. Recommend consulting local agricultural experts for exact dosing.
6. Do not fabricate government schemes, market prices, or regulations. If asked, say you don't have that data currently.
7. When asked about weather, ONLY use the numbers from the WEATHER CONTEXT below. Do not round, change, or invent any values.

FARMER CONTEXT:
- Name: ${context.farmer.name}
- Preferred Language: ${context.farmer.language === 'hi' ? 'Hindi' : 'English'}

FARM CONTEXT:
- Location Set: ${context.farm.locationSet ? 'Yes' : 'No'}
- State: ${context.farm.state || 'Not set'}
- District: ${context.farm.district || 'Not set'}
- Village: ${context.farm.village || 'Not set'}
- Crop: ${context.farm.crop || 'Not set'}
- Variety: ${context.farm.cropVariety || 'Not set'}
- Area: ${context.farm.farmArea ? `${context.farm.farmArea} ${context.farm.farmAreaUnit || 'acres'}` : 'Not set'}
- Crop Age: ${context.farm.cropAge ? `${context.farm.cropAge} days` : 'Not set'}
- Growth Stage: ${context.farm.growthStage || 'Not set'}
- Irrigation: ${context.farm.irrigationMethod || 'Not set'}
- Soil Type: ${context.farm.soilType || 'Not set'}
- Planting Date: ${context.farm.plantingDate || 'Not set'}
- Previous Diseases: ${context.farm.previousDiseases?.join(', ') || 'None recorded'}

`;

  if (!context.farm.locationSet) {
    prompt += `WEATHER CONTEXT:\nFarm location (GPS) is not set. Live weather cannot be retrieved. If the farmer asks about weather, inform them they need to update their location in the app settings first.\n`;
  } else if (context.weather?.error) {
    prompt += `WEATHER CONTEXT:\n${context.weather.error}\n`;
  } else if (context.weather?.current) {
    prompt += `WEATHER CONTEXT (LIVE DATA — use these exact values):
- Current Temperature: ${context.weather.current.temperature}°C
- Current Condition: ${context.weather.current.conditions}
- Humidity: ${context.weather.current.humidity}%
- Wind Speed: ${context.weather.current.windSpeed} km/h
- Rain Probability: ${context.weather.current.rainProbability ?? 'N/A'}%
- Forecast: ${JSON.stringify(context.weather.forecast)}
`;
  }

  return prompt;
}
