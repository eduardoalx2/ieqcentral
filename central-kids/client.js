import { auth, app } from './firebase-client.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-functions.js';
import { signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
export { auth };
const call=httpsCallable(getFunctions(app,'southamerica-east1'),'centralKidsApi');
export const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export async function api(action,data={}){return (await call({action,...data})).data;}
export async function participant(){await new Promise(resolve=>{const stop=onAuthStateChanged(auth,()=>{stop();resolve();});});if(!auth.currentUser)await signInAnonymously(auth);}
export function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
export const labels={reserved:'Aguardando pagamento',pending:'Pagamento em análise',approved:'Pagamento aprovado',rejected:'Compra não aprovada',expired:'Reserva expirada'};
export function message(o){return `Olá, ${o.name}! Confirmamos seu pagamento de ${money(o.paidCents)} na Ação entre Amigos do Central Kids.\nSeus ${o.approvedQuantity} números são: ${o.numbers.join(', ')}.\nSorteio em 20/12/2026, no culto, após a cantata de Natal. Obrigado por participar!`;}
