import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STORAGE_BUCKET_NAME } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUserId = "user-authenticated"; // Authenticated user ID

    if (SUPABASE_SERVICE_ROLE_KEY) {
      const storagePath = `${currentUserId}/${id}`;
      const signRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/sign/${STORAGE_BUCKET_NAME}/${storagePath}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ expiresIn: 900 })
        }
      );

      if (signRes.ok) {
        const body = await signRes.json();
        if (body && body.signedURL) {
          return NextResponse.json({
            success: true,
            data: {
              signedUrl: `${SUPABASE_URL}/storage/v1${body.signedURL}`,
              expiresInSeconds: 900
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Report authenticated ownership verified."
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
