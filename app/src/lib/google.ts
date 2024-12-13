import { Storage } from "@google-cloud/storage"

if (!process.env.GCP_PROJECT_ID) {
  throw new Error(
    "Please define GCP_PROJECT_ID and other GCP variables in env.",
  )
}

if (!process.env.GCP_STORAGE_BUCKET) {
  throw new Error("Please define GCP_STORAGE_BUCKET in env.")
}

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    type: "service_account",
    project_id: process.env.GCP_PROJECT_ID,
    private_key_id: process.env.GCP_PRIVATE_KEY_ID,
    private_key: process.env.GCP_PRIVATE_KEY,
    client_email: process.env.GCP_CLIENT_EMAIL,
    client_id: process.env.GCP_CLIENT_ID,
  },
})

const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET)

export async function uploadToBucket(
  file: Buffer,
  filename: string,
): Promise<string> {
  const fileRef = bucket.file(filename)
  await fileRef.save(file)
  return fileRef.publicUrl()
}
