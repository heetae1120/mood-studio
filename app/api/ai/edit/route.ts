import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../../chatgpt-auth';
import { MODELS, buildPrompt, extractImage } from '../../../../lib/ai-edit.mjs';
export const dynamic = 'force-dynamic';
const noStore={'Cache-Control':'no-store'};
const fail=(error:string,status:number)=>Response.json({error},{status,headers:noStore});
export async function POST(request:Request) {
  if(!await getChatGPTUser()) return fail('로그인이 필요합니다.',401);
  if(request.headers.get('origin')!==new URL(request.url).origin) return fail('사이트에서 다시 요청해주세요.',403);
  const values=env as unknown as Record<string,string|undefined>;
  if(!values.GEMINI_API_KEY) return fail('AI 연결 대기 중입니다. 사이트 서버에 GEMINI_API_KEY를 등록하면 자동 생성이 활성화됩니다.',503);
  if(Number(request.headers.get('content-length'))>18*1024*1024) return fail('이미지 용량을 줄여주세요.',413);
  try {
    const form=await request.formData();
    const model=String(form.get('model')||MODELS[0]);
    if(!MODELS.includes(model)) return fail('지원하는 AI 모델을 선택해주세요.',400);
    if(form.get('consent')!=='true') return fail('Google 이미지 전송 동의가 필요합니다.',400);
    const source=form.get('source'),poseRef=form.get('poseReference'),placeRef=form.get('placeReference');
    if(!(source instanceof File)) return fail('상품 원본 사진을 추가해주세요.',400);
    const files=[source,poseRef,placeRef].filter((file):file is File=>file instanceof File);
    if(files.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||!file.size||file.size>6*1024*1024)) return fail('이미지는 JPG, PNG, WEBP 형식의 6MB 이하 파일이어야 합니다.',400);
    if(files.reduce((sum,file)=>sum+file.size,0)>15*1024*1024) return fail('이미지 총 용량은 15MB 이하여야 합니다.',413);
    const mode=String(form.get('mode')),pose=String(form.get('pose')||'keep'),place=String(form.get('place')||'keep');
    let prompt;
    try {prompt=buildPrompt({mode,pose,place,notes:String(form.get('notes')||''),hasPoseReference:poseRef instanceof File,hasPlaceReference:placeRef instanceof File});}
    catch(error) {return fail(error instanceof Error?error.message:'편집 조건을 확인해주세요.',400);}
    const ratio=String(form.get('ratio')||'1:1');
    if(!['1:1','4:5','3:4'].includes(ratio)) return fail('지원하는 이미지 비율을 선택해주세요.',400);
    const input:unknown[]=[{type:'text',text:prompt}];
    for(const file of files) input.push({type:'image',mime_type:file.type,data:Buffer.from(await file.arrayBuffer()).toString('base64')});
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':values.GEMINI_API_KEY},
      body:JSON.stringify({model,input,store:false,response_format:{type:'image',mime_type:'image/png',aspect_ratio:ratio,image_size:'1K'}}),
      signal:AbortSignal.timeout(170000)
    });
    if(!response.ok) {
      const status=response.status;
      if(status===429) return fail('AI 사용 한도 또는 요청량을 초과했어요. 결제·한도를 확인하거나 잠시 후 다시 시도해주세요.',429);
      if(status===401||status===403) return fail('AI 키의 권한 또는 결제 설정을 확인해주세요.',502);
      return fail(`AI 서비스가 이미지를 생성하지 못했어요. 다시 시도해주세요. (상태 ${status})`,502);
    }
    const result=extractImage(await response.json());
    if(!result) return fail('AI가 편집 이미지를 반환하지 않았어요. 사진이나 편집 조건을 바꿔주세요.',422);
    return Response.json({...result,model},{headers:noStore});
  } catch(error) {
    if(error instanceof Error&&['TimeoutError','AbortError'].includes(error.name)) return fail('AI 응답 시간이 초과됐어요. 중복 요청을 피하려면 잠시 기다린 후 다시 시도해주세요.',504);
    return fail('생성 요청을 처리하지 못했어요. 이미지와 인터넷 연결을 확인해주세요.',500);
  }
}

