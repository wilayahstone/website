// Server-only Next.js adapter. Private keys are never exported to client components.
import {nodeEnvironment} from './runtime-config';
export const env=nodeEnvironment(process.env);
