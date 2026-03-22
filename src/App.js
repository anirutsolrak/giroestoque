import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Inventario from './components/Inventario';
import NovoProduto from './components/NovoProduto';
import MovimentarEstoque from './components/MovimentarEstoque';
import Relatorios from './components/Relatorios';
import ContageRapida from './components/ContagemRapida';
import NavBar from './components/NavBar';
import GerenciarCategorias from './components/GerenciarCategorias';
import { storageGet, storageSet, CATEGORIAS_PADRAO } from './utils/storage';

const PRODUTOS_INICIAIS = [
  { id: 1, nome: 'Filé Mignon', categoria: 'Proteínas', unidade: 'kg', quantidade: 12, minimo: 5, custoMedio: 89.90, ultimaCompra: 89.90 },
  { id: 2, nome: 'Peito de Frango', categoria: 'Proteínas', unidade: 'kg', quantidade: 8, minimo: 10, custoMedio: 18.50, ultimaCompra: 18.50 },
  { id: 3, nome: 'Alface Americana', categoria: 'Hortifrúti', unidade: 'un', quantidade: 15, minimo: 8, custoMedio: 3.80, ultimaCompra: 3.80 },
  { id: 4, nome: 'Tomate', categoria: 'Hortifrúti', unidade: 'kg', quantidade: 4, minimo: 5, custoMedio: 6.20, ultimaCompra: 6.20 },
  { id: 5, nome: 'Água Mineral 500ml', categoria: 'Bebidas', unidade: 'cx', quantidade: 3, minimo: 2, custoMedio: 28.00, ultimaCompra: 28.00 },
  { id: 6, nome: 'Coca-Cola 2L', categoria: 'Bebidas', unidade: 'un', quantidade: 24, minimo: 12, custoMedio: 9.50, ultimaCompra: 9.50 },
  { id: 7, nome: 'Azeite Extra Virgem', categoria: 'Secos', unidade: 'un', quantidade: 6, minimo: 3, custoMedio: 42.00, ultimaCompra: 42.00 },
  { id: 8, nome: 'Detergente', categoria: 'Limpeza', unidade: 'un', quantidade: 2, minimo: 5, custoMedio: 4.50, ultimaCompra: 4.50 },
];

const MOVIMENTOS_INICIAIS = [
  { id: 1, produtoId: 1, tipo: 'entrada', quantidade: 5, custo: 89.90, data: new Date(Date.now() - 86400000 * 2).toISOString(), obs: 'NF 001234' },
  { id: 2, produtoId: 2, tipo: 'saida', quantidade: 3, custo: 18.50, data: new Date(Date.now() - 86400000).toISOString(), obs: 'Consumo cozinha' },
  { id: 3, produtoId: 3, tipo: 'entrada', quantidade: 20, custo: 3.80, data: new Date(Date.now() - 86400000 * 3).toISOString(), obs: '' },
  { id: 4, produtoId: 4, tipo: 'saida', quantidade: 2, custo: 6.20, data: new Date().toISOString(), obs: '' },
  { id: 5, produtoId: 8, tipo: 'saida', quantidade: 3, custo: 4.50, data: new Date(Date.now() - 86400000).toISOString(), obs: 'Reposição' },
];

