import { getUserKeyForGame, Game, submitGameCenterLeaderBoardScore, openGameCenterLeaderboard, isMinVersionSupported } from '@apps-in-toss/web-framework';

// The bridge is available only after the game-specific identifier is obtained.
// It is never logged or retained in browser storage.
window.tossGameReady = (async () => {
  try {
    const user = await getUserKeyForGame();
    if (!user || user === 'ERROR' || user.type !== 'HASH') {
      window.tossGameState = 'unavailable';
      return null;
    }
    const bridge = {
      async getIdentity() {
        let profile;
        try { profile = await Game.getUserProfile(); } catch { profile = null; }
        return { gameId: user.hash, nickname: profile?.statusCode === 'SUCCESS' ? profile.nickname : null, profileStatus: profile?.statusCode || 'UNAVAILABLE' };
      },
      async submit(score) {
        if (!Number.isFinite(score) || score < 0) throw new Error('INVALID_SCORE');
        return submitGameCenterLeaderBoardScore({ score: String(score) });
      },
      async open() {
        if (!isMinVersionSupported({ android: '5.221.0', ios: '5.221.0' })) throw new Error('UNSUPPORTED_VERSION');
        return openGameCenterLeaderboard();
      },
    };
    window.tossGame = bridge;
    window.tossGameState = 'ready';
    window.dispatchEvent(new Event('toss-game-ready'));
    return bridge;
  } catch (error) {
    window.tossGameState = 'unavailable';
    console.warn('게임 식별 기능을 초기화하지 못했습니다.', error);
    return null;
  }
})();
