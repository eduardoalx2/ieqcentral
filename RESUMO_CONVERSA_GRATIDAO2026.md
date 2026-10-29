# 📋 Resumo Consolidado da Sessão — Culto Gratidão 2026 & IEQ Central Londrina
**Data de Registro:** 22 de Outubro de 2026  
**Repositório:** `github.com/eduardoalx2/ieqcentral` (Branch `main`)  
**Domínio Público:** [www.ieqlondrina.com.br](https://www.ieqlondrina.com.br)  
**Líder da Equipe de Louvor & Coral:** **Eduardo Silva**  
**Endereço Oficial:** Travessa Belo Horizonte, 90 - Centro · Londrina - PR  

---

## 📌 1. Principais Solicitações e Decisões Implementadas

### A. Endereço e Liderança
- **Endereço Corrigido:** Todas as menções à antiga Rua Senador Souza Naves foram 100% removidas. O endereço oficial agora é:
  **`Travessa Belo Horizonte, 90 - Centro · Londrina - PR`**
- **Liderança Institucional:** Nome do líder da equipe configurado e exibido no topo e rodapé do Hub do Gratidão e no Kit de Ensaios:
  **`Líder da Equipe: Eduardo Silva`**

---

### B. Hub Oficial do Gratidão 2026 (`/gratidao2026/`)
- **Título & Subtítulo:**
  - Badge no topo: `Data do Culto: 13 de Dezembro de 2026`
  - Título Principal: `Culto Gratidão 2026`
  - Subtítulo: *Hub oficial de materiais, repertório e alinhamento para a celebração do dia 13 de dezembro de 2026. Equipe de Louvor IEQ Central Londrina.*
- **Versículo Bíblico (Salmos 100:4):**
  - Removido o rótulo "Palavra Inspiradora", deixando apenas o versículo e a referência limpos e elegantes no card com borda dourada.
- **Card do Kit de Ensaio Musical:**
  - Texto atualizado para a equipe de louvor:
    > *"Ambiente interativo de estudo para a equipe de louvor. Ouça cada divisão de voz isoladamente, acompanhe com playback e visualize as letras e cifras em PDF."*
- **Repertório da Celebração (Músicas 03 e 05):**
  - Retirada a opacidade cinza/apagada. Ambas agora estão 100% ativas com links diretos para os vídeos correspondentes no YouTube.

---

### C. Proteção por Senha do Gratidão 2026
- **Senha Oficial:** `gratidao`
- **Validação Inteligente:** Tolerante a maiúsculas/minúsculas e acentuação (`gratidao`, `gratidão`, `GRATIDÃO`, `Gratidão`).
- **Segurança Dupla:**
  1. Modal interativo na página inicial (`index.html`).
  2. *Gate* interno com bloqueio em tela cheia ao tentar acessar diretamente `/gratidao2026/` ou `/gratidao2026/ensaio/`.
  3. Sessão sincronizada via `sessionStorage` e `localStorage`.

---

### D. Posicionamento dos Cards na Página Principal (`index.html`)
- Os cards do **Gratidão 2026** e da **Cantata de Natal** foram realocados para a parte de baixo da página principal, reunidos na seção dedicada:
  **`Celebrações & Ensaios`** (posicionada logo acima da seção da Campanha).

---

### E. Player de Áudio Fixo no Topo (`/gratidao2026/ensaio/`)
- O dock do player de áudio foi movido da parte inferior para o **topo da tela**.
- Ao tocar qualquer faixa, ele desliza suavemente (`position: fixed; top: 0;`).
- Visual refinado com borda inferior dourada (`border-bottom: 2px solid var(--gold)`), fundo escuro translúcido com *backdrop-filter blur* e sombra.
- Ajuste automático de espaçamento no topo da página (`has-active-player`) para evitar que qualquer botão ou menu seja coberto.
- Ao clicar no **✕**, o player recolhe suavemente para cima.

---

### F. Visualizador de Letras Formatadas em Texto com Guia Vocal
- Adicionado o botão **"📖 Ver Letra da Música"** em cada faixa que possui arquivo de letra/cifra no repertório (ao lado do botão original de PDF).
- **Fidelidade Total aos PDFs Originais:**
  - <u>**Sublinhado:**</u> Trechos cantados em **uníssono**.
  - **`Negrito:`** Aberturas vocais e **harmonizações** (soprano, contralto, tenor).
  - <mark style="background:#F59E0B;color:#111;padding:1px 6px;border-radius:4px;font-weight:700;">AMARELO</mark>: Orientações dinâmicas de banda e arranjo (*piano e pads*, *marcação no bumbo*, *abre só 2 vozes*, *banda crescendo*, *pausa só voz*, *fermata do solista*).
  - **Notas Técnicas:** Preservadas no rodapé (ex: *"nas aberturas vocais o tenor está sempre na base"*).
- **Remoção de Acordes da Música 01:** As cifras de acordes foram removidas da letra da faixa 01 (*Em Seu Nome, ó Cristo*), deixando apenas a letra limpa e as marcações vocais.
- **Recursos do Modal:**
  - Legenda explicativa no topo.
  - Botões de ajuste de fonte (`A-` e `A+`).
  - Botão de **Copiar Letra** com um clique (`📋 Copiar`).
  - Botão direto para abrir o **PDF original**.

---

## 🎵 2. Mapeamento Completo do Repertório

| Nº | Título | Versão / Informações | Mídia / Links |
| :---: | :--- | :--- | :--- |
| **01** | **Em Seu Nome, ó Cristo** | Thalles Roberto & Lakewood (74 bpm · Tom: Lá) | • 5 Faixas MP3 (Mix, Soprano, Contralto, Tenor, Playback)<br>• Letra formatada em texto<br>• PDF Cifra e Letra |
| **02** | **Tenho Vitória em Ti** | Dia de Milagres (86 bpm · Tom: Ebm) | • 5 Faixas MP3<br>• Letra formatada em texto<br>• PDF Letra |
| **03** | **Siempre a Tiempo** | Vídeo Oficial de Referência | • [Ver no YouTube](https://www.youtube.com/watch?v=Mo2Dtf5yoyk&list=RDMo2Dtf5yoyk&start_radio=1) (ID: `Mo2Dtf5yoyk`) |
| **04** | **Sou Grato por Teu Amor** | Get Worship (72 bpm · Tom: Ré) | • 6 Faixas MP3 (inclui ref artística)<br>• Letra formatada em texto<br>• PDF Letra |
| **05** | **Grato Sou (O Canto das Igrejas)** | Versão brasileira: O Canto das Igrejas<br><small>Orig.: I Thank God (Maverick City & UPPERROOM \| TRIBL)</small> | • [Assistir O Canto das Igrejas](https://www.youtube.com/watch?v=LfSwJaT0V9A&list=RDLfSwJaT0V9A&start_radio=1) (ID: `LfSwJaT0V9A`)<br>• [Gravação Original TRIBL](https://www.youtube.com/watch?v=LM1qrx0Huds&list=RDLM1qrx0Huds&start_radio=1) |
| **06** | **Aqui Vou Eu** | IPALPHA NOVA · Part. Especial Banda Central UP (Tom: Lá / A) | • Áudio de Referência (MP3)<br>• Letra formatada com dinâmicas da banda e vocal<br>• PDF Cifra e Letra |

---

## 📂 3. Arquivos Modificados no Repositório

1. **`index.html`**
   - Cards movidos para a seção "Celebrações & Ensaios" no rodapé.
   - Modal e lógica de validação de senha (`gratidao`).
   - Endereço da igreja atualizado no rodapé principal.
2. **`gratidao2026/index.html`**
   - Cabeçalho: Culto Gratidão 2026 (Data: 13/12/2026).
   - Nome de Eduardo Silva como Líder da Equipe (hero e footer).
   - Remoção do título "Palavra Inspiradora" sobre o versículo.
   - Músicas 03 e 05 ativas e com link para o YouTube.
   - Endereço atualizado no rodapé.
3. **`gratidao2026/ensaio/index.html`**
   - Player de áudio fixo no topo.
   - Modal de Letras Formatadas em texto responsivo com guia vocal e botões de fonte.
   - Remoção de acordes da música 01.
   - Vídeos de referência 03 e 05 configurados.
   - Líder Eduardo Silva e endereço no rodapé.
4. **`CONTINUIDADE.md`**
   - Histórico técnico da sessão e documentação para desenvolvedores.
5. **`RESUMO_CONVERSA_GRATIDAO2026.md`**
   - Este relatório consolidado.

---

## 🌐 4. Links Públicos para Acesso

- 🏠 **Página Principal da Igreja:**  
  [https://www.ieqlondrina.com.br/](https://www.ieqlondrina.com.br/)
- 🌟 **Hub Oficial Culto Gratidão 2026:**  
  [https://www.ieqlondrina.com.br/gratidao2026/](https://www.ieqlondrina.com.br/gratidao2026/)
- 🎧 **Kit de Ensaio Musical Interativo:**  
  [https://www.ieqlondrina.com.br/gratidao2026/ensaio/](https://www.ieqlondrina.com.br/gratidao2026/ensaio/)
