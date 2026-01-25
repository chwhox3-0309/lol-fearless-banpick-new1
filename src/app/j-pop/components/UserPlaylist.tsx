// src/app/j-pop/components/UserPlaylist.tsx
'use client';

import { useState } from 'react';
import { useJPopPlaylist } from '../context/JPopPlaylistContext';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Track } from '@/lib/music-api';
import { useSession } from 'next-auth/react';

interface SortableTrackItemProps {
  track: Track;
}

const SortableTrackItem = ({ track }: SortableTrackItemProps) => {
    const { removeTrack } = useJPopPlaylist();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ 
      id: `playlist-track-${track.id}`,
      data: {
        track,
      }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center p-2 mb-2 bg-gray-700 rounded-lg touch-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={track.albumArt} alt={track.album} className="w-12 h-12 mr-3 rounded" />
            <div>
                <p className="font-semibold text-white">{track.name}</p>
                <p className="text-sm text-gray-400">{track.artist}</p>
            </div>
            <button
                onClick={() => removeTrack(track.id)}
                className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
            >
                Remove
            </button>
        </li>
    );
}


const UserPlaylist = () => {
  const { playlist } = useJPopPlaylist();
  const { data: session } = useSession();
  const { setNodeRef, isOver } = useDroppable({
    id: 'playlist-droppable',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleShare = async () => {
    if (!session) {
      alert('Please log in to share a playlist.');
      return;
    }
    if (playlist.length === 0) {
      alert('Your playlist is empty!');
      return;
    }

    setIsLoading(true);
    setFeedback('');

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks: playlist }),
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist.');
      }

      const { playlistId } = await response.json();
      const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setFeedback(`Copied to clipboard: ${shareUrl}`);

    } catch (error) {
      console.error(error);
      setFeedback('Error: Could not share playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  const droppableStyle = {
    backgroundColor: isOver ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div ref={setNodeRef} style={droppableStyle} className="w-1/2 pl-2 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 px-2">My Playlist</h2>
      <div className="p-4 bg-gray-800/80 rounded-lg min-h-[200px]">
        {playlist.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[150px]">
            <p className="text-gray-400 text-center">Drag songs here or use the 'Add' button to create your playlist.</p>
          </div>
        ) : (
          <SortableContext items={playlist.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <ul>
              {playlist.map((track) => (
                <SortableTrackItem key={track.id} track={track} />
              ))}
            </ul>
          </SortableContext>
        )}
      </div>
      <button 
        onClick={handleShare}
        disabled={isLoading}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
      >
        {isLoading ? 'Sharing...' : 'Share Playlist'}
      </button>
      {feedback && (
        <p className="text-sm text-center mt-2 text-green-400 break-all">{feedback}</p>
      )}
    </div>
  );
};

export default UserPlaylist;