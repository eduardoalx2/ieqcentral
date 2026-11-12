# Ação entre Amigos do Central Kids

Status: planejamento técnico; vendas ainda não disponíveis.

## Dados confirmados
- Ministério Infantil da IEQ Central de Londrina.
- Prêmio: cesta de Natal; imagens e logo fornecidas na conversa.
- Valor por número: R$ 5,00.
- Universo: números de 1 a 200, únicos e atribuídos aleatoriamente após aprovação do pagamento.
- Encerramento: 20/12/2026 às 22h em America/Sao_Paulo (21/12/2026 01h UTC).
- Sorteio: 20/12/2026, após encerramento e conferência; horário exato pendente.
- Card compacto na página inicial, abaixo da inscrição do Almoço da Família.
- Chave Pix pendente; impedir pagamento enquanto não configurada.

## Participação
1. Informar nome, WhatsApp e quantidade; vendedor opcional.
2. Formatar WhatsApp como XX XXXXX-XXXX e validar DDD e número no servidor.
3. Exibir telefone para confirmação explícita antes de prosseguir.
4. Reservar quantidade disponível com prazo visível, controlado pelo servidor.
5. Exibir valor, chave Pix e botão de copiar quando configurada.
6. Receber comprovante JPG, PNG ou PDF em armazenamento privado, com limite de tamanho e verificação de formato.
7. Colocar inscrição em análise; não tratar comprovante como confirmação bancária.
8. Após conferência manual, atribuir números disponíveis em transação atômica.
9. Exibir protocolo privado de consulta para acompanhar status e números; não permitir acesso aos comprovantes ou dados de terceiros somente pelo telefone.

## Administração
- Login individual com autenticação no servidor; nenhuma senha no JavaScript público.
- Resumo de inscritos, pagamentos, arrecadação confirmada e números disponíveis/reservados/atribuídos.
- Filtros por nome, telefone, vendedor e status.
- Visualização privada do comprovante e ação de contato pelo WhatsApp.
- Aprovação idempotente: repetir ação não cria números nem pagamentos duplicados.
- Histórico de operador, data e ação.
- Rejeição/correção com motivo; números aprovados não são liberados silenciosamente.
- Sorteio permitido somente após encerramento das vendas (manual ou automático) e resolução dos pagamentos pendentes.
- Sortear exclusivamente números aprovados usando aleatoriedade segura; registrar resultado atomicamente e impedir repetição acidental.
- Divulgação pública sem telefone nem comprovante.

## Encerramento
- Aplicar limite no servidor, independente do relógio do visitante.
- A partir das 22h, impedir novas reservas, compras e envio de novos comprovantes, com mensagem clara.
- Permitir conferência administrativa das inscrições recebidas antes do prazo.
- Manter consulta de números e resultado disponível pelo mesmo link e QR Code.

## Arquitetura a definir após inspeção
O repositório atual contém um site estático publicado em GitHub Pages e sistemas anteriores com backend externo. O aplicativo exige serviço de servidor, banco transacional, autenticação e armazenamento privado; GitHub Pages sozinho não atende esses requisitos.

A cópia local examinada não contém o card/inscrição do Almoço da Família. Localizar a versão atual antes de editar a página inicial. Preservar alterações preexistentes em index.html e na pasta centralup nacopa.

## Pendências para ativação
- Chave Pix e nome do recebedor.
- Responsáveis e respectivos acessos administrativos.
- Serviço de backend e credenciais configuradas fora do código público.
- Prazo de reserva e política para pagamentos não confirmados.
- Horário exato do sorteio, após a conferência final.
- Importar fotos e logo originais.

## Validação necessária
- Concorrência na disputa dos últimos números e aprovação duplicada.
- Bloqueio no instante exato do encerramento no servidor.
- Controle de acesso administrativo, isolamento dos comprovantes e consulta privada.
- Fluxo de reserva expirada, rejeição e esgotamento.
- Cadastro e envio de comprovantes em celular e computador.
- Persistência e unicidade do resultado do sorteio.
- Revisão do card e das funções anteriores da página inicial.

