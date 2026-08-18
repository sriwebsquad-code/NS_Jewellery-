import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to log admin actions (POST, PUT, DELETE)
 */
export declare const auditLog: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.middleware.d.ts.map