// Utilitário para exportação de relatórios em PDF
// Nota: usamos dynamic import para reduzir o peso do grafo de tipos no build.

export interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
}

async function loadPdfDeps() {
  const [html2canvasMod, jsPdfMod] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const html2canvas = (html2canvasMod as any).default ?? (html2canvasMod as any);
  const JsPDF = (jsPdfMod as any).default ?? (jsPdfMod as any);

  return { html2canvas, JsPDF } as { html2canvas: any; JsPDF: any };
}

// Estimar a altura do conteúdo para quebra de página inteligente
function estimateContentHeight(
  pdf: any,
  text: string,
  maxWidth: number,
  fontSize: number
): number {
  pdf.setFontSize(fontSize);
  const lines = pdf.splitTextToSize(text, maxWidth);
  // Cada linha tem aproximadamente fontSize * 0.35mm de altura
  return lines.length * fontSize * 0.4;
}

// Verificar se há espaço suficiente na página atual
function checkPageBreak(
  pdf: any,
  currentY: number,
  neededHeight: number,
  pageHeight: number,
  margin: number
): { y: number; pageAdded: boolean } {
  const availableSpace = pageHeight - margin - currentY;
  
  if (neededHeight > availableSpace) {
    pdf.addPage();
    return { y: margin + 10, pageAdded: true };
  }
  
  return { y: currentY, pageAdded: false };
}

// Exportar elemento DOM para PDF com quebra de página inteligente
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<void> {
  const { filename, title, subtitle, orientation = 'portrait' } = options;

  const { html2canvas, JsPDF } = await loadPdfDeps();

  // Capturar elemento como imagem
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Criar PDF
  const pdf = new JsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(0, 63, 92);
  pdf.text(title, margin, 20);

  if (subtitle) {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(subtitle, margin, 28);
  }

  // Data de geração
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth - margin - 60,
    20
  );

  // Calcular dimensões da imagem
  const contentWidth = pageWidth - (margin * 2);
  const contentStartY = subtitle ? 35 : 30;
  const availableHeight = pageHeight - contentStartY - margin;

  // Escalar a imagem para caber na largura
  const scale = contentWidth / imgWidth;
  const scaledHeight = imgHeight * scale;

  // Se a imagem é muito alta, dividir em páginas com quebra inteligente
  if (scaledHeight > availableHeight) {
    // Calcular quantos pixels correspondem a uma página
    const pixelsPerPage = (availableHeight / scale);
    const totalPages = Math.ceil(imgHeight / pixelsPerPage);
    
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const sourceY = pixelsPerPage * i;
      const sourceHeight = Math.min(pixelsPerPage, imgHeight - sourceY);
      const destHeight = sourceHeight * scale;
      
      // Criar canvas temporário para esta fatia
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgWidth;
      tempCanvas.height = sourceHeight;
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
        const img = new Image();
        img.src = imgData;
        await new Promise<void>(resolve => {
          img.onload = () => resolve();
        });
        
        ctx.drawImage(
          img, 
          0, sourceY, imgWidth, sourceHeight,
          0, 0, imgWidth, sourceHeight
        );
        
        const partData = tempCanvas.toDataURL('image/png');
        const yPosition = i === 0 ? contentStartY : margin;
        
        pdf.addImage(
          partData,
          'PNG',
          margin,
          yPosition,
          contentWidth,
          destHeight
        );
      }
    }
  } else {
    pdf.addImage(imgData, 'PNG', margin, contentStartY, contentWidth, scaledHeight);
  }

  // Footer em todas as páginas
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.text('Plenne - Seu parceiro financeiro', margin, pageHeight - 10);
  }

  pdf.save(`${filename}.pdf`);
}

