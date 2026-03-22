import React, { useState, useMemo } from 'react';
import { formatMoeda, exportarExcel, imprimirFichaControle } from '../utils/storage';

export default function Inventario({ produtos, movimentos, categorias, onMovimentar, onNovo, onEditar, onExcluir, onCategorias }) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [editando, setEditando] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [fichasSelecionadas, setFichasSelecionadas] = useState({});

  const categoriasComTodos = ['Todos', ...categorias];

  const filtrados = useMemo(() =>
    produtos.filter(p => {
      const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
      const matchCat = categoria === 'Todos' || p.categoria === categoria;
      return matchBusca && matchCat;
    }).sort((a, b) => {
      const aAlerta = a.quantidade <= a.minimo;
      const bAlerta = b.quantidade <= b.minimo;
      if (aAlerta && !bAlerta) return -1;
      if (!aAlerta && bAlerta) return 1;
      return a.nome.localeCompare(b.nome);
    }), [produtos, busca, categoria]);

  const statusCor = (p) => {
    if (p.quantidade === 0) return 'var(--red)';
    if (p.quantidade <= p.minimo) return 'var(--amber)';
    return 'var(--green)';
  };

  const statusLabel = (p) => {
    if (p.quantidade === 0) return 'ZERADO';
    if (p.quantidade <= p.minimo) return 'CRÍTICO';
    return 'OK';
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ padding: '48px 20px 16px', background: 'var(--header-gradient)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 3, marginBottom: 4 }}>ESTOQUE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Inventário</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setFichasSelecionadas({}); setMostrarFicha(true); }} style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 10, padding: '8px 12px',
              color: 'var(--text2)', fontWeight: 700,
              fontFamily: 'var(--display)', fontSize: 12,
              cursor: 'pointer',
            }} title="Ficha de Controle Manual">
              ⎙
            </button>
            <button onClick={() => exportarExcel(produtos, movimentos)} style={{
              background: 'transparent', border: '1px solid var(--green)',
              borderRadius: 10, padding: '8px 12px',
              color: 'var(--green)', fontWeight: 700,
              fontFamily: 'var(--display)', fontSize: 12,
              cursor: 'pointer',
            }} title="Baixar Excel">
              ↓
            </button>
            <button onClick={onNovo} style={{
              background: 'var(--green)', color: '#000', border: 'none',
              borderRadius: 10, padding: '8px 16px', fontWeight: 700,
              fontFamily: 'var(--display)', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              + Novo
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Busca */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 16 }}>⌕</span>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            style={{
              width: '100%', padding: '12px 12px 12px 38px',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text)', fontSize: 15,
            }}
          />
        </div>

        {/* Filtro categoria */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {categoriasComTodos.map(c => (
            <button key={c} onClick={() => setCategoria(c)} style={{
              padding: '6px 14px', borderRadius: 20, flexShrink: 0,
              background: categoria === c ? 'var(--green)' : 'var(--card)',
              color: categoria === c ? '#000' : 'var(--text3)',
              border: categoria === c ? 'none' : '1px solid var(--border)',
              fontWeight: categoria === c ? 700 : 400,
              fontSize: 12, fontFamily: 'var(--display)',
            }}>{c}</button>
          ))}
          <button onClick={onCategorias} style={{
            padding: '6px 12px', borderRadius: 20, flexShrink: 0,
            background: 'transparent',
            color: 'var(--text3)',
            border: '1px dashed var(--border2)',
            fontSize: 12, fontFamily: 'var(--display)',
          }} title="Gerenciar Categorias">⚙</button>
        </div>

        {/* Contador */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
          {filtrados.length} PRODUTO{filtrados.length !== 1 ? 'S' : ''}
        </div>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtrados.map(p => (
            <ProdutoCard
              key={p.id}
              produto={p}
              statusCor={statusCor(p)}
              statusLabel={statusLabel(p)}
              expandido={expandido === p.id}
              onExpand={() => setExpandido(expandido === p.id ? null : p.id)}
              onEntrada={() => onMovimentar(p, 'entrada')}
              onSaida={() => onMovimentar(p, 'saida')}
              onEditar={() => setEditando(p)}
              onExcluir={() => { if (window.confirm(`Excluir "${p.nome}"?`)) onExcluir(p.id); }}
            />
          ))}
          {filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              Nenhum produto encontrado
            </div>
          )}
        </div>
      </div>

      {/* Modal edição */}
      {editando && (
        <EditModal produto={editando} categorias={categorias} onSalvar={(dados) => { onEditar(editando.id, dados); setEditando(null); }} onFechar={() => setEditando(null)} />
      )}

      {/* Modal ficha de controle */}
      {mostrarFicha && (
        <FichaModal
          produtos={produtos}
          selecionados={fichasSelecionadas}
          onToggle={(id) => setFichasSelecionadas(prev => ({ ...prev, [id]: !prev[id] }))}
          onTodos={() => {
            const todos = {};
            produtos.forEach(p => { todos[p.id] = true; });
            setFichasSelecionadas(todos);
          }}
          onNenhum={() => setFichasSelecionadas({})}
          onImprimir={() => {
            const selecionados = produtos.filter(p => fichasSelecionadas[p.id]);
            if (selecionados.length > 0) {
              imprimirFichaControle(selecionados);
              setMostrarFicha(false);
            }
          }}
          onFechar={() => setMostrarFicha(false)}
        />
      )}
    </div>
  );
}

