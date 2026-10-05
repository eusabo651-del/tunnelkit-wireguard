# Plano — TunnelKit / Painel WireGuard

## Objetivo

Entregar um site estático, sem APIs da Manus, sem backend próprio, sem login e sem analytics, que funcione como um painel real de configuração de uma VPN WireGuard. O navegador gera o par de chaves do cliente localmente, monta um perfil `.conf` compatível com o aplicativo oficial WireGuard e permite copiar ou baixar esse perfil. O site também explica que o túnel só existe quando o usuário possui um servidor WireGuard real e cadastra a chave pública do cliente nele.

A limitação técnica será tratada de forma explícita: a Vercel hospeda a interface, mas não termina túneis VPN/UDP. O site não finge que um PWA consegue instalar uma VPN de sistema no iOS; o caminho funcional é importar o perfil no app WireGuard, que então protege os demais aplicativos do dispositivo.

## Design

- **Movimento:** editorial técnico / terminal noir — a sobriedade de ferramentas de infraestrutura com o acabamento de um produto de segurança moderno.
- **Princípios:** honestidade operacional, densidade informativa sem ruído, estados claros e ações reversíveis.
- **Paleta:** fundo azul-marinho quase preto para transmitir controle; branco azulado para legibilidade; ciano elétrico como assinatura de conexão; lima suave para estados online e segurança.
- **Layout:** composição assimétrica com hero dividido entre manifesto e um cartão de status; seções em fluxo vertical, com uma faixa de processo e um builder central em duas colunas.
- **Motivos:** grade pontilhada, linhas de circuito e o símbolo de escudo com uma abertura de túnel.
- **Interação:** formulários respondem imediatamente; geração de chaves é local; mensagens deixam claro o que é prévia, o que foi copiado e o que ainda depende do servidor.
- **Animação:** entrada suave de elementos, brilho mínimo no status e microtransições em botões; nada que pareça uma promessa falsa de conexão automática.
- **Tipografia:** `Plus Jakarta Sans` para leitura e `IBM Plex Mono` para chaves, comandos e estados técnicos, carregadas de fontes de sistema para manter o site independente.
- **Essência:** “A ponte entre seu servidor WireGuard e o app que realmente cria o túnel.” Personalidade: direto, confiável, técnico.
- **Voz:** títulos afirmativos e microcopy sem marketing nebuloso. Exemplos: “VPN de verdade começa no túnel.” e “O site prepara o perfil. O app fecha a conexão.”
- **Wordmark:** um escudo aberto por uma linha horizontal que representa o túnel; nome `tunnelkit` em caixa baixa.
- **Cor proprietária:** `#62e6d5`, o ciano “Tunnel Mint”, usado apenas em ações e estados de conexão.

## Estrutura do projeto

- `index.html`: página única, sem rotas de aplicação; hero, explicação, gerador, fluxo de instalação, guia de servidor e FAQ.
- `styles.css`: sistema visual responsivo, estados de formulário, componentes e ilustração de status.
- `app.js`: geração local de chaves X25519, montagem do perfil WireGuard, cópia/Download e interações da página.
- `logo.svg`: marca vetorial local.
- `manus-routes.json`: manifesto de rota estática exigido pelo ambiente de preview.
- `vercel.json`: cabeçalhos seguros e URLs limpas para hospedagem estática.
- `README.md`: operação, instalação em iOS, pré-requisitos do servidor e limites do projeto.

## Comportamento técnico

1. O usuário informa endpoint, chave pública do servidor, endereço do cliente, DNS e AllowedIPs.
2. O navegador gera uma chave privada aleatória e calcula a chave pública X25519 sem enviar dados para fora.
3. O perfil é montado com `[Interface]` e `[Peer]`, exibido na tela e disponibilizado para copiar ou baixar.
4. O usuário adiciona a chave pública do cliente no `[Peer]` do servidor WireGuard e importa o `.conf` no app WireGuard do iOS.
5. O site nunca expõe uma chave privada em URL, servidor, analytics ou API.

## Material constraints

- Não usar API da Manus, SDK proprietário, banco, autenticação, telemetria ou segredos.
- Não prometer que o site sozinho cria uma VPN de sistema no iOS.
- Não incluir um servidor VPN falso: o servidor WireGuard continua sendo infraestrutura do proprietário do serviço.
- Compatível com deploy estático na Vercel e com repositório público no GitHub.
