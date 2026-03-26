import { GoogleGenerativeAI } from '@google/generative-ai';
import { SystemSettings } from '../models/SystemSettings.model';

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  async initialize() {
    // أولاً: جرب من الداتابيز
    const settings = await SystemSettings.findOne();
    const token = settings?.aiToken || process.env.GEMINI_API_KEY;

    if (token) {
      this.genAI = new GoogleGenerativeAI(token);
      console.log('✅ Gemini AI initialized');
    } else {
      console.warn('⚠️ No Gemini API Key found');
    }
  }

  private async getModel() {
    if (!this.genAI) {
      await this.initialize();
    }
    if (!this.genAI) {
      throw new Error('Gemini API Key not configured');
    }
    return this.genAI.getGenerativeModel({ model: process.env.AI_MODEL || 'gemini-1.5-flash' });
  }

  async searchRooms(userQuery: string, availableRooms: any[]) {
    const model = await this.getModel();

    const roomsData = availableRooms.map(room => ({
      id: room._id,
      number: room.roomNumber,
      type: room.categoryId?.name || 'Standard',
      price: room.categoryId?.basePrice || 0,
      capacity: room.categoryId?.capacity || {},
      amenities: room.categoryId?.amenities || [],
      description: room.categoryId?.description || ''
    }));

    const prompt = `أنت مساعد فندق ذكي. بناءً على طلب الضيف، ابحث عن أنسب الغرف.

طلب الضيف: "${userQuery}"

الغرف المتاحة:
${JSON.stringify(roomsData, null, 2)}

التعليمات:
1. حلل متطلبات الضيف (المرافق، السعر، السعة، إلخ)
2. طابق الغرف بناءً على المرافق والمميزات
3. أرجع فقط JSON array من IDs الغرف مرتبة حسب الأنسب
4. الشكل: ["roomId1", "roomId2", "roomId3"]
5. أقصى 5 غرف
6. لو مفيش غرف مناسبة، أرجع []

أرجع فقط الـ JSON array بدون أي شرح.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const roomIds: string[] = JSON.parse(cleanResponse);

      return roomIds
        .map((id: string) => availableRooms.find(r => r._id.toString() === id))
        .filter((r: any) => r !== undefined);
    } catch (error) {
      console.error('Gemini Search Error:', error);
      throw new Error('AI search failed');
    }
  }

  async generateResponse(userMessage: string, context?: string) {
    const model = await this.getModel();

    const systemPrompt = context
      ? `أنت مساعد فندق مفيد. السياق: ${context}\n\n`
      : 'أنت مساعد فندق مفيد.\n\n';

    try {
      const result = await model.generateContent(systemPrompt + userMessage);
      return result.response.text();
    } catch (error) {
      console.error('Gemini Response Error:', error);
      throw new Error('AI response generation failed');
    }
  }
}

export const aiService = new AIService();