function ProdutoCard({ produto: p, statusCor, statusLabel, expandido, onExpand, onEntrada, onSaida, onEditar, onExcluir }) {
  return (
    <div style={{
      background: 'var(--card)', border: `1px solid ${p.quantidade <= p.minimo ? statusCor + '40' : 'var(--border)'}`,
      borderRadius: 12, overflow: 'hidden',
      animation: 'slideUp 0.2s ease',
    }}>
      <div onClick={onExpand} style={{ padding: '14px 16px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            background: statusCor,
            boxShadow: `0 0 6px ${statusCor}`,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.nome}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
              {p.categoria} · CM: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.custoMedio)}/{p.unidade}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 500, color: statusCor }}>
              {p.quantidade}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: statusCor, letterSpacing: 1 }}>{statusLabel}</div>
          </div>
        </div>
      </div>

      {expandido && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <Info label="Custo Médio" value={`R$ ${p.custoMedio.toFixed(2)}/${p.unidade}`} />
            <Info label="Última Compra" value={`R$ ${p.ultimaCompra?.toFixed(2) || '—'}/${p.unidade}`} />
            <Info label="Mínimo" value={`${p.minimo} ${p.unidade}`} />
            <Info label="Valor Total" value={`R$ ${(p.quantidade * p.custoMedio).toFixed(2)}`} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={onEntrada} style={{
              padding: '12px', borderRadius: 10, background: 'rgba(74,222,128,0.12)',
              color: 'var(--green)', border: '1px solid rgba(74,222,128,0.3)',
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--display)',
            }}>↑ Entrada</button>
            <button onClick={onSaida} style={{
              padding: '12px', borderRadius: 10, background: 'rgba(251,191,36,0.1)',
              color: 'var(--amber)', border: '1px solid rgba(251,191,36,0.3)',
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--display)',
            }}>↓ Saída</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={onEditar} style={{
              flex: 1, padding: '10px', borderRadius: 10, background: 'transparent',
              color: 'var(--text3)', border: '1px solid var(--border)',
              fontSize: 13, fontFamily: 'var(--display)',
            }}>Editar</button>
            <button onClick={onExcluir} style={{
              padding: '10px 16px', borderRadius: 10, background: 'transparent',
              color: 'var(--red)', border: '1px solid rgba(248,113,113,0.3)',
              fontSize: 13, fontFamily: 'var(--display)',
            }}>Excluir</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1, marginBottom: 2 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</div>
    </div>
  );
}

