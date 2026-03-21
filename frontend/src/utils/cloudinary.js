// frontend/src/utils/cloudinary.js

/**
 * Returns a corrected Cloudinary URL for raw files (PDF, DOC, etc.)
 * If the URL contains '/image/upload/' and the file extension indicates a raw type,
 * replace with '/raw/upload/'.
 */
export const getCorrectCloudinaryUrl = (url) => {
  if (!url) return url;
  // Check if it's a raw document (pdf, doc, docx, xls, xlsx, etc.)
  const isRaw = /\.(pdf|docx?|xlsx?|pptx?|txt)$/i.test(url);
  if (isRaw && url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/raw/upload/');
  }
  return url;
};

/**
 * Returns a Google Docs viewer URL for PDFs (embeds nicely)
 */
export const getPdfViewerUrl = (url) => {
  if (!url) return url;
  if (url.match(/\.pdf$/i)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
};