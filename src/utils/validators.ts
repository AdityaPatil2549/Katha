import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty);
};

export const validateStoryTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title.trim()) {
    return { isValid: false, error: 'Story title is required' };
  }
  if (title.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' };
  }
  return { isValid: true };
};

export const validateQuote = (quote: string): { isValid: boolean; error?: string } => {
  if (!quote.trim()) {
    return { isValid: false, error: 'Quote is required' };
  }
  if (quote.length > 500) {
    return { isValid: false, error: 'Quote must be less than 500 characters' };
  }
  return { isValid: true };
};

export const validateRating = (rating: number): { isValid: boolean; error?: string } => {
  if (rating < 0 || rating > 10) {
    return { isValid: false, error: 'Rating must be between 0 and 10' };
  }
  return { isValid: true };
};
