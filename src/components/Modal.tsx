import type { FC, Child } from 'hono/jsx';

interface ModalProps {
  id: string;
  title: string;
  children: Child;
  footer?: Child;
  maxWidth?: string;
}

export const Modal: FC<ModalProps> = ({ id, title, children, footer, maxWidth = 'max-w-lg' }) => {
  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden" id={id}>
      <div class="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onclick={`document.getElementById('${id}').classList.add('hidden')`}></div>
      <div class={`relative bg-surface-container-lowest w-full ${maxWidth} rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[90vh]`}>
        <div class="px-6 py-4 border-b border-surface-variant flex justify-between items-center">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
          <button
            class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high"
            onclick={`document.getElementById('${id}').classList.add('hidden')`}
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6 space-y-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div class="px-6 py-4 border-t border-surface-variant flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
