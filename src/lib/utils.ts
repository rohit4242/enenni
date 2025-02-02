import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ReferenceIdProps {
  prefix: string;
  length: number;
}

export function generateReferenceId({ prefix, length }: ReferenceIdProps): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substring(2, length).toUpperCase()
  return `${prefix}-${dateStr}-${randomStr}`
}
