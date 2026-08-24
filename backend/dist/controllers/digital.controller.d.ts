import { Request, Response } from 'express';
export declare const getBalance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTransactions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLockerDashboard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDigitalUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserMetalTransactions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const redeemUserMetal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=digital.controller.d.ts.map