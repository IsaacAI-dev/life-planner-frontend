'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { authApi } from '@/lib/api/auth';
import { publicApi } from '@/lib/api/public';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useToast } from '@/lib/providers/ToastProvider';

const MAX_BYTES = 5 * 1024 * 1024;

/** Choosing a preset clears an uploaded photo, and uploading clears the preset. */
export function AvatarPickerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuth();
  const notify = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: presets } = useQuery({
    queryKey: ['avatar-presets'],
    queryFn: publicApi.avatarPresets,
    enabled: open,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = () => reject(new Error('Could not read that file.'));
        reader.readAsDataURL(file);
      });
      return authApi.uploadAvatar({ imageBase64, mimeType: file.type });
    },
    onSuccess: (updated) => {
      setUser(updated);
      notify('Photo updated');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const selectPreset = useMutation({
    mutationFn: (presetKey: string) => authApi.selectAvatarPreset(presetKey),
    onSuccess: (updated) => setUser(updated),
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const removeAvatar = useMutation({
    mutationFn: authApi.removeAvatar,
    onSuccess: (updated) => {
      setUser(updated);
      notify('Back to your initials');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      notify('That image is over 5 MB.', 'error');
      return;
    }
    upload.mutate(file);
  };

  const currentPreset = presets?.find((preset) => preset.key === user?.avatarPresetKey);

  return (
    <Dialog open={open} onClose={onClose} title="Profile photo">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-line-2 bg-surface-3 p-3.5">
          <Avatar name={user?.name ?? 'You'} src={user?.avatarUrl} size={52} />
          <div className="flex flex-col">
            <span className="text-sm font-bold">
              {currentPreset ? `${currentPreset.label} · from our set` : 'Your photo'}
            </span>
            <span className="text-xs text-muted">Shown on your board and in shared plans.</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Upload</span>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex items-center gap-3 rounded-xl border border-dashed border-line-dash p-3.5 text-left"
          >
            <span className="flex size-10 flex-none items-center justify-center rounded-lg bg-surface-4 text-violet-ink">
              <Upload size={18} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold">
                {upload.isPending ? 'Uploading…' : 'Upload a photo'}
              </span>
              <span className="text-xs text-muted">PNG or JPG, up to 5 MB</span>
            </span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0])}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
            Or pick one of ours
          </span>

          <div className="grid grid-cols-6 gap-2.5">
            {presets?.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => selectPreset.mutate(preset.key)}
                aria-label={preset.label}
                title={preset.label}
                className="aspect-square rounded-full bg-surface-4 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${preset.url})`,
                  outline:
                    user?.avatarPresetKey === preset.key ? '2px solid var(--violet-ink-2)' : undefined,
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            loading={removeAvatar.isPending}
            onClick={() => removeAvatar.mutate()}
          >
            Reset
          </Button>
          <Button variant="accent" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
