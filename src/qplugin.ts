import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastq from 'fastq';

interface JobPayload {
id: number;
  a: number;
  b: number;
}

interface JobResult {
  status: string;
  result: number;
}

export const taskStore = new Map();

async function taskWorker(payload: JobPayload, cb: (err: Error | null, result?: JobResult) => void): Promise<JobResult> {
    taskStore.set(payload.id, { ...taskStore.get(payload.id), status: 'received', receivedAt: Date.now() });
    
    await new Promise(resolve => setTimeout(() => {
        taskStore.set(payload.id, { ...taskStore.get(payload.id), status: 'processing', startedAt: Date.now() });
        resolve(null);
    }, 10000));

    await new Promise(resolve => setTimeout(() => {
        taskStore.set(payload.id, { ...taskStore.get(payload.id), status: 'done', doneAt: Date.now(), result: payload.a + payload.b });
        resolve(null);
    }, 10000));
    
    console.log(`job ${payload.id} done`);
    
    cb(null, { status: 'done', result: payload.a + payload.b });
}

async function qplugin(fst: FastifyInstance) {
    const queue = fastq<JobPayload, JobResult>(taskWorker, 5);

    fst.decorate('queue', {
        task: queue,
    });
}

export default fp(qplugin);
