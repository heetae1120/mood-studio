import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../../chatgpt-auth';
export const dynamic = 'force-dynamic';
export async function GET() {
  if(!await getChatGPTUser()) return Response.json({error:'로그인이 필요합니다.'},{status:401});
  const values=env as unknown as Record<string,string|undefined>;
  return Response.json({configured:Boolean(values.GEMINI_API_KEY),provider:'Google Gemini',models:['gemini-nano-banana-2.1','gemini-3-pro-image']},{headers:{'Cache-Control':'no-store'}});
}
