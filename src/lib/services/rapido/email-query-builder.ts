/**
 * Builds a Gmail API search query for finding Rapido receipt emails
 */
export function buildRapidoReceiptQuery(): string {
  // Rapido receipt email addresses
  const senderPatterns = ["shoutout@rapido.bike"];

  // Rapido receipt email subjects
  const subjectPatterns = ["trip with Rapido", "Rapido Invoice"];

  // Build sender query
  const fromQuery = senderPatterns.map((email) => `from:${email}`).join(" OR ");

  // Build subject query
  const subjectQuery = subjectPatterns
    .map((subject) => `subject:"${subject}"`)
    .join(" OR ");

  // Combine queries with AND operator
  const query = `(${fromQuery}) OR (${subjectQuery})`;

  return query;
}
