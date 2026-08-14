import { useState } from 'react'
import { format } from 'date-fns'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { apiFetch } from '../../../lib/session'
import type { Page, OfficerWorkspaceData } from '../types'

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

type ReportTypeValue =
  | 'monthly-grievance-audit'
  | 'scheme-funding-utilization'
  | 'ward-high-priority-summary'

const reportOptions: Array<{
  value: ReportTypeValue
  title: string
  desc: string
  icon: string
  fileName: string
}> = [
  {
    value: 'monthly-grievance-audit',
    title: 'Monthly Grievance Audit',
    desc: 'Summary of all logged, in-progress, and resolved complaints from your department.',
    icon: '📊',
    fileName: 'CivicFundAI_Monthly_Grievance_Audit.pdf',
  },
  {
    value: 'scheme-funding-utilization',
    title: 'Scheme Funding Utilization',
    desc: 'Funding and estimate reporting from the Coimbatore Corporation FY 2023-24 budget.',
    icon: '💰',
    fileName: 'CivicFundAI_Scheme_Funding_Utilization.pdf',
  },
  {
    value: 'ward-high-priority-summary',
    title: 'Ward High-Priority Summary',
    desc: 'AI-prioritized grievance and ward risk summary for urgent action.',
    icon: '🚨',
    fileName: 'CivicFundAI_Ward_High_Priority_Summary.pdf',
  },
]

function wrapText(text: string, maxWidth: number, font: any, size: number) {
  const lines: string[] = []
  const paragraphs = text.split('\n')
  for (const paragraph of paragraphs) {
    let currentLine = ''
    paragraph.split(' ').forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        currentLine = candidate
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    })
    if (currentLine) {
      lines.push(currentLine)
    }
  }
  return lines
}

