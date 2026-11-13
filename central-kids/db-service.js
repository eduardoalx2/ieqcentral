// Serviço de Banco de Dados Isolado — Ação entre Amigos Central Kids
// Utiliza a coleção pública autorizada nas regras do projeto ("diadascriancas_inscricoes")
// com documentos exclusivos prefixados ("ck_acao2026_*") e campos próprios ("ckTipo", "ckCriadoEm"),
// sem usar "criadoEm" (para nunca aparecer no sistema antigo de Dia das Crianças)
// e SEM importar firebase-auth (para jamais interferir no login da Região 655).

import { db } from '../firebase-config.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export const COL_PUBLICA_KIDS = "diadascriancas_inscricoes";
export const DOC_GERAL_ID = "ck_acao2026_config_geral";

export const TOTAL_NUMEROS = 200;
export const VALOR_POR_NUMERO_CENTAVOS = 500; // R$ 5,00
export const VALOR_POR_NUMERO_REAIS = 5;
export const PRAZO_RESERVA_PADRAO_MIN = 0; // 0 = Infinito (não expira sozinho)
export const DATA_LIMITE_VENDAS_ISO = "2026-12-20T22:00:00-03:00";
export const DATA_LIMITE_VENDAS_MS = new Date(DATA_LIMITE_VENDAS_ISO).getTime();

export const CONFIG_PADRAO = {
    ckTipo: "ck_acao2026_config",
    nomeAcao: "Ação entre Amigos · Central Kids",
    chavePix: "regiao655@gmail.com",
    nomeRecebedorPix: "IEQ CENTRAL LONDRINA",
    cidadePix: "LONDRINA",
    prazoReservaMinutos: 0, // 0 = Infinito (sem expiração automática)
    vendasEncerradasManual: false,
    divulgarResultadoPublico: true,
    numerosVendidosMap: {},
    sorteios: []
};

function gerarIdUnico(prefixo) {
    const rand = Math.random().toString(36).substring(2, 8);
    return `${prefixo}_${Date.now()}_${rand}`;
}

export function formatarNumeroSorte(n) {
    return String(Number(n)).padStart(3, '0');
}

