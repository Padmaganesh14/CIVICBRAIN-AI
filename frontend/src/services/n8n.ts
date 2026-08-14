import { apiFetch } from "@/lib/session";

export interface ComplaintResponse {
  success: boolean;
  data?: {
    output?: {
      summary?: string;
      issue?: string;
      department?: string;
      reason?: string;
    };
  };
  message?: string;
}

export async function analyzeComplaint(
  formData: FormData
): Promise<ComplaintResponse> {
  try {
    const res = await apiFetch("/api/complaints/analyze", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    return json;
  } catch (error: any) {
    console.error("n8n analysis proxy error:", error);
    return {
      success: false,
      message: error.message || "Failed to analyze complaint via backend proxy",
    };
  }
}
