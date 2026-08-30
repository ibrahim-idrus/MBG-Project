import type { FC } from 'hono/jsx';
import { getTailwindConfig } from '../../config/tailwind.js';

interface LoginPageProps {
  error?: string;
  next?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ error, next }) => {
  const tailwindConfig = getTailwindConfig();

  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MBG Transparansi - Login</title>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script id="tailwind-config" dangerouslySetInnerHTML={{ __html: `tailwind.config = ${tailwindConfig}` }}></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
          .auth-shadow { box-shadow: 0px 8px 30px rgba(0,0,0,0.04); }
          .input-focus:focus-within { border-color: #4b329f; box-shadow: 0px 0px 0px 4px rgba(99,76,184,0.1); }
        `}}></style>
      </head>
      <body class="bg-surface min-h-screen flex flex-col font-body-md text-on-surface">
        <main class="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
          <div class="absolute inset-0 pointer-events-none opacity-40">
            <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-inverse-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>

          <div class="bg-surface-card w-full max-w-container-max-width rounded-xl auth-shadow relative z-10 p-6 sm:p-10 flex flex-col gap-section-gap">
            <div class="text-center flex flex-col gap-2">
              <div class="flex justify-center mb-4 text-primary">
                <span class="material-symbols-outlined text-5xl" style="font-variation-settings: 'FILL' 1;">assured_workload</span>
              </div>
              <h1 class="font-headline-md text-headline-md sm:text-display-lg text-on-surface">MBG Transparansi</h1>
              <p class="font-body-lg text-body-lg text-on-surface-muted">Selamat Datang Kembali</p>
            </div>

            <form action="/login" method="post" class="flex flex-col gap-form-stack w-full">
              {error ? <div role="alert" aria-live="polite" class="rounded-lg bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">{error}</div> : null}
              {next ? <input type="hidden" name="next" value={next} /> : null}
              <div class="flex flex-col gap-2">
                <label class="font-label-lg text-label-lg text-on-surface" for="email">Email</label>
                <div class="relative flex items-center border border-border-subtle rounded-lg bg-surface-card input-focus transition-all duration-200">
                  <span class="material-symbols-outlined absolute left-3 text-on-surface-muted pointer-events-none">mail</span>
                  <input type="email" id="email" name="email" placeholder="Masukkan alamat email Anda" required class="w-full pl-10 pr-4 py-3 bg-transparent border-none rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder-on-surface-muted" />
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <label class="font-label-lg text-label-lg text-on-surface" for="password">Kata Sandi</label>
                  <a href="#" class="font-label-md text-label-md text-primary hover:underline transition-all">Lupa Kata Sandi?</a>
                </div>
                <div class="relative flex items-center border border-border-subtle rounded-lg bg-surface-card input-focus transition-all duration-200">
                  <span class="material-symbols-outlined absolute left-3 text-on-surface-muted pointer-events-none">lock</span>
                  <input type="password" id="password" name="password" placeholder="Masukkan kata sandi Anda" required class="w-full pl-10 pr-10 py-3 bg-transparent border-none rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder-on-surface-muted" />
                  <button type="button" aria-label="Toggle password visibility" class="absolute right-3 text-on-surface-muted hover:text-primary transition-colors focus:outline-none">
                    <span class="material-symbols-outlined">visibility_off</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input type="checkbox" id="remember" name="remember" class="w-4 h-4 text-primary bg-surface-card border-border-subtle rounded focus:ring-primary-container focus:ring-2" />
                <label for="remember" class="font-body-md text-body-md text-on-surface-muted cursor-pointer select-none">Biarkan saya tetap masuk</label>
              </div>

              <button type="submit" class="w-full py-3 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:bg-on-primary-fixed-variant transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm">
                <span>Masuk</span>
                <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
              </button>
            </form>

            <div class="text-center mt-2">
              <p class="font-body-md text-body-md text-on-surface-muted">
                Belum punya akun? <a href="/register" class="font-label-lg text-label-lg text-primary hover:underline transition-all">Daftar di sini</a>
              </p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
};
