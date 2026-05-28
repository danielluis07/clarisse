export const sanitizeFilename = (filename: string) =>
  filename.replace(/^.*[\\/]/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
