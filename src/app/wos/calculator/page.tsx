'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import KakaoAdFitBanner from '@/app/components/KakaoAdFitBanner';

const WosCalculatorPage = () => {
  const [totalSoldiers, setTotalSoldiers] = useState('');
  const [shieldBearers, setShieldBearers] = useState('');
  const [spearmen, setSpearmen] = useState('');
  const [archers, setArchers] = useState('');
  const [ratioShield, setRatioShield] = useState('1');
  const [ratioSpear, setRatioSpear] = useState('1');

  // Archer ratio is now a derived value
  const ratioArcher = 10 - (parseInt(ratioShield, 10) + parseInt(ratioSpear, 10));

  const parseToInt = (value: string) => parseInt(value.replace(/,/g, ''), 10) || 0;
  const formatNumber = (value: string | number) => {
    if (value === '' || value === null || value === undefined) return '';
    return Number(value).toLocaleString('en-US');
  };

  const calculatedResults = useMemo(() => {
    const total = parseToInt(totalSoldiers);
    const currentShield = parseToInt(shieldBearers);
    const currentSpear = parseToInt(spearmen);
    const currentArcher = parseToInt(archers);
    const rShield = parseToInt(ratioShield);
    const rSpear = parseToInt(ratioSpear);
    const rArcher = ratioArcher >= 0 ? ratioArcher : 0;

    if (total === 0 || (rShield === 0 && rSpear === 0 && rArcher === 0)) {
      return { totalRequired: null, additionalRequired: null };
    }

    const ratioSum = rShield + rSpear + rArcher;

    // 1. Calculate Total Required Soldiers (총 필요 병사)
    const totalRequiredShield = ratioSum > 0 ? Math.round((total * rShield) / ratioSum) : 0;
    const totalRequiredSpear = ratioSum > 0 ? Math.round((total * rSpear) / ratioSum) : 0;
    const totalRequiredArcher = ratioSum > 0 ? Math.round((total * rArcher) / ratioSum) : 0;

    const totalRequired = {
      shield: totalRequiredShield,
      spear: totalRequiredSpear,
      archer: totalRequiredArcher,
    };

    // 2. Calculate Additional Required Soldiers (추가로 필요한 병사)
    const additionalShield = Math.max(0, totalRequiredShield - currentShield);
    const additionalSpear = Math.max(0, totalRequiredSpear - currentSpear);
    const additionalArcher = Math.max(0, totalRequiredArcher - currentArcher);

    const additionalRequired = {
      shield: additionalShield,
      spear: additionalSpear,
      archer: additionalArcher,
    };

    return { totalRequired, additionalRequired };
  }, [totalSoldiers, shieldBearers, spearmen, archers, ratioShield, ratioSpear, ratioArcher]);

  const handleNumericInput = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, ''); // Remove existing commas for internal state
    if (/^\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleRatioShieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newShieldRatio = parseInt(e.target.value, 10);
    const currentSpearRatio = parseInt(ratioSpear, 10);
    if (newShieldRatio + currentSpearRatio > 10) {
      // If sum exceeds 10, adjust spear ratio to the max possible value
      setRatioSpear((10 - newShieldRatio).toString());
    }
    setRatioShield(e.target.value);
  };

  // Generate options for Spearman based on Shield Bearer's ratio
  const maxSpearRatio = 10 - parseInt(ratioShield, 10);
  const spearmanOptions = Array.from(Array(maxSpearRatio + 1).keys());


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-8">
        <Link href="/wos" className="text-blue-400 hover:underline">
          &larr; WOS 메인으로 돌아가기
        </Link>
      </div>
      <h1 className="text-4xl font-bold mb-8 text-center">병사 비율 계산기</h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <label htmlFor="totalSoldiers" className="block text-lg font-medium text-gray-300 mb-2">목표 총 병사 수</label>
            <input
              type="text"
              id="totalSoldiers"
              value={formatNumber(totalSoldiers)}
              onChange={handleNumericInput(setTotalSoldiers)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-300">현재 병사 수</h2>
            <div className="flex items-center space-x-4">
              <label htmlFor="shieldBearers" className="w-20">방패병</label>
              <input
                type="text"
                id="shieldBearers"
                value={formatNumber(shieldBearers)}
                onChange={handleNumericInput(setShieldBearers)}
                className="flex-grow p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="spearmen" className="w-20">창병</label>
              <input
                type="text"
                id="spearmen"
                value={formatNumber(spearmen)}
                onChange={handleNumericInput(setSpearmen)}
              className="flex-grow p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="archers" className="w-20">궁병</label>
              <input
                type="text"
                id="archers"
                value={formatNumber(archers)}
                onChange={handleNumericInput(setArchers)}
              className="flex-grow p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-300 mb-2">병사 비율</label>
            <div className="grid grid-cols-5 gap-x-2 items-end">
              {/* Shield Bearer */}
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1 text-center">방패병</label>
                <select
                  value={ratioShield}
                  onChange={handleRatioShieldChange}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                >
                  {[...Array(11)].map((_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              
              <span className="text-xl text-center pb-3">:</span>

              {/* Spearman */}
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1 text-center">창병</label>
                <select
                  value={ratioSpear}
                  onChange={(e) => setRatioSpear(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                >
                  {spearmanOptions.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-x-2 items-end mt-2">
                <div className="col-start-3 col-span-1 text-xl text-center pb-3">:</div>
                {/* Archer */}
                <div className="col-start-4 col-span-2">
                    <label className="block text-sm text-gray-400 mb-1 text-center">궁병</label>
                    <div className="w-full p-3 rounded bg-gray-600 text-white border border-gray-500 text-center">
                      {ratioArcher >= 0 ? ratioArcher : 'N/A'}
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center text-blue-400">계산 결과</h2>
          
          {/* Total Required Soldiers */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">총 필요 병사</h3>
            {calculatedResults.totalRequired && ratioArcher >= 0 ? (
              <div className="bg-gray-700 p-4 rounded">
                <p>방패병: {formatNumber(calculatedResults.totalRequired.shield)}</p>
                <p>창병: {formatNumber(calculatedResults.totalRequired.spear)}</p>
                <p>궁병: {formatNumber(calculatedResults.totalRequired.archer)}</p>
              </div>
            ) : <p className="text-gray-500">계산하려면 값을 입력하세요.</p>}
          </div>

          {/* Additional Required Soldiers */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">추가로 필요한 병사</h3>
            {calculatedResults.additionalRequired && ratioArcher >= 0 ? (
              <div className="bg-gray-700 p-4 rounded">
                <p>방패병: {formatNumber(calculatedResults.additionalRequired.shield)}</p>
                <p>창병: {formatNumber(calculatedResults.additionalRequired.spear)}</p>
                <p>궁병: {formatNumber(calculatedResults.additionalRequired.archer)}</p>
              </div>
            ) : <p className="text-gray-500">계산하려면 값을 입력하세요.</p>}
          </div>
        </div>


      </div>

      <KakaoAdFitBanner />
    </div>
  );
};

export default WosCalculatorPage;