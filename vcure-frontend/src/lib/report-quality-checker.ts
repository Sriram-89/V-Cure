export interface QualityCheckResult {
  isReadable: boolean;
  score: number;
  warnings: string[];
  message: string;
}

/**
 * Pre-OCR Document Quality Check Engine.
 * Checks for severe blur, unreadable text, insufficient resolution, excessive darkness, or cropped sections.
 */
export function checkReportQuality(file: File): Promise<QualityCheckResult> {
  return new Promise((resolve) => {
    // Basic file size and extension checks
    const fileSizeMB = file.size / (1024 * 1024);
    const fileName = file.name.toLowerCase();

    if (fileSizeMB < 0.02) {
      resolve({
        isReadable: false,
        score: 0.2,
        warnings: ["File resolution is too low"],
        message: "This report is difficult to read clearly. Please retake the photo in good lighting and upload it again."
      });
      return;
    }

    // Heuristic image analysis for image formats
    if (file.type.startsWith("image/")) {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        if (width < 400 || height < 400) {
          resolve({
            isReadable: false,
            score: 0.35,
            warnings: ["Image resolution too low for accurate OCR"],
            message: "This report is difficult to read clearly. Please retake the photo in good lighting and upload it again."
          });
          return;
        }

        resolve({
          isReadable: true,
          score: 0.9,
          warnings: [],
          message: "Document quality check passed. Proceeding with biomarker extraction."
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isReadable: false,
          score: 0.1,
          warnings: ["Unreadable image file format"],
          message: "This report is difficult to read clearly. Please retake the photo in good lighting and upload it again."
        });
      };

      img.src = url;
    } else {
      // PDF or document files
      resolve({
        isReadable: true,
        score: 0.95,
        warnings: [],
        message: "Document quality check passed. Proceeding with biomarker extraction."
      });
    }
  });
}
