# Hub: Ação entre Amigos · Central Kids (IEQ Central de Londrina)

## Arquitetura Isolada e Segura
- **URL Pública:** `https://www.ieqlondrina.com.br/central-kids/` (`central-kids/index.html`)
- **Painel Administrativo:** `https://www.ieqlondrina.com.br/central-kids/admin.html` (`central-kids/admin.html`)
- **Senha do Painel Admin:** `centralkids` (aceita maiúsculas ou minúsculas)
- **Chave Pix Padrão:** `regiao655@gmail.com` (editável pelo Painel Admin)
- **Isolamento Total da Região 655:**
  - Não importa nem executa `firebase-auth` (`getAuth`, `signIn`, `signOut`) em nenhuma página.
  - Não altera `firestore.rules` nem Cloud Functions do projeto.
  - Utiliza exclusivamente coleções prefixadas no Firestore:
    - `ck_acao2026_config`
    - `ck_acao2026_pedidos`
    - `ck_acao2026_comprovantes`
    - `ck_acao2026_logs`
