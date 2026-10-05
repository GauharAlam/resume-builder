import React from 'react';
import { createRoot } from 'react-dom/client';
import { ResumeData, TemplateID } from '@/types';
import { ResumeTemplate } from '@/components/templates';
import { sanitizeFilename } from './pdfExport';

const ROOT_ID = 'resume-print-root';
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
// Animation frames don't fire in background tabs, and a font request can stall;
// neither should be able to block the print dialog from opening.
const nextFrame = () => Promise.race([new Promise<void>((resolve) => requestAnimationFrame(() => resolve())), wait(120)]);

export const canPrint = (): boolean => typeof window !== 'undefined' && typeof window.print === 'function';

/**
 * Opens the browser's print dialog with only the resume on the page, so
 * "Save as PDF" produces a real text PDF: selectable, searchable and readable
 * by applicant tracking systems. (The old export saved a screenshot.)
 *
 * The table wrapper gives every printed page a top and bottom margin; the
 * matching rules live in styles/app.css under "@media print".
 */
export const printResume = async (options: { template: TemplateID; data: ResumeData; title: string }): Promise<void> => {
  if (!canPrint()) throw new Error('Printing is not available in this browser.');

  document.getElementById(ROOT_ID)?.remove();
  const host = document.createElement('div');
  host.id = ROOT_ID;
  document.body.appendChild(host);
  const root = createRoot(host);
  root.render(
    <table className="resume-print-table">
      <thead>
        <tr>
          <td>
            <div className="resume-print-spacer" />
          </td>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td>
            <div className="resume-print-spacer" />
          </td>
        </tr>
      </tfoot>
      <tbody>
        <tr>
          <td>
            <div className="resume-print-page">
              <ResumeTemplate template={options.template} data={options.data} />
            </div>
          </td>
        </tr>
      </tbody>
    </table>,
  );

  // Let React commit and web fonts settle before the page is laid out for print
  await nextFrame();
  await nextFrame();
  if (document.fonts?.ready) await Promise.race([document.fonts.ready, wait(1500)]);

  // The document title becomes the suggested file name in "Save as PDF"
  const previousTitle = document.title;
  document.title = sanitizeFilename(options.title);
  document.body.classList.add('printing-resume');

  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    document.body.classList.remove('printing-resume');
    document.title = previousTitle;
    root.unmount();
    host.remove();
  };
  window.addEventListener('afterprint', cleanup);

  window.print();
};
