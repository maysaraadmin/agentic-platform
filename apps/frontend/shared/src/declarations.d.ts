declare module 'shared/auth' {
  export const API_URL: string;

  export interface JwtPayload {
    sub?: string;
    username?: string;
    name?: string;
    roles?: string[];
    active?: boolean;
    exp?: number;
  }

  export function getAuthHeaders(): Record<string, string>;
  export function decodeJwtPayload(token: string): JwtPayload | null;
}

declare module 'shared/styles.css' {
  const content: string;
  export default content;
}

declare module 'mfeChat/Module' {
  import { FC } from 'react';
  const Module: FC;
  export default Module;
}

declare module 'mfeDashboard/Module' {
  import { FC } from 'react';
  const Module: FC;
  export default Module;
}
