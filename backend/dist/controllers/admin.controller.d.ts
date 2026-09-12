import { Request, Response } from 'express';
export declare const getDashboardStats: (req: Request, res: Response) => Promise<void>;
export declare const getTransactions: (req: Request, res: Response) => Promise<void>;
export declare const verifyTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyAdminPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=admin.controller.d.ts.map