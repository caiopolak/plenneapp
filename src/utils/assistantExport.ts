// Exportação de conversas do assistente IA para PDF e CSV
// Com design padronizado e quebra de página inteligente
import { formatDateForExport } from "./dataExport";

export interface MessageExport {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationExport {
  title: string;
  created_at: string;
  messages: MessageExport[];
}

// Configurações de estilo padrão para PDFs
const PDF_STYLES = {
  primaryColor: { r: 0, g: 63, b: 92 },
  successColor: { r: 16, g: 185, b: 129 },
  userBgColor: { r: 224, g: 242, b: 254 },
  assistantBgColor: { r: 240, g: 253, b: 244 },
  headerHeight: 45,
  footerHeight: 15,
  margin: 15,
};

// Exportar conversa para CSV
export function exportConversationToCSV(conversation: ConversationExport): void {
  const headers = ["Data/Hora", "Remetente", "Mensagem"];
  const rows = conversation.messages.map((msg) => {
    const sender = msg.role === "user" ? "Você" : "Plenne IA";
    const dateTime = new Date(msg.created_at).toLocaleString("pt-BR");
    // Escapar aspas e quebras de linha para CSV
    const content = msg.content.replace(/"/g, '""').replace(/\n/g, " ");
    return `"${dateTime}";"${sender}";"${content}"`;
  });

  const csvContent = [headers.join(";"), ...rows].join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });

  const filename = `conversa_plenne_${formatDateForExport(conversation.created_at).replace(/\//g, "-")}.csv`;
  downloadBlob(blob, filename);
}

