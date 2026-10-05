// Reads the text out of a resume file in the browser. The heavy parsers are
// loaded on demand so they don't weigh down the main bundle.

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_RESUME_TYPES = '.pdf,.docx,.txt';

const extension = (name: string) => name.toLowerCase().split('.').pop() || '';

const pdfToText = async (file: File): Promise<string> => {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, 12); n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    // PDFs store text as positioned runs in arbitrary order. Put them back in
    // reading order: top to bottom, then left to right within a line.
    const runs = (content.items as any[])
      .filter((item) => typeof item.str === 'string' && item.str.trim())
      .map((item) => ({ text: item.str as string, x: item.transform?.[4] ?? 0, y: item.transform?.[5] ?? 0 }))
      .sort((a, b) => (Math.abs(a.y - b.y) > 3 ? b.y - a.y : a.x - b.x));
    const lines: string[] = [];
    let lastY: number | null = null;
    for (const run of runs) {
      if (lastY === null || Math.abs(run.y - lastY) > 3) {
        lines.push(run.text);
        lastY = run.y;
      } else {
        const prev = lines[lines.length - 1];
        lines[lines.length - 1] = prev + (prev.endsWith(' ') || run.text.startsWith(' ') ? '' : ' ') + run.text;
      }
    }
    pages.push(lines.map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n'));
  }
  return pages.join('\n\n');
};

const docxToText = async (file: File): Promise<string> => {
  // @ts-ignore - the browser build ships without type declarations
  const mammoth = await import('mammoth/mammoth.browser');
  const result = await (mammoth.default || mammoth).extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value || '';
};

/** Extracts plain text from a PDF, DOCX or TXT resume. Throws an Error with a user-facing message. */
export const extractResumeText = async (file: File): Promise<string> => {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That file is larger than 8 MB. Try a smaller export of your resume.');
  const ext = extension(file.name);
  let text = '';
  try {
    if (ext === 'pdf' || file.type === 'application/pdf') text = await pdfToText(file);
    else if (ext === 'docx') text = await docxToText(file);
    else if (ext === 'txt' || file.type.startsWith('text/')) text = await file.text();
    else throw new Error('UNSUPPORTED');
  } catch (error: any) {
    if (error?.message === 'UNSUPPORTED') throw new Error('Please upload a PDF, DOCX or TXT file. Older .doc files need to be saved as .docx first.');
    console.error('Resume text extraction failed:', error);
    throw new Error("We couldn't read that file. Try another format, or paste your resume text instead.");
  }
  text = text.replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (text.length < 80) {
    throw new Error('No readable text was found. If this is a scanned or image-only PDF, paste your resume text instead.');
  }
  return text;
};
