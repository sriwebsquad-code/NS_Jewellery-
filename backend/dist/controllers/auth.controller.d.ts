import { Request, Response } from 'express';
export declare const sendOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createMPIN: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginWithMPIN: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requestMpinReset: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyMpinResetOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resetMpin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendEmailOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyOtpOnly: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map