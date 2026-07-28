---
title: "미디어 쿼리 대신 컨테이너 쿼리를 쓰기 시작했다"
date: 2026-07-08 09:30:00 +0900
categories: [CSS]
tags: [CSS]
summary: "같은 카드 컴포넌트가 사이드바에서도, 본문에서도 자연스럽게 보이려면 화면 너비가 아니라 부모 너비를 기준으로 삼아야 합니다."
read_time: "5분"
popular: true
---

카드 컴포넌트를 만들다 보면 같은 컴포넌트를 넓은 본문에도, 좁은 사이드바에도 넣게 됩니다.
미디어 쿼리는 화면 너비만 보기 때문에 이 상황을 구분하지 못합니다.

## 컨테이너를 먼저 선언한다

```css
.card-slot {
  container-type: inline-size;
  container-name: slot;
}

@container slot (min-width: 420px) {
  .card { display: grid; grid-template-columns: 120px 1fr; }
}
```

기준이 뷰포트에서 **부모 요소**로 바뀝니다. 컴포넌트가 놓인 자리에 맞춰 스스로 모양을 바꿉니다.

## 언제 미디어 쿼리를 남겨두나

페이지 전체 레이아웃(2단 → 1단)이나 폰트 스케일처럼 화면 자체에 반응해야 하는 것은
여전히 미디어 쿼리가 맞습니다. 둘은 대체 관계가 아니라 역할이 다릅니다.
