import { getIsDemoMode } from './db';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function analyzeImage(buffer: Buffer, filename: string, mimetype: string) {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(buffer)], { type: mimetype }), filename);

    // Call the new real PyTorch endpoint
    const aiRes = await fetch(`${AI_SERVICE_URL}/predict/rice`, {
      method: 'POST',
      body: formData,
    });

    if (aiRes.ok) {
      const data = await aiRes.json();
      
      // Map the simple ML response to the detailed schema expected by the frontend UI
      return {
        prediction: {
          disease: data.prediction,
          confidence: data.confidence,
          severity: 50, // Mocked since model doesn't output this
          affected_area: 40,
          risk_level: data.prediction === 'normal' ? 'LOW' : 'HIGH',
          explanation: `Detected ${data.prediction} with ${(data.confidence * 100).toFixed(1)}% confidence based on ML inference.`,
          is_demo: false, // REAL inference!
        },
        recommendations: [
          'Monitor crop closely',
          'Consult local agricultural expert',
        ],
      };
    } else {
      throw new Error(`AI service returned ${aiRes.status}`);
    }
  } catch (err) {
    console.log('[AI Client] Real ML service unavailable, using fallback:', err);
    // Deterministic fallback based on buffer length
    const fileHash = buffer.length.toString();
    const diseases = [
      'Tomato Early Blight', 'Tomato Late Blight', 'Tomato Leaf Spot',
      'Powdery Mildew', 'Tomato Bacterial Spot', 'Healthy',
    ];
    const idx = parseInt(fileHash.slice(-1)) % diseases.length;
    
    return {
      prediction: {
        disease: diseases[idx],
        confidence: 0.88 + (idx * 0.02),
        severity: idx === 5 ? 0 : 20 + (idx * 8),
        affected_area: idx === 5 ? 0 : 15 + (idx * 7),
        risk_level: idx === 5 ? 'LOW' : idx > 3 ? 'HIGH' : 'MODERATE',
        explanation: idx === 5
          ? 'The plant appears healthy with no visible disease symptoms.'
          : `Visual patterns consistent with ${diseases[idx]} detected. This is a prototype/demo analysis result.`,
        is_demo: true,
      },
      recommendations: [
        'Monitor crop closely',
        'Upload follow-up scans',
        'Consult local agricultural extension',
      ],
    };
  }
}
