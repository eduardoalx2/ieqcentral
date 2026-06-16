# Congresso de Mulheres — IEQ Região 655
## Instruções de Configuração

> Valor da inscrição: **R$ 210,00 por pessoa**
> Banco de dados: **Google Sheets** (via Google Apps Script)

---

## PASSO 1 — Criar a Planilha Google Sheets

1. Acesse https://sheets.new e crie uma nova planilha
2. Nomeie como: **Congresso de Mulheres 2026**
3. Copie o ID da planilha da URL:
   `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`
4. Guarde este ID, você vai precisar

> ⚠️ Crie uma planilha **NOVA**, separada da do Congresso do Diaconato, para os dados não se misturarem.

---

## PASSO 2 — Criar o Google Apps Script

1. Na planilha, clique em **Extensões > Apps Script**
2. Apague o código padrão (`function myFunction() {}`)
3. Cole todo o conteúdo do arquivo **Code.gs** deste pacote
4. Salve (Ctrl+S) com o nome: **Mulheres Backend**

### Inicializar as abas:
5. No menu de funções (topo), selecione `inicializarPlanilha`
6. Clique em **Executar**
7. Autorize as permissões quando solicitado
8. Verifique que 3 abas foram criadas: `igrejas`, `inscritas`, `pagamentos`

---

## PASSO 3 — Fazer o Deploy do Web App

1. No Apps Script, clique em **Implantar > Nova implantação**
2. Tipo: **App da Web**
3. Configurar:
   - Descrição: `Mulheres v1`
   - Executar como: **Eu (seu email)**
   - Quem pode acessar: **Qualquer pessoa**
4. Clique em **Implantar**
5. **Copie a URL gerada** — ela será parecida com:
   `https://script.google.com/macros/s/XXXXXX/exec`

---

## PASSO 4 — Configurar as Páginas HTML

### 4a. Configurar a URL da API
Abra o arquivo `js/config.js` e substitua:
```
export const API_URL = 'COLE_AQUI_A_URL_DO_WEB_APP';
```
pela URL copiada no Passo 3.

### 4b. Configurar o link da planilha
Abra o arquivo `index.html` e substitua:
```
const SHEET_LINK = 'https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit';
```
pelo link real da sua planilha.

> 💡 O valor da inscrição (R$ 210) fica em `js/config.js`, na constante `VALOR_INSCRICAO` — se mudar, é só editar lá num único lugar.

---

## PASSO 5 — Fazer Upload para o Servidor

Envie os seguintes arquivos/pastas para o seu servidor:
```
index.html
igrejas.html
inscricoes.html
pagamentos.html
relatorios.html
js/
  config.js
```

Acesse pelo navegador: `https://seu-servidor.com/congressodemulheres/`

---

## IMPORTANTE — Quando atualizar o Apps Script

Se você precisar editar o código `.gs` no futuro:
1. Faça as alterações
2. Clique em **Implantar > Gerenciar implantações**
3. Clique no lápis (editar) e selecione **Nova versão**
4. Clique em **Implantar**
5. A URL permanece a mesma, não precisa alterar o HTML

---

## Campos da inscrição (todos obrigatórios)

- Nome Completo
- WhatsApp
- E-mail
- CPF
- Data de Nascimento

---

## Senha de confirmação de Pix

Pagamentos via **Pix** entram como **provisórios** e só viram "confirmado" após digitar a senha
na tela de Pagamentos. A senha padrão é **`admin`** — para trocar, edite a constante `SENHA`
no topo do `<script>` em `pagamentos.html`.

---

## Estrutura de arquivos

```
/
├── index.html          → Hub central + contadores
├── igrejas.html        → Gerenciar igrejas participantes
├── inscricoes.html     → Cadastrar/editar inscritas
├── pagamentos.html     → Lançar/controlar pagamentos por igreja
├── relatorios.html     → Gerar relatórios PDF A4
├── js/
│   └── config.js       → URL da API + valor da inscrição + funções compartilhadas
└── Code.gs             → Backend Google Apps Script (não sobe pro servidor)
```

---

## Suporte

Em caso de erro de CORS ou falha na API, verifique:
1. Se a URL em `config.js` está correta e sem espaços
2. Se o deploy foi feito com acesso "Qualquer pessoa"
3. Se as abas foram inicializadas corretamente na planilha
