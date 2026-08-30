import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, language } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = generateAssistantResponse(message, language || 'en');
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: 'Assistant service error' }, { status: 500 });
  }
}

function generateAssistantResponse(message: string, language: string): {
  reply: string;
  replyHi: string;
  suggestions: string[];
  suggestionsHi: string[];
} {
  const lower = message.toLowerCase();

  if (lower.includes('blight') || lower.includes('ब्लाइट') || lower.includes('दाग') || lower.includes('spot') || lower.includes('disease')) {
    return {
      reply: 'Based on your recent scan, Early Blight was detected. The severity has decreased from 38% to 18% after treatment. Continue monitoring every 5 days and maintain the current treatment protocol. Remove any affected lower leaves and ensure good air circulation around your plants.',
      replyHi: 'आपके हाल के स्कैन के आधार पर, अर्ली ब्लाइट का पता चला। उपचार के बाद गंभीरता 38% से घटकर 18% हो गई। हर 5 दिनों में निगरानी जारी रखें और वर्तमान उपचार प्रोटोकॉल बनाए रखें। प्रभावित निचली पत्तियों को हटाएं और पौधों के चारों ओर अच्छा वायु संचार सुनिश्चित करें।',
      suggestions: ['Show my scan history', 'What treatment should I use?', 'When should I spray?'],
      suggestionsHi: ['मेरा स्कैन इतिहास दिखाएं', 'मुझे कौन सा उपचार करना चाहिए?', 'मुझे कब स्प्रे करना चाहिए?'],
    };
  }

  if (lower.includes('treatment') || lower.includes('spray') || lower.includes('medicine') ||
      lower.includes('उपचार') || lower.includes('दवा') || lower.includes('स्प्रे') || lower.includes('इलाज')) {
    return {
      reply: 'For your current Early Blight situation: Apply neem oil spray as an organic option. For stronger treatment, consult your local agricultural extension for approved fungicide recommendations. Apply treatment during favorable weather — tomorrow evening (5-7 PM) appears suitable with low rain probability. Always follow product label instructions.',
      replyHi: 'आपकी वर्तमान अर्ली ब्लाइट स्थिति के लिए: जैविक विकल्प के रूप में नीम का तेल स्प्रे करें। मजबूत उपचार के लिए, अनुमोदित कवकनाशी सिफारिशों के लिए अपने स्थानीय कृषि विस्तार से परामर्श करें। अनुकूल मौसम में उपचार लागू करें — कल शाम (5-7 PM) कम बारिश की संभावना के साथ उपयुक्त दिखता है। हमेशा उत्पाद लेबल निर्देशों का पालन करें।',
      suggestions: ['Best time to spray?', 'Organic treatment options', 'Show weather forecast'],
      suggestionsHi: ['स्प्रे करने का सबसे अच्छा समय?', 'जैविक उपचार विकल्प', 'मौसम पूर्वानुमान दिखाएं'],
    };
  }

  if (lower.includes('weather') || lower.includes('rain') || lower.includes('मौसम') || lower.includes('बारिश')) {
    return {
      reply: 'Current conditions: 31°C with 68% humidity and 25% rain probability. Rain is expected in 2-3 days with heavy rainfall (80% probability). I recommend applying any planned treatment tomorrow before the rain arrives. After the rain, ensure proper drainage to prevent waterlogging.',
      replyHi: 'वर्तमान स्थिति: 31°C, 68% आर्द्रता और 25% बारिश की संभावना। 2-3 दिनों में भारी बारिश (80% संभावना) अपेक्षित है। मैं बारिश आने से पहले कल किसी भी नियोजित उपचार को लागू करने की सिफारिश करता हूं। बारिश के बाद, जलभराव को रोकने के लिए उचित जल निकासी सुनिश्चित करें।',
      suggestions: ['5-day forecast', 'Can I spray today?', 'Disease risk from rain'],
      suggestionsHi: ['5 दिन का पूर्वानुमान', 'क्या मैं आज स्प्रे कर सकता हूं?', 'बारिश से रोग का खतरा'],
    };
  }

  if (lower.includes('tomato') || lower.includes('टमाटर')) {
    return {
      reply: 'Your Pusa Ruby tomato crop is 47 days old, currently in the flowering stage. The latest health score is 72/100 with Early Blight detected at 18% severity (improving). Continue monitoring and follow the treatment schedule. The crop is at a critical growth stage — maintain proper nutrition and pest management.',
      replyHi: 'आपकी पूसा रूबी टमाटर की फसल 47 दिन पुरानी है, वर्तमान में फूल आने के चरण में है। नवीनतम स्वास्थ्य स्कोर 72/100 है, 18% गंभीरता पर अर्ली ब्लाइट पाया गया (सुधार हो रहा है)। निगरानी जारी रखें और उपचार कार्यक्रम का पालन करें।',
      suggestions: ['Scan my crop now', 'Show health timeline', 'When to harvest?'],
      suggestionsHi: ['अभी मेरी फसल स्कैन करें', 'स्वास्थ्य टाइमलाइन दिखाएं', 'कब तुड़ाई करें?'],
    };
  }

  return {
    reply: 'Hello! I\'m your AI crop health assistant. I can help you with: disease diagnosis, treatment recommendations, weather conditions, crop scanning, and monitoring your farm health. What would you like to know?',
    replyHi: 'नमस्ते! मैं आपका AI फसल स्वास्थ्य सहायक हूं। मैं आपकी मदद कर सकता हूं: रोग निदान, उपचार सिफारिशें, मौसम की स्थिति, फसल स्कैनिंग, और आपके खेत के स्वास्थ्य की निगरानी। आप क्या जानना चाहेंगे?',
    suggestions: ['Scan my crop', 'Check weather', 'Show disease risk', 'My farm profile'],
    suggestionsHi: ['मेरी फसल स्कैन करें', 'मौसम जांचें', 'रोग जोखिम दिखाएं', 'मेरी खेत प्रोफ़ाइल'],
  };
}
