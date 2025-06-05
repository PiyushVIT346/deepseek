'use client';

import { assets } from '@assets/assets';
import React, { useState } from 'react';
import Image from 'next/image';
import { useAppContext } from 'context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt;
    try {
      e.preventDefault();
      if (!user) return toast.error('Login to send message');
      if (isLoading) return toast.error('Wait for the previous prompt response');
      if (!prompt.trim()) return;

      setIsLoading(true);
      setPrompt('');

      const userPrompt = {
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
      };

      // Optimistically update UI
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );
      setSelectedChat((prev) => ({
        ...(prev || {}),
        messages: [...prev.messages, userPrompt],
      }));

      const { data } = await axios.post('/api/chat/ai', {
        chatId: selectedChat._id,
        prompt,
      });

      if (data.success) {
        const message = data.data.content;
        const messageTokens = message.split(' ');

        let assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        // Append empty assistant message to start animation
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, assistantMessage] }
              : chat
          )
        );
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        // Animate typing word-by-word
        for (let i = 0; i < messageTokens.length; i++) {
          await new Promise((res) => setTimeout(res, 30)); // control speed
          assistantMessage.content = messageTokens.slice(0, i + 1).join(' ');
          setSelectedChat((prev) => {
            const updatedMessages = [...prev.messages.slice(0, -1), assistantMessage];
            return { ...prev, messages: updatedMessages };
          });
        }

        // Final sync with chats
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  messages: [...chat.messages.slice(0, -1), assistantMessage],
                }
              : chat
          )
        );
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={"w-full ${selectedChat?.messages.length > 0  ? 'max-w-3xl':'max-w-2xl'} bg-[#404045] p-4 rounded-3xl mt-4 transition-all"}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white placeholder:text-gray-300"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />
      <div className="flex items-center justify-between mt-2 text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5 w-5" src={assets.deepthink_icon} alt="deepthink" />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5 w-5" src={assets.search_icon} alt="search" />
            Search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 cursor-pointer" src={assets.pin_icon} alt="pin" />
          <button
            type="submit"
            className={`rounded-full p-2 ${
              prompt.trim() ? 'bg-primary' : 'bg-[#71717a]'
            } cursor-pointer transition`}
          >
            <Image
              className="w-3.5 h-auto aspect-square"
              src={prompt.trim() ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="send"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
