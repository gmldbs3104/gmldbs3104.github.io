# Light Portfolio — Jekyll Theme

흰 배경 / 검정 텍스트 / 사이언(#00B4D8) 포인트의 개인 블로그·포트폴리오 테마입니다.
GitHub Pages에 그대로 올릴 수 있습니다.

---

## 1. 파일 구조

```
.
├── _config.yml                 # 사이트 정보·네비·히어로 문구·토픽 목록
├── Gemfile
├── index.html                  # 홈 (히어로 + 토픽 필터 + 최신 글 + 사이드바)
├── blog.html                   # /blog/  전체 글 목록
├── categories.html             # /categories/  카테고리별 모음
├── about.md                    # /about/
├── contact.md                  # /contact/
├── 404.html
├── _layouts/
│   ├── default.html            # 공통 뼈대 (head + header + main + footer)
│   ├── post.html               # 글 상세 (본문 + 사이드바 + 이전/다음)
│   └── page.html               # 일반 페이지
├── _includes/
│   ├── head.html               # 메타·OG·폰트 preconnect·CSS 링크
│   ├── header.html             # 로고 / 네비 / 검색 / 햄버거
│   ├── hero.html               # 히어로 섹션
│   ├── topics.html             # 알약형 태그 필터 버튼
│   ├── post-card.html          # 글 카드 한 장
│   ├── sidebar.html            # 프로필 / Popular Content / Tags
│   ├── footer.html
│   └── icon.html               # SVG 아이콘 모음
├── _posts/                     # 블로그 글
└── assets/
    ├── css/main.css            # 전체 스타일 (CSS 변수 기반)
    └── js/main.js              # 필터 · 검색 · 모바일 메뉴
```

## 2. 실행

```bash
bundle install
bundle exec jekyll serve
# http://localhost:4000
```

## 3. 색상 바꾸기

`assets/css/main.css` 상단 `:root` 블록 한 곳만 고치면 전체에 반영됩니다.

```css
:root {
  --color-bg:           #FFFFFF;  /* 페이지 배경 */
  --color-surface:      #FFFFFF;  /* 카드 배경 */
  --color-surface-alt:  #F4F8FB;  /* 은은한 블록 배경 */
  --color-text:         #000000;  /* 본문·제목 */
  --color-text-muted:   #6B6B6B;  /* 요약문·캡션 */
  --color-border:       #E3E6E8;  /* 카드 테두리·구분선 */
  --color-primary:      #00B4D8;  /* 포인트 컬러 */
  --color-primary-deep: #0090AE;  /* hover */
  --color-primary-soft: rgba(0,180,216,.10); /* 배지 배경 */
}
```

일러스트 SVG도 `var(--color-primary)`를 쓰므로 포인트 컬러를 바꾸면 그림도 같이 바뀝니다.

## 4. 폰트 (Poppins + Pretendard)

```css
--font-sans: "Poppins", "Pretendard Variable", Pretendard, system-ui, sans-serif;
```

**Poppins를 앞에 둔 것이 의도한 순서입니다.** 브라우저의 폰트 폴백은 글자 단위로 동작합니다.
Poppins에는 한글 글리프가 없으므로 한글은 자동으로 다음 순위인 Pretendard가 맡습니다.
반대로 Pretendard를 앞에 두면 Pretendard가 라틴 글리프도 가지고 있어 영문까지 Pretendard로 렌더링됩니다.

한글이 대부분인 문단에서 서체를 Pretendard로 통일하고 싶다면 `.lang-ko` 클래스나
`lang="ko"` 속성을 붙이세요. (`:lang(ko), .lang-ko { font-family: var(--font-ko); }`)

## 5. 글 쓰기

`_posts/YYYY-MM-DD-slug.md`

```yaml
---
title: "글 제목"
date: 2026-07-20 10:00:00 +0900
categories: [React]        # 카드 상단 배지에 쓰입니다
tags: [React, JavaScript]  # 토픽 필터 대상
summary: "카드에 보일 2~3줄 요약. 생략하면 본문 앞부분을 자동으로 씁니다."
read_time: "6분"
popular: true              # 사이드바 Popular Content에 우선 노출
---
```

## 6. 토픽 필터 · 검색

- 필터 버튼 목록은 `_config.yml`의 `topics.featured` 순서를 먼저 쓰고,
  거기 없는 태그는 `site.tags`에서 자동으로 이어 붙입니다.
- `topics.visible_count` 개까지만 보이고 나머지는 **More…** 버튼으로 펼쳐집니다.
- 검색은 헤더 돋보기 아이콘 → 현재 페이지 글 목록을 제목·요약·태그로 걸러냅니다.
  선택된 태그와 검색어는 AND로 함께 적용되고, Esc로 닫힙니다.
- `/#react` 처럼 해시로 들어오면 해당 태그가 자동 선택됩니다. (사이드바 Tags가 이 링크를 씁니다)

## 7. 반응형

| 구간 | 동작 |
| --- | --- |
| 데스크톱 (1025px~) | 본문 + 320px 사이드바 2단, 사이드바 sticky |
| 태블릿 (~1024px) | 1단 스택, 사이드바 위젯이 가로로 나열 |
| 모바일 (~768px) | 네비게이션이 햄버거 드로어로 전환, 버튼 전폭 |

## 8. 배포

1. `_config.yml`의 `url`, `baseurl`, `title`, `author`, `social`을 수정합니다.
   - `username.github.io` 저장소라면 `baseurl: ""`
   - `username.github.io/blog` 형태라면 `baseurl: "/blog"`
2. 저장소에 push → Settings → Pages → Source를 `main` 브랜치로 지정합니다.

## 9. 다크 모드를 나중에 추가한다면

요청대로 라이트 단일 테마로만 만들었고, 헤더의 테마 토글 버튼은 주석 처리해 두었습니다.
추가하려면 `_includes/header.html`의 주석을 풀고, `main.css`에
`[data-theme="dark"] { --color-bg: #0D0F12; --color-text: #E3E6E8; ... }` 한 벌을 더 정의한 뒤
`<html>`의 `data-theme` 값을 토글하면 됩니다.