// Exportar conversa para PDF com quebra de página inteligente
export async function exportConversationToPDF(conversation: ConversationExport): Promise<void> {
  const [{ default: jsPDF }] = await Promise.all([
    import("jspdf"),
  ]);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const { margin, headerHeight, footerHeight } = PDF_STYLES;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let currentPage = 1;

  // Função para verificar espaço e adicionar página se necessário
  const ensureSpace = (neededHeight: number): boolean => {
    const availableSpace = pageHeight - footerHeight - y;
    if (neededHeight > availableSpace) {
      addFooter();
      pdf.addPage();
      currentPage++;
      y = margin + 10;
      return true;
    }
    return false;
  };

  // Função para adicionar footer
  const addFooter = () => {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${currentPage}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    pdf.text('Plenne - Seu assistente financeiro', margin, pageHeight - 8);
  };

  // ========== HEADER ==========
  pdf.setFillColor(PDF_STYLES.primaryColor.r, PDF_STYLES.primaryColor.g, PDF_STYLES.primaryColor.b);
  pdf.rect(0, 0, pageWidth, headerHeight, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text('🌿 Plenne - Assistente Financeiro', margin, 20);
  
  pdf.setFontSize(10);
  pdf.text('Histórico de Conversa', margin, 30);
  
  pdf.setFontSize(8);
  pdf.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    pageWidth - margin,
    30,
    { align: 'right' }
  );
  
  y = headerHeight + 10;

  // ========== INFO BOX ==========
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(margin, y, contentWidth, 25, 3, 3, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(22, 101, 52);
  pdf.text(`Título: ${conversation.title}`, margin + 5, y + 8);
  pdf.text(`Data: ${new Date(conversation.created_at).toLocaleString("pt-BR")}`, margin + 5, y + 15);
  pdf.text(`Total de mensagens: ${conversation.messages.length}`, margin + 5, y + 22);
  
  y += 35;

  // ========== MENSAGENS ==========
  for (const msg of conversation.messages) {
    const isUser = msg.role === "user";
    const sender = isUser ? "Você" : "Plenne IA";
    const timeStr = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calcular altura necessária para esta mensagem
    pdf.setFontSize(9);
    const textLines = pdf.splitTextToSize(msg.content, contentWidth - 15);
    const messageHeight = 20 + (textLines.length * 4.5);

    // Verificar se precisa de nova página
    ensureSpace(messageHeight);

    // Desenhar caixa da mensagem
    if (isUser) {
      pdf.setFillColor(PDF_STYLES.userBgColor.r, PDF_STYLES.userBgColor.g, PDF_STYLES.userBgColor.b);
      pdf.setDrawColor(14, 165, 233);
    } else {
      pdf.setFillColor(PDF_STYLES.assistantBgColor.r, PDF_STYLES.assistantBgColor.g, PDF_STYLES.assistantBgColor.b);
      pdf.setDrawColor(PDF_STYLES.successColor.r, PDF_STYLES.successColor.g, PDF_STYLES.successColor.b);
    }
    
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, y, contentWidth, messageHeight, 3, 3, 'FD');

    // Cabeçalho da mensagem
    pdf.setFontSize(10);
    pdf.setTextColor(isUser ? 3 : 22, isUser ? 105 : 101, isUser ? 161 : 52);
    pdf.text(sender, margin + 5, y + 7);
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(timeStr, pageWidth - margin - 5, y + 7, { align: 'right' });

    // Conteúdo da mensagem
    pdf.setFontSize(9);
    pdf.setTextColor(50, 50, 50);
    
    let textY = y + 14;
    for (const line of textLines) {
      // Verificar se a linha cabe na página atual
      if (textY > pageHeight - footerHeight - 5) {
        addFooter();
        pdf.addPage();
        currentPage++;
        textY = margin + 10;
        
        // Continuar a caixa na nova página
        const remainingLines = textLines.slice(textLines.indexOf(line));
        const remainingHeight = 10 + (remainingLines.length * 4.5);
        
        if (isUser) {
          pdf.setFillColor(PDF_STYLES.userBgColor.r, PDF_STYLES.userBgColor.g, PDF_STYLES.userBgColor.b);
          pdf.setDrawColor(14, 165, 233);
        } else {
          pdf.setFillColor(PDF_STYLES.assistantBgColor.r, PDF_STYLES.assistantBgColor.g, PDF_STYLES.assistantBgColor.b);
          pdf.setDrawColor(PDF_STYLES.successColor.r, PDF_STYLES.successColor.g, PDF_STYLES.successColor.b);
        }
        pdf.roundedRect(margin, textY - 5, contentWidth, remainingHeight, 3, 3, 'FD');
      }
      
      pdf.setTextColor(50, 50, 50);
      pdf.text(line, margin + 5, textY);
      textY += 4.5;
    }

    y += messageHeight + 5;
  }

  // Footer final
  addFooter();

  // Atualizar todos os footers com total de páginas
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    // Limpar área do footer
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    // Reescrever footer
    pdf.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    pdf.text('Plenne - Seu assistente financeiro', margin, pageHeight - 8);
  }

  const filename = `conversa_plenne_${formatDateForExport(conversation.created_at).replace(/\//g, "-")}.pdf`;
  pdf.save(filename);
}

// Helper para download
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

// Exportar todas as conversas para CSV
export function exportAllConversationsToCSV(
  conversations: { title: string; created_at: string; messages: MessageExport[] }[]
): void {
  const headers = ["Conversa", "Data Conversa", "Data/Hora Mensagem", "Remetente", "Mensagem"];
  const rows: string[] = [];

  conversations.forEach((conv) => {
    conv.messages.forEach((msg) => {
      const sender = msg.role === "user" ? "Você" : "Plenne IA";
      const convDate = formatDateForExport(conv.created_at);
      const msgDateTime = new Date(msg.created_at).toLocaleString("pt-BR");
      const content = msg.content.replace(/"/g, '""').replace(/\n/g, " ");
      rows.push(`"${conv.title}";"${convDate}";"${msgDateTime}";"${sender}";"${content}"`);
    });
  });

  const csvContent = [headers.join(";"), ...rows].join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });

  const filename = `historico_conversas_plenne_${new Date().toISOString().split("T")[0]}.csv`;
  downloadBlob(blob, filename);
}