export default function App() {
  const [tela, setTela] = useState('dashboard');
  const [produtos, setProdutos] = useState(() => storageGet('produtos') || PRODUTOS_INICIAIS);
  const [movimentos, setMovimentos] = useState(() => storageGet('movimentos') || MOVIMENTOS_INICIAIS);
  const [categorias, setCategorias] = useState(() => storageGet('categorias') || CATEGORIAS_PADRAO);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [tipoMovimento, setTipoMovimento] = useState('entrada');
  const [tema, setTema] = useState(() => {
    const salvo = localStorage.getItem('giroestoque_tema');
    return salvo || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('giroestoque_tema', tema);
  }, [tema]);

  const alternarTema = () => setTema(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => { storageSet('produtos', produtos); }, [produtos]);
  useEffect(() => { storageSet('movimentos', movimentos); }, [movimentos]);
  useEffect(() => { storageSet('categorias', categorias); }, [categorias]);

  const adicionarProduto = (p) => {
    const novo = { ...p, id: Date.now(), quantidade: 0, custoMedio: p.ultimaCompra || 0 };
    setProdutos(prev => [...prev, novo]);
    setTela('inventario');
  };

  const atualizarProduto = (id, dados) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p));
  };

  const excluirProduto = (id) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  const registrarMovimento = (mov) => {
    const produto = produtos.find(p => p.id === mov.produtoId);
    if (!produto) return;

    const novoMov = { ...mov, id: Date.now(), data: new Date().toISOString() };
    setMovimentos(prev => [...prev, novoMov]);

    if (mov.tipo === 'entrada') {
      const totalAnterior = produto.quantidade * produto.custoMedio;
      const totalNovo = mov.quantidade * mov.custo;
      const novaQtd = produto.quantidade + mov.quantidade;
      const novoCusto = novaQtd > 0 ? (totalAnterior + totalNovo) / novaQtd : mov.custo;
      atualizarProduto(mov.produtoId, {
        quantidade: novaQtd,
        custoMedio: novoCusto,
        ultimaCompra: mov.custo
      });
    } else {
      const novaQtd = Math.max(0, produto.quantidade - mov.quantidade);
      atualizarProduto(mov.produtoId, { quantidade: novaQtd });
    }
    setTela('inventario');
  };

  const abrirMovimento = (produto, tipo) => {
    setProdutoSelecionado(produto);
    setTipoMovimento(tipo);
    setTela('movimentar');
  };

  const adicionarCategoria = (nome) => {
    const nomeNorm = nome.trim();
    if (!nomeNorm || categorias.includes(nomeNorm)) return false;
    setCategorias(prev => [...prev, nomeNorm]);
    return true;
  };

  const editarCategoria = (antiga, nova) => {
    const novaNorm = nova.trim();
    if (!novaNorm || (novaNorm !== antiga && categorias.includes(novaNorm))) return false;
    setCategorias(prev => prev.map(c => c === antiga ? novaNorm : c));
    setProdutos(prev => prev.map(p => p.categoria === antiga ? { ...p, categoria: novaNorm } : p));
    return true;
  };

  const excluirCategoria = (nome, moverPara) => {
    if (moverPara) {
      setProdutos(prev => prev.map(p => p.categoria === nome ? { ...p, categoria: moverPara } : p));
    }
    setCategorias(prev => prev.filter(c => c !== nome));
  };

  const produtosPorCategoria = (cat) => produtos.filter(p => p.categoria === cat);

  const produtosAbaixoMinimo = produtos.filter(p => p.quantidade <= p.minimo);

  const navegar = (t) => {
    setProdutoSelecionado(null);
    setTela(t);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <div style={{ flex: 1, paddingBottom: 72, overflowY: 'auto' }}>
        {tela === 'dashboard' && (
          <Dashboard produtos={produtos} movimentos={movimentos} alertas={produtosAbaixoMinimo} onNavegar={navegar} />
        )}
        {tela === 'inventario' && (
          <Inventario produtos={produtos} movimentos={movimentos} categorias={categorias} onMovimentar={abrirMovimento} onNovo={() => setTela('novoproduto')} onEditar={atualizarProduto} onExcluir={excluirProduto} onCategorias={() => setTela('categorias')} />
        )}
        {tela === 'novoproduto' && (
          <NovoProduto categorias={categorias} onSalvar={adicionarProduto} onVoltar={() => setTela('inventario')} />
        )}
        {tela === 'movimentar' && (
          <MovimentarEstoque produto={produtoSelecionado} tipo={tipoMovimento} onRegistrar={registrarMovimento} onVoltar={() => setTela('inventario')} />
        )}
        {tela === 'relatorios' && (
          <Relatorios produtos={produtos} movimentos={movimentos} />
        )}
        {tela === 'categorias' && (
          <GerenciarCategorias
            categorias={categorias}
            produtos={produtos}
            onAdicionar={adicionarCategoria}
            onEditar={editarCategoria}
            onExcluir={excluirCategoria}
            produtosPorCategoria={produtosPorCategoria}
            onVoltar={() => setTela('inventario')}
          />
        )}
        {tela === 'contagem' && (
          <ContageRapida produtos={produtos} onAtualizar={atualizarProduto} onVoltar={() => setTela('inventario')} />
        )}
      </div>
      <NavBar tela={tela} onNavegar={navegar} alertas={produtosAbaixoMinimo.length} tema={tema} onTema={alternarTema} />
    </div>
  );
}
