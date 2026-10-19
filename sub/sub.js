// 시안 9 서브 화면 공통 동작: 휴대폰 전체 메뉴 · 머리 띠 빛줄 · 시안 조작판
// 메뉴 = 현행 누리집 메뉴(대메뉴 5 · 하위 15, 사이트맵 원문). 시안이 있는 화면은 시안 파일로 잇고, 나머지는 현행 주소(새 창)
// MENU 표는 tools/build_subpages.py가 채운다(손으로 고치지 않는다 — 모든 쪽의 주 메뉴·하위 메뉴·조작판과 같은 표)
(() => {
  const CUR = 'https://www.semyung.ac.kr';
  // MENU:BEGIN
  const MENU = [
    { h: 'SMIT 소개', home: 'about.html', items: [['학부소개', 'about.html'], ['학부장 인사말', 'greeting.html'], ['학부연혁', 'history.html'], ['교수소개', 'faculty.html']] },
    { h: 'SMIT 교육', home: 'goal.html', items: [['교육목표', 'goal.html'], ['교육과정', 'curriculum.html'], ['전공교육 체계도', 'roadmap.html']] },
    { h: 'SMIT 취업', home: 'recruit.html', items: [['채용공고', 'recruit.html'], ['진로와 취업', 'career.html']] },   // 세션 23(10-19 사용자): 대메뉴 = 채용공고로 바로(2024년 글 2개뿐인 'SMIT 취업' 게시판 쪽 employ.html은 뺐다)
    { h: 'SMIT 소식', home: 'notice.html', items: [['공지사항', 'notice.html'], ['갤러리', 'gallery.html'], ['경진대회', 'contest.html'], ['동아리', 'club.html']] },
    { h: 'SMIT 입학', home: 'admission.html', items: [['SMIT 입학정보', 'admission.html'], ['입학안내', CUR + '/ipsi.do']] },
  ];
  // MENU:END
  const EXT = '<svg class="ext" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5h5v5M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const here = document.body.dataset.page;   // 쪽 이름(about · greeting · … · admission, 교수 상세는 faculty)

  // ── 휴대폰 전체 메뉴: 메뉴 단추로 연다. Esc·닫기로 닫고 단추로 초점을 돌려준다
  const btn = document.querySelector('.menu-btn');
  if (btn) {
    const nav = document.createElement('div');
    nav.className = 'mnav'; nav.id = 'mnav'; nav.hidden = true;
    nav.setAttribute('role', 'dialog'); nav.setAttribute('aria-modal', 'true'); nav.setAttribute('aria-label', '전체 메뉴');
    nav.innerHTML = '<div class="mnav-head"><b>전체 메뉴</b><button type="button" class="mnav-close">닫기</button></div>' +
      // 대메뉴 제목 = 그 구역 첫 화면(home) 링크 — 주 메뉴와 같은 곳(10-16 GPT F-005: 하위 메뉴에 없는 'SMIT 취업' 게시판으로 갈 길이 없었다)
      MENU.map(g => '<section><h2><a class="mnav-home" href="' + g.home + '">' + g.h + '</a></h2><ul>' + g.items.map(([t, u]) => {
        const ext = u.startsWith('http'), cur = u === here + '.html';
        return '<li><a href="' + u + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + (cur ? ' aria-current="page"' : '') + '>' + t + (ext ? EXT + '<span class="sr">(현행 사이트, 새 창)</span>' : '') + '</a></li>';
      }).join('') + '</ul></section>').join('');
    document.body.appendChild(nav);
    btn.setAttribute('aria-controls', 'mnav'); btn.setAttribute('aria-expanded', 'false');
    const close = nav.querySelector('.mnav-close');
    // 세션 18(10-18) 피드백 7-4: 탭·마우스로 연 메뉴를 Esc로 닫으면 메뉴 단추에 주황 테두리가 남았다(스크립트가 돌려준 포커스가 키보드 표시로 그려짐)
    // → 키보드로 움직이던 사람(Enter·Space로 누름 · 안에서 Tab)에게만 포커스를 옮겨 준다(테두리 있음). 마우스·터치로 열면 메뉴 자체에(테두리 없음),
    //   닫을 때는 포커스를 거둔다 — 돌려주면 이어서 방향키를 누를 때 단추에 테두리가 생긴다(검증 세션 18 — 메인 안쪽 화면과 같은 규칙)
    let kb = false;
    nav.tabIndex = -1;
    const open = on => {
      nav.hidden = !on; btn.setAttribute('aria-expanded', String(on)); document.documentElement.style.overflow = on ? 'hidden' : '';
      if (on) (kb ? close : nav).focus({ preventScroll: true });
      else if (kb) btn.focus({ preventScroll: true });
      else if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    };
    btn.addEventListener('click', e => { kb = e.detail === 0; open(true); });   // detail 0 = 키보드(Enter·Space)로 누름
    close.addEventListener('click', e => { if (e.detail === 0) kb = true; else kb = false; open(false); });
    nav.addEventListener('keydown', e => { if (e.key === 'Tab') kb = true; if (e.key === 'Escape') open(false); });
    nav.addEventListener('pointerdown', () => { kb = false; });   // 키보드로 연 뒤 마우스로 쓰면 마우스 사람으로 본다
  }

  // ── 머리 띠 빛줄: 움직임 줄이기면 멈춘다(CSS가 숨긴다). 조작판에서 켜고 끈다
  const sweep = document.getElementById('st-sweep');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sweep && reduce) sweep.pause();
  // 저사양 대응(10-16): 머리 띠가 화면 밖에 있거나 탭이 숨으면 빛줄 영상을 멈춘다(영상 풀기·겹침 합성을 쉰다). 다시 보이면 이어서 재생한다
  if (sweep && !reduce && 'IntersectionObserver' in window) {
    let inView = true;
    const sync = () => { if (sweep.hidden) return; if (inView && !document.hidden) sweep.play().catch(() => {}); else sweep.pause(); };   // 조작판으로 끈 빛줄(hidden)은 건드리지 않는다
    new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }).observe(sweep.closest('.band') || sweep);
    document.addEventListener('visibilitychange', sync);
  }
  const swBtn = document.getElementById('p-sweep');
  if (swBtn && sweep) {
    swBtn.addEventListener('click', () => {
      const on = swBtn.getAttribute('aria-pressed') !== 'true';
      swBtn.setAttribute('aria-pressed', String(on)); swBtn.textContent = on ? '빛줄 켬' : '빛줄 끔';
      sweep.hidden = !on; if (on) { sweep.currentTime = 0; sweep.play().catch(() => {}); } else sweep.pause();
    });
  }

  // ── 시안 메모 숨김(업체·학부용 설명 상자 .rv를 끄고 실제 화면처럼 본다)
  const rvBtn = document.getElementById('p-rv');
  if (rvBtn) rvBtn.addEventListener('click', () => {
    const on = rvBtn.getAttribute('aria-pressed') !== 'true';
    rvBtn.setAttribute('aria-pressed', String(on)); document.documentElement.classList.toggle('no-rv', on);
  });
  if (new URLSearchParams(location.search).has('norv')) { document.documentElement.classList.add('no-rv'); if (rvBtn) rvBtn.setAttribute('aria-pressed', 'true'); }

  // ── 시안 조작판: 넓은 화면은 펼쳐 두고 좁은 화면(900px 이하)·검토 페이지 틀(iframe) 안에서는 접어 둔다(본문을 덮지 않게. 틀 밖 탭이 화면 고르기를 맡는다)
  const proto = document.querySelector('details.proto');
  if (proto && (matchMedia('(max-width: 900px)').matches || window.self !== window.top)) proto.open = false;

  // ── 06 돌아오는 길(웹 1차본, 세션 15): 장 표지가 메인 링크(a.kicker — tools/build_site.py가 바꾼다)인 쪽은 머리 띠 빈 곳을 눌러도 메인 그 장으로 간다.
  //    띠 안 링크·단추(머리말 메뉴 등)를 누른 것은 그대로 둔다. 키보드·읽기 도구는 장 표지 링크를 쓴다
  const kick = document.querySelector('a.kicker'), band = document.querySelector('.band');
  if (kick && band) band.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.target.closest('a, button, summary, input, select, textarea, .top')) return;   // 수정 키 클릭은 가로채지 않는다(새 창은 장 표지 링크로)
    if (String(window.getSelection ? getSelection() : '').length) return;   // 글을 고르던 중이면 옮기지 않는다
    location.href = kick.href;
  });

  // 시험용
  window.__sub = { page: here, menu: MENU, sweepAt: t => { if (sweep) { sweep.pause(); sweep.currentTime = t; } } };
})();