export function formatarMoedaCentavos(centavos) {
    return (Number(centavos || 0) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
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

export function calcularStatusEfetivo(pedido, agora = Date.now(), prazoConfigMin = 0) {
    if (!pedido) return 'desconhecido';
    if (Number(prazoConfigMin) <= 0) {
        // Quando o prazo está configurado como 0 (Infinito), reservas aguardando pagamento nunca expiram sozinhas
        if (pedido.status === 'expirado') return 'reservado_aguardando';
        return pedido.status;
    }
    if (pedido.status === 'reservado_aguardando' && pedido.expiraEm && Number(pedido.expiraEm) > 0 && agora > Number(pedido.expiraEm)) {
        return 'expirado';
    }
    return pedido.status;
}

export function verificarVendasEncerradas(config, agora = Date.now()) {
    if (agora >= DATA_LIMITE_VENDAS_MS) {
        return { encerrada: true, motivo: 'Prazo encerrado em 20/12/2026 às 22h.' };
    }
    if (config?.vendasEncerradasManual) {
        return { encerrada: true, motivo: 'As vendas foram encerradas pela coordenação.' };
    }
    if (Array.isArray(config?.sorteios) && config.sorteios.length > 0) {
        return { encerrada: true, motivo: 'O sorteio já foi iniciado/realizado.' };
    }
    return { encerrada: false, motivo: '' };
}

export async function obterConfigGeral() {
    const ref = doc(db, COL_PUBLICA_KIDS, DOC_GERAL_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        const inicial = { ...CONFIG_PADRAO, atualizadoEm: Date.now() };
        try {
            await setDoc(ref, inicial);
        } catch (e) {
            console.warn("Aviso ao inicializar config padrão:", e);
        }
        return inicial;
    }
    return { ...CONFIG_PADRAO, ...snap.data() };
}

export async function registrarLogAdmin(acao, detalhes = {}, operador = "Admin Central Kids") {
    try {
        const logId = gerarIdUnico("ck_acao2026_log");
        const agora = Date.now();
        await setDoc(doc(db, COL_PUBLICA_KIDS, logId), {
            ckTipo: "ck_acao2026_log",
            acao,
            detalhes,
            operador,
            ckCriadoEm: agora,
            dataHoraTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        });
    } catch (e) {
        console.warn("Não foi possível salvar log de auditoria:", e);
    }
}

export async function carregarResumoEPedidos() {
    const agora = Date.now();
    const qPedidos = query(collection(db, COL_PUBLICA_KIDS), where("ckTipo", "==", "ck_acao2026_pedido"));

    const [config, snapPedidos] = await Promise.all([
        obterConfigGeral(),
        getDocs(qPedidos)
    ]);

    const pedidos = [];
    const expiradosParaAtualizar = [];

    const prazoMinConfig = Number(config.prazoReservaMinutos ?? 0);

    snapPedidos.forEach(docSnap => {
        const dados = docSnap.data();
        const criadoEmVal = dados.ckCriadoEm || dados.criadoEm || 0;
        const statusEfetivo = calcularStatusEfetivo(dados, agora, prazoMinConfig);
        if (prazoMinConfig > 0 && dados.status === 'reservado_aguardando' && statusEfetivo === 'expirado') {
            expiradosParaAtualizar.push(docSnap.id);
        }
        pedidos.push({
            id: docSnap.id,
            ...dados,
            criadoEm: criadoEmVal,
            statusEfetivo
        });
    });

    if (expiradosParaAtualizar.length > 0) {
        Promise.all(
            expiradosParaAtualizar.map(id =>
                updateDoc(doc(db, COL_PUBLICA_KIDS, id), {
                    status: 'expirado',
                    expiradoDetectadoEm: agora
                }).catch(() => {})
            )
        );
    }

    pedidos.sort((a, b) => (Number(b.criadoEm) || 0) - (Number(a.criadoEm) || 0));

    let numerosVendidos = 0;
    let numerosReservadosAguardando = 0;
    let numerosEmAnalise = 0;
    let valorConfirmadoCentavos = 0;
    let valorPendenteCentavos = 0;
    const mapaNumerosOcupados = {};

    for (const p of pedidos) {
        const st = p.statusEfetivo;
        if (st === 'aprovado') {
            const nums = Array.isArray(p.numeros) ? p.numeros : [];
            const qtd = nums.length || Number(p.quantidadeAprovada || p.quantidade || 0);
            numerosVendidos += qtd;
            valorConfirmadoCentavos += Number(p.valorPagoCentavos ?? p.valorTotalCentavos ?? (qtd * VALOR_POR_NUMERO_CENTAVOS));
            for (const num of nums) {
                mapaNumerosOcupados[num] = {
                    pedidoId: p.id,
                    nome: p.nome,
                    whatsapp: p.whatsappFormatado || formatarTelefone(p.whatsappLimpo),
                    vendedor: p.vendedor || ''
                };
            }
        } else if (st === 'reservado_aguardando') {
            const qtd = Number(p.quantidade || 0);
            numerosReservadosAguardando += qtd;
            valorPendenteCentavos += Number(p.valorTotalCentavos || (qtd * VALOR_POR_NUMERO_CENTAVOS));
        } else if (st === 'comprovante_enviado' || st === 'declarado_sem_comprovante') {
            const qtd = Number(p.quantidade || 0);
            numerosEmAnalise += qtd;
            valorPendenteCentavos += Number(p.valorTotalCentavos || (qtd * VALOR_POR_NUMERO_CENTAVOS));
        }
    }

    const totalOcupados = numerosVendidos + numerosReservadosAguardando + numerosEmAnalise;
    const numerosDisponiveis = Math.max(0, TOTAL_NUMEROS - totalOcupados);
    const statusVendas = verificarVendasEncerradas(config, agora);

    return {
        config,
        pedidos,
        mapaNumerosOcupados,
        estatisticas: {
            totalNumeros: TOTAL_NUMEROS,
            numerosVendidos,
            numerosReservadosAguardando,
            numerosEmAnalise,
            numerosReservadosTotal: numerosReservadosAguardando + numerosEmAnalise,
            numerosDisponiveis,
            valorConfirmadoCentavos,
            valorPendenteCentavos,
            vendasEncerradas: statusVendas.encerrada,
            motivoEncerramento: statusVendas.motivo
        }
    };
}

export async function criarPedidoReserva({ nome, whatsapp, vendedor, quantidade }) {
    const nomeLimpo = String(nome || '').trim();
    const whatsappLimpo = limparTelefone(whatsapp);
    const vendedorLimpo = String(vendedor || '').trim();
    const qtd = Number(quantidade);

    if (nomeLimpo.length < 3) {
        throw new Error("Por favor, informe seu nome completo.");
    }
    if (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) {
        throw new Error("Informe um WhatsApp válido com DDD (ex.: (43) 99999-9999).");
    }
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > TOTAL_NUMEROS) {
        throw new Error(`Escolha uma quantidade válida entre 1 e ${TOTAL_NUMEROS} números.`);
    }

    const estadoAtual = await carregarResumoEPedidos();
    if (estadoAtual.estatisticas.vendasEncerradas) {
        throw new Error(estadoAtual.estatisticas.motivoEncerramento || "As vendas já foram encerradas.");
    }
    if (qtd > estadoAtual.estatisticas.numerosDisponiveis) {
        if (estadoAtual.estatisticas.numerosDisponiveis === 0) {
            throw new Error("Todos os 200 números estão vendidos ou reservados no momento! Se alguma reserva expirar, os números voltarão a ficar disponíveis.");
        }
        throw new Error(`Restam apenas ${estadoAtual.estatisticas.numerosDisponiveis} número(s) disponível(is) no momento. Reduza a quantidade para continuar.`);
    }

    const agora = Date.now();
    const prazoMin = Number(estadoAtual.config.prazoReservaMinutos ?? 0);
    const expiraEm = prazoMin > 0 ? agora + (prazoMin * 60 * 1000) : null;
    const valorTotalCentavos = qtd * VALOR_POR_NUMERO_CENTAVOS;
    const protocolo = 'CK-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + String(agora).slice(-4);

    const novoPedidoId = gerarIdUnico("ck_acao2026_ped");
    const novoPedidoRef = doc(db, COL_PUBLICA_KIDS, novoPedidoId);
    const configRef = doc(db, COL_PUBLICA_KIDS, DOC_GERAL_ID);

    const dadosPedido = {
        ckTipo: "ck_acao2026_pedido",
        protocolo,
        nome: nomeLimpo,
        whatsappLimpo,
        ckWhatsappBusca: whatsappLimpo,
        whatsappFormatado: formatarTelefone(whatsappLimpo),
        vendedor: vendedorLimpo,
        quantidade: qtd,
        quantidadeAprovada: 0,
        valorTotalCentavos,
        valorPagoCentavos: 0,
        status: 'reservado_aguardando',
        metodoPagamento: 'pendente',
        possuiComprovante: false,
        comprovanteTipo: '',
        comprovanteNome: '',
        numeros: [],
        observacaoAdmin: '',
        ckCriadoEm: agora,
        criadoEmTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        expiraEm,
        expiraEmTexto: expiraEm ? new Date(expiraEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Sem expiração automática'
    };

    await runTransaction(db, async (transaction) => {
        const configSnap = await transaction.get(configRef);
        const cfg = configSnap.exists() ? { ...CONFIG_PADRAO, ...configSnap.data() } : { ...CONFIG_PADRAO };
        const statusVendas = verificarVendasEncerradas(cfg, Date.now());
        if (statusVendas.encerrada) {
            throw new Error(statusVendas.motivo);
        }

        transaction.set(configRef, {
            ...cfg,
            ckTipo: "ck_acao2026_config",
            ultimaReservaEm: Date.now()
        }, { merge: true });

        transaction.set(novoPedidoRef, dadosPedido);
    });

    return {
        id: novoPedidoId,
        ...dadosPedido,
        criadoEm: agora,
        statusEfetivo: 'reservado_aguardando'
    };
}

export async function buscarPedidoPorId(pedidoId) {
    if (!pedidoId) return null;
    const snap = await getDoc(doc(db, COL_PUBLICA_KIDS, pedidoId));
    if (!snap.exists()) return null;
    const dados = snap.data();
    if (dados.ckTipo !== "ck_acao2026_pedido") return null;
    return {
        id: snap.id,
        ...dados,
        criadoEm: dados.ckCriadoEm || dados.criadoEm || 0,
        statusEfetivo: calcularStatusEfetivo(dados)
    };
}

export async function buscarPedidosPorWhatsapp(whatsapp) {
    const limpo = limparTelefone(whatsapp);
    if (limpo.length < 10) {
        throw new Error("Informe o WhatsApp completo com DDD para consultar.");
    }
    const q = query(collection(db, COL_PUBLICA_KIDS), where("ckWhatsappBusca", "==", limpo));
    const snap = await getDocs(q);
    const lista = [];
    const agora = Date.now();
    snap.forEach(d => {
        const dados = d.data();
        if (dados.ckTipo === "ck_acao2026_pedido") {
            lista.push({
                id: d.id,
                ...dados,
                criadoEm: dados.ckCriadoEm || dados.criadoEm || 0,
                statusEfetivo: calcularStatusEfetivo(dados, agora)
            });
        }
    });
    lista.sort((a, b) => (Number(b.criadoEm) || 0) - (Number(a.criadoEm) || 0));
    return lista;
}

export async function prepararArquivoComprovante(file, onProgress = () => {}) {
    if (!file) throw new Error("Selecione uma foto ou arquivo PDF do comprovante.");

    const tipo = (file.type || '').toLowerCase();
    const nome = file.name || 'comprovante';
    const isPdf = tipo === 'application/pdf' || nome.toLowerCase().endsWith('.pdf');
    const isImage = tipo.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(nome);

    if (!isPdf && !isImage) {
        throw new Error("Formato não suportado. Escolha uma foto (JPG, PNG) ou um documento PDF.");
    }

    onProgress(15, "Lendo arquivo selecionado...");

    if (isPdf) {
        if (file.size > 4.5 * 1024 * 1024) {
            throw new Error("Este PDF é muito grande (acima de 4,5 MB). Envie um PDF menor ou tire um print/foto do comprovante.");
        }
        const base64 = await lerArquivoComoBase64(file);
        onProgress(50, "Documento PDF preparado...");
        return {
            mimeType: 'application/pdf',
            fileName: nome,
            base64,
            tamanhoOriginal: file.size
        };
    }

    if (file.size > 20 * 1024 * 1024) {
        throw new Error("A imagem excede 20 MB. Escolha uma imagem menor.");
    }

    try {
        onProgress(30, "Otimizando imagem para envio rápido...");
        const base64Otimizado = await comprimirImagemCanvas(file, 1280, 0.78);
        onProgress(60, "Imagem pronta para envio...");
        return {
            mimeType: 'image/jpeg',
            fileName: nome.replace(/\.[^.]+$/, '') + '.jpg',
            base64: base64Otimizado,
            tamanhoOriginal: file.size
        };
    } catch (err) {
        if (file.size > 3 * 1024 * 1024) {
            throw new Error("Não foi possível comprimir este formato de foto automaticamente. Tire um print da tela do comprovante e envie o print.");
        }
        const base64 = await lerArquivoComoBase64(file);
        return {
            mimeType: tipo || 'image/jpeg',
            fileName: nome,
            base64,
            tamanhoOriginal: file.size
        };
    }
}

function lerArquivoComoBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const res = String(reader.result || '');
            const idx = res.indexOf(',');
            resolve(idx !== -1 ? res.slice(idx + 1) : res);
        };
        reader.onerror = () => reject(new Error("Falha ao ler o arquivo no celular."));
        reader.readAsDataURL(file);
    });
}

