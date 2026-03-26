import OpenAI from 'openai';
import { SystemSettings } from '../models/SystemSettings.model';

export class AIService {
  private openai: OpenAI | null = null;

  async initialize() {
    const settings = await SystemSettings.findOne();
    if (settings?.aiToken) {
      this.openai = new OpenAI({
        apiKey: settings.aiToken
      });
    }
  }

  async searchRooms(userQuery: string, availableRooms: any[]) {
    if (!this.openai) {
      await this.initialize();
    }

    if (!this.openai) {
      throw new Error('AI Token not configured');
    }

    const roomsData = availableRooms.map(room => ({
      id: room._id,
      number: room.roomNumber,
      type: room.category?.name || 'Standard',
      price: room.pricePerNight,
      capacity: room.capacity,
      amenities: room.amenities || [],
      description: room.description || ''
    }));

    const prompt = `You are a hotel assistant. Based on the user's request, find the most suitable rooms.

User Request: "${userQuery}"

Available Rooms:
${JSON.stringify(roomsData, null, 2)}

Instructions:
1. Analyze the user's requirements (amenities, price range, capacity, etc.)
2. Match rooms based on amenities and features
3. Return ONLY a JSON array of room IDs in order of relevance
4. Format: ["roomId1", "roomId2", "roomId3"]
5. Return maximum 5 rooms
6. If no rooms match, return empty array []

Return ONLY the JSON array, no explanations.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful hotel assistant. Return only JSON arrays.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || '[]';
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const roomIds = JSON.parse(cleanResponse);

      // Filter and return matched rooms in order
      return roomIds
        .map((id: string) => availableRooms.find(r => r._id.toString() === id))
        .filter((r: any) => r !== undefined);
    } catch (error) {
      console.error('AI Search Error:', error);
      throw new Error('AI search failed');
    }
  }

  async generateResponse(userMessage: string, context?: string) {
    if (!this.openai) {
      await this.initialize();
    }

    if (!this.openai) {
      throw new Error('AI Token not configured');
    }

    try {
      const systemPrompt = context 
        ? `You are a helpful hotel assistant. Context: ${context}`
        : 'You are a helpful hotel assistant.';

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('AI Response Error:', error);
      throw new Error('AI response generation failed');
    }
  }
}

export const aiService = new AIService();
