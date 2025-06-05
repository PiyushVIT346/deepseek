export const maxDuration = 60;
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@config/db";
import Chat from "@models/Chat";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { userId } = getAuth(req);

        const { chatId, prompt } = await req.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }
        
        await connectDB();
        const data = await Chat.findOne({ userId, _id: chatId });
        
        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now(),
        };
        data.messages.push(userPrompt);

        // Get a model instance
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate content using Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const message = {
            role: "assistant",
            content: text,
            timestamp: Date.now(),
        };
        
        data.messages.push(message);
        await data.save();
        
        return NextResponse.json({ success: true, data: message });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}