function comprimirImagemCanvas(file, maxDim = 1280, quality = 0.78) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
                const ratio = Math.min(maxDim / width, maxDim / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const idx = dataUrl.indexOf(',');
            resolve(idx !== -1 ? dataUrl.slice(idx + 1) : dataUrl);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Formato de imagem requer conversão."));
        };
        img.src = url;
    });
}

function idDocComprovante(pedidoId, parteIndex = 0) {
    return parteIndex === 0 ? `ck_comp_${pedidoId}` : `ck_comp_${pedidoId}_part_${parteIndex}`;
}

export async function enviarComprovantePedido(pedidoId, file, onProgress = () => {}) {
    const pedido = await buscarPedidoPorId(pedidoId);
    if (!pedido) throw new Error("Reserva não encontrada.");
    if (pedido.status === 'aprovado') {
        throw new Error("Este pedido já foi aprovado!");
    }

    const preparado = await prepararArquivoComprovante(file, onProgress);
    const chunkSize = 600 * 1024;
    const totalChunks = Math.ceil(preparado.base64.length / chunkSize) || 1;

    onProgress(75, "Enviando comprovante para o servidor...");

    for (let i = 0; i < totalChunks; i++) {
        const parte = preparado.base64.slice(i * chunkSize, (i + 1) * chunkSize);
        const docId = idDocComprovante(pedidoId, i);
        await setDoc(doc(db, COL_PUBLICA_KIDS, docId), {
            ckTipo: "ck_acao2026_comprovante",
            pedidoId,
            parteIndex: i,
            totalPartes: totalChunks,
            mimeType: preparado.mimeType,
            fileName: preparado.fileName,
            base64Chunk: parte,
            enviadoEm: Date.now()
        });
        const pct = 75 + Math.round(((i + 1) / totalChunks) * 20);
        onProgress(pct, "Gravando comprovante...");
    }

    const agora = Date.now();
    await updateDoc(doc(db, COL_PUBLICA_KIDS, pedidoId), {
        status: 'comprovante_enviado',
        metodoPagamento: 'comprovante_anexado',
        possuiComprovante: true,
        comprovanteTipo: preparado.mimeType,
        comprovanteNome: preparado.fileName,
        comprovanteTotalPartes: totalChunks,
        comprovanteEnviadoEm: agora,
        comprovanteEnviadoEmTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });

    onProgress(100, "Comprovante enviado com sucesso!");
    return await buscarPedidoPorId(pedidoId);
}

