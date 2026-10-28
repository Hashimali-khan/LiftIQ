import React, { useState, useEffect } from 'react';
import { MealGroup } from '../types';
import { INITIAL_MEALS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface NutritionScreenProps {
  onOpenQuickLog?: () => void;
}

export const NutritionScreen: React.FC<NutritionScreenProps> = () => {
  const { user, profile } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>('WED 10');
  const [meals, setMeals] = useState<MealGroup[]>(INITIAL_MEALS);
  const [naturalMealInput, setNaturalMealInput] = useState<string>('');
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Quick Snacking Log
  const [snackLogged, setSnackLogged] = useState(false);

  // Fetch real meals from Supabase if authenticated
  useEffect(() => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];

    supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('eaten_on', todayStr)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const loadedMeals: MealGroup[] = data.map((fe) => ({
            id: fe.id,
            type: (fe.meal_type as any) || 'snack',
            title: fe.name,
            time: new Date(fe.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            description: fe.source === 'ai' ? 'AI Parsed Macro Profile' : 'Manual Nutrition Log',
            calories: Math.round(Number(fe.calories)),
            proteinG: Math.round(Number(fe.protein_g)),
            isExpanded: false,
            items: [
              {
                id: `${fe.id}-item`,
                name: fe.name,
                weightG: 180,
                calories: Math.round(Number(fe.calories)),
                proteinG: Math.round(Number(fe.protein_g)),
                carbsG: Math.round(Number(fe.carbs_g)),
                fatG: Math.round(Number(fe.fat_g)),
              },
            ],
          }));
          setMeals(loadedMeals);
        }
      });
  }, [user]);

  // Toggle meal card expansion
  const toggleMealExpand = (id: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isExpanded: !m.isExpanded } : m))
    );
  };

  // Delete an item from meal or database
  const handleDeleteItem = async (mealId: string, itemId: string) => {
    if (user) {
      await supabase.from('food_entries').delete().eq('id', mealId).eq('user_id', user.id);
    }
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  // AI Meal Estimation + Supabase Auto-Persistence
  const handleEstimateWithAi = async () => {
    const query = naturalMealInput.trim();
    if (!query) return;

    setIsEstimating(true);
    try {
      const res = await fetch('/api/estimate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: query }),
      });
      const data = await res.json();

      if (data && data.calories) {
        let savedId = `meal-${Date.now()}`;

        // Save to Supabase if authenticated
        if (user) {
          const { data: dbEntry } = await supabase
            .from('food_entries')
            .insert({
              user_id: user.id,
              eaten_on: new Date().toISOString().split('T')[0],
              meal_type: 'snack',
              name: data.title || query,
              calories: data.calories,
              protein_g: data.protein_g || 30,
              carbs_g: data.carbs_g || 40,
              fat_g: data.fat_g || 10,
              source: 'ai',
            })
            .select()
            .single();

          if (dbEntry) {
            savedId = dbEntry.id;
          }
        }

        const newMeal: MealGroup = {
          id: savedId,
          type: 'snack',
          title: data.title || 'AI Logged Fuel',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: query,
          calories: Math.round(data.calories),
          proteinG: Math.round(data.protein_g || 35),
          isExpanded: true,
          isRecent: true,
          items:
            data.items && data.items.length > 0
              ? data.items.map((it: any, i: number) => ({
                  id: `ai-item-${Date.now()}-${i}`,
                  name: it.name || query,
                  weightG: it.weight_g || 150,
                  calories: Math.round(it.calories || 250),
                  proteinG: Math.round(it.protein_g || 25),
                  carbsG: Math.round(it.carbs_g || 20),
                  fatG: Math.round(it.fat_g || 8),
                }))
              : [
                  {
                    id: `ai-item-${Date.now()}`,
                    name: query,
                    weightG: 250,
                    calories: Math.round(data.calories),
                    proteinG: Math.round(data.protein_g || 35),
                    carbsG: Math.round(data.carbs_g || 40),
                    fatG: Math.round(data.fat_g || 12),
                  },
                ],
        };

        setMeals((prev) => [newMeal, ...prev]);
        setNaturalMealInput('');
      }
    } catch (err) {
      console.warn('AI estimate failed, using quick fallback');
    } finally {
      setIsEstimating(false);
    }
  };

  const days = [
    { label: 'SUN', num: '07' },
    { label: 'MON', num: '08' },
    { label: 'TUE', num: '09' },
    { label: 'WED', num: '10' },
    { label: 'THU', num: '11' },
    { label: 'FRI', num: '12' },
    { label: 'SAT', num: '13' },
  ];

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
  const totalCarbs = meals.reduce(
    (sum, m) => sum + m.items.reduce((iSum, it) => iSum + (it.carbsG || 0), 0),
    0
  );
  const totalFat = meals.reduce(
    (sum, m) => sum + m.items.reduce((iSum, it) => iSum + (it.fatG || 0), 0),
    0
  );
  const calorieTarget = profile?.calorie_target || 2600;
  const proteinTarget = profile?.protein_target_g || 190;
  const remainingCalories = Math.max(0, calorieTarget - totalCalories);
  const proteinPercent = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / 280) * 100));

  return (
    <div className="flex flex-col w-full px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-5 pb-32 pt-2">
      {/* Date Navigation Ribbon */}
      <section className="flex flex-col w-full gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4]">
              Today's Fuel
            </span>
            <span
              className="material-symbols-outlined text-[#94de2d] text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
          <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#201f22] border border-[#353437] text-[#e0c0b1] hover:text-[#e5e1e4] text-xs font-semibold cursor-pointer">
            <span className="font-['Space_Grotesk'] uppercase tracking-wider">October</span>
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          </button>
        </div>

        {/* Horizontal Scroll Days Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar -mx-4 px-4">
          {days.map((d) => {
            const key = `${d.label} ${d.num}`;
            const isActive = selectedDay === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={`flex flex-col items-center justify-center min-w-[54px] py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'min-w-[58px] bg-[#2a2a2c] text-[#f97316] border border-[#f97316]/50 shadow-[0_0_20px_rgba(249,115,22,0.3)] relative font-bold'
                    : 'bg-[#1c1b1d] text-[#e0c0b1]/70 hover:bg-[#201f22]'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1 w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.9)]" />
                )}
                <span className="font-['Space_Grotesk'] text-[10px] tracking-wider opacity-75">
                  {d.label}
                </span>
                <span className="font-['Space_Grotesk'] text-lg font-bold mt-0.5 text-[#e5e1e4]">
                  {d.num}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Macro Goal Overview Card */}
      <section className="relative overflow-hidden rounded-2xl bg-[#201f22]/70 backdrop-blur-xl border border-[#2a2a2c] p-4 sm:p-5 shadow-xl">
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#f97316]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-[#94de2d]/10 blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#a78b7d] font-semibold">
                Energy Intake
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#94de2d]/15 text-[#94de2d] font-['Space_Grotesk'] text-[10px] font-bold">
                {totalCalories <= calorieTarget ? 'In Deficit' : 'Surplus Target'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold tracking-tight text-[#e5e1e4] tabular-nums">
                {totalCalories.toLocaleString()}
              </span>
              <span className="text-sm text-[#e0c0b1]/80">/ {calorieTarget.toLocaleString()} kcal</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider font-semibold">
              Remaining
            </span>
            <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-xl bg-[#2a2a2c] border border-[#353437]">
              <span className="material-symbols-outlined text-[#f97316] text-[16px]">bolt</span>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#ffdbca] tabular-nums">
                {remainingCalories.toLocaleString()}
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">kcal</span>
            </div>
          </div>
        </div>

        {/* 4 Neon Macro Progress Bars Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {/* Protein */}
          <div className="flex flex-col p-3 rounded-xl bg-[#0e0e10]/80 border border-[#201f22]">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#a78b7d] font-semibold">
                Protein
              </span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#94de2d]">
                {proteinPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4] tabular-nums">
                {totalProtein}
              </span>
              <span className="text-xs text-[#a78b7d]">/ {proteinTarget}g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#353437] mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#94de2d] shadow-[0_0_12px_rgba(148,222,45,0.8)]"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="flex flex-col p-3 rounded-xl bg-[#0e0e10]/80 border border-[#201f22]">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#a78b7d] font-semibold">
                Carbs
              </span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#f97316]">
                {carbsPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4] tabular-nums">
                {totalCarbs}
              </span>
              <span className="text-xs text-[#a78b7d]">/ 280g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#353437] mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#f97316] shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>
              <span className="text-xs text-[#a78b7d]">/ 280g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#353437] mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#f97316] shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                style={{ width: '75%' }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="flex flex-col p-3 rounded-xl bg-[#0e0e10]/80 border border-[#201f22]">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#a78b7d] font-semibold">
                Fat
              </span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#ffb690]">
                82%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4] tabular-nums">
                58
              </span>
              <span className="text-xs text-[#a78b7d]">/ 70g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#353437] mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#ffb690] shadow-[0_0_12px_rgba(255,182,144,0.8)]"
                style={{ width: '82%' }}
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="flex flex-col p-3 rounded-xl bg-[#0e0e10]/80 border border-[#201f22]">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#a78b7d] font-semibold">
                Fiber
              </span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#4cd7f6]">
                80%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4] tabular-nums">
                28
              </span>
              <span className="text-xs text-[#a78b7d]">/ 35g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#353437] mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#4cd7f6] shadow-[0_0_12px_rgba(76,215,246,0.8)]"
                style={{ width: '80%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Meal Estimator Trigger Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a2a2c]/90 via-[#201f22] to-[#0e0e10] p-4 sm:p-5 shadow-xl border border-[#2a2a2c]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f97316]/15 via-transparent to-[#94de2d]/15 opacity-60 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f97316] text-[#552100] shadow-[0_0_16px_rgba(249,115,22,0.5)]">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <div>
                <span className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-[#e5e1e4] leading-none block">
                  AI Meal Estimator
                </span>
                <span className="block font-['Space_Grotesk'] text-[10px] text-[#94de2d] uppercase tracking-wider font-semibold mt-0.5">
                  Biometric Vision &amp; NLP
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#39393b] text-[#4cd7f6] font-['Space_Grotesk'] text-[10px] font-bold uppercase">
              v2.4 Active
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#e0c0b1]/80">
            Describe what you ate in natural language (e.g.,{' '}
            <span className="text-[#e5e1e4] font-medium italic">
              "2 rotis with chicken curry and cucumber salad"
            </span>
            ) and AI will calculate macros instantly.
          </p>

          {/* Input Field Preview & Action */}
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-[#0e0e10] border border-[#353437] text-[#e0c0b1]">
              <span className="material-symbols-outlined text-[18px] text-[#f97316]">mic</span>
              <input
                className="bg-transparent border-0 outline-none text-xs sm:text-sm text-[#e5e1e4] w-full placeholder:text-[#a78b7d]"
                placeholder="Type or speak meal components..."
                type="text"
                value={naturalMealInput}
                onChange={(e) => setNaturalMealInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEstimateWithAi();
                }}
              />
            </div>
            <button
              onClick={handleEstimateWithAi}
              disabled={isEstimating}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#94de2d] text-[#341100] font-['Space_Grotesk'] text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isEstimating ? 'hourglass_top' : 'smart_toy'}
              </span>
              <span>{isEstimating ? 'Calculating...' : 'Estimate with AI'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Collapsible Meal Log Cards (Timeline) */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
            Meal Timeline
          </span>
          <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#a78b7d] font-semibold">
            {meals.length} Recorded
          </span>
        </div>

        {/* Meal Cards */}
        {meals.map((meal) => {
          const isExpanded = !!meal.isExpanded;
          const isDinner = meal.type === 'dinner' || meal.id === 'meal-dinner';

          return (
            <div
              key={meal.id}
              className={`flex flex-col rounded-2xl transition-all border ${
                isDinner
                  ? 'bg-[#2a2a2c]/90 border-[#f97316]/30 shadow-lg p-4'
                  : 'bg-[#201f22]/60 border-[#2a2a2c] hover:bg-[#2a2a2c]/60 p-4'
              }`}
            >
              <div
                onClick={() => toggleMealExpand(meal.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl border border-[#353437] ${
                      meal.type === 'breakfast'
                        ? 'bg-[#2a2a2c] text-[#f97316]'
                        : meal.type === 'lunch'
                          ? 'bg-[#2a2a2c] text-[#94de2d]'
                          : 'bg-[#353437] text-[#f97316]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {meal.type === 'breakfast'
                        ? 'wb_twilight'
                        : meal.type === 'lunch'
                          ? 'wb_sunny'
                          : 'dinner_dining'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-['Space_Grotesk'] text-base font-bold ${
                          isDinner ? 'text-[#ffdbca]' : 'text-[#e5e1e4]'
                        }`}
                      >
                        {meal.title}
                      </span>
                      {meal.isRecent && (
                        <span className="px-1.5 py-0.5 rounded bg-[#f97316]/20 text-[#f97316] font-['Space_Grotesk'] text-[9px] font-bold uppercase tracking-wider">
                          Recent
                        </span>
                      )}
                      <span className="text-xs text-[#a78b7d]">• {meal.time}</span>
                    </div>
                    <span className="text-xs text-[#e0c0b1]/70 truncate">
                      {meal.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <div className="flex flex-col items-end">
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-[#e5e1e4]">
                      {meal.calories} kcal
                    </span>
                    <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#94de2d]">
                      {meal.proteinG}g P
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isDinner ? 'text-[#f97316]' : 'text-[#a78b7d]'
                    }`}
                  >
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>

              {/* Expanded Breakdown Panel */}
              {isExpanded && (
                <div className="flex flex-col gap-2 mt-3 pt-3 bg-[#0e0e10]/70 border border-[#201f22] rounded-xl p-3">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1 border-b border-[#201f22] last:border-0"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-medium text-[#e5e1e4]">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#a78b7d]">
                          {item.weightG}g • {item.calories} kcal • {item.proteinG}g P • {item.fatG}g F • {item.carbsG}g C
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveModal(`edit-${item.id}`)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#201f22] text-[#a78b7d] hover:text-[#e5e1e4] border border-[#353437] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(meal.id, item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#201f22] text-[#ffb4ab] hover:bg-[#93000a]/20 border border-[#353437] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Micro Macro Ratio Badges */}
                  <div className="flex items-center gap-1.5 pt-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#94de2d]/15 text-[#94de2d] font-['Space_Grotesk'] text-[10px] font-bold">
                      {meal.proteinG}g Protein
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] font-['Space_Grotesk'] text-[10px] font-bold">
                      52g Carbs
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffb690]/15 text-[#ffb690] font-['Space_Grotesk'] text-[10px] font-bold">
                      26g Fats
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Snacks & Hydration (Quick Add State) */}
        <div className="flex items-center justify-between rounded-2xl bg-[#1c1b1d]/80 border border-[#2a2a2c] p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#201f22] text-[#a78b7d] border border-[#353437]">
              <span className="material-symbols-outlined text-[20px]">cookie</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-base font-bold text-[#e5e1e4]">
                Snacks &amp; Hydration
              </span>
              <span className="text-xs text-[#a78b7d]">
                {snackLogged ? 'Protein bar & BCAA Electrolytes logged' : 'No items logged yet'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSnackLogged(true);
              const snackMeal: MealGroup = {
                id: `snack-${Date.now()}`,
                type: 'snack',
                title: 'Snack: Pure Protein Crisp',
                time: '04:15 PM',
                description: 'Salted Caramel Crunch Bar + Electrolyte Sachet',
                calories: 210,
                proteinG: 20,
                isExpanded: false,
                items: [
                  { id: 'snk-1', name: 'Protein Bar', weightG: 60, calories: 200, proteinG: 20, carbsG: 15, fatG: 6 },
                  { id: 'snk-2', name: 'Electrolyte Hydration Drink', weightG: 300, calories: 10, proteinG: 0, carbsG: 2, fatG: 0 },
                ],
              };
              setMeals((prev) => [...prev, snackMeal]);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#201f22] hover:bg-[#2a2a2c] text-[#94de2d] border border-[#94de2d]/30 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>{snackLogged ? 'Logged' : 'Log Snack'}</span>
          </button>
        </div>
      </section>

      {/* Visual Food Imagery & Bio-Quality Highlights */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-base font-bold text-[#e5e1e4]">
            Micronutrient Breakdown
          </span>
          <span className="font-['Space_Grotesk'] text-[10px] text-[#94de2d] uppercase font-bold tracking-wider">
            Optimal Range
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative overflow-hidden rounded-2xl bg-[#201f22] border border-[#2a2a2c] p-3.5 flex flex-col justify-end h-28 shadow-lg">
            <img
              alt="Fresh vegetables and avocado"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9mG8bf6rkOfzrOoujZbQoIB8T93LE2YhIBqVuIIwRANhHS4b6t9AOwl84jwcsZQ36vYiTYtMEx3akxNyLpO8uosvo3z4C7FKoHr2qPJNThDBlS-cIVb_46DRQ_KDsCzIzvC9YloqhxyvCrbSVd8jqLIwDfDXQkqCYIHxfMEoqEKK87ARi1DA3BnRyRXR-Hb6jjhhxUrmJR6Zx_UHi-L0VvAsWYG1SiCCS2q_gTQY7zEBqiXk4aQML"
            />
            <div className="relative z-10 flex flex-col">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#94de2d] font-bold">
                Electrolytes
              </span>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
                3,240 mg
              </span>
              <span className="text-[11px] text-[#e0c0b1]/80">
                Sodium &amp; Potassium balance
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-[#201f22] border border-[#2a2a2c] p-3.5 flex flex-col justify-end h-28 shadow-lg">
            <img
              alt="Raw salmon and flax seeds"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfWcW0SgMsGM4LwtXvBx0bjuRNL6WR2-lits4IsyImO9lxnl_YWsMKSgiDr5oaFu_e0jJznLxYvTUkpRsXWJxEvBvK2DES27OC8lD0OYdvzUwad6sfi9EGZcgke0YUmcK8nz9V6S_cqS2toL3j6MWpBCdR1n5zJ26RB1uNzKhcRTdHzgrnKl_RiAayfw6Zhx0N8GXIPUGVFvEjda9M1uqbf2x5PQk3AK73b3dqZ9BbFAevj23Gll6D"
            />
            <div className="relative z-10 flex flex-col">
              <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#f97316] font-bold">
                Omega-3 Index
              </span>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
                2.4 g EPA/DHA
              </span>
              <span className="text-[11px] text-[#e0c0b1]/80">
                120% daily target
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Fast Log Hub Dock */}
      <section className="sticky bottom-24 w-full z-40 mt-1">
        <div className="flex items-center justify-between p-2 pl-4 rounded-full bg-[#2a2a2c]/95 backdrop-blur-2xl border border-[#353437] shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-[9px] text-[#a78b7d] uppercase tracking-wider font-semibold">
                Fast Log Hub
              </span>
              <span className="text-xs text-[#94de2d] font-bold font-['Space_Grotesk']">
                Ready to record
              </span>
            </div>
          </div>

          {/* Quick Action Group */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveModal('barcode')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0e0e10] border border-[#353437] text-[#e5e1e4] hover:text-[#f97316] hover:bg-[#201f22] transition-all cursor-pointer"
              title="Scan Barcode"
            >
              <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
            </button>
            <button
              onClick={() => setActiveModal('camera')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0e0e10] border border-[#353437] text-[#e5e1e4] hover:text-[#f97316] hover:bg-[#201f22] transition-all cursor-pointer"
              title="Snap Photo with Camera"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
            <button
              onClick={() => {
                setNaturalMealInput('Post-workout shake: 2 scoops whey isolate, 1 banana, almond milk');
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0e0e10] border border-[#353437] text-[#e5e1e4] hover:text-[#f97316] hover:bg-[#201f22] transition-all cursor-pointer"
              title="Voice Audio Log"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>
            <button
              onClick={() => setActiveModal('quicklog')}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#94de2d] text-[#341100] shadow-[0_0_16px_rgba(249,115,22,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="font-['Space_Grotesk'] text-xs uppercase font-bold tracking-wider">
                Quick Log
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal Fallbacks for Fast Log Hub */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1b1d] border border-[#353437] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#e5e1e4] uppercase">
                {activeModal === 'barcode'
                  ? 'Barcode Telemetry Scan'
                  : activeModal === 'camera'
                    ? 'Biometric Vision Lens'
                    : 'Quick Food Entry'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#201f22] flex items-center justify-center text-[#a78b7d] hover:text-[#e5e1e4]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0e10] border border-[#201f22] text-center text-xs text-[#e0c0b1]">
              {activeModal === 'barcode' && (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto border-2 border-dashed border-[#f97316] rounded-xl flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-2xl text-[#f97316]">
                      barcode_scanner
                    </span>
                  </div>
                  <p>Ready to scan UPC or European EAN barcode.</p>
                  <p className="text-[10px] text-[#a78b7d]">Simulated instant database match: Optimum Gold Standard Whey (120 kcal, 24g P)</p>
                </div>
              )}
              {activeModal === 'camera' && (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-[#201f22] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-[#94de2d]">
                      camera_enhance
                    </span>
                  </div>
                  <p>Neural food recognition lens initialized.</p>
                  <p className="text-[10px] text-[#a78b7d]">Point camera at plate or meal container for macro identification.</p>
                </div>
              )}
              {activeModal === 'quicklog' && (
                <div className="space-y-3 text-left">
                  <label className="text-xs font-semibold text-[#a78b7d]">Food / Item Name</label>
                  <input
                    type="text"
                    defaultValue="Greek Yogurt (0% Fat) with Honey"
                    className="w-full bg-[#201f22] border border-[#353437] rounded-lg px-3 py-2 text-xs text-[#e5e1e4]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#a78b7d]">Calories</label>
                      <input
                        type="number"
                        defaultValue={180}
                        className="w-full bg-[#201f22] border border-[#353437] rounded-lg px-2 py-1.5 text-xs text-[#e5e1e4]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#a78b7d]">Protein (g)</label>
                      <input
                        type="number"
                        defaultValue={22}
                        className="w-full bg-[#201f22] border border-[#353437] rounded-lg px-2 py-1.5 text-xs text-[#e5e1e4]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                setSnackLogged(true);
              }}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#f97316] to-[#94de2d] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#341100]"
            >
              Confirm Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