function EditModal({ produto, categorias, onSalvar, onFechar }) {
  const [form, setForm] = useState({
    nome: produto.nome,
    categoria: produto.categoria,
    unidade: produto.unidade,
    minimo: produto.minimo,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--overlay-bg)',
      display: 'flex', alignItems: 'flex-end', zIndex: 200,
    }} onClick={onFechar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
        padding: '24px 20px 40px', width: '100%', maxWidth: 480, margin: '0 auto',
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 2, marginBottom: 16 }}>EDITAR PRODUTO</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Campo label="Nome" value={form.nome} onChange={v => set('nome', v)} />
          <div>
            <label style={labelStyle}>CATEGORIA</label>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value)} style={inputStyle}>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>UNIDADE</label>
              <select value={form.unidade} onChange={e => set('unidade', e.target.value)} style={inputStyle}>
                {['kg', 'un', 'cx', 'lt', 'g', 'ml'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <Campo label="Mínimo" value={form.minimo} onChange={v => set('minimo', Number(v))} type="number" />
          </div>
          <button onClick={() => onSalvar(form)} style={{
            background: 'var(--green)', color: '#000', padding: '14px', borderRadius: 12,
            fontWeight: 700, fontSize: 16, fontFamily: 'var(--display)', marginTop: 8,
          }}>Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 15 };

function Campo({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={labelStyle}>{label.toUpperCase()}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

function FichaModal({ produtos, selecionados, onToggle, onTodos, onNenhum, onImprimir, onFechar }) {
  const qtdSelecionados = Object.values(selecionados).filter(Boolean).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--overlay-bg)',
      display: 'flex', alignItems: 'flex-end', zIndex: 200,
    }} onClick={onFechar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
        padding: '20px 20px 32px', width: '100%', maxWidth: 480, margin: '0 auto',
        border: '1px solid var(--border)',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 2, marginBottom: 4 }}>
          FICHA DE CONTROLE MANUAL
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Selecione os produtos
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
          Uma ficha por produto para fixar no container
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={onTodos} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 11,
            background: 'var(--card)', color: 'var(--text2)',
            border: '1px solid var(--border)', fontFamily: 'var(--display)',
          }}>Selecionar Todos</button>
          <button onClick={onNenhum} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 11,
            background: 'var(--card)', color: 'var(--text3)',
            border: '1px solid var(--border)', fontFamily: 'var(--display)',
          }}>Limpar</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
          {produtos.map(p => (
            <div
              key={p.id}
              onClick={() => onToggle(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: selecionados[p.id] ? 'rgba(74,222,128,0.08)' : 'transparent',
                border: `1px solid ${selecionados[p.id] ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                border: `2px solid ${selecionados[p.id] ? 'var(--green)' : 'var(--border2)'}`,
                background: selecionados[p.id] ? 'var(--green)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
                transition: 'all 0.15s',
              }}>
                {selecionados[p.id] ? '✓' : ''}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.nome}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
                  {p.categoria} · {p.quantidade} {p.unidade}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onImprimir}
          disabled={qtdSelecionados === 0}
          style={{
            width: '100%', padding: '14px',
            background: qtdSelecionados > 0 ? 'var(--green)' : 'var(--bg3)',
            color: qtdSelecionados > 0 ? '#000' : 'var(--text3)',
            borderRadius: 12, fontWeight: 700, fontSize: 15,
            fontFamily: 'var(--display)', transition: 'all 0.2s',
          }}
        >
          {qtdSelecionados > 0
            ? `⎙ Imprimir ${qtdSelecionados} ficha${qtdSelecionados > 1 ? 's' : ''}`
            : 'Selecione ao menos um produto'}
        </button>
      </div>
    </div>
  );
}
