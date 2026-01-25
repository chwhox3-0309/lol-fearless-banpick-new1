'use client';

import { createContext, useState, ReactNode, useContext } from 'react';
import { Track } from '@/lib/music-api';
import { arrayMove } from '@dnd-kit/sortable';

interface PlaylistContextType {
  playlist: Track[];
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  reorderPlaylist: (activeId: string, overId: string) => void;
}

const JPopPlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const JPopPlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);

  const addTrack = (track: Track) => {
    // Prevent adding duplicate tracks
    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist(prev => [...prev, track]);
    }
  };

  const removeTrack = (trackId: string) => {
    setPlaylist(prev => prev.filter(t => t.id !== trackId));
  };
  
  const reorderPlaylist = (activeId: string, overId: string) => {
    setPlaylist((items) => {
      const oldIndex = items.findIndex(item => item.id === activeId);
      const newIndex = items.findIndex(item => item.id === overId);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  return (
    <JPopPlaylistContext.Provider value={{ playlist, addTrack, removeTrack, reorderPlaylist }}>
      {children}
    </JPopPlaylistContext.Provider>
  );
};

export const useJPopPlaylist = () => {
  const context = useContext(JPopPlaylistContext);
  if (context === undefined) {
    throw new Error('useJPopPlaylist must be used within a JPopPlaylistProvider');
  }
  return context;
};
