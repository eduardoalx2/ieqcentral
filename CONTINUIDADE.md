# Contexto & Guia de Continuidade — ieqlondrina.com.br

Este documento serve como memória técnica e instruções para qualquer IA ou desenvolvedor dar continuidade às manutenções e novas funcionalidades deste projeto em uma nova conversa.

---

## 1. Visão Geral do Projeto

- **Organização:** Igreja do Evangelho Quadrangular — Central Londrina/PR
- **Domínio de Produção:** [www.ieqlondrina.com.br](https://www.ieqlondrina.com.br)
- **Hospedagem & Deploy:** GitHub Pages conectado ao repositório `github.com/eduardoalx2/ieqcentral` (branch `main`).
- **Caminho Local:** `G:\Meu Drive\0Sinc\IA\ieqlondrina.com.br`
- **Fluxo de Trabalho:** O usuário prefere ação direta — editar arquivos, testar, commitar e dar `git push origin main`.
- **Cache do Navegador:** Ao testar alterações no GitHub Pages (~1 min após push), adicione `?v=N` no final da URL para furar o cache do navegador.

---

## 2. Estrutura de Pastas e Módulos

```text
├── index.html                   # Hub principal do site (links da igreja, cultos, PIX, etc.)
├── CNAME                        # Configuração do domínio www.ieqlondrina.com.br (NUNCA REMOVER)
├── CLAUDE.md                    # Instruções de contexto para agentes de IA
├── CONTINUIDADE.md              # Este documento de transição entre conversas
│
├── gratidao2026/                # Hub da Celebração Gratidão 2026
│   ├── index.html               # Hub principal da celebração
│   ├── ensaio/index.html        # Kit de ensaio musical interativo (Soprano, Contralto, Tenor, Playback)
│   └── kits de ensaio/          # Áudios MP3 e PDFs das 6 músicas
├── estacaodanovavida/           # Campanha "A Estação da Nova Vida" (Quartas às 20h)
│   ├── index.html               # Hub/landing page da campanha
│   ├── sermao1.html / semana1.html  # Roteiro Sermão 1 (14/10/2026 - A Semente)
│   └── sermao2.html / semana2.html  # Roteiro Sermão 2 (21/10/2026 - O Lenço)
│
├── mesdoavivamento/             # Devocional diário com vídeos verticais do YouTube
├── congressodemulheres/         # Sistema de inscrições Mulheres (backend Google Sheets)
├── congressodiaconato/          # Sistema de inscrições Diaconato (backend Google Sheets)
├── jovens/                      # Sistema de inscrições Jovens
├── centralup/                   # Estudos e interativos
└── imagesieqcentral/            # Imagens e logotipos institucionais
```

---

## 3. Estado Atual da Campanha "A Estação da Nova Vida"

### A. Sermões Implementados:
1. **Sermão 1 (14/10/2026 às 20h):**
   - Arquivos: `estacaodanovavida/sermao1.html` e `estacaodanovavida/semana1.html`
   - Tema: *O fim do inverno: A Semente* (🌱 Símbolo: A Semente)
   - Contém: Cronômetro interativo, controle de fonte, versículos bíblicos formatados, botão de voltar ao início e proteção por senha.
2. **Sermão 2 (21/10/2026 às 20h):**
   - Arquivos: `estacaodanovavida/sermao2.html` e `estacaodanovavida/semana2.html`
   - Tema: *A chuva passou: O Lenço* (🤍 Símbolo: O Lenço)
3. **Sermão 3 (28/10/2026 às 20h):**
   - Arquivos: `estacaodanovavida/sermao3.html` e `estacaodanovavida/semana3.html`
   - Tema: *As flores aparecem: A Flor* (🌸 Símbolo: A Flor)
4. **Sermão 4 (04/11/2026 às 20h):**
   - Arquivos: `estacaodanovavida/sermao4.html` e `estacaodanovavida/semana4.html`
   - Tema: *O tempo de cantar chegou: O Sino* (🔔 Símbolo: O Sino)
   - Anuncia no final a **Semana 5**: *"A VOZ QUE ANUNCIA: A PENA"* (prevista para 11/11/2026 às 20h).

### B. Resumo Dinâmico das Semanas Anteriores (Giro de 7 em 7 dias):
- Implementado em `estacaodanovavida/index.html` e em `index.html` (no interior do accordion da campanha).
- **Lógica de automação:** Calcula automaticamente `now >= dataCulto` para cada quarta-feira (14/10, 21/10, 28/10, 04/11, 11/11) às 20h.
- Sempre de 7 em 7 dias, a nova semana vira automaticamente para o bloco "Resumo das semanas que já se passaram" sem necessidade de deploy manual.
- Destaca a próxima ministração e a corrente visual dos símbolos (`🌱 Semente` → `🤍 Lenço` → `🌸 Flor` → `🔔 Sino` → `🪶 Pena`).
- Para testes/simulação de datas futuras no navegador, basta adicionar `?data=AAAA-MM-DD` na URL.

### C. Posicionamento do Card na Página Inicial (`index.html`):
- O card fica **no final da página**, logo após a seção *Oração* e antes do rodapé.
- Está sob a seção rotulada `Campanha`.

### D. Proteção por Senha:
- **Senha definida:** `campanha` (case-insensitive, sem espaços).
- **Como funciona no `index.html`:**
  - O card aparece fechado com badge `🔒 Senha` e ícone de cadeado.
  - Ao clicar no card, abre-se uma janela modal personalizada solicitando a senha.
  - Se correta, salva `sessionStorage.setItem('campanha_unlocked', '1')`, abre o accordion, muda o badge para `Liberado` e revela os links dos sermões.
- **Como funciona nas páginas dos sermões:**
  - Cada arquivo em `estacaodanovavida/` possui um script no início do `<body>` que verifica `sessionStorage.getItem('campanha_unlocked') === '1'`.
  - Se não estiver desbloqueado, exibe uma tela de bloqueio exigindo a mesma senha `campanha`.

---

## 4. Passo a Passo para Adicionar Novos Sermões (ex: Semana 3)

Quando o usuário trouxer o HTML ou conteúdo do próximo sermão:

1. **Salvar o arquivo do sermão:**
   - Criar `estacaodanovavida/sermao3.html` e uma cópia `estacaodanovavida/semana3.html`.
   - Adicionar o botão de voltar no topo:
     ```html
     <a href="../" class="btn-voltar-home">← Início</a>
     ```
   - Inserir o gate de senha logo após `<body>`:
     ```html
     <!-- GATE DE SENHA CAMPANHA -->
     <div id="gate-campanha" style="position:fixed;inset:0;background:#0c0d10;z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:'Inter',system-ui,sans-serif;">
         <div style="background:#fff;border-radius:20px;max-width:380px;width:100%;padding:2rem 1.5rem;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.5);box-sizing:border-box;">
             <div style="width:56px;height:56px;border-radius:16px;background:#EAF3FA;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                 <svg viewBox="0 0 24 24" width="28" height="28" stroke="#1E3A5F" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                     <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                     <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                 </svg>
             </div>
             <h2 style="font-size:22px;color:#1E3A5F;margin:0 0 8px;font-weight:800;">Acesso Restrito</h2>
             <p style="font-size:14px;color:#586170;margin:0 0 20px;line-height:1.5;">Este conteúdo é restrito aos ministrantes. Digite a senha para visualizar:</p>
             <form onsubmit="verificarSenhaGate(event)">
                 <input type="password" id="gate-pwd" placeholder="Digite a senha" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid #d2dbe5;font-size:16px;text-align:center;outline:none;margin-bottom:8px;box-sizing:border-box;" autofocus />
                 <div id="gate-err" style="color:#e03838;font-size:12px;font-weight:700;display:none;margin-bottom:10px;">Senha incorreta. Tente novamente.</div>
                 <div style="display:flex;gap:8px;">
                     <a href="../" style="flex:1;padding:11px;border-radius:10px;background:#ece7db;color:#2a2c33;text-decoration:none;font-size:14px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">Voltar</a>
                     <button type="submit" style="flex:1;padding:11px;border-radius:10px;background:#1E3A5F;color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;">Entrar</button>
                 </div>
             </form>
         </div>
     </div>
     <script>
     (function(){
         if(sessionStorage.getItem('campanha_unlocked')==='1'){
             var g=document.getElementById('gate-campanha');if(g)g.remove();
         }
     })();
     function verificarSenhaGate(e){
         e.preventDefault();
         var p=document.getElementById('gate-pwd'),err=document.getElementById('gate-err');
         if(p && p.value.trim().toLowerCase()==='campanha'){
             sessionStorage.setItem('campanha_unlocked','1');
             var g=document.getElementById('gate-campanha');if(g)g.remove();
         } else {
             if(err)err.style.display='block';
             if(p){p.style.borderColor='#e03838';p.select();}
         }
     }
     </script>
     ```

2. **Adicionar o link no card em `index.html`:**
   - No elemento `<div class="hub-accordion-body" id="campanha-body">`:
     ```html
     <a href="estacaodanovavida/sermao3.html" class="hub-link hub-sublink">
         <div class="hub-link-icon" style="background:#2E5C8A;color:#fff;font-weight:900;font-size:13px;letter-spacing:-0.5px;">
             03
         </div>
         <div class="hub-link-text">
             <div class="hub-link-title">Sermão 3 · As flores aparecem: A Flor</div>
             <div class="hub-link-sub">28/10/2026 · Quarta-feira às 20h</div>
         </div>
         <span class="hub-link-arrow">→</span>
     </a>
     ```

3. **Atualizar a landing page `estacaodanovavida/index.html`:**
   - Adicionar o card do novo sermão na lista `<main class="sermon-list">`.

4. **Publicar:**
   ```bash
   git add index.html estacaodanovavida/
   git commit -m "Adicionar Sermão 3 da Campanha A Estação da Nova Vida"
   git push origin main
   ```

---

## 5. Dica de Prompt para Iniciar uma Nova Conversa

Basta copiar e colar o bloco abaixo no início de uma nova conversa com a IA:

```text
Olá! Estou trabalhando no site www.ieqlondrina.com.br na pasta:
G:\Meu Drive Sinc\IA\ieqlondrina.com.br

Por favor, leia o arquivo CONTINUIDADE.md e CLAUDE.md para entender a estrutura atual, o fluxo de git push e a Campanha "A Estação da Nova Vida" (protegida com a senha "campanha").

Quero que você me ajude a: [ESCREVA SUA TAREFA AQUI, EX: adicionar o sermão 3]
```

---

## 5. Cantata de Natal IEQ Central ("Cantata de Natal Kids & Teens")

Portal criado para os ensaios e preparação da equipe da cantata em casa.

### A. Estrutura e Recursos:
- **Página Principal do Portal:** `cantatadenatal/index.html` (com redirect automático a partir de `Cantata de Natal Kids/index.html`).
- **Arquivos de Mídia:** armazenados em `Cantata de Natal Kids/`:
  - 6 Canções (12 arquivos de áudio MP3, com versão Voz Cantada e versão Playback Instrumental).
  - 6 PDFs individuais com letras e partituras de cada canção.
  - `ENCENACAO_comp.pdf` (Roteiro Completo de Encenação Teatral, 14 páginas).
  - `MAPA_Ensaios_completo.pdf` (Cronograma detalhado dos ensaios).
  - `MAPA_Mapa das Musicas.pdf` (Estrutura e dinâmica musical).
  - `Caderno de Letras.pdf` e `Caderno de Letras - Livreto.pdf` (Cadernos completos de letras).
- **Player de Áudio Sticky Interativo:**
  - Alternância instantânea no mesmo segundo entre **Voz** e **Playback (PB)**.
  - Controle de velocidade (0.75x para aprender trechos difíceis, 1.0x normal, 1.25x).
  - Pular +/- 5 segundos, barra de progresso com scrubbing e autoplay contínuo.
- **Visualizador Modal de PDF Integrado:**
  - Permite leitura direta de partituras e do roteiro teatral sem sair da página, com botões para tela cheia e download.
- **4 Abas de Navegação:**
  - 🎵 *Músicas & Playbacks*
  - 🎭 *Teatro & Encenação*
  - 📑 *Cronograma & Mapas*
  - 💡 *Dicas de Ensaio em Casa* (15 min/dia, técnicas vocais para crianças, orientações aos pais).

### B. Proteção por Senha:
- **Senha:** `natal` (case-insensitive, sem espaços).
- **Como funciona:**
  - **No `index.html`:** Card em destaque sob a seção *Eventos & Projetos*. Ao clicar, abre modal elegante natalino solicitando a senha. Ao acertar, salva em `sessionStorage` e `localStorage` (`cantata_natal_unlocked = '1'`), atualiza o badge para `Liberado ✨` e redireciona para `cantatadenatal/`.
  - **Em `cantatadenatal/index.html`:** Possui tela de bloqueio (Gate) nativa. Se o usuário acessar o link direto sem ter desbloqueado antes, digita `natal` para liberar o portal. Botão "🔒 Trancar" no topo permite deslogar e testar novamente.


---

## 5. Módulo Gratidão 2026 (Hub & Kit de Ensaio Musical)

- **Líder da Equipe:** Eduardo Silva
- **Endereço Oficial da Igreja:** Travessa Belo Horizonte, 90 · Centro · Londrina/PR
- **Proteção por Senha:** `gratidao` (normalizada: aceita maiúsculas/minúsculas e com ou sem acento, ex: `gratidão`, `GRATIDÃO`, `Gratidao`).
- **Acesso Principal:** Card posicionado no final da página (`index.html`) sob a seção *Celebrações & Ensaios* (junto com o card da Cantata de Natal).
- **Hub:** `gratidao2026/index.html` (com gate de senha).
- **Kit de Ensaio:** `gratidao2026/ensaio/index.html` (com seletor vocal, player flutuante e gate de senha).
- **Repertório:**
  1. *Em Seu Nome, ó Cristo* (Mix, Soprano, Contralto, Tenor, Playback, Cifra e Letra PDF)
  2. *Tenho Vitória em Ti* (Mix, Soprano, Contralto, Tenor, Playback, Letra PDF)
  3. *Siempre a Tiempo* (Vídeo de Referência YouTube: `Mo2Dtf5yoyk` - áudios em preparação)
  4. *Sou Grato por Teu Amor* (Mix, Soprano, Contralto, Tenor, Playback, Referência Get Worship, Letra PDF)
  5. *Grato Sou (O Canto das Igrejas)* (Vídeo YouTube: `LfSwJaT0V9A`, Original: `I Thank God - TRIBL / Maverick City`: `LM1qrx0Huds` - áudios em preparação)
  6. *Grato Sou (Elevation)* (Mix, Soprano, Contralto, Tenor, Playback, Referência Get Worship, Letra PDF)


### Atualizações Recentes - Culto Gratidão 2026 (13/12/2026):
- Título atualizado para **Culto Gratidão 2026** com data oficial: **13 de Dezembro de 2026**.
- Subtítulo: Hub oficial para a celebração de 13/12/2026 pela Equipe de Louvor IEQ Central Londrina.
- Removido o badge "Palavra Inspiradora", mantendo o versículo bíblico limpo.
- Card Destaque: texto ajustado para "Ambiente interativo de estudo para a equipe de louvor".
- Músicas 03 (Siempre a Tiempo) e 05 (Grato Sou) tornadas ativas e clicáveis diretamente para o YouTube na prévia do Hub.

- Player de áudio movido da base para o TOPO: fixado no topo da tela com deslize animado ao tocar faixas, borda dourada e compensação automática no body e na barra de navegação.

### Recurso Adicionado: Letras Formatadas com Guia Vocal
- Adicionado modal interativo de Letra Formatada em texto responsivo diretamente no Kit de Ensaio.
- Fidelidade rigorosa aos PDFs:
  * Sublinhado: vozes cantando em uníssono.
  * Negrito: aberturas e harmonizações vocais (Soprano, Contralto, Tenor).
  * Destaques em amarelo: dinâmicas instrumentais da banda (piano, pads, bumbo, crescendo).
  * Cifras e compassos musicais.
  * Notas de rodapé e observações técnicas do arranjador preservadas integralmente.
- Recursos interativos do modal:
  * Controles de acessibilidade para aumentar/diminuir tamanho da fonte (A- e A+).
  * Botão de copiar letra com um clique.
  * Botão direto para baixar/abrir o PDF original oficial.

- Removidas cifras/acordes da música 01 (Em Seu Nome, ó Cristo) e compassos de intro, mantendo a letra limpa e 100% focada nas divisões vocais e dinâmicas.
