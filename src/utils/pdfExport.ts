// Image-based PDF export, kept as a fallback for browsers where printing is
// unavailable. The preferred export is utils/printResume (real text PDF).

export const sanitizeFilename = (name: string): string =>
  (name || 'Resume').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80) || 'Resume';

const SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
];

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });

/** Loads jsPDF and html2canvas on first use. Resolves false if they can't be loaded (offline, ad-blocker). */
export const ensurePdfLibraries = async (): Promise<boolean> => {
  const w = window as any;
  if (w.jspdf?.jsPDF && w.html2canvas) return true;
  try {
    await Promise.all(SCRIPTS.map(loadScript));
  } catch {
    return false;
  }
  return Boolean(w.jspdf?.jsPDF && w.html2canvas);
};

/** Captures `el` at its natural size and saves it as a multi-page A4 PDF made of images. */
export const exportElementToPdf = async (el: HTMLElement, fileName: string): Promise<void> => {
  const w = window as any;
  const canvas = await w.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new w.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const renderedHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = renderedHeight;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, renderedHeight);
  heightLeft -= pdfHeight;
  // 1mm tolerance so a hairline of overflow doesn't add a blank page
  while (heightLeft > 1) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, renderedHeight);
    heightLeft -= pdfHeight;
  }
  pdf.save(`${sanitizeFilename(fileName)}.pdf`);
};