// Interface para dados do relatório consolidado
interface ConsolidatedReportData {
  netWorth: number;
  currentBalance: number;
  totalInvested: number;
  totalGoalsCurrent: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  goals: Array<{ name: string; progress: number; current: number; target: number }>;
  investments: Array<{ name: string; type: string; amount: number; return: number | null }>;
  upcomingTransactions: number;
  projectedBalance: number;
}

// Gerar PDF de relatório consolidado com dados estruturados
export async function generateConsolidatedPDF(data: ConsolidatedReportData): Promise<void> {
  const { JsPDF } = await loadPdfDeps();

  const pdf = new JsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let y = 20;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Função auxiliar para verificar quebra de página
  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      pdf.addPage();
      y = margin + 10;
      return true;
    }
    return false;
  };

  // ========== HEADER ==========
  pdf.setFillColor(0, 63, 92);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.text('Relatório Financeiro Consolidado', margin, 22);
  
  pdf.setFontSize(10);
  pdf.text(`Plenne - Gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, 32);
  
  y = 55;

  // ========== PATRIMÔNIO ==========
  ensureSpace(50);
  pdf.setTextColor(0, 63, 92);
  pdf.setFontSize(14);
  pdf.text('Patrimônio Líquido', margin, y);
  y += 8;

  pdf.setFillColor(240, 248, 255);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 35, 3, 3, 'F');
  
  pdf.setFontSize(24);
  pdf.setTextColor(0, 63, 92);
  pdf.text(formatCurrency(data.netWorth), margin + 10, y + 20);

  // Breakdown
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  const breakdownY = y + 30;
  pdf.text(`Saldo: ${formatCurrency(data.currentBalance)}`, margin + 10, breakdownY);
  pdf.text(`Investimentos: ${formatCurrency(data.totalInvested)}`, margin + 60, breakdownY);
  pdf.text(`Metas: ${formatCurrency(data.totalGoalsCurrent)}`, margin + 120, breakdownY);

  y += 45;

  // ========== FLUXO MENSAL ==========
  ensureSpace(45);
  pdf.setTextColor(0, 63, 92);
  pdf.setFontSize(14);
  pdf.text('Fluxo do Mês', margin, y);
  y += 8;

  const boxWidth = (pageWidth - margin * 2 - 10) / 3;
  
  // Receitas
  pdf.setFillColor(220, 255, 220);
  pdf.roundedRect(margin, y, boxWidth, 25, 2, 2, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 100, 0);
  pdf.text('Receitas', margin + 5, y + 8);
  pdf.setFontSize(12);
  pdf.text(formatCurrency(data.monthlyIncome), margin + 5, y + 18);

  // Despesas
  pdf.setFillColor(255, 220, 220);
  pdf.roundedRect(margin + boxWidth + 5, y, boxWidth, 25, 2, 2, 'F');
  pdf.setTextColor(150, 0, 0);
  pdf.setFontSize(9);
  pdf.text('Despesas', margin + boxWidth + 10, y + 8);
  pdf.setFontSize(12);
  pdf.text(formatCurrency(data.monthlyExpenses), margin + boxWidth + 10, y + 18);

  // Economia
  const savings = data.monthlyIncome - data.monthlyExpenses;
  pdf.setFillColor(220, 240, 255);
  pdf.roundedRect(margin + (boxWidth + 5) * 2, y, boxWidth, 25, 2, 2, 'F');
  pdf.setTextColor(0, 63, 92);
  pdf.setFontSize(9);
  pdf.text('Economia', margin + (boxWidth + 5) * 2 + 5, y + 8);
  pdf.setFontSize(12);
  pdf.text(formatCurrency(savings), margin + (boxWidth + 5) * 2 + 5, y + 18);

  y += 35;

  // ========== METAS ==========
  if (data.goals.length > 0) {
    ensureSpace(30 + Math.min(data.goals.length, 5) * 22);
    pdf.setTextColor(0, 63, 92);
    pdf.setFontSize(14);
    pdf.text('Metas Financeiras', margin, y);
    y += 8;

    data.goals.slice(0, 5).forEach((goal) => {
      // Verificar espaço antes de cada meta
      if (ensureSpace(22)) {
        // Se adicionou página, recriar cabeçalho da seção
        pdf.setTextColor(0, 63, 92);
        pdf.setFontSize(12);
        pdf.text('Metas Financeiras (cont.)', margin, y);
        y += 8;
      }
      
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      // Truncar nome se muito longo
      const truncatedName = goal.name.length > 30 ? goal.name.substring(0, 27) + '...' : goal.name;
      pdf.text(truncatedName, margin + 5, y + 8);
      
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${goal.progress.toFixed(0)}%`, margin + 100, y + 8);
      pdf.text(`${formatCurrency(goal.current)} / ${formatCurrency(goal.target)}`, margin + 115, y + 8);
      
      // Progress bar
      const barWidth = 90;
      const barX = margin + 5;
      const barY = y + 12;
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(barX, barY, barWidth, 3, 1, 1, 'F');
      pdf.setFillColor(0, 63, 92);
      pdf.roundedRect(barX, barY, Math.min(goal.progress, 100) * barWidth / 100, 3, 1, 1, 'F');
      
      y += 20;
    });
    y += 5;
  }

  // ========== INVESTIMENTOS ==========
  if (data.investments.length > 0) {
    ensureSpace(25 + Math.min(data.investments.length, 8) * 8);
    pdf.setTextColor(0, 63, 92);
    pdf.setFontSize(14);
    pdf.text('Investimentos', margin, y);
    y += 8;

    // Header da tabela
    pdf.setFillColor(0, 63, 92);
    pdf.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text('Nome', margin + 5, y + 5.5);
    pdf.text('Tipo', margin + 70, y + 5.5);
    pdf.text('Valor', margin + 110, y + 5.5);
    pdf.text('Retorno', margin + 150, y + 5.5);
    y += 8;

    data.investments.slice(0, 8).forEach((inv, i) => {
      // Verificar espaço antes de cada linha
      if (ensureSpace(8)) {
        // Recriar header da tabela na nova página
        pdf.setFillColor(0, 63, 92);
        pdf.rect(margin, y, pageWidth - margin * 2, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.text('Nome', margin + 5, y + 5.5);
        pdf.text('Tipo', margin + 70, y + 5.5);
        pdf.text('Valor', margin + 110, y + 5.5);
        pdf.text('Retorno', margin + 150, y + 5.5);
        y += 8;
      }
      
      pdf.setFillColor(i % 2 === 0 ? 250 : 245, i % 2 === 0 ? 250 : 245, i % 2 === 0 ? 250 : 245);
      pdf.rect(margin, y, pageWidth - margin * 2, 7, 'F');
      
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(9);
      pdf.text(inv.name.substring(0, 25), margin + 5, y + 5);
      pdf.text(inv.type.substring(0, 15), margin + 70, y + 5);
      pdf.text(formatCurrency(inv.amount), margin + 110, y + 5);
      pdf.text(inv.return ? `${inv.return.toFixed(1)}%` : '-', margin + 150, y + 5);
      y += 7;
    });
    y += 10;
  }

  // ========== PROJEÇÃO ==========
  ensureSpace(35);
  pdf.setTextColor(0, 63, 92);
  pdf.setFontSize(14);
  pdf.text('Projeção 30 Dias', margin, y);
  y += 8;

  pdf.setFillColor(255, 248, 220);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, 'F');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 80, 0);
  pdf.text(`${data.upcomingTransactions} transações pendentes`, margin + 10, y + 8);
  pdf.text(`Saldo projetado: ${formatCurrency(data.projectedBalance)}`, margin + 10, y + 16);

  // ========== FOOTER EM TODAS AS PÁGINAS ==========
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.text('Plenne - Seu parceiro financeiro', margin, pageHeight - 10);
  }

  pdf.save(`relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
}
