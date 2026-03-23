import { useState, useEffect, useCallback, RefObject } from 'react';

// A4 dimensions at 96 DPI
const A4_HEIGHT_PX = 1123; // 297mm at 96 DPI
const A4_WIDTH_PX = 794;   // 210mm at 96 DPI

// Minimum and maximum scale factors
const MIN_SCALE = 0.65; // Don't go below 65% (roughly 9px font)
const MAX_SCALE = 1.0;  // Don't go above 100%

interface UseAutoFitOptions {
    enabled: boolean;
    targetHeight?: number;
    minScale?: number;
    maxScale?: number;
}

interface UseAutoFitReturn {
    scale: number;
    isOverflowing: boolean;
    contentHeight: number;
    fitPercentage: number;
    recalculate: () => void;
}

/**
 * Custom hook to auto-fit resume content to one page
 * Monitors content height and calculates optimal scale factor
 */
export const useAutoFit = (
    contentRef: RefObject<HTMLElement>,
    options: UseAutoFitOptions
): UseAutoFitReturn => {
    const {
        enabled,
        targetHeight = A4_HEIGHT_PX,
        minScale = MIN_SCALE,
        maxScale = MAX_SCALE
    } = options;

    const [scale, setScale] = useState(1);
    const [contentHeight, setContentHeight] = useState(0);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const calculateFit = useCallback(() => {
        if (!contentRef.current || !enabled) {
            setScale(maxScale);
            setIsOverflowing(false);
            return;
        }

        // Get the actual content height (unscaled)
        const element = contentRef.current;

        // Temporarily reset scale to measure true content height
        const originalTransform = element.style.transform;
        element.style.transform = 'scale(1)';

        // Force reflow to get accurate measurement
        const actualHeight = element.scrollHeight;

        // Restore original transform
        element.style.transform = originalTransform;

        setContentHeight(actualHeight);

        if (actualHeight <= targetHeight) {
            // Content fits without scaling
            setScale(maxScale);
            setIsOverflowing(false);
        } else {
            // Calculate required scale to fit
            const requiredScale = targetHeight / actualHeight;
            const clampedScale = Math.max(minScale, Math.min(maxScale, requiredScale));

            setScale(clampedScale);
            setIsOverflowing(clampedScale === minScale && actualHeight * clampedScale > targetHeight);
        }
    }, [contentRef, enabled, targetHeight, minScale, maxScale]);

    // Recalculate on mount and when dependencies change
    useEffect(() => {
        calculateFit();
    }, [calculateFit]);

    // Set up ResizeObserver to recalculate when content changes
    useEffect(() => {
        if (!contentRef.current || !enabled) return;

        const resizeObserver = new ResizeObserver(() => {
            // Debounce the recalculation
            requestAnimationFrame(calculateFit);
        });

        resizeObserver.observe(contentRef.current);

        // Also observe mutations (content changes)
        const mutationObserver = new MutationObserver(() => {
            requestAnimationFrame(calculateFit);
        });

        mutationObserver.observe(contentRef.current, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [contentRef, enabled, calculateFit]);

    // Calculate fit percentage (how well content fits the page)
    const fitPercentage = contentHeight > 0
        ? Math.min(100, Math.round((targetHeight / contentHeight) * 100))
        : 100;

    return {
        scale,
        isOverflowing,
        contentHeight,
        fitPercentage,
        recalculate: calculateFit
    };
};

export default useAutoFit;
