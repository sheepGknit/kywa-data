function setActiveNav(element) {
	// 모든 메뉴 버튼의 하이라이트 스타일 제거
	const links = document.querySelectorAll('.nav-link');
	links.forEach(link => {
		link.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-900/40');
		link.classList.add('text-slate-300', 'hover:bg-slate-800', 'hover:text-white');
	});

	// 클릭된 메뉴 버튼만 파란색 하이라이트 적용
	element.classList.remove('text-slate-300', 'hover:bg-slate-800', 'hover:text-white');
	element.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-900/40');

	// 상단 타이틀 텍스트 변경
	const pageTitle = element.innerText.trim();
	document.getElementById('currentPageTitle').innerText = pageTitle;
}

