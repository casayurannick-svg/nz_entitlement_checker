import type { NextApiRequest, NextApiResponse } from 'next';
import { WFF_CONSTANTS_2026, WFF_CONSTANTS_2024 } from '../../lib/calculator/wff';
import {
  AS_MAX_CAPS_2024,
  AS_ENTRY_THRESHOLDS_2024,
  AS_ASSET_LIMITS,
} from '../../lib/calculator/accommodationSupplement';
import {
  FAMILYBOOST_CONSTANTS_2026,
  FAMILYBOOST_CONSTANTS_2024,
} from '../../lib/calculator/familyBoost';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Returns active 2026 statutory rates and limits with 2024 comparison
  return res.status(200).json({
    activeTaxYear: '2026',
    rates2026: {
      wff: WFF_CONSTANTS_2026,
      familyBoost: FAMILYBOOST_CONSTANTS_2026,
      accommodationSupplement: {
        caps: AS_MAX_CAPS_2024,
        entryThresholds: AS_ENTRY_THRESHOLDS_2024,
        assetLimits: AS_ASSET_LIMITS,
      },
    },
    historical2024: {
      wff: WFF_CONSTANTS_2024,
      familyBoost: FAMILYBOOST_CONSTANTS_2024,
    },
  });
}
