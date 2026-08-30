
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getWeather } from './src/lib/weather';

async function test() {
  console.log('Testing live weather API...');
  console.log('API KEY loaded:', !!process.env.OPENWEATHER_API_KEY);
  
  // Random coordinates for test (not Delhi/Mumbai)
  const lat = 27.1767; // Agra
  const lng = 78.0081;
  
  try {
    const data = await getWeather(lat, lng);
    console.log('\n--- LIVE WEATHER RESULT ---');
    console.log('Temperature:', data.current.temperature);
    console.log('Humidity:', data.current.humidity);
    console.log('Condition:', data.current.conditions);
    console.log('Wind Speed:', data.current.windSpeed);
    console.log('Risk Level:', data.weatherRisk.level);
    console.log('Forecast Days:', data.forecast.length);
    console.log('---------------------------\n');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();

