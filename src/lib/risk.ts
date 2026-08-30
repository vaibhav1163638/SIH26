/**
 * Disease Risk Prediction Engine.
 * Transparent rule-based scoring system.
 * Structured as a replaceable module — can be swapped with ML model later.
 */

interface RiskInput {
  severity: number;          // 0-100
  temperature: number;       // °C
  humidity: number;           // %
  rainProbability: number;    // 0-100
  growthStage: string;
  previousDiseases: string[];
  currentDisease: string;
}

interface RiskOutput {
  currentRisk: string;       // LOW, MODERATE, HIGH, CRITICAL
  currentScore: number;       // 0-100
  sevenDayRisk: string;
  sevenDayScore: number;
  factors: RiskFactor[];
  recommendation: string;
  recommendationHi: string;
}

interface RiskFactor {
  name: string;
  nameHi: string;
  value: string;
  impact: string;             // LOW, MODERATE, HIGH
  score: number;
  description: string;
  descriptionHi: string;
}

// Growth stage vulnerability multipliers
const GROWTH_STAGE_MULTIPLIER: Record<string, number> = {
  seedling: 1.3,
  vegetative: 1.0,
  flowering: 1.2,
  fruiting: 1.1,
  maturity: 0.9,
  harvest: 0.8,
};

export function calculateDiseaseRisk(input: RiskInput): RiskOutput {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // 1. Disease severity factor (0-30 points)
  const severityScore = Math.min(30, (input.severity / 100) * 30);
  factors.push({
    name: 'Disease Severity',
    nameHi: 'रोग गंभीरता',
    value: `${input.severity}%`,
    impact: severityScore > 20 ? 'HIGH' : severityScore > 10 ? 'MODERATE' : 'LOW',
    score: Math.round(severityScore),
    description: `Current disease severity is ${input.severity}%`,
    descriptionHi: `वर्तमान रोग गंभीरता ${input.severity}% है`,
  });
  totalScore += severityScore;

  // 2. Temperature factor (0-15 points)
  let tempScore = 0;
  if (input.temperature >= 25 && input.temperature <= 35) {
    tempScore = 15; // Optimal fungal growth range
  } else if (input.temperature >= 20 && input.temperature < 25) {
    tempScore = 10;
  } else if (input.temperature > 35) {
    tempScore = 5;
  }
  factors.push({
    name: 'Temperature',
    nameHi: 'तापमान',
    value: `${input.temperature}°C`,
    impact: tempScore > 10 ? 'HIGH' : tempScore > 5 ? 'MODERATE' : 'LOW',
    score: tempScore,
    description: `${input.temperature}°C is ${tempScore > 10 ? 'in the optimal range for fungal pathogens' : 'less favorable for disease spread'}`,
    descriptionHi: `${input.temperature}°C ${tempScore > 10 ? 'कवक रोगजनकों के लिए अनुकूल सीमा में है' : 'रोग फैलने के लिए कम अनुकूल है'}`,
  });
  totalScore += tempScore;

  // 3. Humidity factor (0-20 points)
  let humidityScore = 0;
  if (input.humidity > 80) humidityScore = 20;
  else if (input.humidity > 65) humidityScore = 15;
  else if (input.humidity > 50) humidityScore = 8;
  else humidityScore = 3;
  factors.push({
    name: 'Humidity',
    nameHi: 'आर्द्रता',
    value: `${input.humidity}%`,
    impact: humidityScore > 15 ? 'HIGH' : humidityScore > 8 ? 'MODERATE' : 'LOW',
    score: humidityScore,
    description: `Humidity at ${input.humidity}% ${humidityScore > 15 ? 'strongly favors disease development' : 'has moderate effect on disease risk'}`,
    descriptionHi: `${input.humidity}% आर्द्रता ${humidityScore > 15 ? 'रोग विकास को बहुत बढ़ावा देती है' : 'रोग जोखिम पर मध्यम प्रभाव डालती है'}`,
  });
  totalScore += humidityScore;

  // 4. Rain probability factor (0-20 points)
  let rainScore = 0;
  if (input.rainProbability > 70) rainScore = 20;
  else if (input.rainProbability > 40) rainScore = 12;
  else if (input.rainProbability > 20) rainScore = 5;
  factors.push({
    name: 'Rain Probability',
    nameHi: 'बारिश की संभावना',
    value: `${input.rainProbability}%`,
    impact: rainScore > 15 ? 'HIGH' : rainScore > 8 ? 'MODERATE' : 'LOW',
    score: rainScore,
    description: `${input.rainProbability}% rain probability ${rainScore > 15 ? 'significantly increases moisture-driven disease risk' : 'has limited impact'}`,
    descriptionHi: `${input.rainProbability}% बारिश की संभावना ${rainScore > 15 ? 'नमी-जनित रोग जोखिम को काफी बढ़ाती है' : 'सीमित प्रभाव डालती है'}`,
  });
  totalScore += rainScore;

  // 5. Growth stage factor (0-10 points)
  const stageMultiplier = GROWTH_STAGE_MULTIPLIER[input.growthStage] || 1.0;
  const stageScore = Math.round(10 * (stageMultiplier - 0.8) / 0.5);
  factors.push({
    name: 'Growth Stage',
    nameHi: 'विकास चरण',
    value: input.growthStage,
    impact: stageMultiplier > 1.1 ? 'HIGH' : stageMultiplier > 0.95 ? 'MODERATE' : 'LOW',
    score: Math.max(0, stageScore),
    description: `${input.growthStage} stage has ${stageMultiplier > 1.1 ? 'increased' : 'normal'} disease vulnerability`,
    descriptionHi: `${input.growthStage} चरण में ${stageMultiplier > 1.1 ? 'बढ़ी हुई' : 'सामान्य'} रोग संवेदनशीलता है`,
  });
  totalScore += Math.max(0, stageScore);

  // 6. Disease history factor (0-5 points)
  const historyScore = Math.min(5, input.previousDiseases.length * 2);
  if (input.previousDiseases.length > 0) {
    factors.push({
      name: 'Disease History',
      nameHi: 'रोग इतिहास',
      value: `${input.previousDiseases.length} previous`,
      impact: historyScore > 3 ? 'HIGH' : historyScore > 1 ? 'MODERATE' : 'LOW',
      score: historyScore,
      description: `${input.previousDiseases.length} previous disease(s) on record increase reinfection risk`,
      descriptionHi: `${input.previousDiseases.length} पिछले रोग(ों) का रिकॉर्ड पुन: संक्रमण के जोखिम को बढ़ाता है`,
    });
    totalScore += historyScore;
  }

  // Apply growth stage multiplier
  totalScore = Math.min(100, Math.round(totalScore * stageMultiplier));

  // Current risk level
  const currentRisk = getRiskLevel(totalScore);

  // 7-day projection: add weather trend factor
  const sevenDayBonus = input.rainProbability > 50 ? 15 : input.humidity > 70 ? 10 : 0;
  const sevenDayScore = Math.min(100, totalScore + sevenDayBonus);
  const sevenDayRisk = getRiskLevel(sevenDayScore);

  // Generate recommendation
  const { recommendation, recommendationHi } = generateRecommendation(currentRisk, sevenDayRisk, input);

  return {
    currentRisk,
    currentScore: totalScore,
    sevenDayRisk,
    sevenDayScore,
    factors,
    recommendation,
    recommendationHi,
  };
}

