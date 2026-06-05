import Fastify, { FastifyInstance } from 'fastify';
import Mongodb from '@fastify/mongodb';
import { baseRoutes } from './routes';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import queuePlugin from './qplugin';

const app = Fastify({ logger: true })
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .register(Mongodb, {
        forceClose: true,
        url:'mongodb://localhost/test',
    })
    .register(queuePlugin)
    .register(baseRoutes)
    .listen({ port: 3000 }).then(() => {
        console.log('Listening on :3000');
    });
