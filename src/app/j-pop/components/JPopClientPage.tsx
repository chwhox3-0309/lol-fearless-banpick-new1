'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { JPopPlaylistProvider, useJPopPlaylist } from '../context/JPopPlaylistContext';
import JPopChart from './JPopChart';
import UserPlaylist from './UserPlaylist';
import { Track } from '@/lib/music-api';

// A simple, reusable track item for the overlay
const TrackItemOverlay = ({ track }: { track: Track }) => (
  <div className="flex items-center p-2 mb-2 bg-gray-600 rounded-lg shadow-lg">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={track.albumArt} alt={track.album} className="w-16 h-16 mr-4 rounded" />
    <div>
      <p className="font-semibold text-white">{track.name}</p>
      <p className="text-sm text-gray-300">{track.artist}</p>
    </div>
  </div>
);


interface JPopClientPageProps {
  tracks: Track[];
}

const JPopClientPageInternal = ({ tracks }: JPopClientPageProps) => {
  const { playlist, addTrack, removeTrack, reorderPlaylist } = useJPopPlaylist();
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(tracks.length / pageSize);
  const paginatedTracks = tracks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when size changes
  };


  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.track) {
      setActiveTrack(active.data.current.track);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTrack(null); // Clear the overlay

    if (!over) return;

    const activeId = String(active.id).replace('chart-track-', '').replace('playlist-track-', '');
    
    const isActiveInPlaylist = String(active.id).startsWith('playlist-track-');

    // Drag from playlist to chart to remove
    if (over.id === 'chart-droppable' && isActiveInPlaylist) {
      removeTrack(activeId);
      return;
    }

    // Check if we are sorting within the playlist
    const isOverInPlaylist = String(over.id).startsWith('playlist-track-');

    if (isActiveInPlaylist && isOverInPlaylist) {
      const overId = String(over.id).replace('playlist-track-', '');
      if (activeId !== overId) {
        reorderPlaylist(activeId, overId);
      }
      return;
    }

    // If a draggable item from the chart is dropped over the playlist area
    if (over.id === 'playlist-droppable' && active.data.current?.track) {
      addTrack(active.data.current.track);
    }
  };
  
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex">
        <JPopChart 
          tracks={paginatedTracks}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <UserPlaylist />
      </div>
      <DragOverlay>
        {activeTrack ? <TrackItemOverlay track={activeTrack} /> : null}
      </DragOverlay>
    </DndContext>
  );
};


const JPopClientPage = ({ tracks }: JPopClientPageProps) => {
  return (
    <JPopPlaylistProvider>
      <JPopClientPageInternal tracks={tracks} />
    </JPopPlaylistProvider>
  )
}


export default JPopClientPage;
