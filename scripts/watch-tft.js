import { execSync } from 'child_process';

const INTERVAL = 30 * 60 * 1000; // 30 minutes

async function runUpdate() {
  console.log(`[${new Date().toLocaleString()}] TFT 데이터 업데이트 시작...`);
  try {
    execSync('npm run tft:update', { stdio: 'inherit' });
    console.log(`[${new Date().toLocaleString()}] 업데이트 완료. 다음 업데이트는 30분 후입니다.`);
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] 업데이트 중 오류 발생:`, error.message);
  }
}

// 즉시 한 번 실행 후 인터벌 설정
runUpdate();
setInterval(runUpdate, INTERVAL);
