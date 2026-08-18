import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

/**
 * Middleware to log admin actions (POST, PUT, DELETE)
 */
export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  // Capture original send/json to intercept the response status
  const originalJson = res.json;
  
  res.json = function(body) {
    // Only log successful mutating actions (POST, PUT, DELETE)
    if (req.method !== 'GET' && res.statusCode >= 200 && res.statusCode < 300) {
      const user = (req as any).user;
      
      // If a user is logged in (should be admin due to requireAdmin middleware)
      if (user && user.id) {
        // Asynchronously log the action
        prisma.adminAuditLog.create({
          data: {
            adminId: user.id,
            action: `${req.method} ${req.originalUrl}`,
            details: JSON.stringify(req.body || {}),
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          }
        }).catch(err => {
          console.error('Failed to write audit log:', err);
        });
      }
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};
