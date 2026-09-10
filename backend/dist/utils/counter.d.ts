/**
 * Gets the next sequence number for a given counter and returns it formatted with the given prefix.
 * Example: getNextSequence('digisilver', 'digisilver') -> 'digisilver001'
 * Example: getNextSequence('gold_value_scheme', 'Gold Value Schemes') -> 'Gold Value Schemes001'
 */
export declare const getNextSequence: (counterId: string, prefix: string) => Promise<string>;
//# sourceMappingURL=counter.d.ts.map