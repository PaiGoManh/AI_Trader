"use client";
import React from 'react';
import { 
  History, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Calendar,
  ChevronRight 
} from 'lucide-react';
import { ChatSession } from '../types/chat';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  isOpen,
  onToggle
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateTitle = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getSessionTitle = (session: ChatSession) => {
    const firstUserMessage = session.messages.find(msg => msg.role === 'user');
    return firstUserMessage 
      ? truncateTitle(firstUserMessage.content) 
      : 'New Chat';
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.updatedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 h-screen ml-[-2%] mt-[-2%] bg-[#0b0d12] border border-gray-700
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Chat History</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewSession}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date} className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {formatDate(new Date(date))}
              </div>
              {dateSessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    flex items-center justify-between px-3 py-2 mx-3 rounded-full pl-7 cursor-pointer
                    transition-colors group
                    ${currentSessionId === session.id 
                      ? 'bg-[#0b0d12] border border-blue-500/30' 
                      : 'hover:bg-gray-800'
                    }
                  `}
                  onClick={() => onSessionSelect(session.id)}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <MessageSquare className={`
                      w-4 h-4 flex-shrink-0
                      ${currentSessionId === session.id ? 'text-blue-400' : 'text-gray-400'}
                    `} />
                    <div className="min-w-0 flex-1">
                      <p className={`
                        text-sm font-medium truncate
                        ${currentSessionId === session.id ? 'text-white' : 'text-gray-200'}
                      `}>
                        {getSessionTitle(session)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.messages.length} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-500">
                      {new Date(session.updatedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <History className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-center text-sm">
                No chat history yet. Start a conversation to see it here!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{sessions.length} chats</span>
            <span>AI Trading Agent</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar;