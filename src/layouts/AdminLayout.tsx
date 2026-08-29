import type { FC, Child } from 'hono/jsx';
import { getTailwindConfig } from '../config/tailwind.js';
import { Sidebar } from '../components/Sidebar.js';
import { Header } from '../components/Header.js';

interface AdminLayoutProps {
  title: string;
  activePage: string;
  variant?: 'admin' | 'user';
  children: Child;
}

export const AdminLayout: FC<AdminLayoutProps> = ({ title, activePage, variant = 'admin', children }) => {
  const tailwindConfig = getTailwindConfig();

  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} - MBG Transparansi</title>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script id="tailwind-config" dangerouslySetInnerHTML={{ __html: `tailwind.config = ${tailwindConfig}` }}></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}}></style>
      </head>
      <body class="bg-background text-on-background font-body-md min-h-screen flex">
        <Sidebar activePage={activePage} variant={variant} />
        <div class="flex-1 flex flex-col md:ml-[240px] w-full md:w-[calc(100%-240px)] min-h-screen">
          <Header title={title} />
          <main class="flex-1 p-container-margin overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
};
