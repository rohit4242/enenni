import { z } from "zod";

export const cryptoTypeSchema = z.nativeEnum(CryptoType);

export type CryptoTypeValidation = z.infer<typeof cryptoTypeSchema>;
