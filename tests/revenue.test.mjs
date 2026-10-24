import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRecord,calculateRecord,summarizeRecords,parseBackup,recordsCSV} from '../public/revenue-core.mjs';
const row=overrides=>normalizeRecord({id:'example-record',date:'2026-10-24',name:'크롭 자켓',platform:'에이블리',cost:18000,sale:39900,quantity:3,shipping:3000,packaging:500,feeRate:10,...overrides});
test('quantity multiplies unit prices while order-level shipping and packaging apply once',()=>{
 const c=calculateRecord(row());assert.equal(c.revenue,119700);assert.equal(c.goodsCost,54000);assert.equal(c.fee,11970);assert.equal(c.extras,3500);assert.equal(c.profit,50230);assert.equal(c.margin,50230/119700*100);
});
test('zero sale and loss are represented without NaN or hidden costs',()=>{const c=calculateRecord(row({sale:0,quantity:1}));assert.equal(c.profit,-21500);assert.equal(c.margin,null)});
test('summary margin is weighted by actual revenue, never average of row rates',()=>{const rows=[row({cost:0,sale:10000,quantity:1,shipping:0,packaging:0,feeRate:0}),row({id:'second-record',cost:90000,sale:100000,quantity:1,shipping:0,packaging:0,feeRate:0})];const total=summarizeRecords(rows);assert.equal(total.margin,20000/110000*100);assert.equal(total.quantity,2)});
test('invalid dates, quantities and fee percentages are rejected',()=>{for(const value of [{date:'2026-02-30'},{quantity:0},{quantity:1.5},{cost:-1},{feeRate:101}])assert.throws(()=>row(value))});
test('backup rejects duplicate IDs and CSV escapes formulas and quoted names',()=>{assert.throws(()=>parseBackup({version:1,records:[row(),row()]}));const csv=recordsCSV([row({name:'=HYPERLINK("test")'})]);assert.match(csv,/'=HYPERLINK/);assert.match(csv,/""test""/);assert.equal(csv.charCodeAt(0),0xfeff)});
