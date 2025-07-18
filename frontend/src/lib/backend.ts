import { User } from "firebase/auth";

const BACKEND_URL = "https://resmoai-backend-421758484376.europe-west1.run.app";

// fileUrl is the storage path (e.g., 'resumes/userid/filename.pdf')
export async function optimizeResume({ prompt, fileUrl, user }: { prompt: string, fileUrl: string, user: User }) {
  const idToken = await user.getIdToken();
  const response = await fetch(`${BACKEND_URL}/optimize-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_token: idToken,
      prompt,
      file_url: fileUrl,
    }),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

export async function createResume({ prompt, fileUrl, user }: { prompt: string, fileUrl?: string, user: User }) {
  const idToken = await user.getIdToken();
  const response = await fetch(`${BACKEND_URL}/create-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_token: idToken,
      prompt,
      file_url: fileUrl || null,
    }),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}