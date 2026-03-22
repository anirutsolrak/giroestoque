import React, { useState } from 'react';

const labelStyle = { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '13px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 15 };

export default function NovoProduto({ categorias, onSalvar, onVoltar }) {
  const [form, setForm] = useState({
    nome: '',
    categoria: categorias[0] || '',
    unidade: 'kg',
    minimo: 5,
    ultimaCompra: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valido = form.nome.trim() && form.ultimaCompra > 0;

  return (
    <div className="fade-in">
      <div style={{ padding: '48px 20px 20px', background: 'var(--header-gradient)' }}>
        <button onClick={onVoltar} style={{ background: 'none', color: 'var(--text3)', fontSize: 24, marginBottom: 8 }}>‹</button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 3, marginBottom: 4 }}>CADASTRO</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Novo Produto</div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>NOME DO PRODUTO *</label>
            <input
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Filé Mignon"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>CATEGORIA *</label>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value)} style={inputStyle}>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>UNIDADE</label>
              <select value={form.unidade} onChange={e => set('unidade', e.target.value)} style={inputStyle}>
                {['kg', 'un', 'cx', 'lt', 'g', 'ml', 'pct'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>QTDE MÍNIMA</label>
              <input type="number" min="0" value={form.minimo} onChange={e => set('minimo', Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>CUSTO UNITÁRIO (R$) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.ultimaCompra}
              onChange={e => set('ultimaCompra', Number(e.target.value))}
              placeholder="0,00"
              style={{ ...inputStyle, fontFamily: 'var(--mono)', fontSize: 20 }}
            />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
              Será o custo médio inicial do produto
            </div>
          </div>

          <div style={{
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>RESUMO</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              <b style={{ color: 'var(--text)' }}>{form.nome || '—'}</b> · {form.categoria} · {form.unidade}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', marginTop: 4 }}>
              Custo inicial: R$ {Number(form.ultimaCompra || 0).toFixed(2)} / {form.unidade || 'un'}
            </div>
          </div>

          <button
            onClick={() => valido && onSalvar(form)}
            disabled={!valido}
            style={{
              background: valido ? 'var(--green)' : 'var(--bg3)',
              color: valido ? '#000' : 'var(--text3)',
              padding: '16px', borderRadius: 12,
              fontWeight: 700, fontSize: 16, fontFamily: 'var(--display)',
              transition: 'background 0.2s',
            }}
          >
            Cadastrar Produto
          </button>
        </div>
      </div>
    </div>
  );
}
