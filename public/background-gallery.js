export function initBackgroundGallery(editor){
  const dialog=document.createElement('dialog');
  dialog.className='background-dialog';
  dialog.setAttribute('aria-labelledby','background-gallery-title');
  dialog.innerHTML=`<div class="gallery-header"><div><h2 id="background-gallery-title">어디에서 촬영할까요?</h2><p>유럽의 골목부터 상하이의 야경까지, 배경 사진 30선.<br>사진을 선택한 뒤 ‘선택한 배경으로 바꾸기’를 눌러주세요.</p></div><button class="gallery-close" aria-label="배경 모음 닫기">×</button></div><div class="gallery-filters" role="group" aria-label="배경 지역"><button data-region="전체" aria-pressed="true">전체 30</button><button data-region="유럽" aria-pressed="false">유럽 15</button><button data-region="상하이" aria-pressed="false">상하이 15</button></div><div class="gallery-grid"></div><p class="gallery-license">사진: Unsplash 작가 · <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">무료 사용 조건 보기 ↗</a><br>사진별 출처에서 원본과 작가를 확인할 수 있어요. 인물·상표·건물에 관한 별도 권리는 사용 목적에 맞게 확인해주세요. 배경 합성은 API 키 없이 내 기기에서 처리되며 포즈와 조명은 재생성하지 않습니다.</p>`;
  document.body.append(dialog);
  const launch=document.createElement('button');
  launch.className='gallery-launch';launch.id='open-background-gallery';
  launch.innerHTML='<span><strong>▧ 배경 사진 30선</strong><small>유럽 15 · 상하이 15 · 무료 배경 합성</small></span><span>둘러보기 ↗</span>';
  document.querySelector('.custom-bg-upload').before(launch);
  let photos=null,region='전체',selected=null,loading=false;
  const grid=dialog.querySelector('.gallery-grid');
  function draw(){
    grid.replaceChildren();
    for(const photo of photos.filter(p=>region==='전체'||p.region===region)){
      const card=document.createElement('article');card.className='gallery-card';card.classList.toggle('selected',selected===photo.id);
      const pick=document.createElement('button');pick.className='gallery-pick';pick.setAttribute('aria-label',`${photo.name} 배경 선택`);pick.setAttribute('aria-pressed',String(selected===photo.id));
      const img=document.createElement('img');img.src=photo.thumbnail;img.alt=photo.name;img.loading='lazy';img.width=400;img.height=300;
      const caption=document.createElement('span');caption.className='gallery-caption';
      const title=document.createElement('strong');title.textContent=photo.name;
      const mood=document.createElement('small');mood.textContent=photo.mood;
      const hint=document.createElement('small');hint.textContent=photo.suitability==='C'?'상반신·배너용 · 바닥이 없는 풍경':photo.note;
      const tag=document.createElement('em');tag.textContent=selected===photo.id?'✓ 선택한 배경':`${photo.region} · 선택하기`;
      caption.append(title,mood,hint,tag);pick.append(img,caption);
      pick.onclick=async()=>{
        if(loading||editor.busy)return editor.toast('이미지 처리가 끝난 뒤 배경을 선택해주세요.');
        loading=true;pick.disabled=true;tag.textContent='배경 불러오는 중…';
        try{if(await editor.selectBackground(photo)){selected=photo.id;dialog.close();draw()}}finally{loading=false;pick.disabled=false;if(dialog.open)draw()}
      };
      const source=document.createElement('a');source.className='gallery-source';source.href=photo.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent=`사진: ${photo.author} / Unsplash ↗`;
      card.append(pick,source);grid.append(card);
    }
  }
  launch.onclick=async()=>{
    dialog.showModal();
    if(photos){draw();return}
    grid.innerHTML='<p class="gallery-loading" role="status">배경 사진을 불러오고 있어요…</p>';
    try{const response=await fetch('assets/backgrounds/catalog.json');if(!response.ok)throw new Error();photos=await response.json();draw()}catch{grid.innerHTML='<p class="gallery-loading" role="status">배경 목록을 불러오지 못했어요. 창을 닫고 다시 열어주세요.</p>'}
  };
  dialog.querySelector('.gallery-close').onclick=()=>dialog.close();
  dialog.querySelectorAll('[data-region]').forEach(button=>button.onclick=()=>{region=button.dataset.region;dialog.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(photos)draw()});
  window.addEventListener('mood-background-cleared',()=>{selected=null;if(photos)draw()});
}
