/**
 * Weather service.
 * Uses OpenWeather API if key is available, otherwise returns demo data.
 */

interface WeatherResponse {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    conditions: string;
    icon: string;
    rainProbability: number;
    uvIndex: number;
    pressure: number;
    visibility: number;
  };
  forecast: Array<{
    date: string;
    dayName: string;
    high: number;
    low: number;
    humidity: number;
    rainProbability: number;
    conditions: string;
    icon: string;
    windSpeed: number;
  }>;
  weatherRisk: {
    level: string;
    score: number;
    reasoning: string;
    reasoningHi: string;
  };
  isDemo: boolean;
}

function calculateWeatherRisk(current: { humidity: number; temperature: number; rainProbability: number }): {
  level: string;
  score: number;
  reasoning: string;
  reasoningHi: string;
} {
  let score = 0;
  const reasons: string[] = [];
  const reasonsHi: string[] = [];

  // Humidity factor
  if (current.humidity > 80) {
    score += 30;
    reasons.push(`Very high humidity (${current.humidity}%) greatly increases fungal risk`);
    reasonsHi.push(`बहुत अधिक आर्द्रता (${current.humidity}%) कवक रोग के खतरे को बहुत बढ़ाती है`);
  } else if (current.humidity > 65) {
    score += 20;
    reasons.push(`High humidity (${current.humidity}%) increases disease risk`);
    reasonsHi.push(`उच्च आर्द्रता (${current.humidity}%) रोग के खतरे को बढ़ाती है`);
  }

  // Temperature factor
  if (current.temperature >= 25 && current.temperature <= 35) {
    score += 15;
    reasons.push(`Temperature (${current.temperature}°C) is in the optimal range for fungal growth`);
    reasonsHi.push(`तापमान (${current.temperature}°C) कवक वृद्धि के लिए अनुकूल सीमा में है`);
  }

  // Rain factor
  if (current.rainProbability > 60) {
    score += 25;
    reasons.push(`High rain probability (${current.rainProbability}%) creates moist conditions for disease spread`);
    reasonsHi.push(`बारिश की अधिक संभावना (${current.rainProbability}%) रोग फैलने के लिए नम स्थिति बनाती है`);
  } else if (current.rainProbability > 30) {
    score += 10;
    reasons.push(`Moderate rain expected`);
    reasonsHi.push(`मध्यम बारिश अपेक्षित`);
  }

  let level: string;
  if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MODERATE';
  else level = 'LOW';

  return {
    level,
    score: Math.min(score, 100),
    reasoning: reasons.join('. ') + '.',
    reasoningHi: reasonsHi.join('। ') + '।',
  };
}

export async function getWeather(lat: number, lng: number): Promise<WeatherResponse> {
  console.log("========================================");
  console.log("[WEATHER SERVICE] RECEIVED COORDINATES");
  console.log("[WEATHER SERVICE] latitude:", lat);
  console.log("[WEATHER SERVICE] longitude:", lng);
  console.log("========================================");

  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    throw new Error("Invalid weather coordinates");
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey) {
    try {
      console.log('[WEATHER] requesting live weather API');
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);
      console.log('[WEATHER] weather API HTTP status:', res.status);

      if (res.ok) {
        console.log('[WEATHER] live weather API response received');
        const data = await res.json() as Record<string, unknown>;
        // Parse OpenWeather response
        return parseOpenWeatherResponse(data);
      }
    } catch (err) {
      console.log('[WEATHER] API call failed:', err);
      throw err;
    }
  }

  throw new Error('Failed to fetch weather data');
}

function parseOpenWeatherResponse(data: Record<string, unknown>): WeatherResponse {
  try {
    const list = (data.list as Array<Record<string, unknown>>) || [];
    const first = list[0] || {};
    const main = (first.main as Record<string, number>) || {};
    const weatherArr = (first.weather as Array<Record<string, string>>) || [];
    const weather = weatherArr[0] || {};
    const wind = (first.wind as Record<string, number>) || {};

    if (main.temp === undefined || main.humidity === undefined) {
      throw new Error('Malformed OpenWeather response: missing core metrics');
    }

    const current = {
      temperature: Math.round(main.temp),
      feelsLike: Math.round(main.feels_like ?? main.temp),
      humidity: main.humidity,
      windSpeed: Math.round((wind.speed || 0) * 3.6),
      windDirection: getWindDirection(wind.deg || 0),
      conditions: weather.description || 'Not available',
      icon: weather.icon || '01d',
      rainProbability: Math.round(((first.pop as number) || 0) * 100),
      uvIndex: 0,
      pressure: main.pressure || 0,
      visibility: Math.round(((first.visibility as number) || 0) / 1000),
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyMap = new Map<string, { temps: number[]; humidities: number[]; pops: number[]; conditions: string; icon: string; winds: number[] }>();

    for (const item of list.slice(0, 40)) {
      const itemMain = (item.main as Record<string, number>) || {};
      const itemWeather = ((item.weather as Array<Record<string, string>>) || [])[0] || {};
      const itemWind = (item.wind as Record<string, number>) || {};
      const dtTxt = (item.dt_txt as string) || '';
      const dateStr = dtTxt.split(' ')[0];

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { temps: [], humidities: [], pops: [], conditions: itemWeather.description || '', icon: itemWeather.icon || '01d', winds: [] });
      }
      const day = dailyMap.get(dateStr)!;
      day.temps.push(itemMain.temp);
      day.humidities.push(itemMain.humidity);
      day.pops.push(((item.pop as number) || 0) * 100);
      day.winds.push((itemWind.speed || 0) * 3.6);
    }

    const forecast = Array.from(dailyMap.entries()).slice(1, 6).map(([dateStr, day]) => {
      const date = new Date(dateStr);
      return {
        date: dateStr,
        dayName: days[date.getDay()],
        high: Math.round(Math.max(...day.temps)),
        low: Math.round(Math.min(...day.temps)),
        humidity: Math.round(day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length),
        rainProbability: Math.round(Math.max(...day.pops)),
        conditions: day.conditions,
        icon: day.icon,
        windSpeed: Math.round(day.winds.reduce((a, b) => a + b, 0) / day.winds.length),
      };
    });

    const weatherRisk = calculateWeatherRisk(current);

    return { current, forecast, weatherRisk, isDemo: false };
  } catch (error) {
    console.error('Weather API Error:', error);
    throw new Error('Failed to fetch weather data from external API');
  }
}

function getWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export { calculateWeatherRisk };
