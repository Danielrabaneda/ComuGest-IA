import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
const MAX_OCR_PAGES = 8

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No se incluyó ningún archivo' }, { status: 400 })
        }
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Solo se admiten archivos PDF' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 1. Intentar extracción de texto directa (PDFs digitales con capa de texto)
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(buffer)

        if (pdfData.text && pdfData.text.trim().length > 50) {
            const cleanText = pdfData.text
                .replace(/\n{3,}/g, '\n\n')
                .replace(/ {2,}/g, ' ')
                .trim()
            return NextResponse.json({ text: cleanText, pages: pdfData.numpages, method: 'text' })
        }

        // 2. PDF escaneado: renderizar páginas con mupdf → OCR con tesseract.js
        console.log('No text layer found, switching to OCR...')

        const mupdf = await import('mupdf')
        const doc = mupdf.Document.openDocument(new Uint8Array(buffer), 'application/pdf')
        const totalPages = doc.countPages()
        const numPages = Math.min(totalPages, MAX_OCR_PAGES)

        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker('spa+eng')

        const pageTexts: string[] = []

        for (let i = 0; i < numPages; i++) {
            try {
                const page = doc.loadPage(i)

                // Renderizar a 200 DPI (escala ~2.8x respecto a 72 DPI base)
                const matrix = mupdf.Matrix.scale(2.8, 2.8)
                const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true)
                const pngBuffer = Buffer.from(pixmap.asPNG())
                pixmap.destroy()

                console.log(`Page ${i + 1}: rendered ${pngBuffer.length} bytes`)

                const { data: { text, confidence } } = await worker.recognize(pngBuffer)
                console.log(`Page ${i + 1}: OCR confidence=${confidence.toFixed(1)}, chars=${text.trim().length}`)

                if (text.trim().length > 5) {
                    pageTexts.push(`--- Página ${i + 1} ---\n${text.trim()}`)
                }
            } catch (pageErr) {
                console.warn(`Error procesando página ${i + 1}:`, pageErr)
            }
        }

        await worker.terminate()

        if (pageTexts.length === 0) {
            return NextResponse.json({
                error: 'No se pudo extraer texto con OCR. Asegúrate de que el PDF no está cifrado y tiene una resolución adecuada.'
            }, { status: 422 })
        }

        const fullText = pageTexts.join('\n\n')
        const warning = totalPages > MAX_OCR_PAGES
            ? `\n\n[⚠️ Solo se procesaron ${MAX_OCR_PAGES} de ${totalPages} páginas]`
            : ''

        return NextResponse.json({
            text: fullText + warning,
            pages: totalPages,
            processed_pages: numPages,
            method: 'ocr'
        })

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error parsing PDF:', message)
        return NextResponse.json({ error: `Error al procesar el PDF: ${message}` }, { status: 500 })
    }
}
