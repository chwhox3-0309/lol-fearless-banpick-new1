// 시즌마다 id를 변경하면 미션과 보상 진도가 새로 시작됩니다.
window.SEASON_PASS = Object.freeze({
 id:'season-01',
 missions:[{id:'sortie',name:'일반 출격 1회 완료',metric:'sorties',goal:1,xp:100},{id:'kills',name:'적 100기 처치',metric:'kills',goal:100,xp:100},{id:'survive',name:'누적 5분 생존',metric:'seconds',goal:300,xp:100},{id:'stages',name:'스테이지 1회 클리어',metric:'stages',goal:1,xp:100}],
 rewards:[{xp:100,coins:100,part:{id:'pass-main-01',name:'노바 화력 코어',description:'주무기 기본 공격력 +0.10',main:.10}},{xp:200,coins:150,part:{id:'pass-aux-01',name:'오로라 보조 코어',description:'보조무기 기본 공격력 +0.10',aux:.10}},{xp:300,coins:200,premiumCoins:400},{xp:400,coins:300,premiumCoins:600}]
});
