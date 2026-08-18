import { Request, Response } from 'express';
export declare const verifyFirebaseOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createMPIN: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginWithMPIN: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requestMpinReset: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resetMpin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map