export async function obterComprovantePedido(pedidoId) {
    const docPrincipal = await getDoc(doc(db, COL_PUBLICA_KIDS, idDocComprovante(pedidoId, 0)));
    if (!docPrincipal.exists()) {
        throw new Error("Nenhum arquivo de comprovante encontrado para este pedido.");
    }
    const dados0 = docPrincipal.data();
    const totalPartes = Number(dados0.totalPartes || 1);
    let base64Completo = dados0.base64Chunk || '';

    if (totalPartes > 1) {
        for (let i = 1; i < totalPartes; i++) {
            const snapParte = await getDoc(doc(db, COL_PUBLICA_KIDS, idDocComprovante(pedidoId, i)));
            if (snapParte.exists()) {
                base64Completo += (snapParte.data().base64Chunk || '');
            }
        }
    }

    return {
        mimeType: dados0.mimeType || 'image/jpeg',
        fileName: dados0.fileName || `comprovante-${pedidoId}.jpg`,
        base64: base64Completo,
        dataUrl: `data:${dados0.mimeType || 'image/jpeg'};base64,${base64Completo}`
    };
}

export async function declararPagamentoSemComprovante(pedidoId) {
    const pedido = await buscarPedidoPorId(pedidoId);
    if (!pedido) throw new Error("Reserva não encontrada.");
    if (pedido.status === 'aprovado') {
        throw new Error("Este pedido já foi aprovado!");
    }

    const agora = Date.now();
    await updateDoc(doc(db, COL_PUBLICA_KIDS, pedidoId), {
        status: 'declarado_sem_comprovante',
        metodoPagamento: 'declarado_sem_comprovante',
        declaradoSemComprovanteEm: agora,
        declaradoSemComprovanteEmTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });

    return await buscarPedidoPorId(pedidoId);
}

