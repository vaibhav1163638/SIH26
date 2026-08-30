import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface IConversation extends Document {
  farmerId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema<IConversation>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    title: { type: String, required: true, default: 'New Conversation' },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