## Compra múltipla e conferência de divergências
- Participante escolhe quantidade inteira entre 1 e a disponibilidade atual; total em centavos = quantidade × 500, calculado também no servidor.
- Uma inscrição reúne a quantidade comprada e seu comprovante; a aprovação atribui todos os números da compra atomicamente.
- Exemplo: quatro números, R$ 20,00; após conferência, quatro números distintos.
- Administrador pode ajustar a quantidade antes da aprovação, registrando quantidade original, quantidade aprovada, valor efetivamente recebido, motivo, operador e horário.
- Exemplo: solicitação de cinco números (R$ 25,00), pagamento de R$ 20,00: permitir aprovar quatro números mediante ajuste explícito ou aguardar complemento de R$ 5,00. Nunca atribuir cinco números pelo pagamento de quatro.
- Ajuste para mais depende da disponibilidade; valor não múltiplo de R$ 5,00 permanece em análise para resolução, sem arredondamento silencioso.
- Ao reduzir quantidade, liberar somente a reserva excedente na mesma transação.
- Não alterar os números de uma compra já aprovada através do ajuste de pendências.

## Retorno ao participante
- Após aprovação, gerar recibo com nome, quantidade aprovada, total confirmado, números atribuídos, prêmio e data do sorteio.
- Preparar mensagem de WhatsApp usando os dados persistidos da aprovação e telefone validado.
- Modo inicial: botão “Enviar números pelo WhatsApp” abre conversa com mensagem preenchida; o administrador confirma o envio no WhatsApp. Abrir o link não comprova envio nem entrega.
- Envio sem intervenção humana depende de integração oficial com WhatsApp, configuração e regras do provedor; não prometer envio automático sem essa integração.
- Falha no envio não desfaz aprovação nem atribui outros números; permitir reenviar o mesmo recibo.
- Não criar acesso separado para vendedores, conforme decisão do usuário.

## Decisões confirmadas pelo usuário
- Aprova a reserva temporária de quantidade descrita na proposta (referência: 30 minutos), com disponibilidade protegida contra compras simultâneas.
- Aprova encerrar novas compras e recebimento de comprovantes em 20/12/2026 às 22h, com conferência administrativa posterior das inscrições recebidas no prazo.
- Divergências de pagamento serão tratadas pela equipe diretamente com o participante pelo WhatsApp; o painel deve registrar pendência, contato, motivo e resolução.
- WhatsApp normalizado é a principal chave de identificação da pessoa, além do nome; permitir múltiplas compras vinculadas ao mesmo telefone.
- Participante deve poder consultar suas informações e números pelo celular, sem permissão de edição. A consulta não deve expor informações de outras pessoas.
- Sorteio presencial no culto de domingo, 20/12/2026, após a cantata de Natal. Não prometer transmissão do sorteio pelo YouTube.
- Entrega no culto ao ganhador ou ao vendedor indicado, que poderá entregar ao ganhador; registrar quem retirou e para qual participante.
- Sem resposta do ganhador em 48 horas, a equipe do Central Kids fará novo sorteio. Registrar tentativas de contato, início e fim do prazo e justificativa antes de habilitar novo sorteio. Preservar todos os resultados anteriores; impedir novo sorteio acidental e excluir o ganhador anterior na nova apuração conforme regra final a definir.
- Usuário autoriza recursos administrativos de busca, filtros, exportação, histórico e backup propostos.
- Usuário solicita não aprofundar a discussão regulatória nesta etapa; isso não equivale a validação regulatória.

## Horário confirmado
- Manter o bloqueio automático de novas vendas em 20/12/2026 às 22h, horário de Londrina, como margem de segurança confirmada pelo usuário.
- Sorteio presencial após a cantata, sem exigir que o culto aguarde até as 22h.
- Antes de executar o sorteio, encerrar as vendas e resolver as inscrições pendentes; congelar a lista elegível no servidor. O início do sorteio encerra novas compras mesmo se ocorrer antes do limite automático, impedindo vendas após a apuração.
- Exibir 22h como limite máximo; informar também que as vendas se encerram no início do sorteio, caso ele ocorra antes.

## Contato e novo sorteio
O prazo de 48h refere-se à resposta ao contato, não à retirada física. A regra pública deve definir o marco inicial do prazo e o procedimento de nova apuração, sem prometer novo sorteio antes do vencimento.
