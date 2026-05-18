const DB_ERROR_NAMES = new Set([
  "DatabaseUnavailableError",
  "PrismaClientInitializationError",
  "PrismaClientRustPanicError",
]);

const DB_ERROR_MESSAGE_PATTERNS = [
  /can't reach database server/i,
  /econnrefused/i,
  /database connection/i,
  /\bP1001\b/,
  /\bP1002\b/,
  /\bP1017\b/,
  /connection (?:terminated|closed) unexpectedly/i,
];

export function isDatabaseUnavailableError(error: Error): boolean {
  if (DB_ERROR_NAMES.has(error.name)) return true;
  return DB_ERROR_MESSAGE_PATTERNS.some(re => re.test(error.message));
}
