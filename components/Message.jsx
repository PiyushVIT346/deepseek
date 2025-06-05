'use client';

import React from 'react';
import Image from 'next/image';
import { assets } from '@assets/assets';
import Markdown from 'react-markdown';
import Prism from 'prismjs';
import { useEffect } from 'react';

const Message = ({ role, content }) => {
  const isUser = role === 'user';
  useEffect(()=>{
    Prism.highlightAll()
  },[content])

  const copyMessage = ()=>{
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={`flex flex-col w-full mb-8 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`group relative flex max-w-2xl py-3 px-5 rounded-xl ${
            isUser ? 'bg-[#414158]' : 'bg-transparent gap-3'
          }`}
        >
          {/* Hover action buttons */}
          <div
            className={`opacity-0 group-hover:opacity-100 absolute transition-all ${
              isUser ? '-left-16 top-2.5' : 'left-9 -bottom-6'
            }`}
          >
            <div className="flex items-center gap-2 opacity-70">
              {isUser ? (
                <>
                  <Image onClick={copyMessage} src={assets.copy_icon} alt="copy" className="w-4 cursor-pointer" />
                  <Image src={assets.pencil_icon} alt="edit" className="w-4.5 cursor-pointer" />
                </> 
              ) : (
                <>
                  <Image onClick={copyMessage} src={assets.copy_icon} alt="copy" className="w-4.5 cursor-pointer" />
                  <Image src={assets.regenerate_icon} alt="regenerate" className="w-4 cursor-pointer" />
                  <Image src={assets.like_icon} alt="like" className="w-4 cursor-pointer" />
                  <Image src={assets.dislike_icon} alt="dislike" className="w-4 cursor-pointer" />
                </>
              )}
            </div>
          </div>

          {/* Message content */}
          {isUser ? (
            <span className="text-white/90">{content}</span>
          ) : (
            <>
              <Image
                src={assets.logo_icon}
                alt="AI bot"
                className="h-9 w-9 p-1 border border-white/15 rounded-full"
              />
              <div className="space-y-4 w-full overflow-scroll text-white/90">
                <Markdown>{content}</Markdown></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
