import type { FC } from 'hono/jsx';

export const ClientScript: FC<{ children: string }> = ({ children }) => (
  <script dangerouslySetInnerHTML={{ __html: children }}></script>
);
