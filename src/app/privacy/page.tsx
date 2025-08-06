'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-16">
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">개인정보처리방침</h1>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. 총칙</h2>
            <p className="text-lg leading-relaxed">
              LoL Fearless Banpick(이하 &quot;서비스&quot;)은 사용자의 개인정보를 중요시하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법규를 준수하고 있습니다. 본 개인정보처리방침은 서비스가 사용자의 어떤 정보를 수집하고, 어떻게 이용하며, 누구와 공유하고, 언제 파기하는지 등에 대해 설명합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. 수집하는 개인정보</h2>
            <p className="text-lg leading-relaxed">
              본 서비스는 별도의 회원가입 절차 없이 제공되므로, 사용자의 개인을 식별할 수 있는 어떠한 정보(예: 이름, 이메일 주소, 연락처 등)도 수집하지 않습니다. 다만, 서비스 이용 과정에서 다음과 같은 정보가 자동으로 생성되어 수집될 수 있습니다.
            </p>
            <ul className="list-disc list-inside mt-2 text-lg space-y-1">
              <li><strong>로컬 저장소 데이터:</strong> 사용자가 진행한 밴픽 기록(챔피언 선택 내역)은 사용자의 웹 브라우저 내 로컬 저장소(Local Storage)에 저장됩니다. 이 정보는 서버로 전송되지 않으며, 사용자의 컴퓨터에만 저장됩니다.</li>
              <li><strong>서비스 이용 기록:</strong> IP 주소, 쿠키, 방문 일시, 서비스 이용 기록 등이 익명으로 수집될 수 있으나, 이는 개인을 식별할 수 없는 형태입니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. 개인정보의 이용 목적</h2>
            <p className="text-lg leading-relaxed">
              서비스는 수집한 정보를 다음의 목적으로만 이용합니다.
            </p>
            <ul className="list-disc list-inside mt-2 text-lg space-y-1">
              <li><strong>서비스 제공:</strong> 밴픽 기록 저장 및 불러오기 기능 제공.</li>
              <li><strong>서비스 개선:</strong> 사용 통계 분석을 통한 서비스 품질 향상 및 신규 기능 개발.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. 개인정보의 보유 및 이용기간</h2>
            <p className="text-lg leading-relaxed">
              밴픽 기록은 사용자의 로컬 저장소에 저장되며, 사용자가 직접 브라우저의 데이터를 삭제하거나 &quot;전부 초기화&quot; 기능을 사용하기 전까지 유지됩니다. 서비스는 서버에 개인정보를 저장하지 않으므로, 별도의 파기 절차를 거치지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. 개인정보의 제3자 제공</h2>
            <p className="text-lg leading-relaxed">
              서비스는 사용자의 개인정보를 외부에 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. 개인정보 처리 위탁</h2>
            <p className="text-lg leading-relaxed">
              서비스는 외부 업체에 개인정보 처리를 위탁하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. 사용자의 권리</h2>
            <p className="text-lg leading-relaxed">
              사용자는 언제든지 자신의 브라우저에 저장된 밴픽 기록을 삭제할 수 있습니다. &quot;전부 초기화&quot; 버튼을 통해 모든 기록을 삭제할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. 개인정보 보호 책임자</h2>
            <p className="text-lg leading-relaxed">
              본 서비스는 개인정보 보호 책임자를 지정하여 운영하지 않습니다. 개인정보 관련 문의는 이메일(chcorps0705@gmail.com)로 연락주시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. 정책 변경</h2>
            <p className="text-lg leading-relaxed">
              본 개인정보처리방침은 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우 웹사이트 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold text-xl">
            &larr; 밴픽 시뮬레이터로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
