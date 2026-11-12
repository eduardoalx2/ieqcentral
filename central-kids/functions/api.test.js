'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
const D=require('./domain');
function fixture(){
 const now=Date.parse('2026-11-12T14:00:00Z'),rows=new Map(),id='a3fb503e-8bb9-4001-9001-86c45df433ad',token='a'.repeat(64);
 const snapshot=(path)=>({exists:rows.has(path),data:()=>structuredClone(rows.get(path)),id:path.split('/').at(-1)});
 const doc=path=>({path,collection:name=>collection(path+'/'+name),get:async()=>snapshot(path)});
 const collection=path=>({doc:id=>doc(path+'/'+(id||crypto.randomUUID()))});
 const db={doc,collection,getAll:async(...refs)=>refs.map(r=>snapshot(r.path)),runTransaction:async(fn)=>{const writes=[];const tx={get:async r=>snapshot(r.path),set:(r,v)=>writes.push(()=>rows.set(r.path,structuredClone(v))),create:(r,v)=>writes.push(()=>{if(rows.has(r.path))throw Error('Duplicado');rows.set(r.path,structuredClone(v));}),update:(r,v)=>writes.push(()=>rows.set(r.path,{...rows.get(r.path),...structuredClone(v)}))};const result=await fn(tx);writes.forEach(w=>w());return result;}};
 class HttpsError extends Error{constructor(code,msg){super(msg);this.code=code;}}
 const context={exports:{},Buffer,Date:class extends Date{static now(){return now;}},require:name=>name==='firebase-functions/v2/https'?{onCall:(_,fn)=>fn,HttpsError}:name==='firebase-admin/app'?{initializeApp(){}}:name==='firebase-admin/firestore'?{getFirestore:()=>db}:name==='./domain'?D:require(name)};
 vm.runInNewContext(fs.readFileSync(__dirname+'/index.js','utf8'),context);
 const s={...D.initial(),enabled:true};D.reserve(s,id,2,now);s.holds[id].uid='owner';rows.set('system/event',s);
 rows.set('orders/'+id,{uid:'owner',tokenHash:crypto.createHash('sha256').update(token).digest('hex'),name:'Teste',phone:'43999991234',quantity:2,status:'reserved',expiresAt:now+1800000,numbers:[],paidCents:0,approvedQuantity:0});
 const call=(action,data={},auth={uid:'owner',token:{}})=>context.exports.centralKidsApi({data:{action,id,token,...data},auth});
 const admin={uid:'admin',token:{email_verified:true,email:D.ADMINS[0]}};
 return {rows,id,call,admin};
}
test('aviso sem anexo exige dono, preserva pendência e só administrador libera números',async()=>{
 const f=fixture();await assert.rejects(f.call('declare',{token:'b'.repeat(64)},{uid:'stranger',token:{}}));
 await f.call('declare');await f.call('declare');
 assert.equal(f.rows.get('orders/'+f.id).proofMethod,'declared');assert.equal(f.rows.get('orders/'+f.id).status,'pending');
 assert.deepEqual(f.rows.get('orders/'+f.id).numbers,[]);assert.equal(Object.keys(f.rows.get('system/event').allocations).length,0);
 assert.equal([...f.rows.keys()].filter(k=>k.startsWith('audit/')).length,1);
 await assert.rejects(f.call('approve',{quantity:2,paidCents:1000}));
 const approved=await f.call('approve',{quantity:2,paidCents:1000},f.admin);assert.equal(approved.numbers.length,2);
});
test('PDF de 2 MB é gravado em partes privadas e reconstruído sem perder bytes',async()=>{
 const f=fixture(),file=Buffer.concat([Buffer.from('%PDF-1.7\n'),Buffer.alloc(2*1024*1024)]),base64=file.toString('base64');
 await f.call('submit',{base64,mime:'application/pdf'});
 const parts=[...f.rows.entries()].filter(([k])=>k.startsWith('receipts/'+f.id+'/parts/'));
 assert.ok(parts.length>1);parts.forEach(([,p])=>assert.ok(Buffer.byteLength(JSON.stringify(p))<1048576));
 await assert.rejects(f.call('file'));
 const restored=await f.call('file',{},f.admin);assert.equal(restored.base64,base64);
 f.rows.set('receipts/'+f.id,{mime:'application/pdf',base64});
 assert.equal((await f.call('file',{},f.admin)).base64,base64);
});
