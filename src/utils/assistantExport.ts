// Exportação de conversas do assistente IA para PDF e CSV
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

// Exportar conversa para PDF (HTML simplificado que pode ser impresso)
export async function exportConversationToPDF(conversation: ConversationExport): Promise<void> {
  // Carregar bibliotecas dinamicamente
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Criar elemento HTML temporário com estilo para PDF
  const container = document.createElement("div");
  container.style.cssText = `
    width: 800px;
    padding: 40px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: white;
    color: #1a1a1a;
    line-height: 1.6;
  `;

  // Header
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #10b981;">
      <h1 style="color: #10b981; margin: 0; font-size: 24px;">🌿 Plenne - Assistente Financeiro</h1>
      <p style="color: #666; margin-top: 8px; font-size: 14px;">Histórico de Conversa</p>
    </div>
    <div style="margin-bottom: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0; color: #166534;"><strong>Título:</strong> ${conversation.title}</p>
      <p style="margin: 5px 0 0 0; color: #166534;"><strong>Data:</strong> ${new Date(conversation.created_at).toLocaleString("pt-BR")}</p>
      <p style="margin: 5px 0 0 0; color: #166534;"><strong>Total de mensagens:</strong> ${conversation.messages.length}</p>
    </div>
  `;
  container.appendChild(header);

  // Mensagens
  const messagesContainer = document.createElement("div");
  conversation.messages.forEach((msg, index) => {
    const isUser = msg.role === "user";
    const messageDiv = document.createElement("div");
    messageDiv.style.cssText = `
      margin-bottom: 15px;
      padding: 12px 16px;
      border-radius: 12px;
      background: ${isUser ? "#e0f2fe" : "#f0fdf4"};
      border-left: 4px solid ${isUser ? "#0ea5e9" : "#10b981"};
    `;
    
    const timeStr = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <strong style="color: ${isUser ? "#0369a1" : "#166534"};">${isUser ? "Você" : "Plenne IA"}</strong>
        <span style="color: #666; font-size: 12px;">${timeStr}</span>
      </div>
      <p style="margin: 0; white-space: pre-wrap; color: #333;">${msg.content}</p>
    `;
    messagesContainer.appendChild(messageDiv);
  });
  container.appendChild(messagesContainer);

  // Footer
  const footer = document.createElement("div");
  footer.innerHTML = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #999; font-size: 12px;">
      Gerado por Plenne - Seu assistente financeiro inteligente<br>
      ${new Date().toLocaleString("pt-BR")}
    </div>
  `;
  container.appendChild(footer);

  // Adicionar ao DOM temporariamente
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;
    let page = 1;

    // Primeira página
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    // Páginas adicionais se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
      page++;
    }

    const filename = `conversa_plenne_${formatDateForExport(conversation.created_at).replace(/\//g, "-")}.pdf`;
    pdf.save(filename);
  } finally {
    // Remover elemento temporário
    document.body.removeChild(container);
  }
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
