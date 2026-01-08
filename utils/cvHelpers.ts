/**
 * CV Helper Utilities
 * Shared functions for CV data manipulation
 */

/**
 * Cleans job titles by extracting only the primary role.
 * Removes secondary roles, transferable skills sections, and additional qualifications.
 * 
 * @example
 * cleanJobTitle("Security Operative | Transferable Skills for Residential Support")
 * // Returns: "Security Operative"
 * 
 * @param title - The raw job title string
 * @returns The cleaned primary job title
 */
export const cleanJobTitle = (title: string): string => {
    if (!title) return title;

    // Remove everything after common separators
    const separators = ['|', ' - ', ' – ', ' — ', ' (', ' [', ' / '];

    for (const separator of separators) {
        const index = title.indexOf(separator);
        if (index > 0) {
            return title.substring(0, index).trim();
        }
    }

    return title;
};

/**
 * Formats a file size in bytes to a human-readable string.
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string like "1.5 MB"
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Sanitizes a string to be safe for use as a filename.
 * Removes special characters and limits length for cross-platform compatibility.
 * 
 * @param name - The raw string to sanitize
 * @param maxLength - Maximum length for the filename (default: 50)
 * @returns A clean, filesystem-safe filename
 */
export const sanitizeFileName = (name: string, maxLength: number = 50): string => {
    if (!name) return 'CV';

    return name
        .replace(/[<>:"/\\|?*]/g, '') // Remove illegal filename characters
        .replace(/\s+/g, '_')         // Replace spaces with underscores
        .replace(/[^\w\-_.]/g, '')    // Keep only word chars, hyphens, dots, underscores
        .replace(/_+/g, '_')          // Collapse multiple underscores
        .replace(/^_+|_+$/g, '')      // Trim leading/trailing underscores
        .substring(0, maxLength)      // Limit length
        || 'CV';                      // Fallback if result is empty
};
