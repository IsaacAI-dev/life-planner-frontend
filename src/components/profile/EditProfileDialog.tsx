'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { AvatarPickerDialog } from '@/components/profile/AvatarPickerDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input, Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import type { Gender, User, UserProfile } from '@/lib/types';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'UNDISCLOSED', label: 'Prefer not to say' },
];

const NIGERIAN_STATES = ['Lagos', 'FCT', 'Rivers', 'Kano', 'Oyo', 'Enugu', 'Kaduna'];

export function EditProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: open,
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} title="Edit profile">
        {profile && user ? (
          <ProfileForm
            user={user}
            profile={profile}
            onClose={onClose}
            onChangePhoto={() => setPickerOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        )}
      </Dialog>

      <AvatarPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}

interface ProfileFormProps {
  user: User;
  profile: UserProfile;
  onClose: () => void;
  onChangePhoto: () => void;
}

/** Split out so its initial state comes from props rather than an effect. */
function ProfileForm({ user, profile, onClose, onChangePhoto }: ProfileFormProps) {
  const { setUser } = useAuth();
  const notify = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [location, setLocation] = useState(profile.location ?? '');
  const [heightCm, setHeightCm] = useState(profile.heightCm ? String(profile.heightCm) : '');
  const [yearOfBirth, setYearOfBirth] = useState(
    profile.yearOfBirth ? String(profile.yearOfBirth) : '',
  );
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [residence, setResidence] = useState(profile.state ?? '');

  const save = useMutation({
    mutationFn: async () => {
      const updatedUser = await authApi.updateAccount({ name });
      await authApi.updateProfile({
        phone: phone || null,
        location: location || null,
        state: residence || null,
        heightCm: heightCm ? Number(heightCm) : null,
        yearOfBirth: yearOfBirth ? Number(yearOfBirth) : null,
        gender,
      });
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notify('Profile saved');
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={name || 'You'} src={user.avatarUrl} size={56} />
        <Button variant="solid" size="sm" icon={<Camera size={15} />} onClick={onChangePhoto}>
          Change photo
        </Button>
      </div>

      <Field label="Full name">
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </Field>

      <Field label="Email">
        <Input value={user.email} disabled />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+234…" />
        </Field>
        <Field label="Location">
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Lagos, Nigeria"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (cm)">
          <Input
            type="number"
            value={heightCm}
            onChange={(event) => setHeightCm(event.target.value)}
            placeholder="168"
          />
        </Field>
        <Field label="Year of birth">
          <Input
            type="number"
            value={yearOfBirth}
            onChange={(event) => setYearOfBirth(event.target.value)}
            placeholder="1994"
          />
        </Field>
      </div>

      <p className="text-xs text-muted">
        Height and year of birth give your coach the context to size a meal plan.
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Gender</span>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              color="var(--violet-ink)"
              selected={gender === option.value}
              onClick={() => setGender(option.value)}
            />
          ))}
        </div>
      </div>

      <Field label="State of residence">
        <Select value={residence} onChange={(event) => setResidence(event.target.value)}>
          <option value="">Select a state</option>
          {NIGERIAN_STATES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="accent" className="flex-1" loading={save.isPending} onClick={() => save.mutate()}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
