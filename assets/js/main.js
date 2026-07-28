/* ==============================================================
   main.js
   1) 모바일 햄버거 메뉴
   2) 검색 패널 토글 + 제목/요약/태그 클라이언트 필터
   3) 토픽(태그) 알약 버튼 필터 + "More…" 펼치기
   검색어와 선택된 태그는 AND 조건으로 함께 적용됩니다.
   ============================================================== */
(function () {
  'use strict';

  /* ---------- 1. 모바일 네비게이션 ---------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });

    // 메뉴 안 링크를 누르면 닫기
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. 검색 패널 토글 ---------- */
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var searchInput = document.querySelector('[data-search-input]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      var open = searchPanel.classList.toggle('is-open');
      searchToggle.setAttribute('aria-expanded', String(open));
      if (open && searchInput) searchInput.focus();
      if (!open && searchInput) {
        searchInput.value = '';
        applyFilters();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !searchPanel) return;
    if (searchPanel.classList.contains('is-open')) {
      searchPanel.classList.remove('is-open');
      if (searchToggle) {
        searchToggle.setAttribute('aria-expanded', 'false');
        searchToggle.focus();
      }
      if (searchInput) searchInput.value = '';
      applyFilters();
    }
  });

  /* ---------- 3. 포스트 필터링 ---------- */
  var listEl = document.querySelector('[data-post-list]');
  var cards = Array.prototype.slice.call(
    document.querySelectorAll('[data-post-card]')
  );
  var pills = Array.prototype.slice.call(
    document.querySelectorAll('[data-filter]')
  );
  var emptyState = document.querySelector('[data-empty-state]');
  var countEl = document.querySelector('[data-result-count]');
  var moreBtn = document.querySelector('[data-more-topics]');

  var activeTag = 'all';

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function matchesTag(card) {
    if (activeTag === 'all') return true;
    var tags = normalize(card.getAttribute('data-tags')).split(/\s+/);
    return tags.indexOf(activeTag) !== -1;
  }

  function matchesQuery(card, query) {
    if (!query) return true;
    // 제목 + 요약 + 태그를 한 문자열로 합쳐 검색 (data-search 속성)
    return normalize(card.getAttribute('data-search')).indexOf(query) !== -1;
  }

  function applyFilters() {
    if (!cards.length) return;

    var query = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var show = matchesTag(card) && matchesQuery(card, query);
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });

    if (emptyState) emptyState.classList.toggle('is-visible', visible === 0);
    if (listEl) listEl.setAttribute('aria-busy', 'false');

    if (countEl) {
      if (activeTag === 'all' && !query) {
        countEl.textContent = '전체 글 ' + cards.length + '개';
      } else {
        countEl.textContent = visible + '개의 글을 찾았습니다';
      }
    }
  }

  if (searchInput) {
    // 입력 중 과도한 렌더를 막기 위한 디바운스
    var timer = null;
    searchInput.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(applyFilters, 120);
    });
    // 검색 폼에서 Enter를 눌러도 페이지가 새로고침되지 않도록
    var form = searchInput.closest('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        applyFilters();
      });
    }
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      activeTag = normalize(pill.getAttribute('data-filter'));
      pills.forEach(function (p) {
        p.setAttribute('aria-pressed', String(p === pill));
      });
      applyFilters();
    });
  });

  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      var hidden = document.querySelectorAll('.pill.is-hidden');
      Array.prototype.forEach.call(hidden, function (el) {
        el.classList.remove('is-hidden');
      });
      moreBtn.remove();
    });
  }

  /* ---------- 4. URL 해시로 진입 시 태그 선택 (예: /#react) ---------- */
  function applyHash() {
    var hash = normalize(window.location.hash.replace('#', ''));
    if (!hash) return;
    var target = pills.filter(function (p) {
      return normalize(p.getAttribute('data-filter')) === hash;
    })[0];
    if (target) {
      target.classList.remove('is-hidden');
      target.click();
      target.scrollIntoView({ block: 'center' });
    }
  }

  applyHash();
  window.addEventListener('hashchange', applyHash);

  applyFilters();
})();
