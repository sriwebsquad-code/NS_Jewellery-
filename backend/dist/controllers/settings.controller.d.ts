import { Request, Response } from 'express';
/**
 * Get App Settings (Public)
 * Used by mobile app to fetch WhatsApp number, etc.
 */
export declare const getSettings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update App Settings (Admin Only)
 */
export declare const updateSettings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=settings.controller.d.ts.map