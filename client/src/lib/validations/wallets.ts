import { z } from "zod";
import { CryptoType } from "@prisma/client";

export const cryptoTypeSchema = z.nativeEnum(CryptoType);

export type CryptoTypeValidation = z.infer<typeof cryptoTypeSchema>;
