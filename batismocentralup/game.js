// Mini-Game Interativo Estilo Minecraft — "Jornada das Águas" (Central UP)
// Baseado nas 4 aulas da série "Minha Fé, Minha Decisão"

const FASES_GAME = [
    {
        aula: "Aula 1 · Antes da água, vem a fé!",
        icone: "💧",
        conquista: "Fé Antes da Água",
        pergunta: "No batismo nas águas, o que realmente salva uma pessoa?",
        opcoes: [
            "A água do tanque batismal, que tem poder mágico",
            "A graça de Deus, recebida pela fé em Jesus Cristo",
            "A quantidade de pontos ou boas notas na escola",
            "Entrar na piscina só porque os amigos entraram"
        ],
        correta: 1,
        explicacao: "A água não salva ninguém! Somos salvos pela graça, mediante a fé em Jesus (Efésios 2:8-9). O batismo é a resposta pública de quem já crê no amor de Cristo."
    },
    {
        aula: "Aula 1 · Antes da água, vem a fé!",
        icone: "❤️",
        conquista: "Amado por Jesus",
        pergunta: "Qual frase resume melhor o motivo verdadeiro para ser batizado?",
        opcoes: [
            "Eu sou batizado para tentar convencer Jesus a me amar",
            "Eu quero ser batizado porque creio que Jesus já me ama",
            "Eu sou batizado para nunca mais cometer nenhum erro",
            "Eu sou batizado apenas para ganhar uma camiseta"
        ],
        correta: 1,
        explicacao: "Exatamente! \"Eu não sou batizado para Jesus me amar. Eu quero ser batizado porque creio que Ele já me ama.\""
    },
    {
        aula: "Aula 2 · O preço da fidelidade",
        icone: "👑",
        conquista: "Coroa da Vida",
        pergunta: "Em Apocalipse 2:10, o que Jesus promete para quem permanece fiel a Ele?",
        opcoes: [
            "Uma armadura de ferro infinita",
            "Que nunca mais vai ter dias difíceis",
            "\"Seja fiel até a morte, e eu lhe darei a coroa da vida\"",
            "Que todos os amigos sempre vão concordar com você"
        ],
        correta: 2,
        explicacao: "Seguir Jesus não significa ausência de dificuldades, mas decidir permanecer fiel a Ele em todo tempo! (Apocalipse 2:10)"
    },
    {
        aula: "Aula 2 · O preço da fidelidade",
        icone: "📖",
        conquista: "Guardião da Palavra",
        pergunta: "Qual desses heróis da fé traduziu a Bíblia para que mais pessoas pudessem ler a Palavra de Deus?",
        opcoes: [
            "William Tyndale",
            "Golias",
            "Faraó",
            "Herodes"
        ],
        correta: 0,
        explicacao: "William Tyndale, assim como Estêvão (Atos 7) e Policarpo, pagou um alto preço por amar a Palavra de Deus e não negar a Jesus!"
    },
    {
        aula: "Aula 3 · Uma nova vida começa!",
        icone: "🌊",
        conquista: "Nova Criatura",
        pergunta: "Segundo Romanos 6:3-4, o que simboliza descer às águas e depois sair delas?",
        opcoes: [
            "Apenas um mergulho divertido de verão",
            "Descer = deixar a vida antiga com Cristo; Sair = ressuscitar para uma nova vida!",
            "Apagar a memória como se fosse um botão 'reset'",
            "Virar uma pessoa perfeita que nunca mais precisa pedir perdão"
        ],
        correta: 1,
        explicacao: "Descer às águas representa nossa identificação com a morte de Cristo para o passado, e sair das águas representa a nova vida que Jesus nos dá! (Romanos 6:3-4; 2Co 5:17)"
    },
    {
        aula: "Aula 3 · Uma nova vida começa!",
        icone: "⛏️",
        conquista: "Novo Mundo com Cristo",
        pergunta: "Na vida real, começar uma 'nova jornada' com Jesus (2 Coríntios 5:17) aparece quando a gente...",
        opcoes: [
            "Finge que é cristão só dentro da igreja no domingo",
            "Para de mentir, respeita os pais, pede perdão e aprende a obedecer a Jesus",
            "Esconde a fé dos amigos na escola e na internet",
            "Faz tudo igual antes sem mudar nenhuma atitude"
        ],
        correta: 1,
        explicacao: "Não é apertar um botão 'new game' — Cristo perdoa nossa história, transforma nosso coração e nos ensina a viver de maneira diferente todos os dias!"
    },
    {
        aula: "Aula 4 · Minha fé, minha decisão!",
        icone: "🧭",
        conquista: "Decisão Pessoal",
        pergunta: "Na história de Atos 8:26-39, quem explicou as Escrituras sobre Jesus para o eunuco etíope antes dele pedir para ser batizado?",
        opcoes: [
            "Noé",
            "Filipe",
            "Sansão",
            "Jonas"
        ],
        correta: 1,
        explicacao: "Filipe anunciou Jesus ao eunuco etíope. Assim que ele creu de todo coração, pediu para ser batizado! (Atos 8:26-39)"
    },
    {
        aula: "Aula 4 · Minha fé, minha decisão!",
        icone: "💎",
        conquista: "Pronto para as Águas!",
        pergunta: "No Minecraft, um amigo pode ensinar você a jogar, mas não joga por você. E na fé em Jesus?",
        opcoes: [
            "Basta meus pais serem cristãos que eu já estou pronto",
            "Se meus amigos forem batizados, eu preciso ir no embalo",
            "Pais e líderes podem me ensinar, mas a decisão de crer e seguir Jesus precisa ser minha!",
            "Só adultos acima de 30 anos podem decidir seguir Jesus"
        ],
        correta: 2,
        explicacao: "Isso aí! \"Outros podem me ensinar a seguir Jesus, mas a decisão de crer nele precisa ser minha!\" — Jesus convida você para essa nova vida!"
    }
];

