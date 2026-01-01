# 대기 중인 캠페인명 관리 가이드

## 개요

사전 정의되지 않은 한글 캠페인명이 입력되면 자동으로 `pending-campaign-names.json` 파일에 저장됩니다.
운영자는 이 파일을 확인하고, 검토 후 `translation-dictionary.json`으로 옮길 수 있습니다.

## 파일 위치

- **대기 목록**: `src/lib/campaign/pending-campaign-names.json`
- **사전 정의 사전**: `src/lib/campaign/translation-dictionary.json`

## 파일 형식

### pending-campaign-names.json
```json
{
  "pending": [
    {
      "korean": "신제품 출시",
      "english": "new product launch",
      "normalized": "newproductlaunch",
      "timestamp": "2025-01-29T10:30:00.000Z"
    }
  ]
}
```

### translation-dictionary.json
```json
{
  "신제품 출시": "new product launch",
  "블랙프라이데이": "black friday"
}
```

## 관리 방법

### 1. 대기 목록 확인

대기 목록을 확인하려면 `pending-campaign-names.json` 파일을 열어보세요.

또는 API를 통해 확인할 수 있습니다:
```bash
curl http://localhost:3000/api/campaign-names/pending
```

### 2. 사전 정의 사전으로 옮기기

1. `pending-campaign-names.json` 파일을 엽니다.
2. 검토하고 승인할 항목을 확인합니다.
3. `translation-dictionary.json` 파일을 엽니다.
4. 다음 형식으로 추가합니다:
   ```json
   {
     "한글명": "영어 번역"
   }
   ```
5. `pending-campaign-names.json`에서 해당 항목을 제거합니다.

### 3. 예시

**대기 목록에서:**
```json
{
  "pending": [
    {
      "korean": "신제품 출시",
      "english": "new product launch",
      "normalized": "newproductlaunch",
      "timestamp": "2025-01-29T10:30:00.000Z"
    }
  ]
}
```

**사전 정의 사전으로 옮기기:**
```json
{
  "블랙프라이데이": "black friday",
  "신제품 출시": "new product launch"
}
```

**대기 목록에서 제거:**
```json
{
  "pending": []
}
```

## 주의사항

- 대기 목록에 중복된 항목은 자동으로 방지됩니다.
- `timestamp`는 항목이 추가된 시간을 나타냅니다.
- `english`와 `normalized`는 번역 API가 성공한 경우에만 포함됩니다.
- 사전 정의 사전으로 옮긴 후에는 다음 사용자 입력부터 자동으로 사전 정의된 번역이 사용됩니다.

## 자동 저장 조건

다음 조건을 만족할 때 자동으로 대기 목록에 저장됩니다:

1. 한글 캠페인명이 입력됨
2. `translation-dictionary.json`에 해당 한글명이 없음
3. 번역이 완료됨 (성공 또는 실패 모두)

## API 엔드포인트

### POST /api/campaign-names/pending
대기 목록에 새 항목 추가 (자동 호출됨)

### GET /api/campaign-names/pending
대기 목록 조회