function getRiskLevel(score: number): string {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MODERATE';
  return 'LOW';
}

function generateRecommendation(currentRisk: string, sevenDayRisk: string, input: RiskInput): { recommendation: string; recommendationHi: string } {
  if (currentRisk === 'CRITICAL') {
    return {
      recommendation: 'Immediate action required. Apply treatment as soon as weather permits. Monitor daily. Consult local agricultural extension for guidance.',
      recommendationHi: 'तत्काल कार्रवाई आवश्यक। जैसे ही मौसम अनुमति दे, उपचार लागू करें। दैनिक निगरानी करें। मार्गदर्शन के लिए स्थानीय कृषि विस्तार से परामर्श करें।',
    };
  }
  if (currentRisk === 'HIGH') {
    return {
      recommendation: `Monitor closely and prepare for treatment. ${input.rainProbability > 50 ? 'Wait for rain to pass before applying treatment.' : 'Apply treatment during the next favorable weather window.'}`,
      recommendationHi: `बारीकी से निगरानी करें और उपचार की तैयारी करें। ${input.rainProbability > 50 ? 'उपचार लागू करने से पहले बारिश बंद होने का इंतज़ार करें।' : 'अगली अनुकूल मौसम विंडो में उपचार लागू करें।'}`,
    };
  }
  if (currentRisk === 'MODERATE') {
    return {
      recommendation: 'Continue monitoring every 3-5 days. Follow preventive measures. Upload follow-up scans to track any changes.',
      recommendationHi: 'हर 3-5 दिनों में निगरानी जारी रखें। निवारक उपाय अपनाएं। किसी भी बदलाव को ट्रैक करने के लिए फॉलो-अप स्कैन अपलोड करें।',
    };
  }
  return {
    recommendation: 'Risk is low. Maintain regular monitoring schedule. Continue good agricultural practices.',
    recommendationHi: 'जोखिम कम है। नियमित निगरानी कार्यक्रम बनाए रखें। अच्छी कृषि पद्धतियाँ जारी रखें।',
  };
}

