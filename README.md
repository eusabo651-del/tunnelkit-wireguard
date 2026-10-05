# tunnelkit — painel WireGuard para iOS

Um site estático que gera, no próprio navegador, perfis de cliente WireGuard compatíveis com o app oficial WireGuard. O arquivo gerado pode ser importado no iPhone e, quando o túnel é ativado no app, passa a proteger o tráfego dos outros aplicativos do dispositivo.

> **Importante:** este projeto não é um servidor VPN. Um site hospedado na Vercel não consegue terminar um túnel WireGuard nem criar uma VPN de sistema no iOS sozinho. Você precisa de um VPS/servidor com WireGuard e deve cadastrar nele a chave pública do cliente gerada pelo site.

## O que funciona

- Geração local de chave privada e chave pública X25519.
- Montagem de perfil `.conf` com `[Interface]` e `[Peer]`.
- Cópia do perfil e download para importação no WireGuard para iOS.
- Nenhum login, backend, analytics, API da Manus, banco ou segredo.
- Content Security Policy com `connect-src 'none'`: a interface não faz chamadas de rede.

## Uso rápido

1. Instale o [WireGuard para iOS](https://apps.apple.com/app/wireguard/id1441195209).
2. No servidor WireGuard, tenha a chave pública do servidor, um endpoint UDP e uma sub-rede para clientes.
3. Abra o site e preencha o endpoint, a chave pública do servidor, o endereço do cliente, o DNS e os `AllowedIPs`.
4. Gere o perfil, copie a **chave pública do cliente** e cadastre-a no servidor como um novo peer.
5. Baixe o `.conf` e importe-o no app WireGuard pelo menu de compartilhamento/arquivos do iOS.
6. Ative o túnel no app. O iOS exibirá o indicador de VPN e os demais apps usarão essa conexão.

## Exemplo de peer no servidor

Substitua os valores pelos dados mostrados no painel:

```ini
[Peer]
PublicKey = CHAVE_PUBLICA_DO_CLIENTE
AllowedIPs = 10.8.0.2/32
```

Um servidor Ubuntu normalmente também precisa de encaminhamento de IP e NAT. A configuração exata varia conforme a interface de saída, firewall, sub-rede e provedor. Não copie regras de firewall sem revisar o ambiente.

## Rodar localmente

Não há dependências npm. Com Python 3:

```bash
npm run dev
# ou: python3 -m http.server 3000
```

Abra `http://localhost:3000`.

## Deploy na Vercel

Importe o repositório na Vercel ou execute:

```bash
vercel --prod
```

A Vercel servirá os arquivos estáticos da raiz. Não são necessárias variáveis de ambiente.

## Limites e segurança

- A chave privada é mantida apenas na memória da aba e nunca é enviada pela aplicação.
- Recarregar a página limpa o estado do gerador; gere um novo perfil se necessário.
- O gerador não cadastra o peer automaticamente no servidor. Essa parte exigiria um backend/provisionador e credenciais de infraestrutura, que não fazem parte deste repositório público.
- Para oferecer VPN como serviço para várias pessoas, adicione um painel de provisionamento em um backend separado e proteja as chaves, billing e gestão de servidores. Não coloque credenciais de servidor em código público.

## Licença

MIT. Veja `LICENSE`.