export async function aprovarPedidoAdmin({ pedidoId, quantidadeAprovada, valorPagoCentavos, observacaoAdmin = '' }) {
    const qtdAprovar = Number(quantidadeAprovada);
    if (!Number.isInteger(qtdAprovar) || qtdAprovar < 1 || qtdAprovar > TOTAL_NUMEROS) {
        throw new Error("Quantidade aprovada inválida.");
    }

    const qPedidos = query(collection(db, COL_PUBLICA_KIDS), where("ckTipo", "==", "ck_acao2026_pedido"));
    const snapPedidos = await getDocs(qPedidos);
    const numerosJaUsados = new Set();

    snapPedidos.forEach(d => {
        const p = d.data();
        if (d.id !== pedidoId && p.status === 'aprovado' && Array.isArray(p.numeros)) {
            p.numeros.forEach(n => numerosJaUsados.add(formatarNumeroSorte(n)));
        }
    });

    const pedidoRef = doc(db, COL_PUBLICA_KIDS, pedidoId);
    const configRef = doc(db, COL_PUBLICA_KIDS, DOC_GERAL_ID);

    let numerosSorteadosFinal = [];
    let pedidoAtualizado = null;

    await runTransaction(db, async (transaction) => {
        const [pedidoSnap, configSnap] = await Promise.all([
            transaction.get(pedidoRef),
            transaction.get(configRef)
        ]);

        if (!pedidoSnap.exists()) {
            throw new Error("Pedido não encontrado.");
        }

        const pedido = pedidoSnap.data();
        if (pedido.status === 'aprovado' && Array.isArray(pedido.numeros) && pedido.numeros.length > 0) {
            numerosSorteadosFinal = pedido.numeros;
            pedidoAtualizado = { id: pedidoId, ...pedido };
            return;
        }

        const config = configSnap.exists() ? { ...CONFIG_PADRAO, ...configSnap.data() } : { ...CONFIG_PADRAO };
        const mapaConfig = { ...(config.numerosVendidosMap || {}) };

        Object.keys(mapaConfig).forEach(num => {
            if (mapaConfig[num]?.pedidoId && mapaConfig[num].pedidoId !== pedidoId) {
                numerosJaUsados.add(formatarNumeroSorte(num));
            }
        });

        const disponiveis = [];
        for (let i = 1; i <= TOTAL_NUMEROS; i++) {
            const codigo = formatarNumeroSorte(i);
            if (!numerosJaUsados.has(codigo)) {
                disponiveis.push(codigo);
            }
        }

        if (disponiveis.length < qtdAprovar) {
            throw new Error(`Não há números suficientes livres. Restam apenas ${disponiveis.length} números não aprovados.`);
        }

        for (let i = disponiveis.length - 1; i > 0; i--) {
            const rand = new Uint32Array(1);
            crypto.getRandomValues(rand);
            const j = rand[0] % (i + 1);
            const temp = disponiveis[i];
            disponiveis[i] = disponiveis[j];
            disponiveis[j] = temp;
        }

        numerosSorteadosFinal = disponiveis.slice(0, qtdAprovar).sort();
        const agora = Date.now();
        const valorFinalCentavos = Number(valorPagoCentavos) || (qtdAprovar * VALOR_POR_NUMERO_CENTAVOS);

        for (const num of numerosSorteadosFinal) {
            mapaConfig[num] = {
                pedidoId,
                nome: pedido.nome,
                whatsapp: pedido.whatsappFormatado || formatarTelefone(pedido.whatsappLimpo),
                vendedor: pedido.vendedor || '',
                aprovadoEm: agora
            };
        }

        const camposAtualizados = {
            status: 'aprovado',
            quantidadeAprovada: qtdAprovar,
            valorPagoCentavos: valorFinalCentavos,
            numeros: numerosSorteadosFinal,
            observacaoAdmin: observacaoAdmin ? String(observacaoAdmin).trim() : (pedido.observacaoAdmin || ''),
            aprovadoEm: agora,
            aprovadoEmTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        };

        transaction.set(configRef, {
            ...config,
            ckTipo: "ck_acao2026_config",
            numerosVendidosMap: mapaConfig,
            atualizadoEm: agora
        }, { merge: true });

        transaction.update(pedidoRef, camposAtualizados);

        pedidoAtualizado = {
            id: pedidoId,
            ...pedido,
            ...camposAtualizados,
            statusEfetivo: 'aprovado'
        };
    });

    await registrarLogAdmin("APROVACAO_PAGAMENTO", {
        pedidoId,
        protocolo: pedidoAtualizado?.protocolo,
        nome: pedidoAtualizado?.nome,
        whatsapp: pedidoAtualizado?.whatsappFormatado,
        metodoPagamento: pedidoAtualizado?.metodoPagamento,
        quantidadeOriginal: pedidoAtualizado?.quantidade,
        quantidadeAprovada: qtdAprovar,
        valorPagoReais: (pedidoAtualizado?.valorPagoCentavos || 0) / 100,
        numerosAtribuidos: numerosSorteadosFinal,
        observacaoAdmin
    });

    return pedidoAtualizado;
}

