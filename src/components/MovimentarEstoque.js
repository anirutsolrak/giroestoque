import React, { useState } from 'react';
import { formatMoeda } from '../utils/storage';

export default function MovimentarEstoque({ produto, tipo: tipoInicial, onRegistrar, onVoltar }) {
  const [tipo, setTipo] = useState(tipoInicial || 'entrada');
  const [quantidade, setQuantidade] = useState('');
  const [custo, setCusto] = useState(produto ? produto.ultimaCompra?.toString() || '' : '');
  const [obs, setObs] = useState('');

  if (!produto) return null;

  const valido = quantidade > 0 && (tipo === 'saida' || custo > 0);

  const handleNum = (v) => {
    if (v === '⌫') {
      setQuantidade(prev => prev.slice(0, -1));
    } else if (v === '.') {
      if (!quantidade.includes('.')) setQuantidade(prev => prev + '.');
    } else {
      setQuantidade(prev => (prev + v).replace(/^0+(\d)/, '$1'));
    }
  };

  const totalCusto = (parseFloat(quantidade) || 0) * (parseFloat(custo) || 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ padding: '48px 20px 16px', background: 'var(--header-gradient)' }}>
        <button onClick={onVoltar} style={{ background: 'none', color: 'var(--text3)', fontSize: 24, marginBottom: 8 }}>‹</button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 3, marginBottom: 4 }}>MOVIMENTAÇÃO</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{produto.nome}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
          Em estoque: {produto.quantidade} {produto.unidade} · CM: {formatMoeda(produto.custoMedio)}
        </div>
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        {/* Toggle tipo */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 4, marginBottom: 20,
        }}>
          {['entrada', 'saida'].map(t => (
            <button key={t} onClick={() => setTipo(t)} style={{
              padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 15,
              fontFamily: 'var(--display)',
              background: tipo === t ? (t === 'entrada' ? 'var(--green)' : 'var(--amber)') : 'transparent',
              color: tipo === t ? '#000' : 'var(--text3)',
              transition: 'all 0.2s',
            }}>
              {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
            </button>
          ))}
        </div>

        {/* Display quantidade */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px 20px 16px', marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 8 }}>QUANTIDADE ({produto.unidade})</div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 52, fontWeight: 500,
            color: tipo === 'entrada' ? 'var(--green)' : 'var(--amber)',
            minHeight: 64, lineHeight: 1,
          }}>
            {quantidade || '0'}
          </div>
        </div>

        {/* Teclado numérico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(n => (
            <button key={n} onClick={() => handleNum(n)} style={{
              padding: '18px 0', borderRadius: 12, fontSize: 22, fontWeight: 600,
              fontFamily: 'var(--mono)',
              background: n === '⌫' ? 'rgba(248,113,113,0.1)' : 'var(--card)',
              color: n === '⌫' ? 'var(--red)' : 'var(--text)',
              border: '1px solid var(--border)',
              transition: 'background 0.1s',
            }}
              onTouchStart={e => e.currentTarget.style.background = 'var(--bg3)'}
              onTouchEnd={e => e.currentTarget.style.background = n === '⌫' ? 'rgba(248,113,113,0.1)' : 'var(--card)'}
            >{n}</button>
          ))}
        </div>

        {/* Custo (somente entrada) */}
        {tipo === 'entrada' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, display: 'block', marginBottom: 6 }}>
              CUSTO UNITÁRIO (R$) *
            </label>
            <input
              type="number" min="0" step="0.01"
              value={custo}
              onChange={e => setCusto(e.target.value)}
              placeholder="0,00"
              style={{
                width: '100%', padding: '13px 14px',
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text)', fontSize: 18,
                fontFamily: 'var(--mono)',
              }}
            />
            {totalCusto > 0 && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', marginTop: 6 }}>
                Total desta entrada: {formatMoeda(totalCusto)}
              </div>
            )}
          </div>
        )}

        {/* Observação */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, display: 'block', marginBottom: 6 }}>
            OBSERVAÇÃO (opcional)
          </label>
          <input
            value={obs}
            onChange={e => setObs(e.target.value)}
            placeholder="Ex: NF 001234, fornecedor..."
            style={{
              width: '100%', padding: '13px 14px',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text)', fontSize: 14,
            }}
          />
        </div>

        <button
          disabled={!valido}
          onClick={() => valido && onRegistrar({
            produtoId: produto.id,
            tipo,
            quantidade: parseFloat(quantidade),
            custo: tipo === 'entrada' ? parseFloat(custo) : produto.custoMedio,
            obs,
          })}
          style={{
            width: '100%', padding: '18px',
            background: valido ? (tipo === 'entrada' ? 'var(--green)' : 'var(--amber)') : 'var(--bg3)',
            color: valido ? '#000' : 'var(--text3)',
            borderRadius: 14, fontWeight: 800, fontSize: 17, fontFamily: 'var(--display)',
            transition: 'background 0.2s',
          }}
        >
          {tipo === 'entrada' ? '↑ Confirmar Entrada' : '↓ Confirmar Saída'}
        </button>
      </div>
    </div>
  );
}
