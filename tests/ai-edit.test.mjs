import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildPrompt,extractImage} from '../lib/ai-edit.mjs';
test('place-only edit explicitly locks original pose and garment details',()=>{
 const prompt=buildPrompt({mode:'place',pose:'keep',place:'beach'});
 assert.match(prompt,/exact original pose/);assert.match(prompt,/coastal walkway/);assert.match(prompt,/button count/);
});
test('references keep stable image ordering when only a place photo is provided',()=>{
 const prompt=buildPrompt({mode:'place',pose:'keep',place:'reference',hasPlaceReference:true});
 assert.match(prompt,/Input image 2 is PLACE/);assert.doesNotMatch(prompt,/Input image 3/);
});
test('missing references and invalid presets never produce a paid request',()=>{
 assert.throws(()=>buildPrompt({mode:'pose',pose:'reference',place:'keep'}),/포즈 참고사진/);
 assert.throws(()=>buildPrompt({mode:'place',pose:'keep',place:'reference'}),/장소 참고사진/);
 assert.throws(()=>buildPrompt({mode:'pose',pose:'invalid',place:'keep'}),/다시 선택/);
});
test('response parsing ignores input and thought steps and rejects text-only output',()=>{
 assert.deepEqual(extractImage({steps:[{type:'model_thought',content:[{type:'image',mime_type:'image/png',data:'thought'}]},{type:'model_output',content:[{type:'image',mime_type:'image/png',data:'final'}]}]}),{mimeType:'image/png',data:'final'});
 assert.equal(extractImage({steps:[{type:'model_output',content:[{type:'text',text:'Unable to edit'}]}]}),null);
});
