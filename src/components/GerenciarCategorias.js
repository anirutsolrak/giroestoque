import React, { useState } from 'react';

export default function GerenciarCategorias({ categorias, produtos, onAdicionar, onEditar, onExcluir, produtosPorCategoria, onVoltar }) {
  const [nova, setNova] = useState('');
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [moverPara, setMoverPara] = useState('');
  const [erro, setErro] = useState('');

  const handleAdicionar = () => {
    const nome = nova.trim();
    if (!nome) return;
    if (categorias.includes(nome)) {
      setErro('Essa categoria já existe');
      return;
    }
    onAdicionar(nome);
    setNova('');
    setErro('');
  };

  const handleEditar = (cat) => {
    setEditando(cat);
    setNomeEditado(cat);
    setErro('');
  };

  const handleSalvarEdicao = () => {
    const nome = nomeEditado.trim();
    if (!nome) return;
    if (nome !== editando && categorias.includes(nome)) {
      setErro('Essa categoria já existe');
      return;
    }
    onEditar(editando, nome);
    setEditando(null);
    setErro('');
  };

  const handleExcluir = (cat) => {
    const itens = produtosPorCategoria(cat);
    if (itens.length > 0) {
      setExcluindo(cat);
      const outras = categorias.filter(c => c !== cat);
      setMoverPara(outras[0] || '');
    } else {
      onExcluir(cat);
    }
  };

  const handleConfirmarExclusao = () => {
    if (!moverPara) return;
    onExcluir(excluindo, moverPara);
    setExcluindo(null);
    setMoverPara('');
  };

  return (
    <div className="fade-in">
      <div style={{ padding: '48px 20px 16px', background: 'var(--header-gradient)' }}>
        <button onClick={onVoltar} style={{ background: 'none', color: 'var(--text3)', fontSize: 24, marginBottom: 8 }}>‹</button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 3, marginBottom: 4 }}>CONFIGURAÇÕES</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Categorias</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
          {categorias.length} categoria{categorias.length !== 1 ? 's' : ''} cadastrada{categorias.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ padding: '16px 16px 20px' }}>
        {/* Adicionar nova */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 20,
        }}>
          <input
            value={nova}
            onChange={e => { setNova(e.target.value); setErro(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAdicionar()}
            placeholder="Nova categoria..."
            style={{
              flex: 1, padding: '12px 14px',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text)', fontSize: 14,
              fontFamily: 'var(--display)',
            }}
          />
          <button onClick={handleAdicionar} style={{
            background: 'var(--green)', color: '#000', border: 'none',
            borderRadius: 10, padding: '12px 18px', fontWeight: 700,
            fontFamily: 'var(--display)', fontSize: 14, flexShrink: 0,
          }}>+</button>
        </div>

        {erro && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8, padding: '8px 12px', marginBottom: 12,
            fontSize: 12, color: 'var(--red)', fontFamily: 'var(--mono)',
          }}>{erro}</div>
        )}

        {/* Lista de categorias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categorias.map(cat => {
            const qtdItens = produtosPorCategoria(cat).length;
            const isEditando = editando === cat;

            return (
              <div key={cat} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px',
                transition: 'all 0.15s',
              }}>
                {isEditando ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      value={nomeEditado}
                      onChange={e => { setNomeEditado(e.target.value); setErro(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleSalvarEdicao()}
                      autoFocus
                      style={{
                        flex: 1, padding: '8px 12px',
                        background: 'var(--bg3)', border: '1px solid var(--green)',
                        borderRadius: 8, color: 'var(--text)', fontSize: 14,
                        fontFamily: 'var(--display)',
                      }}
                    />
                    <button onClick={handleSalvarEdicao} style={{
                      background: 'var(--green)', color: '#000', border: 'none',
                      borderRadius: 8, padding: '8px 14px', fontWeight: 700,
                      fontFamily: 'var(--display)', fontSize: 12,
                    }}>Salvar</button>
                    <button onClick={() => { setEditando(null); setErro(''); }} style={{
                      background: 'transparent', color: 'var(--text3)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 12,
                      fontFamily: 'var(--display)',
                    }}>X</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{cat}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                        {qtdItens} {qtdItens === 1 ? 'produto' : 'produtos'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => handleEditar(cat)} style={{
                        background: 'transparent', color: 'var(--text3)',
                        border: '1px solid var(--border)', borderRadius: 8,
                        padding: '6px 12px', fontSize: 12, fontFamily: 'var(--display)',
                      }}>Editar</button>
                      <button onClick={() => handleExcluir(cat)} style={{
                        background: 'transparent', color: 'var(--red)',
                        border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8,
                        padding: '6px 12px', fontSize: 12, fontFamily: 'var(--display)',
                      }}>Excluir</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {categorias.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            Nenhuma categoria cadastrada
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão com itens */}
      {excluindo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--overlay-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          padding: 20,
        }} onClick={() => setExcluindo(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg2)', borderRadius: 16,
            padding: '24px 20px', width: '100%', maxWidth: 400,
            border: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: 28, textAlign: 'center', marginBottom: 12,
            }}>⚠</div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)',
              letterSpacing: 2, marginBottom: 8, textAlign: 'center',
            }}>ATENÇÃO</div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 6,
            }}>
              A categoria "{excluindo}" possui produtos
            </div>
            <div style={{
              fontSize: 13, color: 'var(--text2)', textAlign: 'center', marginBottom: 16,
            }}>
              {produtosPorCategoria(excluindo).length} produto{produtosPorCategoria(excluindo).length > 1 ? 's' : ''} precisa{produtosPorCategoria(excluindo).length > 1 ? 'm' : ''} ser movido{produtosPorCategoria(excluindo).length > 1 ? 's' : ''} para outra categoria antes de excluir.
            </div>

            {/* Lista dos produtos afetados */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              maxHeight: 120, overflowY: 'auto',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 6 }}>
                PRODUTOS AFETADOS
              </div>
              {produtosPorCategoria(excluindo).map(p => (
                <div key={p.id} style={{
                  fontSize: 12, color: 'var(--text2)', padding: '3px 0',
                  fontFamily: 'var(--mono)',
                }}>
                  • {p.nome} ({p.quantidade} {p.unidade})
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)',
                letterSpacing: 1.5, display: 'block', marginBottom: 6,
              }}>MOVER PARA</label>
              <select
                value={moverPara}
                onChange={e => setMoverPara(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 10, color: 'var(--text)', fontSize: 14,
                  fontFamily: 'var(--display)',
                }}
              >
                {categorias.filter(c => c !== excluindo).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setExcluindo(null)} style={{
                padding: '12px', borderRadius: 10, background: 'transparent',
                color: 'var(--text3)', border: '1px solid var(--border)',
                fontWeight: 600, fontSize: 14, fontFamily: 'var(--display)',
              }}>Cancelar</button>
              <button onClick={handleConfirmarExclusao} style={{
                padding: '12px', borderRadius: 10,
                background: 'var(--red)', color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--display)',
              }}>Mover e Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
