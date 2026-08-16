'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import type { FoodItem } from '@/lib/types';
import { withAlpha } from '@/lib/utils';

interface FoodRowProps {
  food: FoodItem;
  selected: boolean;
  /** The filter currently applied, so the matching tag can be emphasised. */
  activeCategoryKey: string | null;
  onToggle: () => void;
}

/**
 * A food belongs to several categories — beans is both a protein and a
 * carbohydrate. Each is rendered as its own coloured pill rather than joined
 * into a sentence, so the overlap is visible at a glance and it is obvious why
 * a food shows up under more than one filter.
 */
export function FoodRow({ food, selected, activeCategoryKey, onToggle }: FoodRowProps) {
  const macros = [
    food.proteinG !== null ? `P ${food.proteinG}g` : null,
    food.carbsG !== null ? `C ${food.carbsG}g` : null,
    food.fatG !== null ? `F ${food.fatG}g` : null,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className="flex items-start gap-3 rounded-xl border p-2.5 text-left"
      style={{
        borderColor: selected ? 'var(--green-ink)' : 'var(--line-2)',
        background: selected ? 'rgba(91,228,155,0.08)' : 'var(--surface-3)',
      }}
    >
      <span
        className="flex size-11 flex-none items-center justify-center rounded-lg bg-surface-4 bg-cover bg-center text-center text-[10px] font-bold text-muted"
        style={food.imageUrl ? { backgroundImage: `url(${food.imageUrl})` } : undefined}
      >
        {food.imageUrl ? null : food.name.slice(0, 8)}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate text-sm font-bold">{food.name}</span>

        <span className="flex flex-wrap gap-1">
          {food.categories.map((category) => {
            const color = category.color || FALLBACK_CATEGORY_COLOR;
            const active = category.key === activeCategoryKey;

            return (
              <span
                key={category.key}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  color,
                  background: withAlpha(color, active ? 0.28 : 0.14),
                  outline: active ? `1px solid ${color}` : undefined,
                }}
              >
                {category.label}
              </span>
            );
          })}
        </span>

        <span className="truncate text-xs text-muted">
          {food.servingSize ? `${food.servingSize} · ` : ''}
          {food.caloriesPerServing} kcal
          {macros.length ? ` · ${macros.join(' · ')}` : ''}
        </span>
      </span>

      {selected ? (
        <CheckCircle2 size={21} className="mt-1 flex-none text-green-ink" />
      ) : (
        <Circle size={21} className="mt-1 flex-none text-muted-3" />
      )}
    </button>
  );
}
