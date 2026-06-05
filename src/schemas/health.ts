import z from 'zod';

export const OK = z.object({
    status: z.string(),
});

export default z.object({
    response: z.object({
        200: OK,
    })
});
