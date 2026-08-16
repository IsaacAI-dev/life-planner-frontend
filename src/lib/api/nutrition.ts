import { request } from '@/lib/api/client';
import type { FoodCategoryTag, FoodItem, MealPlan, MealRequest } from '@/lib/types';

export const nutritionApi = {
  /** Falls back to the caller's own country when none is given. */
  catalog: (query: { country?: string; categoryKey?: string; q?: string }) =>
    request<FoodItem[]>('/food-catalog', { query, unwrap: 'items' }),

  categories: () => request<FoodCategoryTag[]>('/food-catalog/categories', { unwrap: 'categories' }),

  inventory: () => request<FoodItem[]>('/food-inventory', { unwrap: 'items' }),

  replaceInventory: (foodItemIds: string[]) =>
    request<FoodItem[]>('/food-inventory', {
      method: 'PUT',
      body: { foodItemIds },
      unwrap: 'items',
    }),

  addFood: (foodItemId: string) =>
    request<FoodItem>(`/food-inventory/${foodItemId}`, { method: 'POST', body: {}, unwrap: 'item' }),

  removeFood: (foodItemId: string) =>
    request<{ ok: true }>(`/food-inventory/${foodItemId}`, { method: 'DELETE' }),

  /** PUBLISHED only — a draft never reaches the user. */
  planForDate: (date: string) => request<MealPlan | null>(`/meal-plans/${date}`, { unwrap: 'mealPlan' }),

  plans: (query: { from: string; to: string }) =>
    request<MealPlan[]>('/meal-plans', { query, unwrap: 'mealPlans' }),

  requestPlan: (body: { date: string; note?: string }) =>
    request<MealRequest>('/meal-plans/requests', { method: 'POST', body, unwrap: 'request' }),

  requests: () => request<MealRequest[]>('/meal-plans/requests', { unwrap: 'requests' }),
};
