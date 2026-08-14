import { User } from "../models/User";

/**
 * Resolve an AI-returned department string to the canonical department value
 * stored in the User collection for officers.
 *
 * n8n may return "Water Supply" while officers have "Water Supply Department".
 * This function finds the best matching officer department from the live DB.
 *
 * Returns the matched canonical department string, or the original value if
 * no match is found (so the complaint is still recorded with some department).
 */
export async function resolveAIDepartment(aiDepartment: string | undefined | null): Promise<string | null> {
  if (!aiDepartment || typeof aiDepartment !== "string") return null;

  const normalized = aiDepartment.trim();

  // 1. Fetch all unique officer department values from the live User collection
  const officerDepts: string[] = await User.distinct("department", {
    role: "officer",
    department: { $ne: null, $exists: true },
  });

  if (officerDepts.length === 0) {
    // No officers in DB — just return the raw value
    return normalized;
  }

  // 2. Exact match (case-insensitive)
  const exact = officerDepts.find(
    (d) => d.toLowerCase() === normalized.toLowerCase()
  );
  if (exact) return exact;

  // 3. Partial / keyword match — prefer the dept that contains the AI value or vice versa
  const partial = officerDepts.find(
    (d) =>
      d.toLowerCase().includes(normalized.toLowerCase()) ||
      normalized.toLowerCase().includes(d.toLowerCase().replace(" department", "").replace(" dept", "").trim())
  );
  if (partial) return partial;

  // 4. Word-level intersection — find dept with most overlapping words
  const aiWords = new Set(normalized.toLowerCase().replace(/department|dept/g, "").trim().split(/\s+/));
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const dept of officerDepts) {
    const deptWords = dept.toLowerCase().replace(/department|dept/g, "").trim().split(/\s+/);
    const score = deptWords.filter((w) => aiWords.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = dept;
    }
  }

  if (bestMatch && bestScore > 0) return bestMatch;

  // 5. No match found — return the raw AI value (stores something rather than undefined)
  return normalized;
}

/**
 * Resolve an officer User document for a given canonical department string.
 * Returns the first matching officer's _id (for assignedOfficer) or null.
 */
export async function resolveOfficerForDepartment(
  canonicalDept: string | null
): Promise<{ officerId: string | null; officerName: string | null; officerEmail: string | null }> {
  if (!canonicalDept) return { officerId: null, officerName: null, officerEmail: null };

  const officer = await User.findOne({
    role: "officer",
    department: canonicalDept,
  }).select("_id name email department");

  if (!officer) return { officerId: null, officerName: null, officerEmail: null };

  return {
    officerId: (officer._id as any).toString(),
    officerName: officer.name,
    officerEmail: officer.email ?? null,
  };
}
