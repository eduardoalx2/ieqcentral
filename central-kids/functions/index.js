'use strict';
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {randomBytes,createHash,timingSafeEqual}=require('node:crypto');
const D=require('./domain');
initializeApp();
const db=getFirestore('central-kids');
const stateRef=db.doc('system/event');
const hash=t=>createHash('sha256').update(String(t||'')).digest('hex');
function owns(o,request){const token=hash(request.data.token);return request.auth?.uid===o.uid||(typeof o.tokenHash==='string'&&timingSafeEqual(Buffer.from(token),Buffer.from(o.tokenHash)));}
function admin(r){return !!r.auth?.token.email_verified&&D.ADMINS.includes(String(r.auth.token.email||'').toLowerCase());}
function publicOrder(o,id,internal=false){const {uid,tokenHash,...safe}=o;if(!internal){for(const key of ["note","duplicateReceipt","approvedBy","adjustmentReason"])delete safe[key];}return {id,...safe};}
exports.centralKidsApi=onCall({region:'southamerica-east1',maxInstances:5,timeoutSeconds:60,cors:['https://www.ieqlondrina.com.br','https://ieqlondrina.com.br',/^http:\/\/localhost(:\d+)?$/,/^http:\/\/127\.0\.0\.1(:\d+)?$/]},async request=>{
 try{
 const a=request.data?.action, now=Date.now();
 if(a==='status'){const s=(await stateRef.get()).data()||D.initial();D.clean(s,now);return {enabled:s.enabled,closed:s.closed||now>=D.CLOSE,available:D.remaining(s),pix:'regiao655@gmail.com',closeAt:D.CLOSE,winner:s.draws.at(-1)?{number:s.draws.at(-1).number,name:s.draws.at(-1).name}:null};}
 if(!request.auth)throw new HttpsError('unauthenticated','Entre novamente para continuar.');
 const management=['dashboard','approve','reject','note','close','enable','draw','contact','deliver','file'];
 if(management.includes(a)&&!admin(request))throw new HttpsError('permission-denied','Acesso reservado aos administradores.');
 if(a==='reserve'){
 const name=D.text(request.data.name),phone=D.phone(request.data.phone),quantity=D.integer(request.data.quantity,1,200),seller=String(request.data.seller||'').trim().slice(0,100);
 if(!request.data.confirmPhone)throw Error('Confirme seu WhatsApp.');
 const id=D.text(request.data.id,80);if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Identificador inválido.');
 const token=D.text(request.data.token,100);if(!/^[a-f0-9]{64}$/.test(token))throw Error('Protocolo inválido.');
 const ref=db.doc(`orders/${id}`);
 return await db.runTransaction(async tx=>{
 const [ss,os]=await Promise.all([tx.get(stateRef),tx.get(ref)]);if(os.exists){if(!owns(os.data(),request))throw Error('Compra indisponível.');return publicOrder(os.data(),id);}
 const s=ss.data()||D.initial();D.clean(s,now);const active=Object.values(s.holds).filter(h=>h.uid===request.auth.uid||h.phone===phone);if(active.filter(h=>!h.pending).length>=2)throw Error('Você já tem reservas em aberto. Consulte suas compras.');
 const h=D.reserve(s,id,quantity,now);h.uid=request.auth.uid;h.phone=phone;
 const o={uid:request.auth.uid,tokenHash:hash(token),name,phone,seller,quantity,amountCents:quantity*500,status:'reserved',createdAt:now,expiresAt:h.until,numbers:[],paidCents:0,approvedQuantity:0};tx.set(stateRef,s);tx.create(ref,o);return publicOrder(o,id);
 });}
 if(a==='lookup'){const ref=db.doc(`orders/${D.text(request.data.id,80)}`);const snap=await ref.get();if(!snap.exists||!owns(snap.data(),request))throw Error('Compra não encontrada. Use seu link privado.');const o=publicOrder(snap.data(),snap.id);if(o.status==='reserved'&&o.expiresAt<=now)o.status='expired';return o;}
 if(a==='submit'){
 const id=D.text(request.data.id,80);if(id.includes('/'))throw Error('Compra inválida.');
 const bytes=D.validateFile(request.data.base64,request.data.mime),digest=hash(bytes.toString('base64'));
 return await db.runTransaction(async tx=>{
 const ref=db.doc(`orders/${id}`),fileRef=db.doc(`receipts/${id}`),dupRef=db.doc(`receiptHashes/${digest}`);
 const [ss,os,ds]=await Promise.all([tx.get(stateRef),tx.get(ref),tx.get(dupRef)]);if(!os.exists||!owns(os.data(),request))throw Error('Compra indisponível.');const o=os.data();if(['pending','approved'].includes(o.status))return publicOrder(o,id);
 if(o.status!=='reserved')throw Error('Compra não aceita comprovante.');const s=ss.data()||D.initial();D.submit(s,id,now);
 const encoded=bytes.toString('base64'),parts=Array.from({length:Math.ceil(encoded.length/600000)},(_,i)=>encoded.slice(i*600000,(i+1)*600000));
 tx.set(fileRef,{chunkCount:parts.length,mime:request.data.mime,createdAt:now,bytes:bytes.length});
 parts.forEach((base64,i)=>tx.set(fileRef.collection('parts').doc(String(i).padStart(2,'0')),{base64}));tx.set(dupRef,{firstOrderId:ds.data()?.firstOrderId||id});tx.update(ref,{status:'pending',submittedAt:now,duplicateReceipt:ds.exists&&ds.data().firstOrderId!==id});tx.set(stateRef,s);return {id,status:'pending'};
 });}
 if(a==='dashboard'){const [ss,orders,logs]=await Promise.all([stateRef.get(),db.collection('orders').get(),db.collection('audit').orderBy('at','desc').limit(100).get()]);const s=ss.data()||D.initial();D.clean(s,now);return {state:s,available:D.remaining(s),orders:orders.docs.map(o=>publicOrder(o.data(),o.id,true)),audit:logs.docs.map(x=>x.data())};}
 if(a==='file'){const ref=db.doc(`receipts/${D.text(request.data.id,80)}`),f=await ref.get();if(!f.exists)throw Error('Comprovante indisponível.');const meta=f.data();if(meta.base64)return meta;const count=D.integer(meta.chunkCount,1,12);const parts=await db.getAll(...Array.from({length:count},(_,i)=>ref.collection('parts').doc(String(i).padStart(2,'0'))));if(parts.some(p=>!p.exists))throw Error('Comprovante incompleto. Contate a equipe.');const base64=parts.map(p=>p.data().base64).join('');D.validateFile(base64,meta.mime);return {mime:meta.mime,base64};}
 if(management.includes(a))return await db.runTransaction(async tx=>{
 const ss=await tx.get(stateRef),s=ss.data()||D.initial();D.clean(s,now);
 const id=request.data.id?D.text(request.data.id,80):null;if(id?.includes('/'))throw Error('Compra inválida.');
 const ref=id?db.doc(`orders/${id}`):null,os=ref?await tx.get(ref):null;let result={ok:true};
 if(['approve','reject','note'].includes(a)){
 if(!os?.exists)throw Error('Compra não encontrada.');const o=os.data();
 if(a==='approve'){
 if(o.status==='approved')return publicOrder(o,id);
 if(o.status!=='pending')throw Error('É necessário receber o comprovante antes da aprovação.');
 const quantity=request.data.quantity,paidCents=request.data.paidCents,reason=String(request.data.reason||'').trim();
 if(quantity!==o.quantity)D.text(reason,500);
 const numbers=D.approve(s,id,quantity,paidCents,now);const update={status:'approved',approvedQuantity:quantity,paidCents,numbers,approvedAt:now,approvedBy:request.auth.token.email,adjustmentReason:reason};tx.update(ref,update);result=publicOrder({...o,...update},id);
 }else if(a==='reject'){
 if(!['pending','reserved'].includes(o.status))throw Error('Compra não pode ser rejeitada neste estado.');const reason=D.text(request.data.reason,500);delete s.holds[id];tx.update(ref,{status:'rejected',reason,resolvedAt:now});
 }else tx.update(ref,{note:D.text(request.data.reason,1000)});
 }else if(a==='enable'){if(s.closed||s.draws.length||now>=D.CLOSE)throw Error('Evento encerrado.');s.enabled=request.data.enabled===true;
 }else if(a==='close'){s.closed=true;
 }else if(a==='draw'){
 const all=await tx.get(db.collection('orders'));const orders=Object.fromEntries(all.docs.map(x=>[x.id,x.data()]));s.closed=true;result=D.draw(s,orders,now,request.data.reason);
 }else if(a==='contact'){const last=s.draws.at(-1);if(!last)throw Error('Sorteio ainda não realizado.');D.text(request.data.reason,500);if(!last.contactAt)last.contactAt=now;
 }else if(a==='deliver'){const last=s.draws.at(-1);if(!last)throw Error('Sorteio ainda não realizado.');last.delivered=true;last.deliveredAt=now;last.receivedBy=D.text(request.data.reason,200);
 }else throw Error('Ação inválida.');
 tx.set(stateRef,s);tx.create(db.collection('audit').doc(),{action:a,orderId:id,at:now,by:request.auth.token.email,reason:String(request.data.reason||'').slice(0,1000),quantity:request.data.quantity||null,paidCents:request.data.paidCents||null});return result;
 });
 throw Error('Ação inválida.');
 }catch(e){if(e instanceof HttpsError)throw e;throw new HttpsError('failed-precondition',e.message||'Não foi possível concluir.');}
});
