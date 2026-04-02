## Plano de Implementação - Points!

### Fase 1: Corrigir botões e interações quebradas
- **Profile/Settings**: Tornar todos os botões funcionais (editar perfil, notificações, tema, sair)
- **Feed**: Corrigir likes e comentários com persistência no banco de dados
- **Stories**: Garantir abertura e interação completa
- **Navegação**: Adicionar animações de transição entre telas (framer-motion)

### Fase 2: PDV Profissional Completo
- Seleção de produtos com busca, categorias e estoque
- Carrinho com edição inline, descontos por item e por pedido
- Resumo de venda com impressão de recibo (PDF)
- Histórico de vendas com filtros por data
- Dashboard de vendas da empresa
- Controle de estoque automático (diminui ao vender)

### Fase 3: Mercado Pago Integration
- Edge function para criar pagamentos via API do Mercado Pago
- QR Code PIX para pagamento
- Webhook para confirmar pagamentos
- Fluxo: Cliente → Empresa (vendas) e Empresa → Entregador (pagamento)
- **Necessário**: Chave de API do Mercado Pago (vou solicitar)

### Fase 4: Admin Dashboard com Insights
- Gráficos interativos com Recharts:
  - Vendas por período (linha)
  - Empresas mais curtidas/comentadas (barras)
  - Distribuição de categorias (pizza)
  - Pedidos por status (barras empilhadas)
- Métricas em cards: total de usuários, pedidos hoje, receita, empresas ativas
- Tabelas com ranking de empresas e produtos mais vendidos

### Fase 5: Animações e Polish
- Transições de página com framer-motion
- Micro-interações em botões (scale, ripple)
- Loading states e skeletons
- Melhorar resolução de imagens (usar URLs de alta qualidade)

### Fase 6: Instruções VS Code
- Gerar README completo com:
  - Pré-requisitos (Node.js, npm)
  - Como clonar do GitHub
  - Variáveis de ambiente
  - Comandos para rodar localmente

**Nota**: Para Mercado Pago, vou precisar que você forneça sua chave de API (Access Token). Vou solicitar de forma segura.