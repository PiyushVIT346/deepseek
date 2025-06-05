import React from 'react';
import Image from 'next/image';
import { assets } from '@assets/assets';
import { useAppContext } from 'context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const ChatLabel = ({ openMenu, setOpenMenu, id, name }) => {
  const { fetchUserChats, chats, setSelectedChat, setChats } = useAppContext();

  const selectChat = () => {
    const chatData = chats.find((chat) => chat._id === id);
    setSelectedChat(chatData);
    console.log('Selected chat:', chatData);
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Menu clicked for chat:', id);
    
    setOpenMenu({
      id: openMenu.id === id && openMenu.open ? 0 : id,
      open: !(openMenu.id === id && openMenu.open)
    });
  };

  const handleRename = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Rename clicked for chat:', id);
    
    try {
      const newName = prompt("Enter new name:");
      console.log('New name entered:', newName);
      
      if (!newName || newName.trim() === '') {
        console.log('No name provided, cancelling rename');
        return;
      }
      
      const trimmedName = newName.trim();
      
      // Optimistic update - update UI immediately
      const updatedChats = chats.map(chat => 
        chat._id === id ? { ...chat, name: trimmedName } : chat
      );
      setChats(updatedChats);
      setOpenMenu({ id: 0, open: false });
      
      console.log('Sending rename request...');
      const response = await axios.post('/api/chat/rename', { 
        chatId: id, 
        name: trimmedName 
      });
      
      console.log('Rename response:', response.data);
      
      if (response.data.success) {
        toast.success('Chat renamed successfully');
        // Optionally refetch to ensure sync with server
        await fetchUserChats();
      } else {
        // Revert optimistic update on failure
        const revertedChats = chats.map(chat => 
          chat._id === id ? { ...chat, name: name } : chat
        );
        setChats(revertedChats);
        toast.error(response.data.message || 'Failed to rename chat');
      }
    } catch (error) {
      console.error('Rename error:', error);
      // Revert optimistic update on error
      const revertedChats = chats.map(chat => 
        chat._id === id ? { ...chat, name: name } : chat
      );
      setChats(revertedChats);
      toast.error('Failed to rename chat');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Delete clicked for chat:', id);
    
    try {
      const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
      console.log('Delete confirmed:', confirmDelete);
      
      if (!confirmDelete) {
        console.log('Delete cancelled by user');
        return;
      }
      
      // Optimistic update - remove from UI immediately
      const updatedChats = chats.filter(chat => chat._id !== id);
      setChats(updatedChats);
      setOpenMenu({ id: 0, open: false });
      
      console.log('Sending delete request...');
      const response = await axios.post('/api/chat/delete', { chatId: id });
      
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        toast.success('Chat deleted successfully');
        // Optionally refetch to ensure sync with server
        await fetchUserChats();
      } else {
        // Revert optimistic update on failure
        setChats(chats);
        toast.error(response.data.message || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('Delete error:', error);
      // Revert optimistic update on error
      setChats(chats);
      toast.error('Failed to delete chat');
    }
  };

  const isMenuOpen = openMenu.id === id && openMenu.open;

  return (
    <div className='relative'>
      <div
        onClick={selectChat}
        className='flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer'
      >
        <p className='truncate flex-1 mr-2'>{name}</p>
        
        {/* Three dots menu button */}
        <button
          onClick={handleMenuClick}
          className='flex items-center justify-center h-6 w-6 hover:bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity'
          type="button"
        >
          <Image
            src={assets.three_dots}
            alt='Menu'
            className='w-4 h-4'
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className='absolute right-0 top-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-[100] min-w-[120px]'>
          <button
            onClick={handleRename}
            className='flex items-center gap-3 w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-t-lg transition-colors'
            type="button"
          >
            <Image src={assets.pencil_icon} alt='Rename' className='w-4 h-4' />
            <span>Rename</span>
          </button>
          
          <button
            onClick={handleDelete}
            className='flex items-center gap-3 w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-b-lg transition-colors'
            type="button"
          >
            <Image src={assets.delete_icon} alt='Delete' className='w-4 h-4' />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatLabel;