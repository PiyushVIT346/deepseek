import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { assets } from '@assets/assets';
import { useClerk, UserButton } from '@clerk/nextjs';
import { useAppContext } from 'context/AppContext';
import ChatLabel from './ChatLabel';

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user, chats, createNewChat } = useAppContext();
  const [openMenu, setOpenMenu] = useState({ id: 0, open: false });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu.open) {
        // Check if click is outside any chat menu
        const isInsideMenu = event.target.closest('.relative') && 
                            event.target.closest('.relative').querySelector('[class*="absolute"]');
        
        if (!isInsideMenu) {
          console.log('Clicking outside menu, closing...');
          setOpenMenu({ id: 0, open: false });
        }
      }
    };

    if (openMenu.open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu.open]);

  return (
    <div className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-md:h-screen ${expand ? 'p-4 w-64' : 'md:w-20 w-0 max-md:overflow-hidden'}`}>
      
      <div>
        {/* Logo and Toggle Button */}
        <div className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}>
          <Image className={expand ? "w-36" : "w-10"} src={expand ? assets.logo_text : assets.logo_icon} alt="logo" />
          <div
            onClick={() => setExpand(!expand)}
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer"
          >
            <Image src={assets.menu_icon} alt="menu" className="md:hidden" />
            <Image src={expand ? assets.sidebar_close_icon : assets.sidebar_icon} alt="sidebar toggle" className="hidden md:block w-7" />
            <div className={`absolute w-max ${expand ? "left-1/2 -translate-x-1/2 top-12" : "top-12 left-0"} opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}>
              {expand ? "Close Sidebar" : "Open Sidebar"}
              <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? "left-1/2 -top-1.5 -translate-x-1/2" : "left-4 -bottom-1.5"}`}></div>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className={`mt-8 flex items-center justify-center cursor-pointer ${expand ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max" : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"}`}
        >
          <Image className={expand ? 'w-6' : 'w-7'} src={expand ? assets.chat_icon : assets.chat_icon_dull} alt="chat icon" />
          {!expand && (
            <div className="absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
              New Chat
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
            </div>
          )}
          {expand && <p className="text-white font-medium">New Chat</p>}
        </button>

        {/* Recents */}
        <div className={`mt-8 text-white/25 text-sm ${expand ? "block" : "hidden"}`}>
          <p className="my-1">Recents</p>
          {chats.map((chat, index) => (
            <ChatLabel 
              key={chat._id || index} 
              name={chat.name} 
              id={chat._id} 
              openMenu={openMenu} 
              setOpenMenu={setOpenMenu} 
            />
          ))}
        </div>
      </div>

      {/* Get App (QR Code) */}
      <div className={`flex items-center cursor-pointer group relative ${expand ? "gap-1 text-white/80 text-sm p-2.5 border border-primary rounded-lg hover:bg-white/10" : "h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg"}`}>
        <Image className={expand ? "w-5" : "w-6.5 mx-auto"} src={expand ? assets.phone_icon : assets.phone_icon_dull} alt="phone icon" />
        
        {/* QR Tooltip */}
        <div className={`absolute z-10 pb-8 ${!expand ? "-right-40" : "right-1/2 translate-x-1/2"} -top-60 opacity-0 group-hover:opacity-100 group-hover:block transition hidden`}>
          <div className="relative w-max bg-black text-white text-sm p-3 rounded-lg shadow-lg">
            <Image src={assets.qrcode} alt="QR code" className="w-44" />
            <p className="mt-1 text-center">Scan to get DeepSeek App</p>
            <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? "right-1/2 translate-x-1/2" : "left-4"} -bottom-1.5`}></div>
          </div>
        </div>

        {expand && (
          <>
            <span>Get App</span>
            <Image src={assets.new_icon} alt="new" />
          </>
        )}
      </div>

      {/* Profile Button */}
      <div onClick={!user ? openSignIn : null} className={`flex items-center ${expand ? 'hover:bg-white/10 rounded-lg' : 'justify-center w-full'} gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}>
        {user ? <UserButton /> : <Image src={assets.profile_icon} alt="profile" className="w-7" />}
        {expand && <span>My Profile</span>}
      </div>
    </div>
  );
};

export default Sidebar;