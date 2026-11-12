window.GAME_CONFIG = {
  "stats": {
    "playerMain": 2,
    "playerAux": 1,
    "levelMainGrowth": 0.12,
    "levelAuxGrowth": 0.04,
    "enemyDamage": 22,
    "stageDamageGrowth": 2,
    "roundDamageGrowth": 2,
    "maxEnemyDamage": 42,
    "bossHp": 24560,
    "bossDefense": 0.5,
    "baseSpeed": 180,
    "speedPerLevel": 5,
    "maxSpeedBonus": 60,
    "augmentMainPower": 0.35,
    "augmentAuxPower": 0.2,
    "magnetRange": 25,
    "repairAmount": 25,
    "enemyScoutHp": 2,
    "enemyChargerHp": 3,
    "enemyHunterHp": 4,
    "enemyShooterHp": 5,
    "enemyVenomHp": 5,
    "enemyGunnerHp": 6,
    "enemySalvoHp": 8,
    "enemyFastHp": 3,
    "miniBossHp": 600,
    "miniBossWaveGrowth": 0.25,
    "miniBossSpeed": 28,
    "miniBossFirstSpawn": 70,
    "miniBossSecondSpawn": 130,
    "miniBossOuterInterval": 2.3,
    "miniBossInnerInterval": 1.65,
    "miniBossOuterSpeed": 145,
    "miniBossInnerSpeed": 125,
    "miniBossBombDamage": 12,
    "bossEnrageFirst": 75,
    "bossEnrageSecond": 120,
    "bossEnrageStageGrowth": 3,
    "normalEnemyHpMultiplier": 0.8,
    "baseWingMissileDamage": 0.45,
    "baseDroneOffset": 48,
    "baseDroneDamage": 0.28,
    "baseDroneLevelGrowth": 0.025,
    "baseDroneInterval": 0.9,
    "normalSpawnIntervalMultiplier": 1.25,
    "normalEnemyMaxCount": 45,
    "xpPerPickup": 1.25,
    "miniBossXpMultiplier": 4,
    "bossXpMultiplier": 10,
    "bossLootSeconds": 10,
    "shipArkXpMultiplier": 1.12,
    "shipMantaSpeedMultiplier": 1.1,
    "shipForgeMainBonus": 0.25,
    "droneBonusDamage": 0.04,
    "droneBonusRate": 0.04,
    "droneBonusSpeed": 15,
    "droneOverflowDamage": 0.025,
    "droneMinInterval": 0.55,
    "droneBaseBulletSpeed": 320,
    "droneDamageCapRatio": 0.22,
    "droneOverflowCapGrowth": 0.01,
    "droneOverflowCapMax": 0.1,
    "stageDifficultyGrowth": 0.32,
    "spawnBaseInterval": 0.62,
    "spawnMinInterval": 0.32,
    "spawnLevelReduction": 0.02,
    "spawnWaveMultiplier": 0.9,
    "nearFuseGrazeRadius": 22,
    "nearFuseRequired": 5,
    "nearFuseBlastRadius": 90,
    "afterimageDelay": 0.55,
    "afterimageLife": 0.9,
    "regroupDuration": 0.9,
    "regroupTravel": 75,
    "regroupDamageCap": 0.32,
    "aceSquadronMissileDamage": 0.45,
    "barrageMissileCount": 6,
    "barrageLaunchSpacing": 0.12,
    "barrageSplashRadius": 24,
    "mineThrowDistance": 130,
    "mineThrowDuration": 0.4,
    "mineThrowSpacing": 30,
    "mineMaxCount": 10,
    "mineArmingTime": 0.35,
    "mineLifetime": 7,
    "illusionMaxRatio": 0.6
  },
  "dialogue": {
    "tutorial": [
      {
        "who": "파일럿 이안",
        "portrait": "pilot",
        "text": "관제탑, 여기는 이안. 출격 준비 완료. 교신 상태 확인 바란다."
      },
      {
        "who": "관제사 미라",
        "portrait": "mira",
        "text": "잘 들려요, 이안. 실제 출격 전에 안전한 훈련장에서 조작을 확인할게요."
      },
      {
        "who": "관제사 미라",
        "portrait": "mira",
        "text": "빛나는 왼쪽 가상 패드를 움직여 기체를 이동하세요. PC에서는 W A S D를 누르세요.",
        "action": "move"
      },
      {
        "who": "관제사 미라",
        "portrait": "mira",
        "text": "좋아요! 적 탄막이 다가올 때 오른쪽 폭탄 버튼을 눌러 보세요.",
        "action": "bomb"
      },
      {
        "who": "관제사 미라",
        "portrait": "mira",
        "text": "성공이에요! 이제 빛나는 에너지에 기체를 가까이 움직여 획득해 보세요.",
        "action": "collect"
      },
      {
        "who": "파일럿 이안",
        "portrait": "pilot",
        "text": "훈련 완료. 기체 점검 끝! 관제탑, 이제 본격적으로 출격하겠다."
      }
    ],
    "bossIntro": [
      {
        "who": "관제사 미라",
        "portrait": "mira",
        "text": "{boss} 포착! 탄막 사이의 빈틈을 찾아요. 시간이 지나면 광폭화하니 조심하세요!"
      }
    ],
    "stageClear": [
      {
        "who": "관제사 미라",
        "portrait": "mira",
        "text": "{stage}의 적 지휘기가 격파됐어요! 항로가 열렸습니다."
      },
      {
        "who": "파일럿 이안",
        "portrait": "pilot",
        "text": "확인했다. 다음 구역으로 계속 전진한다!"
      }
    ]
  },
  "augments": {
    "rate": {
      "name": "연사 모듈",
      "detail": "기본 공격 속도 증가",
      "max": 5,
      "group": "utility"
    },
    "spread": {
      "name": "분열탄",
      "detail": "강화당 탄환 1발 추가 · 바깥 탄환 피해 감소",
      "max": 5,
      "group": "main"
    },
    "power": {
      "name": "주무기 화력",
      "detail": "주무기 피해 증가",
      "max": 5,
      "group": "utility"
    },
    "cross": {
      "name": "근접 기뢰",
      "detail": "전방에 기뢰 투척 · 레벨당 설치 개수 증가",
      "max": 5,
      "group": "main"
    },
    "cannon": {
      "name": "중장 포",
      "detail": "강력한 전방 포탄 발사",
      "max": 5,
      "group": "main"
    },
    "auxpower": {
      "name": "보조 화력",
      "detail": "보조 무기 피해 증가",
      "max": 5,
      "group": "utility"
    },
    "magnet": {
      "name": "에너지 자석",
      "detail": "수집 범위 증가",
      "max": 3,
      "group": "utility"
    },
    "orbit": {
      "name": "회전 위성",
      "detail": "주변을 도는 위성으로 공격",
      "max": 5,
      "group": "aux"
    },
    "missile": {
      "name": "추적 미사일",
      "detail": "최대 5발 · 추가 발사 시 개별 피해 감소, 레벨당 피해 증가",
      "max": 5,
      "group": "aux"
    },
    "pulse": {
      "name": "폭격 포드",
      "detail": "폭탄 투척 · 중심에서 멀수록 피해 감소",
      "max": 5,
      "group": "aux"
    },
    "rail": {
      "name": "화염 방사기",
      "detail": "전방에 화염을 분사해 범위 피해",
      "max": 5,
      "group": "aux"
    },
    "lightning": {
      "name": "연쇄 번개",
      "detail": "연쇄될 때마다 피해 50% 감소",
      "max": 5,
      "group": "aux"
    },
    "drone": {
      "name": "지원 드론",
      "detail": "조준 지원탄 발사",
      "max": 5,
      "group": "aux"
    },
    "blade": {
      "name": "회전 톱날",
      "detail": "기체 주변을 회전하며 적에게 반복 피해",
      "max": 5,
      "group": "aux"
    },
    "repair": {
      "name": "일루전",
      "detail": "드론 복제 공격 · 선택 이후 강화 선택지 3개가 동일",
      "max": 5,
      "group": "utility"
    },
    "nova": {
      "name": "중력 파동",
      "detail": "주변에 주기적으로 파동을 발산해 범위 피해",
      "max": 5,
      "group": "aux"
    },
    "boomerang": {
      "name": "유성 폭격",
      "detail": "적 무리에 유성을 떨어뜨려 범위 피해",
      "max": 5,
      "group": "aux"
    },
    "rocket": {
      "name": "전방 로켓",
      "detail": "전방에 로켓 연사 · 레벨당 1발 추가",
      "max": 5,
      "group": "main"
    },
    "swarm": {
      "name": "군집 미사일",
      "detail": "여러 적에게 미사일 분산 발사",
      "max": 5,
      "group": "aux"
    },
    "m_burst": {
      "name": "펄스 연발",
      "detail": "전방으로 펄스탄 2발을 시간차 연사",
      "max": 5,
      "group": "main"
    },
    "m_twin": {
      "name": "쌍열 포",
      "detail": "좌우에서 평행 탄환 발사",
      "max": 5,
      "group": "main"
    },
    "m_fan": {
      "name": "산탄 포격",
      "detail": "좁은 부채꼴 탄환 발사",
      "max": 5,
      "group": "main"
    },
    "m_pierce": {
      "name": "철갑 침투탄",
      "detail": "적을 관통하는 중탄 발사",
      "max": 5,
      "group": "main"
    },
    "m_side": {
      "name": "측면 교차포",
      "detail": "양쪽에서 중앙으로 교차하는 탄환",
      "max": 5,
      "group": "main"
    },
    "m_rapid": {
      "name": "속사포",
      "detail": "약한 탄환을 빠르게 발사",
      "max": 5,
      "group": "main"
    },
    "m_heavy": {
      "name": "공성포",
      "detail": "느린 중포탄 · 주변 적에게 35% 폭발 피해",
      "max": 5,
      "group": "main"
    },
    "m_wave": {
      "name": "파상 사격",
      "detail": "물결치며 날아가는 세 갈래 탄환",
      "max": 5,
      "group": "main"
    },
    "m_lance": {
      "name": "플라즈마 창",
      "detail": "좁은 범위를 관통하는 포탄",
      "max": 5,
      "group": "main"
    },
    "m_sweep": {
      "name": "회전 포문",
      "detail": "방향이 바뀌는 전방 탄환",
      "max": 5,
      "group": "main"
    },
    "a_seeker": {
      "name": "요격 유도탄",
      "detail": "가장 가까운 적에게 빠른 유도탄 발사",
      "max": 5,
      "group": "aux"
    },
    "a_wing": {
      "name": "날개 미사일",
      "detail": "양쪽으로 펼쳐진 뒤 적을 추적하는 미사일",
      "max": 5,
      "group": "aux"
    },
    "a_scatter": {
      "name": "파편 로켓",
      "detail": "세 방향 로켓 · 작은 범위에 35% 피해",
      "max": 5,
      "group": "aux"
    },
    "a_pierce": {
      "name": "광자 투창",
      "detail": "적을 관통하는 에너지 투창",
      "max": 5,
      "group": "aux"
    },
    "a_hunter": {
      "name": "사냥 드론탄",
      "detail": "여러 적에게 느린 유도탄을 분산 발사",
      "max": 5,
      "group": "aux"
    },
    "a_rapid": {
      "name": "소형 요격탄",
      "detail": "빠른 소형 유도탄을 자주 발사",
      "max": 5,
      "group": "aux"
    },
    "a_cannon": {
      "name": "보조 중포",
      "detail": "느린 중포탄 · 주변 적에게 35% 폭발 피해",
      "max": 5,
      "group": "aux"
    },
    "a_pair": {
      "name": "쌍발 유도탄",
      "detail": "체력이 가장 많은 적에게 두 발 집중",
      "max": 5,
      "group": "aux"
    },
    "a_spread": {
      "name": "성운 포격",
      "detail": "물결치는 다섯 방향 에너지 탄환",
      "max": 5,
      "group": "aux"
    },
    "a_lance": {
      "name": "쌍광 투창",
      "detail": "나란히 적을 관통하는 광탄",
      "max": 5,
      "group": "aux"
    },
    "afterimage": {
      "name": "잔상 폭격",
      "detail": "이동 경로에 잔상을 남겨 지연 사격",
      "group": "aux",
      "max": 5
    },
    "near_fuse": {
      "name": "근접 신관",
      "detail": "적 탄환을 5회 아슬아슬하게 회피하면 반격",
      "group": "utility",
      "max": 5
    },
    "regroup": {
      "name": "편대 재집결",
      "detail": "양쪽 드론이 돌진하며 집중 사격",
      "group": "utility",
      "max": 5
    },
    "a_barrage": {
      "name": "스카이 버스트",
      "detail": "소형 유도탄 연속 발사 · 주변 적에게 폭발 피해",
      "max": 5,
      "group": "aux"
    }
  },
  "rarityWeights": {
    "common": 45,
    "uncommon": 30,
    "rare": 16,
    "legendary": 7,
    "mythic": 2
  },
  "augmentRarityWeights": {
    "rate": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "spread": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "power": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "cross": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "cannon": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "auxpower": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "magnet": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "orbit": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "missile": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "pulse": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "rail": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "lightning": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "drone": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "blade": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "repair": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "nova": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "boomerang": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "rocket": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "swarm": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_burst": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_twin": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_fan": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_pierce": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_side": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_rapid": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_heavy": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_wave": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_lance": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "m_sweep": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_seeker": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_wing": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_scatter": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_pierce": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_hunter": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_rapid": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_cannon": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_pair": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_spread": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_lance": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "afterimage": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "near_fuse": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "regroup": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    },
    "a_barrage": {
      "common": 1.6663513442839524,
      "uncommon": 0.5705418915197569,
      "rare": 0.07448545568172793,
      "legendary": 0.012797383450250832,
      "mythic": 0.0014053204131496257
    }
  },
  "augmentCombat": {
    "rate": {
      "intervalDecrease": 0.035,
      "minimumInterval": 0.12
    },
    "spread": {
      "damageFalloff": 0.8
    },
    "cross": {
      "baseInterval": 3.2,
      "intervalReduction": 0.22,
      "minimumInterval": 1.4,
      "baseDamage": 1.4,
      "damagePerLevel": 1
    },
    "cannon": {
      "interval": 1.4,
      "baseDamage": 2,
      "damagePerLevel": 0.6
    },
    "orbit": {
      "hitInterval": 0.45,
      "damageMultiplier": 1
    },
    "missile": {
      "baseInterval": 2.2,
      "intervalReduction": 0.3,
      "minimumInterval": 0.55,
      "baseDamage": 1.5,
      "damagePerLevel": 0.5
    },
    "pulse": {
      "interval": 3.5,
      "baseDamage": 2.2,
      "damagePerLevel": 0.8
    },
    "rail": {
      "baseInterval": 1.8,
      "intervalReduction": 0.2,
      "minimumInterval": 0.65,
      "baseDamage": 1.6,
      "damagePerLevel": 0.85
    },
    "lightning": {
      "interval": 2.2,
      "baseDamage": 1,
      "damagePerLevel": 0.35,
      "bounceMultiplier": 0.5
    },
    "drone": {
      "interval": 1.6,
      "baseDamage": 0.5,
      "damagePerLevel": 0.25
    },
    "blade": {
      "interval": 0.55,
      "baseDamage": 0.6,
      "damagePerLevel": 1.2
    },
    "nova": {
      "interval": 3.4,
      "baseDamage": 1.5,
      "damagePerLevel": 0.45
    },
    "boomerang": {
      "interval": 2.2,
      "baseDamage": 1.1,
      "damagePerLevel": 0.35
    },
    "rocket": {
      "interval": 2,
      "baseDamage": 0.75,
      "damagePerLevel": 0.15
    },
    "swarm": {
      "interval": 2.8,
      "baseDamage": 0.65,
      "damagePerLevel": 0.15
    },
    "m_burst": {
      "interval": 1,
      "baseDamage": 1,
      "damagePerLevel": 0.15
    },
    "m_twin": {
      "interval": 1.3,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "m_fan": {
      "interval": 1.8,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "m_pierce": {
      "interval": 2.4,
      "baseDamage": 1,
      "damagePerLevel": 0.15
    },
    "m_side": {
      "interval": 2,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "m_rapid": {
      "interval": 0.55,
      "baseDamage": 1,
      "damagePerLevel": 0.15
    },
    "m_heavy": {
      "interval": 3,
      "baseDamage": 2,
      "damagePerLevel": 0.15
    },
    "m_wave": {
      "interval": 2.3,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "m_lance": {
      "interval": 2.8,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "m_sweep": {
      "interval": 1.15,
      "baseDamage": 1,
      "damagePerLevel": 0.15
    },
    "a_seeker": {
      "interval": 2.4,
      "baseDamage": 1,
      "damagePerLevel": 0.15
    },
    "a_wing": {
      "interval": 3,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "a_scatter": {
      "interval": 3.1,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "a_pierce": {
      "interval": 3.2,
      "baseDamage": 2,
      "damagePerLevel": 0.15
    },
    "a_hunter": {
      "interval": 3.5,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "a_rapid": {
      "interval": 1.5,
      "baseDamage": 1,
      "damagePerLevel": 0.15
    },
    "a_cannon": {
      "interval": 3.6,
      "baseDamage": 2,
      "damagePerLevel": 0.15
    },
    "a_pair": {
      "interval": 3.1,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "a_spread": {
      "interval": 4,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "a_lance": {
      "interval": 4,
      "baseDamage": 0.7,
      "damagePerLevel": 0.15
    },
    "afterimage": {
      "interval": 1.4,
      "baseDamage": 0.55,
      "damagePerLevel": 0.12
    },
    "near_fuse": {
      "interval": 5,
      "baseDamage": 1,
      "damagePerLevel": 0.25
    },
    "regroup": {
      "interval": 7,
      "baseDamage": 0.25,
      "damagePerLevel": 0.035
    },
    "a_barrage": {
      "interval": 3.8,
      "baseDamage": 0.35,
      "damagePerLevel": 0.07,
      "damageFalloff": 0.25
    },
    "repair": {
      "damageMultiplier": 0.4,
      "damagePerLevel": 0.025
    }
  }
};