let somAtivo = true;
let audioCtx = null;

function tocarSom(tipo) {
    if (!somAtivo) return;
    try {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (tipo === 'acerto') {
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            osc.start(now);
            osc.stop(now + 0.32);
        } else if (tipo === 'erro') {
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.setValueAtTime(165, now + 0.12);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.start(now);
            osc.stop(now + 0.28);
        } else if (tipo === 'vitoria') {
            const notas = [523.25, 659.25, 783.99, 1046.5];
            notas.forEach((freq, idx) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'square';
                o.frequency.setValueAtTime(freq, now + idx * 0.1);
                g.gain.setValueAtTime(0.06, now + idx * 0.1);
                g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.22);
                o.connect(g);
                g.connect(audioCtx.destination);
                o.start(now + idx * 0.1);
                o.stop(now + idx * 0.1 + 0.22);
            });
        }
    } catch (_) {
        // Ignora erro de áudio em navegadores restritivos
    }
}

export function iniciarMiniGame(containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;

    const estado = {
        tela: 'inicio', // inicio | jogando | fim
        nomeJogador: '',
        indice: 0,
        vidas: 3,
        esmeraldas: 0,
        acertos: 0,
        respondido: false,
        opcaoSelecionada: -1,
        conquistas: []
    };

    function mostrarToastConquista(titulo, icone) {
        const toast = document.getElementById('mc-achievement-toast');
        if (!toast) return;
        toast.querySelector('.mc-ach-icon').textContent = icone || '💎';
        toast.querySelector('.mc-ach-name').textContent = titulo;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    function render() {
        if (estado.tela === 'inicio') {
            root.innerHTML = `
                <div class="game-start-screen">
                    <div class="game-pixel-avatar" aria-hidden="true">⛏️💧</div>
                    <h3 class="pixel-title" style="font-size:1.05rem;color:#fef08a;margin-bottom:0.65rem;">
                        JORNADA DAS ÁGUAS
                    </h3>
                    <p style="color:#cbd5e1;font-size:0.95rem;max-width:460px;margin:0 auto 1.25rem;line-height:1.55;">
                        Complete os <strong>8 blocos de missão</strong> sobre tudo o que aprendemos no Central UP,
                        colete <strong>Esmeraldas</strong> e desbloqueie sua conquista de Batismo nas Águas!
                    </p>
                    <div class="game-name-box">
                        <label for="game-player-name" class="mc-label">Seu nome ou apelido de jogador (opcional):</label>
                        <input id="game-player-name" type="text" class="mc-input" maxlength="28"
                               placeholder="Ex.: Lucas_UP" value="${estado.nomeJogador}">
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:1rem;">
                        <button type="button" id="btn-start-game" class="mc-btn mc-btn-emerald">
                            ▶ COMEÇAR MISSÃO
                        </button>
                        <button type="button" id="btn-toggle-sound" class="mc-btn mc-btn-stone">
                            ${somAtivo ? '🔊 Som: Ligado' : '🔇 Som: Mudo'}
                        </button>
                    </div>
                </div>
            `;

            root.querySelector('#btn-start-game').addEventListener('click', () => {
                const input = root.querySelector('#game-player-name');
                estado.nomeJogador = (input?.value || '').trim() || 'Aventureiro UP';
                estado.tela = 'jogando';
                estado.indice = 0;
                estado.vidas = 3;
                estado.esmeraldas = 0;
                estado.acertos = 0;
                estado.respondido = false;
                estado.opcaoSelecionada = -1;
                estado.conquistas = [];
                tocarSom('acerto');
                render();
            });

            root.querySelector('#btn-toggle-sound').addEventListener('click', () => {
                somAtivo = !somAtivo;
                render();
            });
            return;
        }

        if (estado.tela === 'jogando') {
            const fase = FASES_GAME[estado.indice];
            const total = FASES_GAME.length;
            const progressoPct = Math.round(((estado.indice + (estado.respondido ? 1 : 0)) / total) * 100);
            const coracoesHtml = Array.from({ length: 3 }, (_, i) =>
                `<span class="mc-heart ${i < estado.vidas ? 'full' : 'empty'}">${i < estado.vidas ? '❤️' : '🖤'}</span>`
            ).join('');

            const opcoesHtml = fase.opcoes.map((texto, idx) => {
                let extraClass = '';
                if (estado.respondido) {
                    if (idx === fase.correta) extraClass = 'is-correct';
                    else if (idx === estado.opcaoSelecionada) extraClass = 'is-wrong';
                    else extraClass = 'is-dim';
                }
                const letra = ['A', 'B', 'C', 'D'][idx];
                return `
                    <button type="button" class="game-option-btn ${extraClass}" data-idx="${idx}" ${estado.respondido ? 'disabled' : ''}>
                        <span class="game-option-key">${letra}</span>
                        <span class="game-option-text">${texto}</span>
                    </button>
                `;
            }).join('');

            const feedbackHtml = estado.respondido ? `
                <div class="game-feedback ${estado.opcaoSelecionada === fase.correta ? 'ok' : 'err'}">
                    <div class="game-feedback-title">
                        ${estado.opcaoSelecionada === fase.correta
                            ? `💎 +100 XP · Conquista "${fase.conquista}"!`
                            : `🛡️ Quase lá! Veja o que aprendemos:`}
                    </div>
                    <p>${fase.explicacao}</p>
                    <button type="button" id="btn-next-fase" class="mc-btn mc-btn-water" style="margin-top:0.75rem;">
                        ${estado.indice + 1 < total ? 'PRÓXIMO BLOCO ➔' : 'VER MINHA CONQUISTA 🏆'}
                    </button>
                </div>
            ` : '';

            root.innerHTML = `
                <div class="game-hud">
                    <div class="game-hud-item" title="Vidas">${coracoesHtml}</div>
                    <div class="game-hud-item game-hud-stage">BLOCO ${estado.indice + 1}/${total}</div>
                    <div class="game-hud-item game-hud-emeralds">💎 ${estado.esmeraldas}</div>
                    <button type="button" id="btn-mute-inline" class="game-mute-mini" title="Ligar/Desligar som">
                        ${somAtivo ? '🔊' : '🔇'}
                    </button>
                </div>

                <div class="mc-xp-bar" aria-label="Progresso da missão">
                    <div class="mc-xp-fill" style="width:${progressoPct}%"></div>
                </div>

                <div class="game-question-card">
                    <div class="game-aula-tag">${fase.icone} ${fase.aula}</div>
                    <h4 class="game-question-text">${fase.pergunta}</h4>
                    <div class="game-options-grid">
                        ${opcoesHtml}
                    </div>
                    ${feedbackHtml}
                </div>
            `;

            root.querySelector('#btn-mute-inline').addEventListener('click', () => {
                somAtivo = !somAtivo;
                render();
            });

            root.querySelectorAll('.game-option-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    if (estado.respondido) return;
                    const idx = Number(btn.dataset.idx);
                    estado.respondido = true;
                    estado.opcaoSelecionada = idx;
                    if (idx === fase.correta) {
                        estado.acertos++;
                        estado.esmeraldas += 100;
                        estado.conquistas.push(fase.conquista);
                        tocarSom('acerto');
                        mostrarToastConquista(fase.conquista, fase.icone);
                    } else {
                        estado.vidas = Math.max(0, estado.vidas - 1);
                        tocarSom('erro');
                    }
                    render();
                });
            });

            const btnNext = root.querySelector('#btn-next-fase');
            if (btnNext) {
                btnNext.addEventListener('click', () => {
                    if (estado.indice + 1 < total) {
                        estado.indice++;
                        estado.respondido = false;
                        estado.opcaoSelecionada = -1;
                        render();
                    } else {
                        estado.tela = 'fim';
                        tocarSom('vitoria');
                        render();
                    }
                });
            }
            return;
        }

        // Tela final (Certificado / Conquista)
        const total = FASES_GAME.length;
        let patente = 'Discípulo de Ferro';
        let emojiPatente = '🛡️';
        let mensagemFinal = 'Você está aprendendo muito sobre o batismo! Vale revisar as aulas e tentar de novo para subir de nível!';

        if (estado.acertos === total) {
            patente = 'Discípulo Diamante';
            emojiPatente = '💎';
            mensagemFinal = 'Incrível!! Você gabaritou toda a Jornada das Águas! Jesus te convida para viver essa nova história com Ele!';
        } else if (estado.acertos >= 6) {
            patente = 'Discípulo Esmeralda';
            emojiPatente = '🟢';
            mensagemFinal = 'Mandou muito bem! Você compreendeu o verdadeiro significado de descer às águas e viver uma nova vida com Jesus!';
        } else if (estado.acertos >= 4) {
            patente = 'Discípulo de Ouro';
            emojiPatente = '👑';
            mensagemFinal = 'Muito bom! Continue firme na Palavra e converse com seus pais sobre sua decisão de seguir Jesus!';
        }

        root.innerHTML = `
            <div class="game-finish-card">
                <div class="game-finish-badge">${emojiPatente}</div>
                <div class="game-aula-tag" style="justify-content:center;">MISSÃO CONCLUÍDA!</div>
                <h3 class="pixel-title" style="font-size:1rem;color:#fef08a;margin:0.5rem 0;">
                    ${estado.nomeJogador}
                </h3>
                <div class="game-rank-pill">${patente}</div>

                <div class="game-stats-row">
                    <div class="game-stat-box">
                        <span class="game-stat-val">${estado.acertos}/${total}</span>
                        <span class="game-stat-lbl">Acertos</span>
                    </div>
                    <div class="game-stat-box">
                        <span class="game-stat-val">💎 ${estado.esmeraldas}</span>
                        <span class="game-stat-lbl">XP Total</span>
                    </div>
                    <div class="game-stat-box">
                        <span class="game-stat-val">${estado.conquistas.length}</span>
                        <span class="game-stat-lbl">Conquistas</span>
                    </div>
                </div>

                <p style="color:#e2e8f0;font-size:0.93rem;line-height:1.55;margin:1rem auto;max-width:460px;">
                    ${mensagemFinal}
                </p>

                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:1.1rem;">
                    <button type="button" id="btn-replay-game" class="mc-btn mc-btn-emerald">
                        🔄 JOGAR NOVAMENTE
                    </button>
                    <a href="#inscricao" class="mc-btn mc-btn-water" style="text-decoration:none;">
                        📝 FAZER MINHA INSCRIÇÃO
                    </a>
                </div>
            </div>
        `;

        root.querySelector('#btn-replay-game').addEventListener('click', () => {
            estado.tela = 'inicio';
            render();
        });
    }

    render();
}
