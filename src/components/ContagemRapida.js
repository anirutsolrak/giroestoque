import React, { useState } from 'react';

export default function ContagemRapida({ produtos, onAtualizar, onVoltar }) {
  const [contagens, setContagens] = useState({});
  const [salvo, setSalvo] = useState(false);
  const [busca, setBusca] = useState('');

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const set = (id, val) => setContagens(prev => ({ ...prev, [id]: val }));

  const handleSalvar = () => {
    Object.entries(contagens).forEach(([id, qtd]) => {
      if (qtd !== '' && qtd !== undefined) {
        onAtualizar(Number(id), { quantidade: Number(qtd) });
      }
    });
    setSalvo(true);
    setTimeout(() => { setSalvo(false); setContagens({}); }, 2000);
  };

  const modificados = Object.keys(contagens).filter(id => contagens[id] !== '').length;

  return (
    <div className="fade-in">
      <div style={{ padding: '48px 20px 16px', background: 'var(--header-gradient)' }}>
        <button onClick={onVoltar} style={{ background: 'none', color: 'var(--text3)', fontSize: 24, marginBottom: 8 }}>‹</button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 3, marginBottom: 4 }}>CONTAGEM</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Batida de Estoque</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
          Informe as quantidades reais encontradas
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>⌕</span>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Filtrar produto..."
            style={{
              width: '100%', padding: '12px 12px 12px 36px',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text)', fontSize: 15,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {filtrados.map(p => {
            const val = contagens[p.id];
            const alterado = val !== '' && val !== undefined && Number(val) !== p.quantidade;
            return (
              <div key={p.id} style={{
                background: 'var(--card)',
                border: `1px solid ${alterado ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`,
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Sistema: <span style={{ color: 'var(--text2)' }}>{p.quantidade} {p.unidade}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <input
                    type="number"
                    min="0"
                    value={val !== undefined ? val : ''}
                    onChange={e => set(p.id, e.target.value)}
                    placeholder={p.quantidade.toString()}
                    style={{
                      width: 80, padding: '8px 10px', textAlign: 'right',
                      background: 'var(--bg3)', border: `1px solid ${alterado ? 'rgba(74,222,128,0.5)' : 'var(--border)'}`,
                      borderRadius: 8, color: alterado ? 'var(--green)' : 'var(--text)',
                      fontSize: 16, fontFamily: 'var(--mono)',
                    }}
                  />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>{p.unidade}</span>
                </div>
              </div>
            );
          })}
        </div>

        {modificados > 0 && (
          <div style={{
            position: 'sticky', bottom: 80,
            background: 'var(--sticky-bg)', backdropFilter: 'blur(10px)',
            borderRadius: 14, padding: '14px 16px',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>
              {modificados} produto{modificados !== 1 ? 's' : ''} alterado{modificados !== 1 ? 's' : ''}
            </div>
            <button onClick={handleSalvar} style={{
              background: salvo ? 'var(--green-dim)' : 'var(--green)',
              color: '#000', padding: '10px 20px', borderRadius: 10,
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--display)',
            }}>
              {salvo ? '✓ Salvo!' : 'Salvar Contagem'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
