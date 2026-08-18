import { Request, Response } from 'express';
export declare const getPlans: (req: Request, res: Response) => Promise<void>;
export declare const purchasePlan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const payInstallment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const seedPlans: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=plans.controller.d.ts.map