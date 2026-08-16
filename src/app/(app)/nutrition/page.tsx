'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Globe, Search, Utensils } from 'lucide-react';
import { useState } from 'react';
import { nutritionApi } from '@/lib/api/nutrition';
import { CountryChangeDialog } from '@/components/nutrition/CountryChangeDialog';
import { FoodRow } from '@/components/nutrition/FoodRow';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { FALLBACK_CATEGORY_COLOR, MEAL_TYPE_LABELS } from '@/lib/constants';
import { formatTime, toIsoDate } from '@/lib/format';
import { useAuth } from '@/lib/providers/AuthProvider';
import { usePlan } from '@/lib/providers/PlanProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import type { Meal } from '@/lib/types';

/**
 * Calories are recorded on the meal: `calories` is computed from the items and
 * `estimatedCalories` is the coach's own figure. Items carry no calorie field.
 */
function caloriesOf(meal: Meal): number {
  return meal.calories ?? meal.estimatedCalories ?? 0;
}

export default function NutritionPage() {
  const { subscription } = usePlan();
  const { user } = useAuth();
  const notify = useToast();
  const queryClient = useQueryClient();

  const [categoryKey, setCategoryKey] = useState<string | null>(null);
  const [term, setTerm] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [countryDialog, setCountryDialog] = useState(false);

  const isoDate = toIsoDate(date);

  const { data: categories } = useQuery({
    queryKey: ['food-categories'],
    queryFn: nutritionApi.categories,
  });

  const { data: catalog } = useQuery({
    queryKey: ['food-catalog', categoryKey, term],
    queryFn: () =>
      nutritionApi.catalog({ categoryKey: categoryKey ?? undefined, q: term || undefined }),
  });

  const { data: inventory } = useQuery({
    queryKey: ['food-inventory'],
    queryFn: nutritionApi.inventory,
  });

  const { data: plan } = useQuery({
    queryKey: ['meal-plan', isoDate],
    queryFn: () => nutritionApi.planForDate(isoDate),
    enabled: subscription.limits.mealPlansEnabled,
  });

  const owned = new Set(inventory?.map((item) => item.id));

  const toggleFood = useMutation({
    mutationFn: async (foodItemId: string) => {
      if (owned.has(foodItemId)) await nutritionApi.removeFood(foodItemId);
      else await nutritionApi.addFood(foodItemId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['food-inventory'] }),
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const requestPlan = useMutation({
    mutationFn: () => nutritionApi.requestPlan({ date: isoDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-requests'] });
      notify('Your coach has been asked for a plan');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const consumed = plan?.meals.reduce((total, meal) => total + caloriesOf(meal), 0) ?? 0;

  return (
    <div className="mx-auto grid max-w-320 gap-3 lg:grid-cols-2">
      <Card className="flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">Foods I have</h2>
          <button
            type="button"
            onClick={() => setCountryDialog(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-line-2 bg-surface-4 px-2.5 py-1.5 text-xs font-bold text-muted"
          >
            <Globe size={14} />
            {user?.country ?? 'Set country'}
          </button>
        </div>

        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search the catalog"
          icon={<Search size={17} />}
        />

        <div className="flex flex-wrap gap-2">
          <Chip
            label="All"
            color="var(--green-ink)"
            selected={categoryKey === null}
            onClick={() => setCategoryKey(null)}
          />
          {categories?.map((category) => (
            <Chip
              key={category.key}
              label={category.label}
              color={category.color || FALLBACK_CATEGORY_COLOR}
              selected={categoryKey === category.key}
              onClick={() => setCategoryKey(category.key)}
            />
          ))}
        </div>

        <div className="flex max-h-125 flex-col gap-2 overflow-y-auto">
          {catalog?.map((food) => (
            <FoodRow
              key={food.id}
              food={food}
              selected={owned.has(food.id)}
              activeCategoryKey={categoryKey}
              onToggle={() => toggleFood.mutate(food.id)}
            />
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold tracking-tight">Meal plan</h2>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDate(addDays(date, -1))}
              aria-label="Previous day"
              className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="text-sm font-bold">{format(date, 'EEE d MMM')}</span>
            <button
              type="button"
              onClick={() => setDate(addDays(date, 1))}
              aria-label="Next day"
              className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {!subscription.limits.mealPlansEnabled ? (
          <EmptyState
            icon={<Utensils size={22} />}
            title="Meal plans are part of Pro"
            description="Your coach builds a daily plan from the foods you have. Upgrade to see it here."
          />
        ) : plan ? (
          <>
            <Card className="flex flex-col gap-3" style={{ borderColor: 'var(--green-ink)' }}>
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={plan.createdByAdmin?.name ?? 'Coach'}
                  src={plan.createdByAdmin?.avatarUrl}
                  size={36}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    Built for you by {plan.createdByAdmin?.name?.split(' ')[0] ?? 'your coach'}
                  </span>
                  <span className="text-xs text-muted">Published · from the foods you have</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-green-ink">
                  {Math.round(consumed)}
                </span>
                <span className="text-sm text-muted">/ {plan.targetCalories ?? '—'} kcal</span>
              </div>

              <Progress
                value={consumed}
                max={plan.targetCalories ?? (consumed || 1)}
                color="var(--green-ink)"
              />

              {plan.notes ? <p className="text-xs text-muted">{plan.notes}</p> : null}
            </Card>

            {plan.meals.map((meal) => (
              <Card key={meal.id} className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[10.5px] font-bold tracking-[0.1em] text-amber-ink uppercase">
                    {MEAL_TYPE_LABELS[meal.mealType]}
                  </span>
                  {meal.mealTime ? (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={12} />
                      {formatTime(meal.mealTime)}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs font-bold text-muted">
                    {Math.round(caloriesOf(meal))} kcal
                  </span>
                </div>

                {meal.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 text-sm">
                    <span className="size-2 flex-none rounded-full bg-green-ink" />
                    <span className="truncate font-semibold text-text-3">
                      {item.foodItem?.name ?? item.freeText ?? 'Item'}
                    </span>
                    <span className="ml-auto flex-none font-bold text-muted">
                      {item.weightGrams
                        ? `${item.weightGrams}g`
                        : item.servings
                          ? `\u00d7${item.servings}`
                          : ''}
                    </span>
                  </div>
                ))}
              </Card>
            ))}
          </>
        ) : (
          <EmptyState
            icon={<Utensils size={22} />}
            title="No plan for this day"
            description="Pick the foods you have on the left, then ask your coach to build a plan around them."
            action={
              <Button variant="accent" loading={requestPlan.isPending} onClick={() => requestPlan.mutate()}>
                Request a plan
              </Button>
            }
          />
        )}
      </div>

      <CountryChangeDialog open={countryDialog} onClose={() => setCountryDialog(false)} />
    </div>
  );
}
