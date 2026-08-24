import { Request, Response } from 'express';
export declare const getPlans: (req: Request, res: Response) => Promise<void>;
export declare const createPlan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const joinPlan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserPlans: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const payInstallment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPlanUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserPlanTransactions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyPlanTransactions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const redeemUserPlan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=plans.controller.d.ts.map