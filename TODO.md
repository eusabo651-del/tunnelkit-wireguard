# Entregas

- O site deve funcionar como um painel client-side de WireGuard, deixando explícito que o túnel precisa de um servidor WireGuard real e que a Vercel hospeda apenas a interface.
- O site deve gerar localmente um par de chaves do cliente e exibir a chave pública para cadastro no servidor, sem enviar a chave privada para uma API, servidor, analytics ou serviço externo.
- O usuário deve conseguir informar endpoint do servidor, chave pública do servidor, endereço do cliente, DNS e AllowedIPs e gerar um perfil WireGuard válido com seções `[Interface]` e `[Peer]`.
- O usuário deve conseguir copiar o perfil completo e baixar um arquivo `.conf` para importação no app WireGuard do iOS.
- A página deve explicar como importar o perfil no iPhone e que, depois de ativado no app WireGuard, os demais aplicativos usam o túnel do sistema.
- A página deve mostrar o passo necessário de cadastrar a chave pública do cliente no servidor, com exemplo de configuração de peer.
- O projeto não deve usar APIs da Manus, backend obrigatório, banco, login, analytics, chave secreta ou dependência de infraestrutura gerenciada para funcionar.
- O projeto deve estar pronto para deploy estático na Vercel e versionamento em um repositório público do GitHub.
- O layout deve ser responsivo, em português brasileiro, com estados de erro/sucesso e aparência de produto real de infraestrutura, não de landing page genérica.
