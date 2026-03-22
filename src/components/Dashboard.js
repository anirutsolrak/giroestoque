import React, { useMemo } from 'react';
import { formatMoeda, COR_CATEGORIA } from '../utils/storage';

export default function Dashboard({ produtos, movimentos, alertas, onNavegar }) {
  const valorTotal = useMemo(() =>
    produtos.reduce((acc, p) => acc + p.quantidade * p.custoMedio, 0), [produtos]);

  const movimentosHoje = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return movimentos.filter(m => new Date(m.data) >= hoje);
  }, [movimentos]);

  const entradasHoje = movimentosHoje.filter(m => m.tipo === 'entrada').length;
  const saidasHoje = movimentosHoje.filter(m => m.tipo === 'saida').length;

  const porCategoria = useMemo(() => {
    const map = {};
    produtos.forEach(p => {
      if (!map[p.categoria]) map[p.categoria] = 0;
      map[p.categoria] += p.quantidade * p.custoMedio;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [produtos]);

  const ultimosMovimentos = useMemo(() =>
    [...movimentos].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5),
    [movimentos]);

  const nomeProduto = (id) => produtos.find(p => p.id === id)?.nome || '—';

  return (
    <div className="fade-in" style={{ padding: '0 0 16px' }}>
      {/* Header */}
      <div style={{
        padding: '48px 20px 24px',
        background: 'var(--header-gradient)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180,
          background: 'radial-gradient(circle, var(--glow-green) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 3, marginBottom: 4 }}>
          GIROESTOQUE
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
          Visão Geral
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Alertas */}
        {alertas.length > 0 && (
          <div onClick={() => onNavegar('inventario')} style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            animation: 'pulse-green 2s infinite',
          }}>
            <span style={{ fontSize: 22 }}>⚠</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>
                {alertas.length} item{alertas.length > 1 ? 's' : ''} em estoque crítico
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                {alertas.slice(0, 2).map(a => a.nome).join(', ')}{alertas.length > 2 ? '...' : ''}
              </div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--red)', fontSize: 18 }}>›</span>
          </div>
        )}

        {/* Cards principais */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <Card
            label="VALOR EM ESTOQUE"
            value={formatMoeda(valorTotal)}
            icon="◈"
            color="var(--green)"
          />
          <Card
            label="TOTAL DE ITENS"
            value={produtos.length}
            icon="▦"
            color="var(--blue)"
          />
          <Card
            label="ENTRADAS HOJE"
            value={entradasHoje}
            icon="↑"
            color="var(--green)"
          />
          <Card
            label="SAÍDAS HOJE"
            value={saidasHoje}
            icon="↓"
            color="var(--amber)"
          />
        </div>

        {/* Ações rápidas */}
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Ações Rápidas</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <AcaoBtn icon="↑" label="Registrar Entrada" color="var(--green)" onClick={() => onNavegar('inventario')} />
            <AcaoBtn icon="↓" label="Registrar Saída" color="var(--amber)" onClick={() => onNavegar('inventario')} />
            <AcaoBtn icon="◎" label="Contagem Rápida" color="var(--blue)" onClick={() => onNavegar('contagem')} />
            <AcaoBtn icon="◈" label="Ver Relatórios" color="var(--purple)" onClick={() => onNavegar('relatorios')} />
          </div>
        </div>

        {/* Por categoria */}
        {porCategoria.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionTitle>Valor por Categoria</SectionTitle>
            <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {porCategoria.map(([cat, val], i) => {
                const pct = (val / valorTotal) * 100;
                return (
                  <div key={cat} style={{
                    padding: '12px 16px',
                    borderBottom: i < porCategoria.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COR_CATEGORIA[cat] || '#aaa' }} />
                        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{cat}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>{formatMoeda(val)}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: COR_CATEGORIA[cat] || '#aaa', borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Últimos movimentos */}
        {ultimosMovimentos.length > 0 && (
          <div>
            <SectionTitle>Últimas Movimentações</SectionTitle>
            <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {ultimosMovimentos.map((m, i) => (
                <div key={m.id} style={{
                  padding: '12px 16px',
                  borderBottom: i < ultimosMovimentos.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: m.tipo === 'entrada' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                    color: m.tipo === 'entrada' ? '#4ade80' : '#fbbf24',
                    fontSize: 16, fontWeight: 700,
                  }}>
                    {m.tipo === 'entrada' ? '↑' : '↓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {nomeProduto(m.produtoId)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                      {m.quantidade} un · {new Date(m.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: m.tipo === 'entrada' ? '#4ade80' : '#fbbf24', textAlign: 'right' }}>
                    {m.tipo === 'entrada' ? '+' : '-'}{formatMoeda(m.custo * m.quantidade)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 14px 12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5 }}>{label}</span>
        <span style={{ color, fontSize: 16 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 10 }}>
      {children.toUpperCase()}
    </div>
  );
}

function AcaoBtn({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      color: 'var(--text)', textAlign: 'left',
      transition: 'border-color 0.2s, background 0.2s',
    }}
      onTouchStart={e => e.currentTarget.style.background = 'var(--bg3)'}
      onTouchEnd={e => e.currentTarget.style.background = 'var(--card)'}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: `${color}18`,
        color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}