export function calculateTreatmentTiming(weather: {
  forecast: Array<{ date: string; dayName: string; rainProbability: number; humidity: number; windSpeed: number; conditions: string }>;
}): {
  recommended: boolean;
  windowDate: string;
  windowDay: string;
  windowTime: string;
  reason: string;
  reasonHi: string;
  alternatives: Array<{ date: string; day: string; time: string; reason: string }>;
} {
  // Find the best treatment window in the next 5 days
  const windows: Array<{ date: string; day: string; score: number; reason: string; reasonHi: string }> = [];

  for (const day of weather.forecast) {
    let score = 100;
    const reasons: string[] = [];
    const reasonsHi: string[] = [];

    // Rain penalty
    if (day.rainProbability > 60) {
      score -= 50;
      reasons.push('High rain probability');
      reasonsHi.push('बारिश की अधिक संभावना');
    } else if (day.rainProbability > 30) {
      score -= 20;
      reasons.push('Moderate rain chance');
      reasonsHi.push('मध्यम बारिश की संभावना');
    } else {
      reasons.push('Low rain probability');
      reasonsHi.push('बारिश की कम संभावना');
    }

    // Wind penalty
    if (day.windSpeed > 25) {
      score -= 30;
      reasons.push('High winds may cause drift');
      reasonsHi.push('तेज हवा से बहाव हो सकता है');
    } else if (day.windSpeed > 15) {
      score -= 10;
    }

    // Humidity bonus for fungicide effectiveness
    if (day.humidity > 60 && day.humidity < 80) {
      score += 5;
      reasons.push('Good humidity for absorption');
      reasonsHi.push('अवशोषण के लिए अच्छी आर्द्रता');
    }

    windows.push({
      date: day.date,
      day: day.dayName,
      score,
      reason: reasons.join('. '),
      reasonHi: reasonsHi.join('। '),
    });
  }

  // Sort by score (best first)
  windows.sort((a, b) => b.score - a.score);

  const best = windows[0];
  const isRecommended = best && best.score > 50;

  return {
    recommended: isRecommended,
    windowDate: best?.date || '',
    windowDay: best?.day || '',
    windowTime: '5:00 PM – 7:00 PM',
    reason: isRecommended
      ? `${best.reason}. Evening application recommended for better absorption and reduced UV degradation.`
      : 'Current weather conditions are not favorable for treatment application. Wait for better conditions.',
    reasonHi: isRecommended
      ? `${best.reasonHi}। बेहतर अवशोषण और कम UV क्षरण के लिए शाम में आवेदन की सिफारिश की जाती है।`
      : 'वर्तमान मौसम की स्थिति उपचार के लिए अनुकूल नहीं है। बेहतर स्थिति की प्रतीक्षा करें।',
    alternatives: windows.slice(1, 3).map(w => ({
      date: w.date,
      day: w.day,
      time: '5:00 PM – 7:00 PM',
      reason: w.reason,
    })),
  };
}
