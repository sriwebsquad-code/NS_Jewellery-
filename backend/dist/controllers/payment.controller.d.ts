import { Request, Response } from 'express';
export declare const createPaymentOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const renderCheckoutPage: (req: Request, res: Response) => void;
//# sourceMappingURL=payment.controller.d.ts.map