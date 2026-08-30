import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Conversation } from '@/models/Conversation';
import { buildFarmerContext, generateSystemPrompt } from '@/lib/ai/context';
import { generateOpenRouterResponse } from '@/lib/ai/openrouter';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, conversationId, imageBase64 } = body;

    if (!message && !imageBase64) {
      return NextResponse.json({ success: false, error: 'Message or image is required' }, { status: 400 });
    }

    await connectDB();

    // 1. Build context
    const aiContext = await buildFarmerContext(user._id);
    const systemPrompt = generateSystemPrompt(aiContext);

    // 2. Fetch or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, farmerId: user._id });
      if (!conversation) {
        return NextResponse.json({ success: false, error: 'Conversation not found or unauthorized' }, { status: 404 });
      }
    } else {
      conversation = new Conversation({
        farmerId: user._id,
        title: message ? message.substring(0, 30) + (message.length > 30 ? '...' : '') : 'Visual Diagnosis',
        messages: [],
      });
    }

    // 3. Prepare message payload for OpenRouter
    const openRouterMessages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add previous history
    for (const msg of conversation.messages) {
      openRouterMessages.push({ role: msg.role, content: msg.content });
    }

    // Add new user message
    let userContent: any = message || '';
    if (imageBase64) {
      userContent = [
        { type: "text", text: message || "Analyze this crop image." },
        { type: "image_url", image_url: { url: imageBase64 } }
      ];
    }

    openRouterMessages.push({ role: 'user', content: userContent });

    // 4. Call OpenRouter
    const { content: assistantReplyText, model: assistantModel, usedFallback } = await generateOpenRouterResponse(openRouterMessages);

    // 5. Save to MongoDB
    conversation.messages.push({
      role: 'user',
      content: typeof userContent === 'string' ? userContent : JSON.stringify({ text: message, hasImage: true }),
    });

    conversation.messages.push({
      role: 'assistant',
      content: assistantReplyText,
    });

    await conversation.save();

    return NextResponse.json({
      success: true,
      message: assistantReplyText,
      conversationId: conversation._id,
    });

  } catch (err: any) {
    console.error('[ASSISTANT ERROR]', err);
    const userMessage = err.message?.includes('temporarily busy')
      ? 'AI service is temporarily busy (rate limited). Please wait a moment and try again.'
      : err.message?.includes('OPENROUTER_API_KEY')
        ? 'AI service is not configured. Please contact the administrator.'
        : 'Assistant service error. Please try again.';
    return NextResponse.json({ success: false, error: userMessage }, { status: 500 });
  }
}
