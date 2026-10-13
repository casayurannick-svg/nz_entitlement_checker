import type { NextApiRequest, NextApiResponse } from 'next';
import { WFF_CONSTANTS_2024 } from '../../lib/calculator/wff';
import {
  AS_MAX_CAPS_2024,
  AS_ENTRY_THRESHOLDS_2024,
  AS_ASSET_LIMITS,
} from '../../lib/calculator/accommodationSupplement';
import { FAMILYBOOST_CONSTANTS } from '../../lib/calculator/familyBoost';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Returns active statutory rates and limits
  return res.status(200).json({
    taxYear: '2024/2025',
    effectiveDate: '2024-07-01',
    wff: WFF_CONSTANTS_2024,
    accommodationSupplement: {
      caps: AS_MAX_CAPS_2024,
      entryThresholds: AS_ENTRY_THRESHOLDS_2024,
      assetLimits: AS_ASSET_LIMITS,
    },
    familyBoost: FAMILYBOOST_CONSTANTS,
  });
}
