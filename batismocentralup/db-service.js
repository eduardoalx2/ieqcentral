// Serviço de Banco de Dados Isolado — Batismo nas Águas · Central UP 2026
// Utiliza a coleção pública autorizada nas regras do projeto ("diadascriancas_inscricoes")
// com documentos exclusivos prefixados ("bup2026_*") e campos próprios ("bupTipo", "bupCriadoEm"),
// sem usar "criadoEm" para manter isolamento completo dos demais sistemas.

import { db } from '../firebase-config.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export const COL_PUBLICA = "diadascriancas_inscricoes";
export const DOC_CONFIG_ID = "bup2026_config_geral";

export const CONFIG_PADRAO = {
    bupTipo: "bup2026_config",
    inscricoesAbertas: true,
    camisetaAtiva: true,
    camisetaTitulo: "Camiseta Oficial · Batismo Central UP",
    camisetaDescricao: "Garanta a camiseta oficial para o grande dia do Batismo nas Águas no Culto Gratidão (13/12 às 19h)!",
    camisetaValor: "A definir",
    camisetaPagamento: "Pagamento via PIX ou presencialmente com a liderança do Central UP.",
    camisetaPix: "",
    camisetaLinkCompra: "",
    camisetaFotoBase64: "",
    camisetaFotoUrl: "",
    camisetaTamanhos: "10, 12, 14, P, M, G, GG",
    atualizadoEm: 0
};

function gerarId(prefixo) {
    const rand = Math.random().toString(36).substring(2, 8);
    return `${prefixo}_${Date.now()}_${rand}`;
}

export function limparTelefone(tel) {
    return String(tel || '').replace(/\D/g, '').slice(0, 11);
}

export function formatarTelefone(tel) {
    const d = limparTelefone(tel);
    if (d.length > 6) {
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    } else if (d.length > 2) {
        return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else if (d.length > 0) {
        return `(${d}`;
    }
    return '';
}

export function calcularIdade(dataIso) {
    if (!dataIso) return '';
    const partes = dataIso.split('-').map(Number);
    if (partes.length !== 3) return '';
    const nasc = new Date(partes[0], partes[1] - 1, partes[2]);
    const ref = new Date(2026, 11, 13); // 13/12/2026
    let idade = ref.getFullYear() - nasc.getFullYear();
    const m = ref.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && ref.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade >= 0 && idade < 120 ? `${idade} anos` : '';
}

export function formatarDataBR(dataIso) {
    if (!dataIso) return '-';
    const p = String(dataIso).split('-');
    if (p.length !== 3) return dataIso;
    return `${p[2]}/${p[1]}/${p[0]}`;
}

export async function obterConfig() {
    try {
        const ref = doc(db, COL_PUBLICA, DOC_CONFIG_ID);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            return { ...CONFIG_PADRAO };
        }
        return { ...CONFIG_PADRAO, ...snap.data() };
    } catch (err) {
        console.warn("Erro ao carregar config do Batismo UP:", err);
        return { ...CONFIG_PADRAO };
    }
}

export async function salvarConfig(dados) {
    const ref = doc(db, COL_PUBLICA, DOC_CONFIG_ID);
    const payload = {
        ...CONFIG_PADRAO,
        ...dados,
        bupTipo: "bup2026_config",
        atualizadoEm: Date.now()
    };
    await setDoc(ref, payload, { merge: true });
    return payload;
}

export async function criarInscricao(dados) {
    const id = gerarId("bup2026_insc");
    const agora = Date.now();
    const payload = {
        id,
        bupTipo: "bup2026_inscricao",
        bupCriadoEm: agora,
        bupExcluido: false,
        status: "pendente",
        nomeUp: String(dados.nomeUp || '').trim(),
        dataNascimento: String(dados.dataNascimento || '').trim(),
        filiacao: String(dados.filiacao || '').trim(),
        responsavelNome: String(dados.responsavelNome || '').trim(),
        responsavelWhatsapp: limparTelefone(dados.responsavelWhatsapp),
        querCamiseta: Boolean(dados.querCamiseta),
        tamanhoCamiseta: dados.querCamiseta ? String(dados.tamanhoCamiseta || '').trim() : '',
        observacoes: String(dados.observacoes || '').trim(),
        dataHoraTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    };
    await setDoc(doc(db, COL_PUBLICA, id), payload);
    return payload;
}

export async function listarInscricoes() {
    const q = query(
        collection(db, COL_PUBLICA),
        where("bupTipo", "==", "bup2026_inscricao")
    );
    const snap = await getDocs(q);
    const lista = [];
    snap.forEach((d) => {
        const data = d.data();
        if (!data.bupExcluido) {
            lista.push({ id: d.id, ...data });
        }
    });
    lista.sort((a, b) => (b.bupCriadoEm || 0) - (a.bupCriadoEm || 0));
    return lista;
}

export async function atualizarInscricao(id, campos) {
    const ref = doc(db, COL_PUBLICA, id);
    await updateDoc(ref, {
        ...campos,
        bupAtualizadoEm: Date.now()
    });
}

export async function excluirInscricao(id) {
    const ref = doc(db, COL_PUBLICA, id);
    try {
        await deleteDoc(ref);
    } catch (e) {
        // Fallback seguro caso a regra do Firestore bloqueie delete físico
        await updateDoc(ref, {
            bupExcluido: true,
            bupAtualizadoEm: Date.now()
        });
    }
}

// Comprime a foto da camiseta via Canvas para armazenamento leve e rápido no Firestore
export function comprimirImagemParaBase64(file, maxLargura = 820, qualidade = 0.78) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Não foi possível ler o arquivo de imagem."));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error("Arquivo selecionado não é uma imagem válida."));
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > maxLargura) {
                    h = Math.round((h * maxLargura) / w);
                    w = maxLargura;
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', qualidade);
                resolve(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export function exportarInscricoesCSV(inscricoes) {
    const cabecalho = [
        "Nome do Up",
        "Data de Nascimento",
        "Idade em 13/12/2026",
        "Filiação",
        "Responsável",
        "WhatsApp",
        "Camiseta",
        "Tamanho",
        "Status",
        "Observações",
        "Inscrito em"
    ];
    const linhas = inscricoes.map((i) => [
        i.nomeUp || '',
        formatarDataBR(i.dataNascimento),
        calcularIdade(i.dataNascimento),
        i.filiacao || '',
        i.responsavelNome || '',
        formatarTelefone(i.responsavelWhatsapp),
        i.querCamiseta ? 'Sim' : 'Não',
        i.tamanhoCamiseta || '-',
        i.status === 'confirmado' ? 'Confirmado' : 'Pendente',
        (i.observacoes || '').replace(/\r?\n/g, ' '),
        i.dataHoraTexto || ''
    ]);

    const csv = [cabecalho, ...linhas]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'))
        .join('\n');

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batismo-central-up-2026-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