// Exportar todas as conversas para PDF com design consolidado
export async function exportAllConversationsToPDF(
  conversations: ConversationExport[]
): Promise<void> {
  const [{ default: jsPDF }] = await Promise.all([
    import("jspdf"),
  ]);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const { margin, headerHeight, footerHeight } = PDF_STYLES;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ========== CAPA ==========
  pdf.setFillColor(PDF_STYLES.primaryColor.r, PDF_STYLES.primaryColor.g, PDF_STYLES.primaryColor.b);
  pdf.rect(0, 0, pageWidth, pageHeight / 2, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.text('🌿 Plenne', pageWidth / 2, 60, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.text('Histórico de Conversas', pageWidth / 2, 80, { align: 'center' });
  pdf.text('Assistente Financeiro IA', pageWidth / 2, 92, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`${conversations.length} conversas exportadas`, pageWidth / 2, 110, { align: 'center' });
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 120, { align: 'center' });

  // Sumário
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(14);
  pdf.text('Sumário das Conversas:', margin, pageHeight / 2 + 20);
  
  let summaryY = pageHeight / 2 + 30;
  pdf.setFontSize(10);
  conversations.slice(0, 15).forEach((conv, i) => {
    const truncatedTitle = conv.title.length > 50 ? conv.title.substring(0, 47) + '...' : conv.title;
    pdf.text(`${i + 1}. ${truncatedTitle}`, margin + 5, summaryY);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`(${conv.messages.length} mensagens)`, pageWidth - margin - 30, summaryY);
    pdf.setTextColor(50, 50, 50);
    summaryY += 7;
  });

  if (conversations.length > 15) {
    pdf.setTextColor(100, 100, 100);
    pdf.text(`... e mais ${conversations.length - 15} conversas`, margin + 5, summaryY);
  }

  // Exportar cada conversa individualmente nas próximas páginas
  for (let i = 0; i < conversations.length; i++) {
    pdf.addPage();
    const conv = conversations[i];
    y = margin;

    // Header da conversa
    pdf.setFillColor(PDF_STYLES.primaryColor.r, PDF_STYLES.primaryColor.g, PDF_STYLES.primaryColor.b);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text(`Conversa ${i + 1} de ${conversations.length}`, margin, 15);
    
    pdf.setFontSize(11);
    const truncatedTitle = conv.title.length > 60 ? conv.title.substring(0, 57) + '...' : conv.title;
    pdf.text(truncatedTitle, margin, 25);
    
    pdf.setFontSize(8);
    pdf.text(new Date(conv.created_at).toLocaleString("pt-BR"), pageWidth - margin, 25, { align: 'right' });
    
    y = 45;

    // Mensagens
    for (const msg of conv.messages) {
      const isUser = msg.role === "user";
      const sender = isUser ? "Você" : "Plenne IA";
      const timeStr = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      pdf.setFontSize(9);
      const textLines = pdf.splitTextToSize(msg.content, contentWidth - 15);
      const messageHeight = 18 + (textLines.length * 4);

      // Verificar espaço
      if (y + messageHeight > pageHeight - footerHeight) {
        pdf.addPage();
        y = margin + 10;
      }

      // Desenhar mensagem
      if (isUser) {
        pdf.setFillColor(PDF_STYLES.userBgColor.r, PDF_STYLES.userBgColor.g, PDF_STYLES.userBgColor.b);
      } else {
        pdf.setFillColor(PDF_STYLES.assistantBgColor.r, PDF_STYLES.assistantBgColor.g, PDF_STYLES.assistantBgColor.b);
      }
      pdf.roundedRect(margin, y, contentWidth, messageHeight, 2, 2, 'F');

      pdf.setFontSize(9);
      pdf.setTextColor(isUser ? 3 : 22, isUser ? 105 : 101, isUser ? 161 : 52);
      pdf.text(`${sender} • ${timeStr}`, margin + 3, y + 6);

      pdf.setTextColor(50, 50, 50);
      let textY = y + 12;
      for (const line of textLines) {
        pdf.text(line, margin + 3, textY);
        textY += 4;
      }

      y += messageHeight + 3;
    }
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
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const filename = `historico_conversas_plenne_${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(filename);
}
