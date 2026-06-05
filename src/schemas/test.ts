import z from 'zod';

export const POST = z.object({
    foo: z.string(),
    bar: z.string(),
});
export const CALC = z.object({
    a: z.number(),
    b: z.number(),
});