export async function rejeitarPedidoAdmin({ pedidoId, motivo }) {
    const motivoLimpo = String(motivo || '').trim();
    if (!motivoLimpo) {
        throw new Error("Informe o motivo da rejeição para registro.");
    }
    const pedido = await buscarPedidoPorId(pedidoId);
    if (!pedido) throw new Error("Pedido não encontrado.");
    if (pedido.status === 'aprovado') {
        throw new Error("Pedidos já aprovados com números gerados não podem ser rejeitados diretamente.");
    }

    const agora = Date.now();
    await updateDoc(doc(db, COL_PUBLICA_KIDS, pedidoId), {
        status: 'rejeitado',
        observacaoAdmin: motivoLimpo,
        rejeitadoEm: agora,
        rejeitadoEmTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });

    await registrarLogAdmin("REJEICAO_PEDIDO", {
        pedidoId,
        protocolo: pedido.protocolo,
        nome: pedido.nome,
        whatsapp: pedido.whatsappFormatado,
        quantidade: pedido.quantidade,
        motivo: motivoLimpo
    });
}

export async function cancelarPedidoAdmin({ pedidoId, motivo }) {
    const motivoLimpo = String(motivo || '').trim() || "Cancelado pela administração";
    const pedido = await buscarPedidoPorId(pedidoId);
    if (!pedido) throw new Error("Pedido não encontrado.");

    const agora = Date.now();
    const configRef = doc(db, COL_PUBLICA_KIDS, DOC_GERAL_ID);
    const pedidoRef = doc(db, COL_PUBLICA_KIDS, pedidoId);

    await runTransaction(db, async (transaction) => {
        const configSnap = await transaction.get(configRef);
        const config = configSnap.exists() ? { ...CONFIG_PADRAO, ...configSnap.data() } : { ...CONFIG_PADRAO };
        const mapaConfig = { ...(config.numerosVendidosMap || {}) };

        if (Array.isArray(pedido.numeros) && pedido.numeros.length > 0) {
            for (const num of pedido.numeros) {
                if (mapaConfig[num]?.pedidoId === pedidoId) {
                    delete mapaConfig[num];
                }
            }
        }

        transaction.set(configRef, {
            ...config,
            ckTipo: "ck_acao2026_config",
            numerosVendidosMap: mapaConfig,
            atualizadoEm: agora
        }, { merge: true });

        transaction.update(pedidoRef, {
            status: 'cancelado',
            numerosAnterioresCancelados: pedido.numeros || [],
            numeros: [],
            quantidadeAprovada: 0,
            observacaoAdmin: motivoLimpo,
            canceladoEm: agora,
            canceladoEmTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        });
    });

    await registrarLogAdmin("CANCELAMENTO_PEDIDO", {
        pedidoId,
        protocolo: pedido.protocolo,
        nome: pedido.nome,
        whatsapp: pedido.whatsappFormatado,
        statusAnterior: pedido.status,
        numerosLiberados: pedido.numeros || [],
        motivo: motivoLimpo
    });
}

