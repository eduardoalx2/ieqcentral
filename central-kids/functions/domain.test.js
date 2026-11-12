'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const D=require('./domain');
const now=Date.parse('2026-11-12T13:00:00Z');
function state(){return {...D.initial(),enabled:true};}
test('reservas concorrentes não ultrapassam 200 números',()=>{
 const s=state();D.reserve(s,'a',198,now);D.reserve(s,'b',2,now);
 assert.throws(()=>D.reserve(s,'c',1,now));assert.equal(D.remaining(s),0);
});
test('aprovação ajustada libera excedente e não repete números',()=>{
 const s=state();D.reserve(s,'a',5,now);D.submit(s,'a',now);
 const a=D.approve(s,'a',4,2000,now);assert.equal(a.length,4);
 assert.equal(D.remaining(s),196);assert.throws(()=>D.approve(s,'a',4,2000,now));
 D.reserve(s,'b',196,now);D.submit(s,'b',now);
 const b=D.approve(s,'b',196,98000,now);
 assert.equal(new Set([...a,...b]).size,200);
});
test('reserva expira e valor divergente não gera números',()=>{
 const s=state();D.reserve(s,'a',5,now);D.submit(s,'a',now);
 assert.throws(()=>D.approve(s,'a',5,2000,now));assert.deepEqual(s.allocations,{});
 D.reserve(s,'b',2,now);assert.throws(()=>D.submit(s,'b',now+1800001));
});
test('encerramento bloqueia compra e comprovante, mas permite conferência',()=>{
 const s=state();D.reserve(s,'a',1,now);D.submit(s,'a',now);
 assert.throws(()=>D.reserve(s,'b',1,D.CLOSE));
 assert.throws(()=>D.submit(s,'b',D.CLOSE));
 assert.equal(D.approve(s,'a',1,500,D.CLOSE+1).length,1);
});
test('sorteio exige encerramento e resolução das pendências',()=>{
 const s=state();D.reserve(s,'a',1,now);D.submit(s,'a',now);
 assert.throws(()=>D.draw(s,{a:{name:'Ana'}},now));s.closed=true;
 assert.throws(()=>D.draw(s,{a:{name:'Ana'}},now));D.approve(s,'a',1,500,now);
 const winner=D.draw(s,{a:{name:'Ana'}},now);assert.equal(winner.name,'Ana');
 assert.throws(()=>D.draw(s,{a:{name:'Ana'}},now+49*3600000,'Sem resposta'));
});
test('WhatsApp aceita formato brasileiro e rejeita DDD inválido',()=>{
 assert.equal(D.phone('(43) 99999-1234'),'43999991234');
 assert.equal(D.phone('+55 43 99999-1234'),'43999991234');
 assert.throws(()=>D.phone('00999991234'));
});

test('nova apuração exclui todas as compras do mesmo ganhador',()=>{
 const s=state();for(const id of ['a','b','c']){D.reserve(s,id,1,now);D.submit(s,id,now);D.approve(s,id,1,500,now);}
 s.closed=true;const orders={a:{name:'Ana',phone:'43999991234'},b:{name:'Ana',phone:'43999991234'},c:{name:'Bia',phone:'43999995678'}};
 s.draws.push({orderId:'a',contactAt:now,delivered:false});
 const result=D.draw(s,orders,now+48*3600000,'Sem resposta');assert.equal(result.orderId,'c');
});
