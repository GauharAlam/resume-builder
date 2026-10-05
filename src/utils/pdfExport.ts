// Shared PDF export for a rendered resume. jsPDF and html2canvas are loaded
// from the CDN in index.html, so they can be missing (ad-blocker, offline).

export const sanitizeFilename = (name: string): string =>
  (name || "Resume").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80) || "Resume";

export const isPdfLibraryLoaded = (): boolean => {
  const w = window as any;
  return Boolean(w.jspdf?.jsPDF && w.html2canvas);
};

/** Captures `el` at its natural size and saves it as a multi-page A4 PDF. */
export const exportElementToPdf = async (el: HTMLElement, fileName: string): Promise<void> => {
  const w = window as any;
  const canvas = await w.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new w.jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const renderedHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = renderedHeight;
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, renderedHeight);
  heightLeft -= pdfHeight;
  // 1mm tolerance so a hairline of overflow doesn't add a blank page
  while (heightLeft > 1) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, renderedHeight);
    heightLeft -= pdfHeight;
  }
  pdf.save(`${sanitizeFilename(fileName)}.pdf`);
};
