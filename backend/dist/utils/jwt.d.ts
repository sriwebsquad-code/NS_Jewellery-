export interface JwtPayload {
    userId: string;
    role: string;
}
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map