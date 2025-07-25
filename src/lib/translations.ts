interface Translations {
  [key: string]: {
    nextSet: string;
    resetAll: string;
    loadSummoner: string;
    guide: string;
    announcement: string;
    close: string;
    siteGuideTitle: string;
    siteGuideContent1: string;
    siteGuideContent2: string;
    siteGuideContent3: string;
    siteGuideContent4: string;
    siteGuideContent5: string;
    siteGuideContent6: string;
    siteGuideContent7: string;
    siteGuideContent8: string;
    announcementTitle: string;
    announcementDate: string;
    announcementGreeting: string;
    announcementUpdate1: string;
    announcementUpdate2: string;
    announcementUpdate3: string;
    announcementClosing: string;
  };
}

export const translations: Translations = {
  ko_KR: {
    nextSet: '다음 세트',
    resetAll: '전부 초기화',
    loadSummoner: '소환사명으로 불러오기',
    guide: '?',
    announcement: '공지사항',
    close: '닫기',
    siteGuideTitle: '사이트 가이드',
    siteGuideContent1: '이 시뮬레이터는 리그 오브 레전드 밴픽 과정을 연습하는 데 도움을 줍니다.',
    siteGuideContent2: '화면 중앙에 현재 밴/픽 순서가 표시됩니다.',
    siteGuideContent3: '아래 챔피언 목록에서 원하는 챔피언을 클릭하여 밴하거나 픽할 수 있습니다.',
    siteGuideContent4: '이미 선택된 챔피언은 비활성화됩니다.',
    siteGuideContent5: '좌측에는 블루팀, 우측에는 레드팀의 밴/픽 현황이 표시됩니다.',
    siteGuideContent6: '모든 밴/픽이 완료되면 \'다음 세트\' 버튼을 눌러 새로운 밴픽을 시작할 수 있습니다.',
    siteGuideContent7: '모든 밴/픽 기록을 초기화합니다.',
    siteGuideContent8: '우측 상단에서 언어를 변경할 수 있습니다.',
    announcementTitle: '공지사항',
    announcementDate: '[2025년 7월 25일]',
    announcementGreeting: '안녕하세요! 롤 피어리스 밴픽 시뮬레이터가 업데이트되었습니다.',
    announcementUpdate1: '사이트 설명 텍스트 추가 및 레이아웃 개선',
    announcementUpdate2: '공지사항 기능 추가',
    announcementUpdate3: 'Google AdSense 광고 게재 최적화 작업 진행 중',
    announcementClosing: '지속적으로 더 나은 서비스를 제공하기 위해 노력하겠습니다. 많은 이용 부탁드립니다!',
  },
  en_US: {
    nextSet: 'Next Set',
    resetAll: 'Reset All',
    loadSummoner: 'Load by Summoner Name',
    guide: '?',
    announcement: 'Announcement',
    close: 'Close',
    siteGuideTitle: 'Site Guide',
    siteGuideContent1: 'This simulator helps you practice the League of Legends ban/pick process.',
    siteGuideContent2: 'The current ban/pick order is displayed in the center of the screen.',
    siteGuideContent3: 'Click on the desired champion from the list below to ban or pick.',
    siteGuideContent4: 'Already selected champions will be disabled.',
    siteGuideContent5: 'Blue team\'s ban/pick status is shown on the left, and red team\'s on the right.',
    siteGuideContent6: 'Once all bans/picks are complete, click the \'Next Set\' button to start a new ban/pick.',
    siteGuideContent7: 'Resets all ban/pick records.',
    siteGuideContent8: 'You can change the language in the top right corner.',
    announcementTitle: 'Announcement',
    announcementDate: '[July 25, 2025]',
    announcementGreeting: 'Hello! LoL Fearless Ban/Pick Simulator has been updated.',
    announcementUpdate1: 'Added site description text and improved layout',
    announcementUpdate2: 'Added announcement feature',
    announcementUpdate3: 'Google AdSense ad placement optimization in progress',
    announcementClosing: 'We will continue to strive to provide better service. Thank you for your continued use!',
  },
  ja_JP: {
    nextSet: '次のセット',
    resetAll: 'すべてリセット',
    loadSummoner: 'サモナー名でロード',
    guide: '?',
    announcement: 'お知らせ',
    close: '閉じる',
    siteGuideTitle: 'サイトガイド',
    siteGuideContent1: 'このシミュレーターは、リーグ・オブ・レジェンドのバンピックプロセスを練習するのに役立ちます。',
    siteGuideContent2: '現在のバン/ピック順序は画面中央に表示されます。',
    siteGuideContent3: '以下のチャンピオンリストから希望のチャンピオンをクリックして、バンまたはピックできます。',
    siteGuideContent4: 'すでに選択されたチャンピオンは無効になります。',
    siteGuideContent5: '左側にはブルーチーム、右側にはレッドチームのバン/ピック状況が表示されます。',
    siteGuideContent6: 'すべてのバン/ピックが完了したら、\'次のセット\'ボタンをクリックして新しいバンピックを開始できます。',
    siteGuideContent7: 'すべてのバン/ピック記録をリセットします。',
    siteGuideContent8: '右上で言語を変更できます。',
    announcementTitle: 'お知らせ',
    announcementDate: '[2025年7月25日]',
    announcementGreeting: 'こんにちは！LoLフィアレスバンピックシミュレーターが更新されました。',
    announcementUpdate1: 'サイト説明テキストの追加とレイアウトの改善',
    announcementUpdate2: 'お知らせ機能の追加',
    announcementUpdate3: 'Google AdSense広告配置の最適化作業中',
    announcementClosing: 'より良いサービスを提供できるよう、引き続き努力してまいります。引き続きご利用ください！',
  },
};