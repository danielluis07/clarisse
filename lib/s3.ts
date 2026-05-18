export const client = new Bun.S3Client({
  region: process.env.AWS_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  bucket: process.env.AWS_BUCKET_NAME!,
});
