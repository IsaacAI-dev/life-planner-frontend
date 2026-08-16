'use client';

import { Mic, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatClock } from '@/lib/format';

interface ChatComposerProps {
  onSend: (content: string) => void;
  onSendVoiceNote: (blob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
  voiceNotesEnabled: boolean;
  placeholder: string;
  /** Prefilled when editing an existing message. */
  initialValue?: string;
}

export function ChatComposer({
  onSend,
  onSendVoiceNote,
  disabled = false,
  voiceNotesEnabled,
  placeholder,
  initialValue = '',
}: ChatComposerProps) {
  const [text, setText] = useState(initialValue);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
    } catch {
      // Permission denied or no microphone — stay in text mode.
    }
  };

  const finishRecording = (send: boolean) => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    recorder.onstop = () => {
      recorder.stream.getTracks().forEach((track) => track.stop());
      if (send && chunksRef.current.length) {
        onSendVoiceNote(new Blob(chunksRef.current, { type: recorder.mimeType }), seconds);
      }
      chunksRef.current = [];
    };

    recorder.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  if (recording) {
    return (
      <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={() => finishRecording(false)}
          aria-label="Discard recording"
          className="flex size-10 flex-none items-center justify-center rounded-full border border-red-ink/40 text-red-ink"
        >
          <Trash2 size={17} />
        </button>

        <div className="flex flex-1 items-center gap-2.5 rounded-full border border-red-ink/40 px-4 py-2.5">
          <span className="size-2 rounded-full bg-red-ink" />
          <span className="text-xs font-bold text-red-ink">{formatClock(seconds)}</span>
          <span className="ml-auto text-xs font-semibold text-muted">Recording</span>
        </div>

        <button
          type="button"
          onClick={() => finishRecording(true)}
          aria-label="Send voice note"
          className="flex size-10 flex-none items-center justify-center rounded-full bg-accent text-on-accent"
        >
          <Send size={17} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
      <button
        type="button"
        aria-label="Add attachment"
        disabled={disabled}
        className="flex size-10 flex-none items-center justify-center rounded-full border border-line-2 bg-surface-4 text-muted disabled:opacity-40"
      >
        <Plus size={18} />
      </button>

      <input
        value={text}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && submit()}
        placeholder={placeholder}
        className="flex-1 rounded-full border border-line-3 bg-surface-input px-4 py-2.5 text-sm outline-none placeholder:text-muted-3 focus:border-violet-ink-2 disabled:opacity-60"
      />

      {voiceNotesEnabled ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          aria-label="Record a voice note"
          className="flex size-10 flex-none items-center justify-center rounded-full border border-line-2 bg-surface-4 text-muted disabled:opacity-40"
        >
          <Mic size={18} />
        </button>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        aria-label="Send message"
        className="flex size-10 flex-none items-center justify-center rounded-full bg-accent text-on-accent disabled:opacity-40"
      >
        <Send size={17} />
      </button>
    </div>
  );
}
