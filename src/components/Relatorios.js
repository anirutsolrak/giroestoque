import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMoeda, COR_CATEGORIA, exportarExcel } from '../utils/storage';

export default function Relatorios({ produtos, movimentos }) {
  const [periodo, setPeriodo] = useState(15);

  const corte = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - periodo);
    return d;
  }, [periodo]);

  const movPeriodo = useMemo(() =>
    movimentos.filter(m => new Date(m.data) >= corte), [movimentos, corte]);

  const saidasPorProd = useMemo(() => {
    const map = {};
    movPeriodo.filter(m => m.tipo === 'saida').forEach(m => {
      const p = produtos.find(x => x.id === m.produtoId);
      if (!p) return;
      if (!map[p.nome]) map[p.nome] = { nome: p.nome, qtd: 0, custo: 0 };
      map[p.nome].qtd += m.quantidade;
      map[p.nome].custo += m.quantidade * m.custo;
    });
    return Object.values(map).sort((a, b) => b.custo - a.custo).slice(0, 6);
  }, [movPeriodo, produtos]);

  const entradasPorProd = useMemo(() => {
    const map = {};
    movPeriodo.filter(m => m.tipo === 'entrada').forEach(m => {
      const p = produtos.find(x => x.id === m.produtoId);
      if (!p) return;
      if (!map[p.nome]) map[p.nome] = { nome: p.nome, qtd: 0, custo: 0 };
      map[p.nome].qtd += m.quantidade;
      map[p.nome].custo += m.quantidade * m.custo;
    });
    return Object.values(map).sort((a, b) => b.custo - a.custo).slice(0, 6);
  }, [movPeriodo, produtos]);

  const porCategoria = useMemo(() => {
    const map = {};
    produtos.forEach(p => {
      if (!map[p.categoria]) map[p.categoria] = 0;
      map[p.categoria] += p.quantidade * p.custoMedio;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(x => x.value > 0);
  }, [produtos]);

  const totalEstoque = porCategoria.reduce((a, b) => a + b.value, 0);
  const totalSaidas = saidasPorProd.reduce((a, b) => a + b.custo, 0);
  const totalEntradas = entradasPorProd.reduce((a, b) => a + b.custo, 0);

  const estoqueInicial = totalEstoque + totalSaidas - totalEntradas;
  const consumoReal = estoqueInicial + totalEntradas - totalEstoque;
  const diff = totalEntradas - consumoReal;

  return (
    <div className="fade-in">
      <div style={{ padding: '48px 20px 16px', background: 'var(--header-gradient)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 3, marginBottom: 4 }}>RELATÓRIOS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Análise</div>
          <button onClick={() => exportarExcel(produtos, movimentos)} style={{
            background: 'transparent', border: '1px solid #4ade80',
            borderRadius: 10, padding: '8px 14px',
            color: 'var(--green)', fontWeight: 700,
            fontFamily: 'var(--display)', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 14 }}>↓</span> Baixar Excel
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        {/* Período */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[7, 15, 30].map(d => (
            <button key={d} onClick={() => setPeriodo(d)} style={{
              padding: '6px 16px', borderRadius: 20, flexShrink: 0,
              background: periodo === d ? 'var(--green)' : 'var(--card)',
              color: periodo === d ? '#000' : 'var(--text3)',
              border: periodo === d ? 'none' : '1px solid var(--border)',
              fontWeight: periodo === d ? 700 : 400,
              fontSize: 13, fontFamily: 'var(--display)',
            }}>{d} dias</button>
          ))}
        </div>

        {/* KPIs do período */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <KPICard label="Compras no Período" value={formatMoeda(totalEntradas)} cor="#4ade80" />
          <KPICard label="Consumo no Período" value={formatMoeda(consumoReal > 0 ? consumoReal : 0)} cor="var(--amber)" />
          <KPICard label="Valor em Estoque" value={formatMoeda(totalEstoque)} cor="var(--blue)" />
          <KPICard label={diff > 0 ? 'Parado no Estoque' : 'Saldo do Período'} value={formatMoeda(Math.abs(diff))} cor={diff > 0 ? 'var(--red)' : 'var(--green)'} />
        </div>

        {/* Equação de consumo */}
        {consumoReal > 0 && (
          <div style={{
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
            borderRadius: 12, padding: 16, marginBottom: 20,
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 10 }}>
              EQUAÇÃO DE CONSUMO
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)', lineHeight: 2 }}>
              Est. Inicial {formatMoeda(estoqueInicial > 0 ? estoqueInicial : 0)}<br />
              + Compras {formatMoeda(totalEntradas)}<br />
              − Est. Final {formatMoeda(totalEstoque)}<br />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>= Consumo Real {formatMoeda(consumoReal > 0 ? consumoReal : 0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico pizza categorias */}
        {porCategoria.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionTitle>Estoque por Categoria</SectionTitle>
            <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', padding: '16px 0 8px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={porCategoria} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {porCategoria.map((entry) => (
                      <Cell key={entry.name} fill={COR_CATEGORIA[entry.name] || '#aaa'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoeda(v)} contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: 8, color: 'var(--tooltip-text)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                {porCategoria.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COR_CATEGORIA[c.name] || '#aaa' }} />
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                      {c.name} {((c.value / totalEstoque) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top consumo */}
        {saidasPorProd.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionTitle>Maior Consumo ({periodo}d)</SectionTitle>
            <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', padding: '16px 8px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={saidasPorProd} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} />
                  <YAxis type="category" dataKey="nome" width={90} tick={{ fill: 'var(--text2)', fontSize: 10, fontFamily: 'var(--display)' }} />
                  <Tooltip formatter={(v) => formatMoeda(v)} contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: 8, color: 'var(--tooltip-text)' }} />
                  <Bar dataKey="custo" fill="var(--amber)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top entradas */}
        {entradasPorProd.length > 0 && (
          <div>
            <SectionTitle>Maiores Compras ({periodo}d)</SectionTitle>
            <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {entradasPorProd.map((item, i) => (
                <div key={item.nome} style={{
                  padding: '12px 16px',
                  borderBottom: i < entradasPorProd.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{item.nome}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{item.qtd.toFixed(1)} unid.</div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--green)' }}>{formatMoeda(item.custo)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {movimentos.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            Nenhuma movimentação no período
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ label, value, cor }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 14px 12px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 8 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 500, color: cor }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}
