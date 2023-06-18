import 'server-only';

import { z } from 'zod';

const ServerConfig = z.object({
  github: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
  }),
  dato: z.object({
    endpoint: z.string(),
    token: z.string(),
  }),
  analytics: z.object({
    containerId: z.string().optional(),
    trackingId: z.string().optional(),
  }),
});

export type ServerConfig = z.infer<typeof ServerConfig>;

export const serverConfig = ServerConfig.parse({
  dato: {
    endpoint: process.env.DATO_ENDPOINT,
    token: process.env.DATO_TOKEN,
  },
  github: {
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  },
  analytics: {
    containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER,
    trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },
});