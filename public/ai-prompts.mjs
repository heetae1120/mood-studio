export const MODELS = ['gemini-nano-banana-2.1', 'gemini-3-pro-image'];
export const POSES = {
  keep:'Keep the exact original pose, body geometry and framing.',
  walk:'A natural mid-step walking pose, relaxed shoulders and natural arms.',
  sit:'Sitting naturally on a simple bench, with believable fabric folds.',
  side:'A three-quarter side-facing fashion pose. Preserve all visible garment details.',
  pocket:'A relaxed standing fashion pose with hands in the garment pockets only if pockets actually exist; otherwise rest the hands at the sides.',
  lean:'Lean lightly against a suitable nearby wall or railing in a relaxed fashion pose.',
  reference:'Follow only the pose and camera framing in the pose reference image; never copy its person or clothing.'
};
export const PLACES = {
  keep:'Preserve the original background and setting.',
  beach:'A photorealistic coastal walkway beside a calm ocean and sandy beach, soft daylight, believable horizon and ground contact.',
  park:'A real-looking green city park with leafy trees, a walking path and softly blurred greenery in natural daylight.',
  cafe:'A real-looking modern outdoor cafe terrace with subtle furniture and warm natural window light.',
  city:'A real-looking understated city street with neutral architecture and natural lifestyle fashion photography.',
  garden:'A real-looking quiet botanical garden with textured stone paths and soft dappled daylight.',
  reference:'Use the place reference as the location and environmental composition. Match perspective, ground, depth and lighting. Do not copy any people from it.'
};
export function buildPrompt({mode,pose,place,notes='',hasPoseReference=false,hasPlaceReference=false}) {
  if(!['pose','place'].includes(mode)) throw new Error('올바른 편집 모드를 선택해주세요.');
  if(!Object.hasOwn(POSES,pose)||!Object.hasOwn(PLACES,place)) throw new Error('포즈와 장소를 다시 선택해주세요.');
  if(pose==='reference'&&!hasPoseReference) throw new Error('포즈 참고사진을 추가해주세요.');
  if(place==='reference'&&!hasPlaceReference) throw new Error('장소 참고사진을 추가해주세요.');
  if(typeof notes!=='string'||notes.length>800) throw new Error('추가 요청은 800자 이내로 입력해주세요.');
  const lines=[
    'Edit the FIRST input photograph into ONE photorealistic ecommerce fashion photograph. The first image is the sole source of truth for the model and the product.',
    'Keep the same person, identity where visible, hairstyle, body proportions, exact clothing colors, fabric texture, pattern, button count, seams, pockets, logos and garment length. Do not beautify, redesign, add accessories or invent product details.',
    'Keep the original face crop when the face is not visible. Do not expand into unseen garment surfaces unnecessarily.',
    `POSE: ${POSES[pose]}`,
    `LOCATION: ${PLACES[place]}`,
    'Use physically plausible anatomy, hands, perspective, scale, ambient light, ground contact and contact shadows. No text, labels, collage, borders or watermarks added by the prompt.'
  ];
  let index=2;
  if(hasPoseReference) lines.push(`Input image ${index++} is POSE REFERENCE ONLY. Do not use its identity, clothes or product.`);
  if(hasPlaceReference) lines.push(`Input image ${index} is PLACE REFERENCE ONLY. Do not copy its people or clothes.`);
  if(notes.trim()) lines.push(`Additional visual direction (subject and garment preservation still applies): ${notes.trim()}`);
  return lines.join('\n\n');
}
export function extractImage(body) {
  const outputs=(body.steps||[]).filter(step=>step.type==='model_output').flatMap(step=>step.content||[]);
  const image=outputs.findLast(part=>part.type==='image'&&part.data);
  if(!image||!['image/png','image/jpeg','image/webp'].includes(image.mime_type)) return null;
  return {mimeType:image.mime_type,data:image.data};
}
