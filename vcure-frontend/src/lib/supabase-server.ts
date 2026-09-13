/**
 * Server-only Supabase REST Client.
 * Uses SUPABASE_SERVICE_ROLE_KEY for secure storage operations.
 * NEVER exposed to client/browser JS.
 */

export const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://mlmlhnealtveagtvbhqw.supabase.co";

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

export const STORAGE_BUCKET_NAME =
  process.env.SUPABASE_STORAGE_BUCKET || "medical-reports";

export async function uploadToSupabaseStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<{ success: boolean; url?: string; message?: string }> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: false,
      message: "SUPABASE_SERVICE_ROLE_KEY is unconfigured in environment."
    };
  }

  try {
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET_NAME}/${storagePath}`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": contentType,
        "x-upsert": "true"
      },
      body: new Uint8Array(buffer)
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, message: `Supabase Storage upload failed: ${errText}` };
    }

    // Generate signed retrieval URL
    const signedRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/${STORAGE_BUCKET_NAME}/${storagePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ expiresIn: 3600 })
      }
    );

    let signedUrl = "";
    if (signedRes.ok) {
      const signBody = await signedRes.json();
      if (signBody && signBody.signedURL) {
        signedUrl = `${SUPABASE_URL}/storage/v1${signBody.signedURL}`;
      }
    }

    return {
      success: true,
      url: signedUrl || `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET_NAME}/${storagePath}`
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Storage upload exception" };
  }
}
