export const storageGet = (key) => {
  try {
    const v = localStorage.getItem('giroestoque_' + key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};

export const storageSet = (key, value) => {
  try {
    localStorage.setItem('giroestoque_' + key, JSON.stringify(value));
  } catch {}
};

export const formatMoeda = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export const formatData = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const CATEGORIAS_PADRAO = ['Proteínas', 'Hortifrúti', 'Bebidas', 'Secos', 'Laticínios', 'Limpeza', 'Outros'];

export const exportarExcel = (produtos, movimentos) => {
  const BOM = '\uFEFF';
  const sep = ';';

  // Aba 1: Produtos
  let csv = 'CONTROLE DE ESTOQUE - GIRO ESTOQUE\n';
  csv += `Data da exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
  csv += ['Produto', 'Categoria', 'Unidade', 'Quantidade', 'Mínimo', 'Status', 'Custo Médio (R$)', 'Última Compra (R$)', 'Valor Total (R$)'].join(sep) + '\n';

  produtos.forEach(p => {
    const status = p.quantidade === 0 ? 'ZERADO' : p.quantidade <= p.minimo ? 'CRÍTICO' : 'OK';
    const valorTotal = (p.quantidade * p.custoMedio).toFixed(2).replace('.', ',');
    csv += [
      p.nome,
      p.categoria,
      p.unidade,
      String(p.quantidade).replace('.', ','),
      String(p.minimo).replace('.', ','),
      status,
      p.custoMedio.toFixed(2).replace('.', ','),
      (p.ultimaCompra || 0).toFixed(2).replace('.', ','),
      valorTotal,
    ].join(sep) + '\n';
  });

  const totalEstoque = produtos.reduce((s, p) => s + p.quantidade * p.custoMedio, 0);
  csv += `\n${sep}${sep}${sep}${sep}${sep}${sep}${sep}TOTAL${sep}${totalEstoque.toFixed(2).replace('.', ',')}\n`;

  // Aba 2: Movimentações
  csv += '\n\nMOVIMENTAÇÕES\n';
  csv += ['Data', 'Produto', 'Tipo', 'Quantidade', 'Custo Unit. (R$)', 'Custo Total (R$)', 'Observação'].join(sep) + '\n';

  const movOrdenados = [...movimentos].sort((a, b) => new Date(b.data) - new Date(a.data));
  movOrdenados.forEach(m => {
    const p = produtos.find(x => x.id === m.produtoId);
    const d = new Date(m.data);
    csv += [
      d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      p ? p.nome : 'Produto removido',
      m.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA',
      String(m.quantidade).replace('.', ','),
      m.custo.toFixed(2).replace('.', ','),
      (m.quantidade * m.custo).toFixed(2).replace('.', ','),
      m.obs || '',
    ].join(sep) + '\n';
  });

  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `estoque_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const imprimirFichaControle = (produtos) => {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const horarios = [
    '06:00','07:00','08:00','09:00','10:00','11:00',
    '12:00','13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00','22:00','23:00',
  ];

  const fichas = produtos.map(p => {
    const linhas = horarios.map(h => `
      <tr>
        <td class="hora">${h}</td>
        <td class="ck"><div class="box"></div></td>
        <td class="ck"><div class="box"></div></td>
        <td class="ck"><div class="box"></div></td>
        <td class="ck sep"><div class="box"></div></td>
        <td class="ck"><div class="box"></div></td>
        <td class="ck sep"><div class="box"></div></td>
        <td class="ck"><div class="box"></div></td>
        <td class="total-cel"></td>
        <td class="obs-cel"></td>
      </tr>
    `).join('');

    return `
      <div class="ficha">
        <div class="header">
          <div class="header-top">
            <div>
              <div class="titulo">${p.nome}</div>
              <div class="sub">${p.categoria} · ${p.unidade}</div>
            </div>
            <div class="header-right">
              <div class="campo-inline"><span>Data:</span> ${hoje}</div>
              <div class="campo-inline"><span>Estoque Inicial:</span> <b>${p.quantidade} ${p.unidade}</b></div>
            </div>
          </div>
          <div class="instrucoes">
            Marque um X na coluna correspondente a cada retirada. No final do turno, some os valores de cada linha e preencha o total.
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="hora-th" rowspan="2">Horário</th>
              <th colspan="3" class="grupo">×1</th>
              <th colspan="1" class="grupo">×3</th>
              <th colspan="1" class="grupo">×5</th>
              <th colspan="1" class="grupo">×10</th>
              <th class="total-th" rowspan="2">Total</th>
              <th class="obs-th" rowspan="2">Obs</th>
            </tr>
            <tr>
              <th class="sub-th">1</th>
              <th class="sub-th">1</th>
              <th class="sub-th">1</th>
              <th class="sub-th">3</th>
              <th class="sub-th">5</th>
              <th class="sub-th">10</th>
            </tr>
          </thead>
          <tbody>
            ${linhas}
          </tbody>
          <tfoot>
            <tr class="foot-row">
              <td class="hora"><b>SUBTOTAL</b></td>
              <td class="ck" colspan="3"></td>
              <td class="ck"></td>
              <td class="ck"></td>
              <td class="ck"></td>
              <td class="total-cel"></td>
              <td class="obs-cel"></td>
            </tr>
          </tfoot>
        </table>

        <div class="rodape">
          <div class="rodape-grid">
            <div class="campo">Estoque Inicial: <span class="linha-campo">${p.quantidade} ${p.unidade}</span></div>
            <div class="campo">Total Saídas: <span class="linha-campo"></span></div>
            <div class="campo">Estoque Final (contado): <span class="linha-campo"></span></div>
            <div class="campo">Diferença: <span class="linha-campo"></span></div>
          </div>
          <div class="assinatura-grid">
            <div class="campo">Responsável: <span class="linha-assinatura"></span></div>
            <div class="campo">Conferido por: <span class="linha-assinatura"></span></div>
          </div>
        </div>

        <div class="marca">GiroEstoque · Ficha de Controle Manual</div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Fichas de Controle - GiroEstoque</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      color: #111;
      background: #fff;
    }
    .ficha {
      page-break-after: always;
      padding: 4mm;
    }
    .ficha:last-child { page-break-after: avoid; }
    .header { margin-bottom: 3mm; }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111;
      padding-bottom: 2mm;
      margin-bottom: 2mm;
    }
    .titulo {
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sub {
      font-size: 12px;
      color: #555;
      margin-top: 1px;
    }
    .header-right { text-align: right; }
    .campo-inline {
      font-size: 11px;
      margin-bottom: 2px;
    }
    .campo-inline span {
      color: #666;
    }
    .instrucoes {
      font-size: 9px;
      color: #777;
      font-style: italic;
      border: 1px dashed #ccc;
      padding: 2mm;
      border-radius: 3px;
      margin-bottom: 2mm;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 3mm;
    }
    th, td {
      border: 1px solid #333;
      text-align: center;
      padding: 1px;
    }
    .hora-th { width: 52px; background: #222; color: #fff; font-size: 9px; }
    .grupo {
      background: #222;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 2px 0;
    }
    .sub-th {
      background: #e8e8e8;
      font-size: 9px;
      font-weight: 600;
      color: #444;
      padding: 1px;
    }
    .hora {
      font-size: 10px;
      font-weight: 600;
      background: #f5f5f5;
      width: 52px;
      padding: 0 4px;
    }
    .ck {
      width: 36px;
      padding: 1px;
    }
    .ck.sep {
      border-left: 2px solid #222;
    }
    .box {
      width: 18px;
      height: 18px;
      border: 1.5px solid #888;
      border-radius: 2px;
      margin: 0 auto;
    }
    .total-th {
      width: 50px;
      background: #222;
      color: #fff;
      font-size: 9px;
    }
    .obs-th {
      width: 80px;
      background: #222;
      color: #fff;
      font-size: 9px;
    }
    .total-cel {
      width: 50px;
      background: #fafafa;
    }
    .obs-cel {
      width: 80px;
    }
    .foot-row td {
      background: #e8e8e8;
      height: 22px;
      font-size: 10px;
    }

    .rodape {
      border: 1.5px solid #333;
      border-radius: 4px;
      padding: 3mm;
      margin-bottom: 2mm;
    }
    .rodape-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3mm;
      margin-bottom: 3mm;
    }
    .campo {
      font-size: 10px;
      font-weight: 600;
    }
    .linha-campo {
      display: inline-block;
      min-width: 60px;
      border-bottom: 1px solid #333;
      font-weight: 700;
      padding: 0 4px;
    }
    .assinatura-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3mm;
      padding-top: 2mm;
      border-top: 1px dashed #ccc;
    }
    .linha-assinatura {
      display: inline-block;
      min-width: 120px;
      border-bottom: 1px solid #333;
    }

    .marca {
      text-align: center;
      font-size: 8px;
      color: #aaa;
      margin-top: 2mm;
      letter-spacing: 2px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>${fichas}</body>
</html>`;

  const janela = window.open('', '_blank');
  janela.document.write(html);
  janela.document.close();
  janela.onload = () => janela.print();
};

export const COR_CATEGORIA = {
  'Proteínas': '#f87171',
  'Hortifrúti': '#4ade80',
  'Bebidas': '#60a5fa',
  'Secos': '#fbbf24',
  'Laticínios': '#e879f9',
  'Limpeza': '#34d399',
  'Outros': '#94a3b8',
};
