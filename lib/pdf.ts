import { jsPDF } from "jspdf"

export function gerarPDFOrcamento(orcamento: any) {
    const doc = new jsPDF()

    // Cabeçalho - Título
    doc.setFontSize(18)
    doc.setTextColor(30, 58, 138) // Azul escuro
    doc.text("Gestão de Orçamentos", 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text("Edição Científica & Tradução Acadêmica", 14, 26)

    // Cabeçalho - Número da Proposta e Data
    doc.setFontSize(12)
    doc.setTextColor(37, 99, 235) // Azul principal
    doc.text(`Proposta: ${orcamento.codigo_proposta || 'ORC-001'}`, 135, 20)

    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 135, 26)

    // Linha divisória
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.5)
    doc.line(14, 30, 196, 30)

    // Bloco de Informações do Cliente
    let posY = 40
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)

    doc.setFont("helvetica", "bold")
    doc.text("Cliente / Instituição:", 14, posY)
    doc.setFont("helvetica", "normal")
    doc.text(`${orcamento.cliente_nome || 'Universidade / Cliente'}`, 55, posY)

    if (orcamento.titulo_artigo) {
        posY += 7
        doc.setFont("helvetica", "bold")
        doc.text("Título da Obra:", 14, posY)
        doc.setFont("helvetica", "normal")
        doc.text(`${orcamento.titulo_artigo}`, 55, posY)
    }

    if (orcamento.docente_responsavel) {
        posY += 7
        doc.setFont("helvetica", "bold")
        doc.text("Docente Responsável:", 14, posY)
        doc.setFont("helvetica", "normal")
        doc.text(`${orcamento.docente_responsavel}`, 55, posY)
    }

    if (orcamento.numero_processo) {
        posY += 7
        doc.setFont("helvetica", "bold")
        doc.text("Processo / Licitação:", 14, posY)
        doc.setFont("helvetica", "normal")
        doc.text(`${orcamento.numero_processo}`, 55, posY)
    }

    // Tabela de Serviços
    posY += 12
    doc.setFillColor(37, 99, 235)
    doc.rect(14, posY, 182, 8, 'F')

    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text("Serviço Contratado", 18, posY + 5.5)
    doc.text("Valor Total", 160, posY + 5.5)

    posY += 14
    doc.setFont("helvetica", "normal")
    doc.setTextColor(17, 24, 39)
    doc.text(`${orcamento.servicos_resumo || 'Serviços de Revisão e Tradução'}`, 18, posY)

    const valorFormatado = `R$ ${Number(orcamento.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    doc.text(valorFormatado, 160, posY)

    // Linha de Fechamento da Tabela
    posY += 5
    doc.setDrawColor(229, 231, 235)
    doc.line(14, posY, 196, posY)

    // Total da Proposta
    posY += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(30, 58, 138)
    doc.text(`Total da Proposta: ${valorFormatado}`, 120, posY)

    // Rodapé - Condições de Pagamento
    posY += 25
    doc.setDrawColor(229, 231, 235)
    doc.line(14, posY, 196, posY)

    posY += 10
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    doc.setFont("helvetica", "bold")
    doc.text("Validade da Proposta:", 14, posY)
    doc.setFont("helvetica", "normal")
    doc.text(`${orcamento.validade_dias || 30} dias`, 52, posY)

    posY += 6
    doc.setFont("helvetica", "bold")
    doc.text("Dados para Pagamento (PIX):", 14, posY)
    doc.setFont("helvetica", "normal")
    doc.text("Chave PIX / Dados Bancários Cadastrados", 62, posY)

    // Salvar o PDF
    doc.save(`Orcamento_${orcamento.codigo_proposta || 'Proposta'}.pdf`)
}