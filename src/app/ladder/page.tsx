// src/app/ladder/page.tsx
"use client";


import { useState, useEffect, useRef } from 'react';
import usePersistentState from '../hooks/usePersistentState';

// 나중에 별도 파일로 분리할 컴포넌트들
const NormalLadderGame = () => {
  const [participants, setParticipants] = usePersistentState('ladder_participants', ['', '']);
  const [results, setResults] = usePersistentState('ladder_results', ['', '']);
  const [gameStarted, setGameStarted] = usePersistentState('ladder_game_started', false);
  const [finalResults, setFinalResults] = useState({});
  const canvasRef = useRef(null);
  const ladderDef = useRef(null);

  const handleParticipantChange = (index, value) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const handleResultChange = (index, value) => {
    const newResults = [...results];
    newResults[index] = value;
    setResults(newResults);
  };

  const addEntry = () => {
    setParticipants([...participants, '']);
    setResults([...results, '']);
  };

  const removeEntry = (index) => {
    if (participants.length <= 2) return;
    const newParticipants = participants.filter((_, i) => i !== index);
    const newResults = results.filter((_, i) => i !== index);
    setParticipants(newParticipants);
    setResults(newResults);
  };

  const startGame = () => {
    if (participants.some(p => p.trim() === '') || results.some(r => r.trim() === '')) {
      alert('모든 참가자와 결과 값을 입력해주세요.');
      return;
    }
    setGameStarted(true);
  };
  
  const resetGame = () => {
    setParticipants(['', '']);
    setResults(['', '']);
    setGameStarted(false);
    setFinalResults({});
    ladderDef.current = null;
  };
  
  const drawLadder = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const numParticipants = participants.length;
    const spacing = canvas.offsetWidth / numParticipants;
    const PADDING = 30;
    const LADDER_HEIGHT = canvas.offsetHeight - (PADDING * 2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw names and results
    ctx.font = '16px "Pretendard", sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    participants.forEach((p, i) => {
        ctx.fillText(p, (i * spacing) + (spacing / 2), PADDING - 10);
    });
    results.forEach((r, i) => {
        ctx.fillText(r, (i * spacing) + (spacing / 2), canvas.offsetHeight - PADDING + 20);
    });

    // Draw vertical lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    const verticalLines = [];
    for (let i = 0; i < numParticipants; i++) {
        const x = i * spacing + spacing / 2;
        ctx.beginPath();
        ctx.moveTo(x, PADDING);
        ctx.lineTo(x, canvas.offsetHeight - PADDING);
        ctx.stroke();
        verticalLines.push(x);
    }
    
    // Generate & Draw horizontal rungs
    let horizontalRungs = [];
    if (ladderDef.current && ladderDef.current.horizontalRungs) {
        horizontalRungs = ladderDef.current.horizontalRungs;
    } else {
        const RUNG_COUNT = numParticipants * 2;
        const RUNG_HEIGHT = LADDER_HEIGHT / (RUNG_COUNT + 1);

        for (let i = 0; i < RUNG_COUNT; i++) {
            const lane = Math.floor(Math.random() * (numParticipants - 1));
            const y = (i + 1) * RUNG_HEIGHT + PADDING;

            const prevRung = horizontalRungs.find(r => r.y === y);
            if (prevRung && (prevRung.lane === lane || prevRung.lane === lane - 1 || prevRung.lane === lane + 1)) {
                continue;
            }
            horizontalRungs.push({ lane, y });
        }
        horizontalRungs.sort((a,b) => a.y - b.y);
    }

    horizontalRungs.forEach(rung => {
        const x1 = verticalLines[rung.lane];
        const x2 = verticalLines[rung.lane + 1];
        ctx.beginPath();
        ctx.moveTo(x1, rung.y);
        ctx.lineTo(x2, rung.y);
        ctx.stroke();
    });
    
    const resultsMap = calculateResults(numParticipants, horizontalRungs);
    
    ladderDef.current = { verticalLines, horizontalRungs, spacing, PADDING, resultsMap };
  };

  const calculateResults = (numParticipants, rungs) => {
    const resultsMap = {};
    for (let i = 0; i < numParticipants; i++) {
        let currentLane = i;
        
        rungs.forEach(rung => {
             if (rung.lane === currentLane) {
                currentLane++;
            } else if (rung.lane === currentLane - 1) {
                currentLane--;
            }
        });
        resultsMap[i] = currentLane;
    }
    return resultsMap;
  };
  
  const animatePath = (startIndex) => {
    if (!ladderDef.current) return;
    const { verticalLines, horizontalRungs, PADDING, resultsMap } = ladderDef.current;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let currentLane = startIndex;
    
    const path = [];
    path.push({x: verticalLines[currentLane], y: PADDING});

    horizontalRungs.forEach(rung => {
        if (rung.lane === currentLane) { // Move right
            path.push({x: verticalLines[currentLane], y: rung.y});
            path.push({x: verticalLines[currentLane + 1], y: rung.y});
            currentLane++;
        } else if (rung.lane === currentLane - 1) { // Move left
            path.push({x: verticalLines[currentLane], y: rung.y});
            path.push({x: verticalLines[currentLane - 1], y: rung.y});
            currentLane--;
        }
    });

    path.push({x: verticalLines[currentLane], y: canvas.offsetHeight / (window.devicePixelRatio || 1) - PADDING});

    let startTime = null;
    const duration = 2000;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        drawLadder();
        
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const totalPathLength = path.length - 1;
        const currentPathTotalIndex = progress * totalPathLength;
        const integerPathIndex = Math.floor(currentPathTotalIndex);
        const segmentProgress = currentPathTotalIndex - integerPathIndex;

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 0; i < integerPathIndex; i++) {
            ctx.lineTo(path[i+1].x, path[i+1].y);
        }

        if (integerPathIndex < totalPathLength) {
            const lastPoint = path[integerPathIndex];
            const nextPoint = path[integerPathIndex + 1];
            const intermediateX = lastPoint.x + (nextPoint.x - lastPoint.x) * segmentProgress;
            const intermediateY = lastPoint.y + (nextPoint.y - lastPoint.y) * segmentProgress;
            ctx.lineTo(intermediateX, intermediateY);
        }
        
        ctx.stroke();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
             setFinalResults(prev => ({...prev, [startIndex]: resultsMap[startIndex]}));
        }
    }
    
    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (gameStarted) {
      // Small delay to ensure canvas is in the DOM and has dimensions
      setTimeout(drawLadder, 50);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">일반 사다리게임</h2>
      <p className="text-gray-400 mb-8">참가자 이름과 결과를 입력하고 사다리를 타보세요.</p>
      
      <div className="border-t border-white/10 pt-8">
      {!gameStarted ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">입력</h3>
            <div className="space-x-2">
              <button onClick={addEntry} className="btn btn-secondary">칸 추가</button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-2">
              <label className="label">
                <span className="label-text text-lg font-medium">참가자</span>
              </label>
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`참가자 ${index + 1}`}
                    className="input input-bordered w-full bg-gray-800"
                    value={participant}
                    onChange={(e) => handleParticipantChange(index, e.target.value)}
                  />
                  {participants.length > 2 && (
                    <button onClick={() => removeEntry(index)} className="btn btn-sm btn-circle btn-outline btn-error">
                      –
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="label">
                <span className="label-text text-lg font-medium">결과</span>
              </label>
              {results.map((result, index) => (
                 <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={`결과 ${index + 1}`}
                      className="input input-bordered w-full bg-gray-800"
                      value={result}
                      onChange={(e) => handleResultChange(index, e.target.value)}
                    />
                     {participants.length > 2 && (
                        <button onClick={() => removeEntry(index)} className="btn btn-sm btn-circle btn-outline btn-error">
                          –
                        </button>
                     )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center pt-4">
            <button onClick={startGame} className="btn btn-primary btn-lg btn-wide">사다리 생성</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-2xl font-semibold">사다리 결과</h3>
             <button onClick={resetGame} className="btn btn-secondary">초기화</button>
          </div>
          <div className="text-center mb-2">
             <p className="text-gray-400">결과를 확인할 참가자 이름을 클릭하세요.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {participants.map((p, i) => (
                <button key={i} onClick={() => animatePath(i)} className="btn btn-outline btn-info">
                    {p} 결과 확인
                </button>
            ))}
          </div>
          <canvas ref={canvasRef} id="ladder-canvas" className="w-full h-[500px] bg-gray-800/50 rounded-lg border border-white/10"></canvas>
          <div className="mt-4 text-center space-y-2">
            {Object.entries(finalResults).map(([participantIndex, resultIndex]) => (
                <div key={participantIndex} className="text-xl p-3 bg-gray-800 rounded-lg">
                   <span className="font-bold text-cyan-400">{participants[participantIndex]}</span>
                   <span className="text-gray-400"> → </span>
                   <span className="font-bold text-green-400">{results[resultIndex]}</span>
                </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const LolLaneRandomizer = () => {
  const [blueTeam, setBlueTeam] = usePersistentState('lol_blue_team', Array(5).fill(''));
  const [redTeam, setRedTeam] = usePersistentState('lol_red_team', Array(5).fill(''));
  const [results, setResults] = usePersistentState('lol_lane_results', null);

  const handlePlayerNameChange = (team, index, value) => {
    if (team === 'blue') {
      const newTeam = [...blueTeam];
      newTeam[index] = value;
      setBlueTeam(newTeam);
    } else {
      const newTeam = [...redTeam];
      newTeam[index] = value;
      setRedTeam(newTeam);
    }
  };

  const assignLanes = () => {
    if (blueTeam.some(p => p.trim() === '') || redTeam.some(p => p.trim() === '')) {
      alert('모든 플레이어의 이름을 입력해주세요.');
      return;
    }

    const LANES = ['탑', '정글', '미드', '원딜', '서포터'];
    
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    const shuffledLanesBlue = shuffle([...LANES]);
    const shuffledLanesRed = shuffle([...LANES]);

    setResults({
      blue: blueTeam.map((player, index) => ({ player, lane: shuffledLanesBlue[index] })),
      red: redTeam.map((player, index) => ({ player, lane: shuffledLanesRed[index] })),
    });
  };

  const resetResults = () => {
    setResults(null);
  };
  
  const initializeTeams = () => {
    setBlueTeam(Array(5).fill(''));
    setRedTeam(Array(5).fill(''));
    setResults(null);
  }


  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">롤 랜덤 라인 CK</h2>
      <p className="text-gray-400 mb-8">블루/레드 팀의 플레이어 이름을 입력하고 라인을 랜덤으로 배정합니다.</p>
      
      <div className="border-t border-white/10 pt-8">
      {!results ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blue Team */}
            <div>
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">블루 팀</h3>
              {blueTeam.map((player, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`블루 팀 플레이어 ${index + 1}`}
                  className="input input-bordered w-full mb-2 bg-gray-800"
                  value={player}
                  onChange={(e) => handlePlayerNameChange('blue', index, e.target.value)}
                />
              ))}
            </div>
            {/* Red Team */}
            <div>
              <h3 className="text-2xl font-semibold text-red-400 mb-4">레드 팀</h3>
              {redTeam.map((player, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`레드 팀 플레이어 ${index + 1}`}
                  className="input input-bordered w-full mb-2 bg-gray-800"
                  value={player}
                  onChange={(e) => handlePlayerNameChange('red', index, e.target.value)}
                />
              ))}
            </div>
          </div>
          <div className="text-center pt-4 flex flex-wrap justify-center gap-4">
            <button onClick={assignLanes} className="btn btn-primary btn-lg btn-wide">라인 랜덤 배정</button>
            <button onClick={initializeTeams} className="btn btn-secondary btn-lg btn-wide">초기화</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-semibold text-blue-400 mb-4">블루 팀 결과</h3>
                <div className="overflow-x-auto bg-gray-800/50 p-4 rounded-lg shadow-inner border border-white/10">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th className="text-gray-300">플레이어</th>
                                <th className="text-gray-300">라인</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.blue.map(({player, lane}, index) => (
                                <tr key={index}>
                                    <td className="font-medium text-white">{player}</td>
                                    <td className="text-blue-300">{lane}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
               <div>
                <h3 className="text-2xl font-semibold text-red-400 mb-4">레드 팀 결과</h3>
                <div className="overflow-x-auto bg-gray-800/50 p-4 rounded-lg shadow-inner border border-white/10">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th className="text-gray-300">플레이어</th>
                                <th className="text-gray-300">라인</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.red.map(({player, lane}, index) => (
                                <tr key={index}>
                                    <td className="font-medium text-white">{player}</td>
                                    <td className="text-red-300">{lane}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
           </div>
           <div className="text-center pt-4">
                <button onClick={resetResults} className="btn btn-primary btn-lg btn-wide">다시하기</button>
           </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default function LadderPage() {
  const [gameMode, setGameMode] = usePersistentState('ladder_game_mode', 'normal'); // 'normal' or 'lol'

  return (
    <main className="min-h-screen bg-gray-950 text-white py-12">
      <div className="max-w-4xl mx-auto space-y-10 px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-2">사다리게임</h1>
          <p className="text-gray-400">간편하게 즐기는 두 가지 모드의 사다리게임</p>
        </div>


        <div className="bg-gray-900/50 p-6 rounded-xl shadow-2xl">
            <div className="flex justify-center space-x-8">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="gameMode"
                  value="normal"
                  checked={gameMode === 'normal'}
                  onChange={() => setGameMode('normal')}
                  className="radio radio-primary radio-lg"
                />
                <span className="text-xl font-medium">일반 사다리게임</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="gameMode"
                  value="lol"
                  checked={gameMode === 'lol'}
                  onChange={() => setGameMode('lol')}
                  className="radio radio-primary radio-lg"
                />
                <span className="text-xl font-medium">롤 랜덤 라인 CK</span>
              </label>
            </div>
        </div>

        <div className="bg-gray-900/50 p-6 sm:p-8 rounded-xl shadow-2xl">
          {gameMode === 'normal' ? <NormalLadderGame /> : <LolLaneRandomizer />}
        </div>
      </div>
    </main>
  );
}
