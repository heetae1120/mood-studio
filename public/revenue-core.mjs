export const STORAGE_KEY='heeta-shopping-tools.revenue.v1';
export function normalizeRecord(raw){
 if(!raw||typeof raw!=='object')throw new Error('올바른 판매 기록이 아닙니다.');
 const name=String(raw.name??'').trim(),platform=String(raw.platform??'').trim(),date=String(raw.date??'');
 if(!name||name.length>80||platform.length>40)throw new Error('상품명은 1~80자, 플랫폼은 40자 이내로 입력해주세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw new Error('올바른 판매일을 입력해주세요.');
 const out={id:String(raw.id??''),date,name,platform};
 if(!/^[a-zA-Z0-9-]{8,80}$/.test(out.id))throw new Error('판매 기록 ID가 올바르지 않습니다.');
 for(const key of ['cost','sale','quantity','shipping','packaging','feeRate']){
  const value=Number(raw[key]);
  const max=key==='quantity'?100000:key==='feeRate'?100:1000000000;
  if(!Number.isFinite(value)||value<0||value>max||(key!=='feeRate'&&!Number.isInteger(value))||(key==='quantity'&&value<1))throw new Error('금액·수량·수수료를 확인해주세요. 금액은 0 이상, 수량은 1 이상의 정수입니다.');
  out[key]=value;
 }
 return out;
}
export function calculateRecord(record){
 const revenue=record.sale*record.quantity,goodsCost=record.cost*record.quantity;
 const fee=Math.round(revenue*record.feeRate/100),extras=record.shipping+record.packaging;
 const totalCost=goodsCost+fee+extras,profit=revenue-totalCost;
 return {revenue,goodsCost,fee,extras,totalCost,profit,margin:revenue>0?profit/revenue*100:null};
}
export function summarizeRecords(records){
 const total=records.reduce((sum,r)=>{const c=calculateRecord(r);for(const k of ['revenue','goodsCost','fee','extras','totalCost','profit'])sum[k]+=c[k];sum.quantity+=r.quantity;return sum},{revenue:0,goodsCost:0,fee:0,extras:0,totalCost:0,profit:0,quantity:0});
 return {...total,margin:total.revenue>0?total.profit/total.revenue*100:null};
}
export function parseBackup(value){
 if(!value||value.version!==1||!Array.isArray(value.records)||value.records.length>10000)throw new Error('지원하는 백업 파일이 아닙니다. 최대 10,000건까지 복원할 수 있어요.');
 const rows=value.records.map(normalizeRecord);
 if(new Set(rows.map(r=>r.id)).size!==rows.length)throw new Error('중복된 기록 ID가 있는 파일입니다.');
 return rows;
}
export function recordsCSV(records){
 const columns=['판매일','상품명','플랫폼','개당 원가','개당 판가','판매수량','총매출','총상품원가','택배비(건 전체)','포장비(건 전체)','수수료율(%)','플랫폼수수료','총비용','이익금','이익률(%)'];
 const cell=value=>{let s=String(value??'');if(typeof value==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 return '\uFEFF'+[columns,...records.map(r=>{const c=calculateRecord(r);return [r.date,r.name,r.platform,r.cost,r.sale,r.quantity,c.revenue,c.goodsCost,r.shipping,r.packaging,r.feeRate,c.fee,c.totalCost,c.profit,c.margin===null?'':Number(c.margin.toFixed(2))]})].map(row=>row.map(cell).join(',')).join('\r\n');
}
