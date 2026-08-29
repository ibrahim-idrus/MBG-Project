import type { FC } from 'hono/jsx';

interface FileUploadProps {
  label: string;
  hint?: string;
  accept?: string;
}

export const FileUpload: FC<FileUploadProps> = ({ label, hint = 'Maks. 5MB (JPG, PNG, PDF)', accept = 'image/*,.pdf' }) => {
  return (
    <div>
      <label class="block font-label-md text-label-md text-on-surface mb-2">{label}</label>
      <div class="border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group">
        <span class="material-symbols-outlined text-outline group-hover:text-primary text-3xl mb-2 transition-colors">upload_file</span>
        <p class="font-label-md text-label-md text-on-surface-variant group-hover:text-primary transition-colors">Klik untuk unggah atau seret file ke sini</p>
        <p class="font-body-sm text-body-sm text-outline mt-1 text-center">{hint}</p>
        <input type="file" accept={accept} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
};
