import { z } from "zod";
import { CryptoType } from "../types/db";

export const cryptoTypeSchema = z.nativeEnum(CryptoType);

export type CryptoTypeValidation = z.infer<typeof cryptoTypeSchema>;
