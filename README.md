# GiroEstoque

Sistema de controle de estoque para restaurantes. App mobile-first feito em React.

## Funcionalidades

### Inventario
- Cadastro, edicao e exclusao de produtos
- Filtro por busca e categoria
- Indicadores visuais de status (OK, CRITICO, ZERADO)
- Custo medio ponderado calculado automaticamente

### Movimentacoes
- Registro de entradas e saidas com teclado numerico
- Custo unitario por entrada com calculo de custo medio
- Historico completo de movimentacoes com observacoes

### Contagem Rapida (Batida de Estoque)
- Atualizacao em lote das quantidades reais
- Comparacao visual sistema vs. contagem fisica

### Relatorios
- KPIs: valor em estoque, compras, consumo, saldo
- Equacao de consumo real (estoque inicial + compras - estoque final)
- Grafico pizza por categoria
- Top consumo e maiores compras por periodo (7/15/30 dias)

### Categorias
- Gerenciamento completo: adicionar, editar, excluir
- Exclusao segura: categorias com produtos exigem move-los para outra antes

### Exportacoes
- **Excel (CSV)**: exporta produtos + movimentacoes em CSV compativel com Excel (separador `;`, formato brasileiro)
- **Ficha de Controle Manual**: fichas A4 imprimiveis por produto para fixar em containers, com grade de horarios (06h-23h), colunas facilitadoras (x1, x3, x5, x10), totalizadores e campo de fechamento

### Tema
- Modo escuro (padrao) e modo claro
- Switch na barra de navegacao inferior
- Preferencia salva no navegador

## Armazenamento

Todos os dados sao salvos no **localStorage** do navegador:
- `giroestoque_produtos` - lista de produtos
- `giroestoque_movimentos` - historico de movimentacoes
- `giroestoque_categorias` - categorias personalizadas
- `giroestoque_tema` - preferencia de tema (dark/light)

> Use a funcao "Baixar Excel" para fazer backup dos dados.

## Instalacao

```bash
cd giroestoque
npm install
npm start
```

Acesse http://localhost:3000

## Deploy

Configurado para Vercel (`vercel.json` incluso).

```bash
npm run build
```

## Estrutura

```
src/
  App.js                    # Roteamento e estado global
  components/
    Dashboard.js            # Tela inicial com KPIs e alertas
    Inventario.js           # Lista de produtos com filtros
    NovoProduto.js          # Cadastro de produto
    MovimentarEstoque.js    # Entrada/Saida com teclado numerico
    ContagemRapida.js       # Batida de estoque
    Relatorios.js           # Analise com graficos (Recharts)
    GerenciarCategorias.js  # CRUD de categorias
    NavBar.js               # Navegacao inferior + switch de tema
  utils/
    storage.js              # localStorage, exportacao Excel, ficha de controle
```

## Stack

- React 18
- Recharts (graficos)
- CSS Variables (temas claro/escuro)
- localStorage (persistencia)
