import connectDB from "@config/db";
import Chat from "@models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req){
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }

        const { chatId } = await req.json();
        await connectDB();

        // Delete the chat by its ID
        await Chat.findOneAndDelete({ _id: chatId, userId });

        return NextResponse.json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}