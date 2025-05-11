// lib/query.ts
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Pulls a named query-param from req.query, ensures it’s a single string,
 * parses it as base-10 integer, and sends a 400 response if anything’s wrong.
 * @returns the parsed number, or null if a 400 has been sent.
 */
export function parseQueryParamAsInt(
  req: NextApiRequest,
  res: NextApiResponse,
  name: string
): number | null {
  const raw = req.query[name];
  // normalize to string
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!str) {
    res.status(400).json({ error: `Missing "${name}" parameter` });
    return null;
  }

  const n = parseInt(str, 10);
  if (Number.isNaN(n)) {
    res.status(400).json({ error: `"${name}" must be a number` });
    return null;
  }

  return n;
}