export async function salvarObservacaoPedidoAdmin({ pedidoId, observacao }) {
    const obs = String(observacao || '').trim();
    await updateDoc(doc(db, COL_PUBLICA_KIDS, pedidoId), {
        observacaoAdmin: obs,
        atualizadoEm: Date.now()
    });
    await registrarLogAdmin("OBSERVACAO_PEDIDO", { pedidoId, observacao: obs });
}

export async function atualizarConfiguracoesAdmin(novosDados) {
    const ref = doc(db, COL_PUBLICA_KIDS, DOC_GERAL_ID);
    const atual = await obterConfigGeral();
    const atualizado = {
        ...atual,
        ...novosDados,
        ckTipo: "ck_acao2026_config",
        atualizadoEm: Date.now()
    };
    await setDoc(ref, atualizado, { merge: true });
    await registrarLogAdmin("ATUALIZACAO_CONFIG", novosDados);
    return atualizado;
}

export async function registrarSorteioOficialAdmin({ modo = 'sistema', numeroManual = '', observacao = '' }) {
    const resumo = await carregarResumoEPedidos();
    const numerosElegiveis = Object.keys(resumo.mapaNumerosOcupados).sort();

    if (numerosElegiveis.length === 0) {
        throw new Error("Não há nenhum número com pagamento aprovado para participar do sorteio.");
    }

    let numeroGanhador = '';
    if (modo === 'manual') {
        const formatado = formatarNumeroSorte(numeroManual);
        if (!resumo.mapaNumerosOcupados[formatado]) {
            throw new Error(`O número ${formatado} NÃO possui pagamento confirmado! Somente números pagos podem ser registrados como ganhadores.`);
        }
        numeroGanhador = formatado;
    } else {
        const rand = new Uint32Array(1);
        crypto.getRandomValues(rand);
        const idx = rand[0] % numerosElegiveis.length;
        numeroGanhador = numerosElegiveis[idx];
    }

    const dadosTitular = resumo.mapaNumerosOcupados[numeroGanhador];
    const agora = Date.now();
    const registroSorteio = {
        idSorteio: 'SRT-' + String(agora).slice(-6),
        numero: numeroGanhador,
        pedidoId: dadosTitular.pedidoId,
        nome: dadosTitular.nome,
        whatsapp: dadosTitular.whatsapp,
        vendedor: dadosTitular.vendedor || '',
        modo: modo === 'manual' ? 'Sorteio Presencial no Culto' : 'Sorteador Digital do Sistema',
        observacao: String(observacao || '').trim(),
        totalNumerosConcorrendo: numerosElegiveis.length,
        realizadoEm: agora,
        realizadoEmTexto: new Date(agora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    };

    const sorteiosAtuais = Array.isArray(resumo.config.sorteios) ? [...resumo.config.sorteios] : [];
    sorteiosAtuais.push(registroSorteio);

    await atualizarConfiguracoesAdmin({
        vendasEncerradasManual: true,
        sorteios: sorteiosAtuais
    });

    await registrarLogAdmin("SORTEIO_REALIZADO", registroSorteio);
    return registroSorteio;
}

export async function carregarLogsAdmin() {
    const qLogs = query(collection(db, COL_PUBLICA_KIDS), where("ckTipo", "==", "ck_acao2026_log"));
    const snap = await getDocs(qLogs);
    const logs = [];
    snap.forEach(d => {
        const data = d.data();
        logs.push({ id: d.id, ...data, criadoEm: data.ckCriadoEm || 0 });
    });
    logs.sort((a, b) => (Number(b.criadoEm) || 0) - (Number(a.criadoEm) || 0));
    return logs.slice(0, 150);
}

export function gerarMensagemWhatsAppAprovacao(pedido) {
    const nums = Array.isArray(pedido.numeros) ? pedido.numeros.join(', ') : '';
    const qtd = (pedido.numeros && pedido.numeros.length) || pedido.quantidadeAprovada || pedido.quantidade;
    const valor = formatarMoedaCentavos(pedido.valorPagoCentavos || pedido.valorTotalCentavos);
    return (
        `🎄 *AÇÃO ENTRE AMIGOS — CENTRAL KIDS*\n` +
        `IEQ Central de Londrina\n\n` +
        `Olá, *${pedido.nome}*! Seu pagamento foi confirmado com sucesso! 🙌\n\n` +
        `📋 *Protocolo:* ${pedido.protocolo || pedido.id.slice(0, 6).toUpperCase()}\n` +
        `🎟️ *Quantidade:* ${qtd} número(s) (${valor})\n` +
        `🎟️ *Seus números:* *${nums}*\n\n` +
        `📅 *Sorteio:* 20/12/2026, presencialmente no culto, após a Cantata de Natal.\n\n` +
        `Muito obrigado por abençoar o nosso Ministério Infantil Central Kids! 💛`
    );
}