function downloadBlob(pdfBytes: Uint8Array, fileName: string) {
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

async function createReportPdf(
  report: any,
  officerName: string,
  officerDepartment: string,
  fileName: string
) {
  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 612
  const pageHeight = 792
  const margin = 50
  const lineHeight = 14

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const addLine = (text: string, size = 10, font = helvetica, color?: any) => {
    const opts: any = {
      x: margin,
      y,
      size,
      font,
    }
    if (color !== undefined) {
      opts.color = color
    }
    page.drawText(text, opts)
    y -= lineHeight
  }

  const addWrappedText = (text: string, size = 10, font = helvetica, indent = 0) => {
    const maxWidth = pageWidth - margin * 2 - indent
    const lines = wrapText(text, maxWidth, font, size)
    lines.forEach((line) => {
      if (y < margin + lineHeight * 4) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        y = pageHeight - margin
      }
      page.drawText(line, {
        x: margin + indent,
        y,
        size,
        font,
      })
      y -= lineHeight
    })
  }

  const addSectionTitle = (title: string) => {
    if (y < margin + lineHeight * 6) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
    page.drawText(title, {
      x: margin,
      y,
      size: 14,
      font: helveticaBold,
    })
    y -= lineHeight * 1.5
  }

  const addPageFooter = (page: any, pageIndex: number, pagesCount: number) => {
    page.drawText(`Page ${pageIndex + 1} of ${pagesCount}`, {
      x: pageWidth - margin - 110,
      y: margin - 10,
      size: 9,
      font: helvetica,
    })
  }

  page.drawText('Government of Tamil Nadu', {
    x: margin,
    y,
    size: 18,
    font: helveticaBold,
  })
  y -= lineHeight * 1.4
  page.drawText('CivicFund AI', {
    x: margin,
    y,
    size: 14,
    font: helveticaBold,
  })
  y -= lineHeight * 2
  page.drawText('Officer Executive Report', {
    x: margin,
    y,
    size: 13,
    font: helveticaBold,
  })
  y -= lineHeight * 2

  addLine(`Officer: ${officerName}`, 11, helvetica)
  addLine(`Department: ${officerDepartment}`, 11, helvetica)
  addLine(`Report Type: ${report.reportTitle}`, 11, helvetica)
  addLine(`Generated: ${format(new Date(report.generatedAt), 'PPpp')}`, 11, helvetica)
  y -= lineHeight / 2

  addSectionTitle('Executive Summary')
  addWrappedText(
    `This report is generated with authenticated officer authorization and uses live MongoDB records from the selected department workspace. It includes source attribution and live AI analysis for the selected report type.`,
    10,
    helvetica
  )
  y -= lineHeight

  if (report.reportType === 'monthly-grievance-audit') {
    addSectionTitle('Monthly Grievance Audit')
    const items = report.data.items || []
    if (items.length === 0) {
      addWrappedText('No department grievances were available for this audit period.', 10, helvetica)
    }
    items.forEach((item: any, index: number) => {
      if (y < margin + lineHeight * 8) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        y = pageHeight - margin
      }
      addLine(`${index + 1}. Complaint ID: ${item.complaintId}`, 10, helveticaBold)
      addWrappedText(`Submitted: ${format(new Date(item.submittedDate), 'PP')}`, 10, helvetica, 10)
      addWrappedText(`Status: ${item.status} | Department: ${item.department || 'N/A'} | Category: ${item.category || 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`Priority: ${item.priority || 'N/A'} | Severity: ${item.severity ?? 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`AI Summary: ${item.aiSummary || 'No summary available.'}`, 10, helvetica, 10)
      addWrappedText(`AI Processed: ${item.aiProcessedAt ? format(new Date(item.aiProcessedAt), 'PPpp') : 'Not processed yet.'}`, 10, helvetica, 10)
      y -= lineHeight / 2
    })
  }

  if (report.reportType === 'scheme-funding-utilization') {
    addSectionTitle('Scheme Funding Utilization')
    addWrappedText('Source: Coimbatore Corporation Budget 2023-24', 10, helvetica)
    addWrappedText('This report uses validated budget records and budget fund summaries from the official FY 2023-24 corpus.', 10, helvetica)
    if (report.data.projects?.length === 0) {
      addWrappedText('No matching budget projects were found for this department.', 10, helvetica)
    }

    report.data.projects?.forEach((project: any, index: number) => {
      if (y < margin + lineHeight * 12) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        y = pageHeight - margin
      }
      addLine(`${index + 1}. Scheme / Project: ${project.projectName}`, 11, helveticaBold)
      if (project.schemeName) {
        addWrappedText(`Scheme Name: ${project.schemeName}`, 10, helvetica, 10)
      }
      addWrappedText(`Department: ${project.department || 'N/A'} | FY: ${project.financialYear}`, 10, helvetica, 10)
      addWrappedText(`FY 2023-24 Budget Estimate: ${project.estimatedCost != null ? `₹${project.estimatedCost.toLocaleString()} ${project.estimatedCostUnit || ''}` : 'Not available'}`, 10, helvetica, 10)
      if (project.budgetAllocation) {
        addWrappedText(`Budget Allocation: ₹${project.budgetAllocation.amount.toLocaleString()} ${project.budgetAllocation.unit || ''}`, 10, helvetica, 10)
      }
      addWrappedText(`Funding Source: ${project.fundingSource || 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`Location: ${project.location || 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`Source: ${project.sourceDocument || 'Coimbatore Corporation Budget 2023-24'}`, 10, helvetica, 10)
      addWrappedText(`PDF Page: ${project.pdfPage} | Document Page: ${project.documentPage ?? 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`Source Reference: ${project.sourceReference || 'Not available'}`, 10, helvetica, 10)
      y -= lineHeight / 2
    })

    if (report.data.fundSummaries?.length > 0) {
      addSectionTitle('Budget Fund Summaries')
      report.data.fundSummaries.forEach((summary: any, index: number) => {
        if (y < margin + lineHeight * 10) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          y = pageHeight - margin
        }
        addLine(`${index + 1}. ${summary.fundName}`, 11, helveticaBold)
        addWrappedText(`Receipts: ₹${summary.totalReceipts.toLocaleString()} ${summary.unit}`, 10, helvetica, 10)
        addWrappedText(`Expenditure: ₹${summary.totalExpenditure.toLocaleString()} ${summary.unit}`, 10, helvetica, 10)
        addWrappedText(`Surplus / Deficit: ₹${summary.surplusDeficit.toLocaleString()} ${summary.unit}`, 10, helvetica, 10)
        addWrappedText(`PDF Page: ${summary.pdfPage} | Document Page: ${summary.documentPage ?? 'N/A'}`, 10, helvetica, 10)
        addWrappedText(`Source Reference: ${summary.sourceReference || 'Not available'}`, 10, helvetica, 10)
        y -= lineHeight / 2
      })
    }
  }

  if (report.reportType === 'ward-high-priority-summary') {
    addSectionTitle('Ward High-Priority Summary')
    const items = report.data.items || []
    if (items.length === 0) {
      addWrappedText('No high-priority ward complaints were found for this department.', 10, helvetica)
    }
    items.forEach((item: any, index: number) => {
      if (y < margin + lineHeight * 10) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        y = pageHeight - margin
      }
      addLine(`${index + 1}. Complaint ID: ${item.complaintId}`, 10, helveticaBold)
      addWrappedText(`Location / Ward: ${item.location || 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`Priority: ${item.priority || 'N/A'} | Severity: ${item.severity ?? 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`Category: ${item.category || 'N/A'} | Status: ${item.status || 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`Department: ${item.department || 'N/A'}`, 10, helvetica, 10)
      addWrappedText(`AI Summary: ${item.aiSummary || 'No summary available.'}`, 10, helvetica, 10)
      y -= lineHeight / 2
    })
  }

  const pages = pdfDoc.getPages()
  pages.forEach((pdfPage, index) => addPageFooter(pdfPage, index, pages.length))

  const pdfBytes = await pdfDoc.save()
  downloadBlob(pdfBytes, fileName)
}

export default function Reports({ data, navigate }: Props) {
  const department = data?.officer?.department || 'Public Works'
  const officerName = data?.officer?.name || data?.officer?.username || 'Officer'
  const [selectedReport, setSelectedReport] = useState<ReportTypeValue>('monthly-grievance-audit')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = reportOptions.find((option) => option.value === selectedReport)

  const handleGenerate = async () => {
    if (!selected) {
      setError('Please select a report type before generating.')
      return
    }

    setGenerating(true)
    setError(null)
    setGenerated(false)

    try {
      const response = await apiFetch(`/api/officer/reports/${selectedReport}`)
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message || 'Unable to fetch report data.')
      }

      const payload = await response.json()
      if (!payload.success || !payload.data) {
        throw new Error(payload?.message || 'Report API returned no data.')
      }

      await createReportPdf(payload.data, officerName, department, selected.fileName)
      setGenerated(true)
    } catch (err: any) {
      setError(err?.message || 'A network error occurred while generating the report.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Executive Report Generator</h1>
        <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
          Generate authenticated PDF reports for <strong>{department}</strong> using live MongoDB and AI results.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 space-y-5" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold text-slate-900">Select Report Type</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportOptions.map((report) => {
            const isSelected = report.value === selectedReport
            return (
              <button
                key={report.value}
                type="button"
                onClick={() => {
                  setSelectedReport(report.value)
                  setGenerated(false)
                  setError(null)
                }}
                className={`p-4 rounded-xl border bg-slate-50 text-left transition-all ${
                  isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-500'
                }`}
              >
                <div className="text-2xl">{report.icon}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{report.title}</div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{report.desc}</p>
              </button>
            )
          })}
        </div>

        <div className="pt-4 border-t flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: '#F1F5F9' }}>
          <span className="text-xs text-slate-500">Includes verified MongoDB metadata and persisted AI results.</span>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {generating ? 'Generating official report...' : 'Generate Official Report PDF'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <strong>Selected report:</strong>
          <div className="mt-1 font-semibold text-slate-900">{selected?.title}</div>
          <div className="text-xs text-slate-500">{selected?.desc}</div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <p className="font-semibold">Unable to generate report</p>
            <p className="mt-1 text-xs">{error}</p>
            <button
              type="button"
              onClick={handleGenerate}
              className="mt-3 inline-flex rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : generated ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">✓ Report downloaded successfully.</p>
            <p className="mt-1 text-xs">The official PDF was generated using your authenticated officer profile and live departmental records.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
