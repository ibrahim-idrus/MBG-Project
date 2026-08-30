import type { FC } from 'hono/jsx';
import { getTailwindConfig } from '../../config/tailwind.js';

interface RegisterPageProps {
  error?: string;
}

export const RegisterPage: FC<RegisterPageProps> = ({ error }) => {
  const tailwindConfig = getTailwindConfig();

  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MBG Transparansi - Register</title>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script id="tailwind-config" dangerouslySetInnerHTML={{ __html: `tailwind.config = ${tailwindConfig}` }}></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
          .shadow-ambient { box-shadow: 0px 8px 30px rgba(0,0,0,0.04); }
        `}}></style>
      </head>
      <body class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col justify-between">
        <header class="bg-surface fixed top-0 w-full z-50">
          <div class="flex justify-between items-center px-inline-padding h-16 w-full max-w-[1200px] mx-auto">
            <a href="/login" class="flex items-center gap-2 cursor-pointer active:opacity-80">
              <span class="material-symbols-outlined text-primary">account_balance</span>
              <span class="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary tracking-tight">MBG Transparansi</span>
            </a>
            <div class="flex items-center gap-4">
              <a href="#" class="text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer active:opacity-80">
                <span class="material-symbols-outlined">help_outline</span>
              </a>
            </div>
          </div>
        </header>

        <main class="flex-grow flex items-center justify-center pt-24 pb-12 px-4 md:px-0">
          <div class="w-full max-w-container-max-width bg-surface-card rounded-xl shadow-ambient p-8 md:p-10 mx-auto">
            <div class="text-center mb-8">
              <h1 class="font-headline-md text-headline-md text-on-surface mb-2">Buat Akun Baru</h1>
              <p class="font-body-md text-body-md text-on-surface-muted">Lengkapi data di bawah untuk bergabung dengan MBG Transparansi.</p>
            </div>

            <div class="flex items-center justify-center gap-2 mb-8">
              <div class="h-1.5 w-8 rounded-full bg-primary"></div>
              <div class="h-1.5 w-8 rounded-full bg-surface-variant"></div>
              <div class="h-1.5 w-8 rounded-full bg-surface-variant"></div>
            </div>

            <form action="/register" method="post" class="space-y-form-stack">
              {error ? <div role="alert" aria-live="polite" class="rounded-lg bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">{error}</div> : null}
              <div>
                <label class="block font-label-lg text-label-lg text-on-surface mb-1.5" for="fullname">Nama Lengkap</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                  <input type="text" id="fullname" name="fullname" placeholder="Masukkan nama lengkap" required class="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label class="block font-label-lg text-label-lg text-on-surface mb-1.5" for="email">Email</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input type="email" id="email" name="email" placeholder="contoh@email.com" required class="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label class="block font-label-lg text-label-lg text-on-surface mb-1.5" for="password">Kata Sandi</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input type="password" id="password" name="password" placeholder="Minimal 8 karakter" required class="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="block font-label-lg text-label-lg text-on-surface mb-1.5" for="confirm_password">Konfirmasi Kata Sandi</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input type="password" id="confirm_password" name="confirm_password" placeholder="Ulangi kata sandi" required class="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none">
                    <span class="material-symbols-outlined">visibility_off</span>
                  </button>
                </div>
              </div>

              <div class="flex items-start gap-2 pt-2">
                <div class="flex items-center h-5">
                  <input type="checkbox" id="terms" name="terms" required class="w-4 h-4 text-primary bg-surface-container-lowest border-border-subtle rounded focus:ring-primary focus:ring-2 cursor-pointer" />
                </div>
                <label for="terms" class="font-body-md text-body-md text-on-surface-muted cursor-pointer select-none">
                  Saya menyetujui <a href="#" class="text-primary font-semibold hover:underline">Syarat &amp; Ketentuan</a> serta <a href="#" class="text-primary font-semibold hover:underline">Kebijakan Privasi</a> MBG Transparansi.
                </label>
              </div>

              <button type="submit" class="w-full bg-primary text-on-primary font-label-lg text-label-lg py-3 px-4 rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] mt-6 flex justify-center items-center gap-2">
                Daftar
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            <div class="mt-8 text-center border-t border-border-subtle pt-6">
              <p class="font-body-md text-body-md text-on-surface-muted">
                Sudah punya akun? <a href="/login" class="text-primary font-semibold hover:underline transition-all">Masuk di sini</a>
              </p>
            </div>
          </div>
        </main>

        <footer class="bg-transparent w-full py-8 mt-auto">
          <div class="flex flex-col items-center gap-4 w-full max-w-container-max-width mx-auto px-inline-padding">
            <div class="flex gap-4">
              <a href="#" class="text-on-surface-muted font-label-md text-label-md hover:text-primary hover:underline transition-all duration-200">Kebijakan Privasi</a>
              <a href="#" class="text-on-surface-muted font-label-md text-label-md hover:text-primary hover:underline transition-all duration-200">Syarat &amp; Ketentuan</a>
              <a href="#" class="text-on-surface-muted font-label-md text-label-md hover:text-primary hover:underline transition-all duration-200">Bantuan</a>
            </div>
            <p class="text-on-surface-muted font-label-md text-label-md text-center">&copy; 2024 MBG Transparansi. Seluruh hak cipta dilindungi.</p>
          </div>
        </footer>
      </body>
    </html>
  );
};
