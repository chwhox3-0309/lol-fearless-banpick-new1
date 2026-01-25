// src/app/j-pop/components/JPopChart.tsx
'use client';

import { Track } from '@/lib/music-api';
import { useJPopPlaylist } from '../context/JPopPlaylistContext';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Pagination from './Pagination';

interface DraggableTrackProps {
  track: Track;
}

const DraggableTrack = ({ track }: DraggableTrackProps) => {
  const { addTrack } = useJPopPlaylist();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `chart-track-${track.id}`,
    data: {
      track, // Pass the whole track object
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center p-2 mb-2 bg-gray-800 rounded-lg touch-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={track.albumArt} alt={track.album} className="w-16 h-16 mr-4 rounded" />
      <div>
        <p className="font-semibold text-white">{track.name}</p>
        <p className="text-sm text-gray-400">{track.artist}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent dnd listeners from firing
          addTrack(track);
        }}
        className="ml-auto bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded"
      >
        Add
      </button>
    </li>
  );
};

interface JPopChartProps {
  tracks: Track[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const JPopChart = ({ 
  tracks,
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPageChange
}: JPopChartProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'chart-droppable',
  });

  const droppableStyle = {
    backgroundColor: isOver ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
    transition: 'background-color 0.2s ease',
    padding: '0.5rem', // Add some padding
  };

  const pageSizes = [10, 30, 50];

  return (
    <div ref={setNodeRef} style={droppableStyle} className="w-1/2 pr-2 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">J-Pop 인기 음악 리스트</h2>
        <div className="flex items-center space-x-2 text-sm">
          <span>보기:</span>
          {pageSizes.map(size => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`px-2 py-1 rounded ${pageSize === size ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {size}개
            </button>
          ))}
        </div>
      </div>
      
      <ul>
        {tracks.map((track) => (
          <DraggableTrack key={track.id} track={track} />
        ))}
      </ul>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default JPopChart;
