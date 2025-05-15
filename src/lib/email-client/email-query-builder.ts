/**
 * Builds a Gmail API search query for finding Uber receipt emails
 */
export function buildUberReceiptQuery(): string {
  // Common Uber receipt email addresses
  const senderPatterns = [
    "receipts@uber.com",
    "uber.receipts@uber.com",
    "noreply@uber.com",
  ];

  // Common Uber receipt email subjects
  const subjectPatterns = [
    "trip with Uber",
    "Your Uber Receipt",
    "Your receipt from",
    "Thanks for riding",
    "Your Uber Eats order",
    "Receipt for your Uber",
    "Your order with Uber",
  ];

  // Build sender query
  const fromQuery = senderPatterns.map((email) => `from:${email}`).join(" OR ");

  // Build subject query
  const subjectQuery = subjectPatterns
    .map((subject) => `subject:"${subject}"`)
    .join(" OR ");

  // Combine queries with AND operator
  const query = `(${fromQuery}) AND (${subjectQuery})`;

  // Date filtering will be handled by the Gmail client
  // The actual dates are added as after: and before: parameters

  return query;
}
