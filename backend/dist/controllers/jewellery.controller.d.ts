import { Request, Response } from 'express';
export declare const createCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCategories: (req: Request, res: Response) => Promise<void>;
export declare const createJewelleryItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getJewelleryItems: (req: Request, res: Response) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=jewellery.controller.d.ts.map