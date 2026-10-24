# MOOD Studio

한국어 쇼핑몰 이미지 편집 스튜디오. 기존 편집기를 유지하며 Google Gemini 이미지 편집 API를 호출하는 Sites/Vinext 서버를 추가했습니다.

## 기능

- 기본 배경: 기기 내 피사체 분리, 18개 단색·도형 배경 합성.
- 포즈 변경: 원본 유지·걷기·앉기·측면·주머니에 손·기대기 및 포즈 참고사진.
- 장소 변경: 원본·바닷가·공원·카페·도심·가든 및 실제 장소 참고사진.
- 원본 의상·인물 보존 지시문, 추가 요청, 두 AI 모델 선택, 명시적인 사진 전송 동의.
- 연결 전: 편집 지시문 복사 → Gemini에서 수동 편집 → 완성 이미지 가져오기.
- 결과 최대 6개를 현재 세션에서 비교·선택하고 후보정·상세페이지에 적용. 새 원본 업로드 시 결과 초기화.
- 밝기·대비·채도·따뜻함, 원본 비교, PNG 저장.
- 자체 제작 미니멀·러블리·스트릿 상세페이지와 마진 계산기.

## AI 연결

사이트의 production 비밀 환경변수에 GEMINI_API_KEY를 등록합니다. 키는 public 소스·hosting.json·브라우저 입력에 저장하지 않습니다. 코드 수정 없이 다음 연결 확인부터 활성화됩니다.

GET /api/ai/status는 키의 존재만 반환합니다. POST /api/ai/edit는 로그인과 같은 출처, 이미지 형식·용량, 모델·프리셋 및 전송 동의를 검사합니다. Google Interactions API에 store:false로 요청하며 서버는 사진이나 결과를 자체 저장하지 않습니다. API 이용료는 Codex 구독과 별도입니다. 키의 실제 권한·요금제·모델 접근은 첫 실제 요청에서 확인됩니다.

기본 모델 gemini-nano-banana-2.1, 정밀 선택 gemini-3-pro-image, 1K 결과 한 장씩 요청. 입력은 클라이언트에서 최대 긴 변 2048px JPEG로 변환됩니다. 오류·할당량·타임아웃·키 미등록 상태를 구분하며 자동 재시도하지 않습니다. 의상 및 얼굴 보존과 정확한 포즈는 생성 모델 특성상 보장할 수 없으므로 결과 검수가 필요합니다.

공식 문서: https://ai.google.dev/gemini-api/docs/image-generation

## 개발과 검증

pnpm dev 또는 node scripts/run-framework.mjs dev --host 127.0.0.1

로컬 로그인: http://127.0.0.1:5173/signin-with-chatgpt?return_to=%2Fstudio.html (Sites 개발용 인증). 프로덕션은 Sites 인증을 사용합니다.

node --test tests/ai-edit.test.mjs: 상품 보존 지시문, 참고사진 순서, 잘못된 프리셋, 이미지 출력 추출.

node tests/check-local-api.mjs: 실행 중인 로컬 개발 서버에서 401/200/503/403 검사. 실제 AI를 호출하지 않습니다.

빌드: Sites의 build-site.mjs helper. public 소스가 dist/client로 복사되고 서버가 dist/server에 생성됩니다. 기존 프로젝트 ID와 비공개 접근을 유지합니다.

API 키가 없어 실제 Google 이미지 생성은 미검증입니다. 브라우저에서 프리셋, 연결 대기 안내, 완성 이미지 가져오기와 적용을 확인했습니다.

기본 배경 제거는 @imgly/background-removal@1.7.0을 esm.sh에서 로드하며 첫 실행에 모델 다운로드가 필요합니다. 기본 배경 제거 사진은 기기에서 처리됩니다. 라이브러리의 AGPL 및 상용 라이선스 선택 사항은 상용 운영 전 확인이 필요합니다. Google Fonts는 로드 실패 시 시스템 폰트로 대체됩니다.
