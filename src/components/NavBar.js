import React from 'react';

const TABS = [
  { id: 'dashboard', label: 'Início', icon: '⬡' },
  { id: 'inventario', label: 'Estoque', icon: '▦' },
  { id: 'contagem', label: 'Contagem', icon: '◎' },
  { id: 'relatorios', label: 'Relatórios', icon: '◈' },
];

export default function NavBar({ tela, onNavegar, alertas, tema, onTema }) {
  const telaNormal = ['dashboard', 'inventario', 'relatorios', 'contagem'].includes(tela) ? tela : null;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--nav-border)',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(tab => {
        const ativo = telaNormal === tab.id;
        const badge = tab.id === 'dashboard' && alertas > 0;
        return (
          <button
            key={tab.id}
            onClick={() => onNavegar(tab.id)}
            style={{
              flex: 1, padding: '12px 0 10px',
              background: 'transparent',
              color: ativo ? 'var(--green)' : 'var(--text3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: ativo ? 700 : 400, fontFamily: 'var(--mono)', letterSpacing: 1 }}>
              {tab.label.toUpperCase()}
            </span>
            {badge && (
              <span style={{
                position: 'absolute', top: 8, right: '50%', transform: 'translateX(10px)',
                background: 'var(--red)', color: '#fff', borderRadius: '50%',
                width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--mono)', fontWeight: 700,
              }}>{alertas}</span>
            )}
            {ativo && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 2, background: 'var(--green)', borderRadius: '0 0 2px 2px',
              }} />
            )}
          </button>
        );
      })}
      {/* Theme toggle */}
      <button
        onClick={onTema}
        style={{
          width: 44, padding: '12px 0 10px',
          background: 'transparent',
          color: 'var(--text3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          transition: 'color 0.2s',
          flexShrink: 0,
        }}
        title={tema === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{tema === 'dark' ? '☀' : '☾'}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: 1 }}>
          {tema === 'dark' ? 'CLARO' : 'ESCURO'}
        </span>
      </button>
    </nav>
  );
}
