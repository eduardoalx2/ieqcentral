# Projeto ieqlondrina.com.br

Site estático da IEQ Central Londrina + sistemas auxiliares. Repositório Git conectado a
`github.com/eduardoalx2/ieqcentral`, publicado via **GitHub Pages** em **www.ieqlondrina.com.br**.

## Estrutura
- `index.html` — página principal (links da igreja, contribua/PIX, card "Mês do Avivamento", card "Mensagens de Célula")
- `celulas/` — portal de roteiros de célula e banco com 25 dinâmicas de quebra-gelo
- `PROMPT_MESTRE_MENSAGENS_CELULA.md` — diretriz canônica e prompt mestre para criação de sermões de célula
- `estacaodanovavida/` — campanha "A Estação da Nova Vida" (roteiros de ministração das quartas às 20h)
- `mesdoavivamento/` — devocional diário "Mês do Avivamento" (libera 1 dia por dia, com vídeos)
- `congressodemulheres/` — sistema de inscrições (Google Sheets backend) — paleta rosa, R$210
- `congressodiaconato/` — sistema de inscrições (Google Sheets backend) — paleta índigo, R$150
- `gratidao2026/` — Hub e Kit de Ensaio Musical 'Gratidão 2026' (repertório de 6 músicas, divisões Soprano, Contralto, Tenor, Playback e Letras)
- `CONTINUIDADE.md` — memória técnica e guia de continuidade em novas conversas
- `CNAME` — domínio do GitHub Pages (não remover)

## Publicação
Tudo que muda neste repositório vai pro ar com `git add` + `git commit` + `git push`.
O usuário prefere que eu **aja direto** (editar, commitar e dar push) e só relate o resultado —
não ficar pedindo confirmação para ações claras. O GitHub Pages leva ~1 min para reconstruir.
Para furar o cache do navegador ao testar, use `?v=N` no final da URL.

Domínio: `www.ieqlondrina.com.br` → GitHub Pages. `ieqlondrina.com.br` (sem www) → HostGator,
mas a home redireciona para o www. Subpastas tipo `/jantardecasais` seguem na HostGator.

---

# TAREFA RECORRENTE: "adicionar youtube no devocional"

Quando o usuário trouxer um link do YouTube e disser a qual **dia** ele pertence
(ex.: "adiciona esse vídeo no dia 16: <link>"), faça:

### 1. Extrair o ID do vídeo do link
- Shorts: `https://youtube.com/shorts/VIDEO_ID?feature=share` → ID é o que está entre `/shorts/` e `?`
- Normal: `https://www.youtube.com/watch?v=VIDEO_ID` → ID é o valor de `v=`
- Curto: `https://youtu.be/VIDEO_ID` → ID é o trecho após a barra
- Sempre **descartar** tudo a partir de `?` (parâmetros como `?feature=share`).

### 2. Inserir o ID no array `videos`
- Arquivo: `mesdoavivamento/index.html`, na constante `const videos = [ ... ];`
- O array é **0-indexed**: índice 0 = Dia 1, índice 1 = Dia 2, ... índice N-1 = Dia N.
  Ou seja, o **Dia X** ocupa a posição X na ordem (a entrada com o comentário `// Dia X`).
- Mantenha o padrão: um ID por linha, com o comentário `// Dia X` ao lado.
- A última entrada do array **não** leva vírgula no final; as demais levam. Ao adicionar um novo
  dia ao fim, acrescente a vírgula na entrada que antes era a última.
- Os dias devem ficar em ordem sequencial. Se o usuário pular dias (raro), preencha as posições
  intermediárias com `""` (string vazia) — dia sem vídeo simplesmente não mostra a seção "Assista".

### 3. NÃO mexer no bloqueio/liberação do dia
- A liberação é controlada **só pela data** (`const START` + lógica de `isUnlocked`). **Não altere isso.**
- O vídeo só é renderizado quando o dia já está desbloqueado pela data (a seção "Assista" está
  dentro do ramo "dia desbloqueado"). Portanto: adicionar o ID agora deixa o vídeo **pronto e
  embutido**, e ele aparece automaticamente quando chegar a data daquele dia. É exatamente o
  comportamento desejado — adicione o ID mesmo que o dia ainda esteja bloqueado.

### 4. Publicar
- `git add mesdoavivamento/index.html && git commit -m "..." && git push`
- Não precisa pedir confirmação para isso.

### Referência rápida da mecânica (não precisa recriar, só entender)
- CSS do player: classe `.video-wrap` (formato vertical 9/16, máx 300px) — já existe.
- Template: dentro do `dias.forEach`, `const vid = videos[i];` gera a seção "Assista" com
  `<iframe src="https://www.youtube.com/embed/${vid}" ...>` quando `vid` existe.
- O calendário: `START = 02/06/2026`; Dia N (índice N-1) desbloqueia em `START + (N-1)` dias.

---

# PADRÃO OBRIGATÓRIO: "criar/adicionar mensagem de célula"

Sempre que o usuário pedir para criar, elaborar ou adicionar uma nova mensagem para as células da IEQ Central:
1. **Seguir rigorosamente** o padrão em `PROMPT_MESTRE_MENSAGENS_CELULA.md` (e regras em `.agents/rules/ieq-mensagens-celula.md`).
2. **Duração:** 25 a 30 minutos (referência 28 min).
3. **Estrutura mandatória:**
   - Título memorável e pastoral
   - Texto bíblico completo por extenso versículo por versículo numerado (`.scripture-box`)
   - Introdução e contextualização com frase de transição
   - Exatamente **3 pontos principais**, cada um com explicação bíblica, aplicação cotidiana e caixa de destaque `👔 ORIENTAÇÃO AO LÍDER` com "Enfatize"
   - Três perguntas abertas para o grupo com dica de moderação
   - Aplicação prática da semana específica e realizável
   - Oração final e frase de impacto para levar no coração
4. **Inserção no site:** Adicionar o novo objeto no array `lessons` em `celulas/index.html` e associar ao ID de um quebra-gelo temático recomendado (`suggestedIcebreakerId`).
5. **Endereço da igreja sempre:** `Travessa Belo Horizonte, 90 · Londrina/PR`.

