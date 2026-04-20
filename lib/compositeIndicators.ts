import type { CityData } from './dataUtils';
import { convertToEur } from './dataUtils';

export function safeGet(
  section: Record<string, number> | undefined,
  key: string
): number | null {
  if (!section) return null;
  const v = section[key];
  if (v == null || typeof v !== 'number') return null;
  return v;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function weightedMean(
  values: Array<[number | null, number]>,
  minCount: number
): number | null {
  const available = values.filter(([v]) => v !== null) as Array<[number, number]>;
  if (available.length < minCount) return null;
  const totalWeight = available.reduce((s, [, w]) => s + w, 0);
  if (totalWeight === 0) return null;
  return available.reduce((s, [v, w]) => s + v * w, 0) / totalWeight;
}

export function calcHousingAffordability(city: CityData): number | null {
  const col = city.sections['cost-of-living'];
  const rent = safeGet(col, '1 Bedroom Apartment Outside of City Centre');
  const salary = safeGet(col, 'Average Monthly Net Salary (After Tax)');
  if (rent === null || salary === null || salary === 0) return null;
  const rentEur = convertToEur(rent, city.city);
  const salaryEur = convertToEur(salary, city.city);
  const rentRatio = rentEur / salaryEur;
  return clamp(100 - rentRatio * 100, 0, 100);
}

export function calcMonthlyBudget(city: CityData): number | null {
  const col = city.sections['cost-of-living'];
  const rent = safeGet(col, '1 Bedroom Apartment Outside of City Centre');
  if (rent === null) return null;
  const toEur = (v: number | null) =>
    v !== null ? convertToEur(v, city.city) : null;

  const rentEur = toEur(rent)!;
  const utilities = toEur(
    safeGet(col, 'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)')
  );
  const transport = toEur(
    safeGet(col, 'Monthly Public Transport Pass (Regular Price)')
  );
  const meal = safeGet(col, 'Meal at an Inexpensive Restaurant');
  const mealsEur = meal !== null ? convertToEur(meal, city.city) * 20 : null;
  const broadband = toEur(
    safeGet(col, 'Broadband Internet (Unlimited Data, 60 Mbps or Higher)')
  );
  const mobile = toEur(
    safeGet(col, 'Mobile Phone Plan (Monthly, with Calls and 10GB+ Data)')
  );

  return (
    rentEur +
    (utilities ?? 0) +
    (transport ?? 0) +
    (mealsEur ?? 0) +
    (broadband ?? 0) +
    (mobile ?? 0)
  );
}

export function calcPersonalSafety(city: CityData): number | null {
  const c = city.sections['crime'];
  const crimeLevel = safeGet(c, 'Level of crime');
  const safetyDay = safeGet(c, 'Safety walking alone during daylight');
  const safetyNight = safeGet(c, 'Safety walking alone during night');
  const mugging = safeGet(c, 'Worries being mugged or robbed');
  const attack = safeGet(c, 'Worries attacked');
  const corruption = safeGet(c, 'Problem corruption and bribery');

  const inputs: Array<[number | null, number]> = [
    [crimeLevel !== null ? 100 - crimeLevel : null, 0.25],
    [safetyDay, 0.20],
    [safetyNight, 0.25],
    [mugging !== null ? 100 - mugging : null, 0.10],
    [attack !== null ? 100 - attack : null, 0.10],
    [corruption !== null ? 100 - corruption : null, 0.10],
  ];

  return weightedMean(inputs, 3);
}

export function calcCityEcology(city: CityData): number | null {
  const p = city.sections['pollution'];
  const inputs: Array<[number | null, number]> = [
    [safeGet(p, 'Air quality'), 1.5],
    [safeGet(p, 'Drinking Water Quality and Accessibility'), 1.0],
    [safeGet(p, 'Clean and Tidy'), 1.0],
    [safeGet(p, 'Quality of Green and Parks'), 1.0],
    [safeGet(p, 'Garbage Disposal Satisfaction'), 0.75],
    [safeGet(p, 'Comfortable to Spend Time in the City'), 0.75],
    [safeGet(p, 'Quiet and No Problem with Night Lights'), 0.5],
  ];
  return weightedMean(inputs, 3);
}

export function calcHealthcare(city: CityData): number | null {
  const h = city.sections['health-care'];
  const inputs: Array<[number | null, number]> = [
    [safeGet(h, 'Skill and competency of medical staff'), 2.0],
    [safeGet(h, 'Equipment for modern diagnosis and treatment'), 1.5],
    [safeGet(h, 'Satisfaction with cost to you'), 1.5],
    [safeGet(h, 'Speed in completing examinations and reports'), 1.0],
    [safeGet(h, 'Accuracy and completeness in filling out reports'), 1.0],
    [safeGet(h, 'Satisfaction with responsiveness (waitings) in medical institutions'), 1.0],
    [safeGet(h, 'Friendliness and courtesy of the staff'), 0.5],
    [safeGet(h, 'Convenience of location for you'), 0.5],
  ];
  return weightedMean(inputs, 4);
}

export function calcUrbanMobility(city: CityData): number | null {
  const t = city.sections['traffic'];
  const avgTime = safeGet(t, 'Average Travel Time');
  const overall = safeGet(t, 'Overall');
  if (avgTime === null || overall === null) return null;
  const timeScore = clamp((60 - avgTime) / 50 * 100, 0, 100);
  const overallScore = clamp((70 - overall) / 60 * 100, 0, 100);
  return timeScore * 0.6 + overallScore * 0.4;
}

export function calcPropertyInvestment(city: CityData): number | null {
  const pi = city.sections['property-investment'];
  const rent = safeGet(pi, '1 Bedroom Apartment Outside of City Centre');
  const priceM2 = safeGet(pi, 'Price per Square Meter to Buy Apartment Outside of Centre');
  if (rent === null || priceM2 === null) return null;
  const rentEur = convertToEur(rent, city.city);
  const priceM2Eur = convertToEur(priceM2, city.city);
  if (priceM2Eur === 0) return null;
  const grossYield = (rentEur * 12) / (priceM2Eur * 50) * 100;
  const yieldScore = clamp((grossYield - 3) / 9 * 100, 0, 100);
  const mortgageRate = safeGet(pi, 'Annual Mortgage Interest Rate (20-Year Fixed, in %)');
  if (mortgageRate !== null) {
    const mortgageScore = clamp((15 - mortgageRate) / 13 * 100, 0, 100);
    return yieldScore * 0.65 + mortgageScore * 0.35;
  }
  return yieldScore;
}

export interface CompositeIndicator {
  key: string;
  label: string;
  description: string;
  unit: string;
  lowerIsBetter: boolean;
  calculate: (city: CityData) => number | null;
}

export function calcCostOfLiving(city: CityData): number | null {
  return safeGet(city.sections['quality-of-life'], 'Cost of Living Index');
}

export const COMPOSITE_INDICATORS: CompositeIndicator[] = [
  {
    key: 'cost-of-living-index',
    label: 'Стоимость жизни',
    description: 'Индекс Numbeo относительно Нью-Йорка (NYC = 100). Охватывает жильё, продукты, рестораны, транспорт. Чем ниже — тем дешевле.',
    unit: '',
    lowerIsBetter: true,
    calculate: calcCostOfLiving,
  },
  {
    key: 'housing-affordability',
    label: 'Доступность жилья',
    description: 'Аренда 1BR вне центра / зарплата после налогов. 100 = аренда бесплатна, 0 = аренда съедает всю зарплату.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcHousingAffordability,
  },
  {
    key: 'monthly-budget',
    label: 'Бюджет жизни',
    description: 'Аренда + коммуналка + транспорт (проездной) + 20 обедов в кафе + интернет + мобильный. Все значения в EUR.',
    unit: '€/мес',
    lowerIsBetter: true,
    calculate: calcMonthlyBudget,
  },
  {
    key: 'personal-safety',
    label: 'Личная безопасность',
    description: 'Взвешенная оценка: уровень преступности, безопасность днём и ночью, страх ограбления/нападения, коррупция.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcPersonalSafety,
  },
  {
    key: 'city-ecology',
    label: 'Экология города',
    description: 'Взвешенная оценка позитивных показателей: качество воздуха, воды, чистота улиц, парки, тишина.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcCityEcology,
  },
  {
    key: 'healthcare',
    label: 'Здравоохранение',
    description: 'Взвешенная оценка: квалификация врачей, оборудование, стоимость, скорость, точность, отзывчивость персонала.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcHealthcare,
  },
  {
    key: 'urban-mobility',
    label: 'Городская мобильность',
    description: 'Среднее время поездки на работу и общий индекс пробок. 100 = 10 мин без пробок, 0 = 60+ мин в трафике.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcUrbanMobility,
  },
  {
    key: 'property-investment',
    label: 'Инвестиции в жильё',
    description: 'Gross rental yield (аренда × 12 / цена 50 м²) и ставка ипотеки. 100 = высокая доходность + низкая ставка.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcPropertyInvestment,
  },
];
