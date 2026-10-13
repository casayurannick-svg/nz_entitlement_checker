import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../db';
import { msdPostcodeAreas } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postcode } = req.query;
  if (!postcode || typeof postcode !== 'string') {
    return res.status(400).json({ error: 'Postcode parameter is required' });
  }

  const cleanPostcode = postcode.trim().padStart(4, '0');

  try {
    const records = await db
      .select()
      .from(msdPostcodeAreas)
      .where(eq(msdPostcodeAreas.postcode, cleanPostcode))
      .limit(1);

    if (records.length === 0) {
      return res.status(404).json({
        found: false,
        message: `Postcode ${cleanPostcode} not found in database. Please select your Area manually.`,
      });
    }

    return res.status(200).json({
      found: true,
      data: records[0],
    });
  } catch (error) {
    console.error('Failed to lookup postcode:', error);
    return res.status(500).json({ error: 'Internal server error looking up postcode' });
  }
}
