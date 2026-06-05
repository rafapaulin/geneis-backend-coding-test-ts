import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { HEALTH, TEST } from '../schemas';
import { taskStore } from '../qplugin';
import z from 'zod';

export default async function baseRoutes(fastify: FastifyInstance) {
    fastify
        .withTypeProvider<ZodTypeProvider>()
        .route({
            method: 'GET',
            url: '/health',
            schema: HEALTH,
            handler: async () => ({ status: 'ok' }),
        })
        .route({
            method: 'GET',
            url: '/jobstatus/:jobId',
            schema: {
                params: z.object({ jobId: z.string() })
            },
            handler: async (req) => ({ status: 'ok', jobId: req.params.jobId }),
        })
        .route({
            method: 'POST',
            url: '/test',
            schema: { body: TEST.POST },
            handler: async (req) => ({ foo: `received ${req.body.foo}`, bar: `received ${req.body.bar}` }),
        })
        .route({
            method: 'POST',
            url: '/calc',
            schema: { body: TEST.CALC },
            handler: async (req) => {
                (fastify as any).queue.task.push({ ...req.body, id: req.id });

                taskStore.set(req.id, { status: 'queued', queuedAt: Date.now() });

                return { queue: 'accepted', jobId: req.id };
            },
        })
        .route({
            method: 'GET',
            url: '/jobStatus/:jobId',
            schema: {
                params: z.object({ jobId: z.string() })
            },
            handler: async (req, reply) => {
                const task = taskStore.get(req.params.jobId);

                if (!task) {
                    return reply.status(404).send({ error: 'Task not found' });
                }

                return task;
            },
        })
        .route({
            method: 'GET',
            url: '/queueStatus',
            handler: async () => ({ 
                waitingTasks: fastify.queue.task.length(), 
                workersRunning: fastify.queue.task.running(), 
            }),
        });
}
