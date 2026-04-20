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

export interface SubMetric {
  label: string;
  unit: string;
  getValue: (city: CityData) => number | null;
}

export interface CompositeIndicator {
  key: string;
  label: string;
  description: string;
  unit: string;
  lowerIsBetter: boolean;
  calculate: (city: CityData) => number | null;
  subMetrics: SubMetric[];
  scaleToData?: boolean;
}

// ─── Calculators ─────────────────────────────────────────────────────────────

export function calcCostOfLiving(city: CityData): number | null {
  return safeGet(city.sections['quality-of-life'], 'Cost of Living Index');
}

export function calcHousingAffordability(city: CityData): number | null {
  const col = city.sections['cost-of-living'];
  const rent = safeGet(col, '3 Bedroom Apartment Outside of City Centre');
  const salary = safeGet(col, 'Average Monthly Net Salary (After Tax)');
  if (rent === null || salary === null || salary === 0) return null;
  const rentEur = convertToEur(rent, city.city);
  const salaryEur = convertToEur(salary, city.city) * 2; // combined household income
  return clamp(100 - (rentEur / salaryEur) * 100, 0, 100);
}

export function calcMonthlyBudget(city: CityData): number | null {
  const col = city.sections['cost-of-living'];
  const rent = safeGet(col, '1 Bedroom Apartment Outside of City Centre');
  if (rent === null) return null;
  const toEur = (v: number | null) => (v !== null ? convertToEur(v, city.city) : null);
  const meal = safeGet(col, 'Meal at an Inexpensive Restaurant');
  const rent3br = safeGet(col, '3 Bedroom Apartment Outside of City Centre') ?? rent;
  return (
    convertToEur(rent3br, city.city) +                                                                      // shared
    (toEur(safeGet(col, 'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)')) ?? 0) + // shared
    (toEur(safeGet(col, 'Monthly Public Transport Pass (Regular Price)')) ?? 0) * 2 +                       // ×2 persons
    (meal !== null ? convertToEur(meal, city.city) * 35 * 2 : 0) +                                         // 35 meals ×2 persons
    (toEur(safeGet(col, 'Broadband Internet (Unlimited Data, 60 Mbps or Higher)')) ?? 0) +                  // shared
    (toEur(safeGet(col, 'Mobile Phone Plan (Monthly, with Calls and 10GB+ Data)')) ?? 0) * 2               // ×2 persons
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
  return weightedMean(
    [
      [crimeLevel !== null ? 100 - crimeLevel : null, 0.25],
      [safetyDay, 0.20],
      [safetyNight, 0.25],
      [mugging !== null ? 100 - mugging : null, 0.10],
      [attack !== null ? 100 - attack : null, 0.10],
      [corruption !== null ? 100 - corruption : null, 0.10],
    ],
    3
  );
}

export function calcCityEcology(city: CityData): number | null {
  const p = city.sections['pollution'];
  return weightedMean(
    [
      [safeGet(p, 'Air quality'), 1.5],
      [safeGet(p, 'Drinking Water Quality and Accessibility'), 1.0],
      [safeGet(p, 'Clean and Tidy'), 1.0],
      [safeGet(p, 'Quality of Green and Parks'), 1.0],
      [safeGet(p, 'Garbage Disposal Satisfaction'), 0.75],
      [safeGet(p, 'Comfortable to Spend Time in the City'), 0.75],
      [safeGet(p, 'Quiet and No Problem with Night Lights'), 0.5],
    ],
    3
  );
}

export function calcHealthcare(city: CityData): number | null {
  const h = city.sections['health-care'];
  return weightedMean(
    [
      [safeGet(h, 'Skill and competency of medical staff'), 2.0],
      [safeGet(h, 'Equipment for modern diagnosis and treatment'), 1.5],
      [safeGet(h, 'Satisfaction with cost to you'), 1.5],
      [safeGet(h, 'Speed in completing examinations and reports'), 1.0],
      [safeGet(h, 'Accuracy and completeness in filling out reports'), 1.0],
      [safeGet(h, 'Satisfaction with responsiveness (waitings) in medical institutions'), 1.0],
      [safeGet(h, 'Friendliness and courtesy of the staff'), 0.5],
      [safeGet(h, 'Convenience of location for you'), 0.5],
    ],
    4
  );
}

export function calcUrbanMobility(city: CityData): number | null {
  const t = city.sections['traffic'];
  const avgTime = safeGet(t, 'Average Travel Time');
  const overall = safeGet(t, 'Overall');
  if (avgTime === null || overall === null) return null;
  return (
    clamp(((60 - avgTime) / 50) * 100, 0, 100) * 0.6 +
    clamp(((70 - overall) / 60) * 100, 0, 100) * 0.4
  );
}

export function calcPropertyInvestment(city: CityData): number | null {
  const pi = city.sections['property-investment'];
  const rent = safeGet(pi, '1 Bedroom Apartment Outside of City Centre');
  const priceM2 = safeGet(pi, 'Price per Square Meter to Buy Apartment Outside of Centre');
  if (rent === null || priceM2 === null) return null;
  const rentEur = convertToEur(rent, city.city);
  const priceM2Eur = convertToEur(priceM2, city.city);
  if (priceM2Eur === 0) return null;
  const grossYield = ((rentEur * 12) / (priceM2Eur * 50)) * 100;
  const yieldScore = clamp(((grossYield - 3) / 9) * 100, 0, 100);
  const mortgageRate = safeGet(pi, 'Annual Mortgage Interest Rate (20-Year Fixed, in %)');
  if (mortgageRate !== null) {
    return yieldScore * 0.65 + clamp(((15 - mortgageRate) / 13) * 100, 0, 100) * 0.35;
  }
  return yieldScore;
}

export function calcNetRentalYield(city: CityData): number | null {
  const pi = city.sections['property-investment'];
  const col = city.sections['cost-of-living'];
  const rent = safeGet(pi, '1 Bedroom Apartment Outside of City Centre');
  const priceM2 = safeGet(pi, 'Price per Square Meter to Buy Apartment Outside of Centre');
  if (rent === null || priceM2 === null) return null;
  const rentEur = convertToEur(rent, city.city);
  const priceM2Eur = convertToEur(priceM2, city.city);
  if (priceM2Eur === 0) return null;
  const utilities = safeGet(col, 'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)');
  const utilitiesEur = utilities !== null ? convertToEur(utilities, city.city) : 0;
  const propertyValue = priceM2Eur * 50;
  return Math.round(((rentEur - utilitiesEur) * 12) / propertyValue * 1000) / 10;
}

// ─── Indicator definitions ────────────────────────────────────────────────────

export const COMPOSITE_INDICATORS: CompositeIndicator[] = [
  {
    key: 'cost-of-living-index',
    label: 'Стоимость жизни',
    description: 'Индекс Numbeo относительно Нью-Йорка (NYC = 100). Охватывает жильё, продукты, рестораны, транспорт. Чем ниже — тем дешевле.',
    unit: '',
    lowerIsBetter: true,
    calculate: calcCostOfLiving,
    subMetrics: [],
  },
  {
    key: 'housing-affordability',
    label: 'Доступность жилья',
    description: 'Аренда 3BR вне центра / (зарплата × 2). 100 = аренда бесплатна, 0 = аренда съедает весь доход семьи.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcHousingAffordability,
    subMetrics: [
      {
        label: 'Аренда 3BR вне центра',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], '3 Bedroom Apartment Outside of City Centre');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Зарплата (2 чел.)',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], 'Average Monthly Net Salary (After Tax)');
          return v !== null ? convertToEur(v, c.city) * 2 : null;
        },
      },
      {
        label: 'Доля аренды от дохода семьи',
        unit: '%',
        getValue: (c) => {
          const col = c.sections['cost-of-living'];
          const rent = safeGet(col, '3 Bedroom Apartment Outside of City Centre');
          const salary = safeGet(col, 'Average Monthly Net Salary (After Tax)');
          if (rent === null || salary === null || salary === 0) return null;
          return Math.round((convertToEur(rent, c.city) / (convertToEur(salary, c.city) * 2)) * 1000) / 10;
        },
      },
    ],
  },
  {
    key: 'monthly-budget',
    label: 'Бюджет жизни',
    description: 'На двоих: 3BR аренда + коммуналка + интернет (общее) + 2× проездной + 2× мобильный + 70 обедов в кафе. Все в EUR.',
    unit: '€/мес',
    lowerIsBetter: true,
    calculate: calcMonthlyBudget,
    subMetrics: [
      {
        label: 'Аренда 3BR вне центра',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], '3 Bedroom Apartment Outside of City Centre');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Коммуналка 85м²',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], 'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Проездной (2 чел.)',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], 'Monthly Public Transport Pass (Regular Price)');
          return v !== null ? convertToEur(v, c.city) * 2 : null;
        },
      },
      {
        label: '70 обедов в кафе (2×35)',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], 'Meal at an Inexpensive Restaurant');
          return v !== null ? convertToEur(v, c.city) * 70 : null;
        },
      },
      {
        label: 'Интернет (60 Мбит/с+)',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], 'Broadband Internet (Unlimited Data, 60 Mbps or Higher)');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Мобильный (2 чел.)',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], 'Mobile Phone Plan (Monthly, with Calls and 10GB+ Data)');
          return v !== null ? convertToEur(v, c.city) * 2 : null;
        },
      },
    ],
  },
  {
    key: 'personal-safety',
    label: 'Личная безопасность',
    description: 'Взвешенная оценка: уровень преступности, безопасность днём и ночью, страх ограбления/нападения, коррупция.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcPersonalSafety,
    subMetrics: [
      {
        label: 'Уровень преступности (инверт.)',
        unit: '',
        getValue: (c) => {
          const v = safeGet(c.sections['crime'], 'Level of crime');
          return v !== null ? 100 - v : null;
        },
      },
      {
        label: 'Безопасность днём',
        unit: '',
        getValue: (c) => safeGet(c.sections['crime'], 'Safety walking alone during daylight'),
      },
      {
        label: 'Безопасность ночью',
        unit: '',
        getValue: (c) => safeGet(c.sections['crime'], 'Safety walking alone during night'),
      },
      {
        label: 'Нет страха ограбления',
        unit: '',
        getValue: (c) => {
          const v = safeGet(c.sections['crime'], 'Worries being mugged or robbed');
          return v !== null ? 100 - v : null;
        },
      },
      {
        label: 'Нет страха нападения',
        unit: '',
        getValue: (c) => {
          const v = safeGet(c.sections['crime'], 'Worries attacked');
          return v !== null ? 100 - v : null;
        },
      },
      {
        label: 'Низкая коррупция',
        unit: '',
        getValue: (c) => {
          const v = safeGet(c.sections['crime'], 'Problem corruption and bribery');
          return v !== null ? 100 - v : null;
        },
      },
    ],
  },
  {
    key: 'city-ecology',
    label: 'Экология города',
    description: 'Взвешенная оценка позитивных показателей: качество воздуха, воды, чистота улиц, парки, тишина.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcCityEcology,
    subMetrics: [
      { label: 'Качество воздуха', unit: '', getValue: (c) => safeGet(c.sections['pollution'], 'Air quality') },
      { label: 'Качество питьевой воды', unit: '', getValue: (c) => safeGet(c.sections['pollution'], 'Drinking Water Quality and Accessibility') },
      { label: 'Чистота улиц', unit: '', getValue: (c) => safeGet(c.sections['pollution'], 'Clean and Tidy') },
      { label: 'Парки и зелень', unit: '', getValue: (c) => safeGet(c.sections['pollution'], 'Quality of Green and Parks') },
      { label: 'Вывоз мусора', unit: '', getValue: (c) => safeGet(c.sections['pollution'], 'Garbage Disposal Satisfaction') },
      { label: 'Комфортность города', unit: '', getValue: (c) => safeGet(c.sections['pollution'], 'Comfortable to Spend Time in the City') },
      { label: 'Тишина и свет ночью', unit: '', getValue: (c) => safeGet(c.sections['pollution'], 'Quiet and No Problem with Night Lights') },
    ],
  },
  {
    key: 'healthcare',
    label: 'Здравоохранение',
    description: 'Взвешенная оценка: квалификация врачей, оборудование, стоимость, скорость, точность, отзывчивость персонала.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcHealthcare,
    subMetrics: [
      { label: 'Квалификация врачей', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Skill and competency of medical staff') },
      { label: 'Оборудование', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Equipment for modern diagnosis and treatment') },
      { label: 'Доступность по цене', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Satisfaction with cost to you') },
      { label: 'Скорость обследований', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Speed in completing examinations and reports') },
      { label: 'Точность отчётов', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Accuracy and completeness in filling out reports') },
      { label: 'Отзывчивость', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Satisfaction with responsiveness (waitings) in medical institutions') },
      { label: 'Дружелюбие персонала', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Friendliness and courtesy of the staff') },
      { label: 'Удобство расположения', unit: '', getValue: (c) => safeGet(c.sections['health-care'], 'Convenience of location for you') },
    ],
  },
  {
    key: 'urban-mobility',
    label: 'Городская мобильность',
    description: 'Среднее время поездки на работу и общий индекс пробок. 100 = 10 мин без пробок, 0 = 60+ мин в трафике.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcUrbanMobility,
    subMetrics: [
      { label: 'Среднее время поездки', unit: 'мин', getValue: (c) => safeGet(c.sections['traffic'], 'Average Travel Time') },
      { label: 'Индекс загруженности', unit: '', getValue: (c) => safeGet(c.sections['traffic'], 'Overall') },
    ],
  },
  {
    key: 'property-investment',
    label: 'Инвестиции в жильё',
    description: 'Gross rental yield (аренда × 12 / цена 50 м²) и ставка ипотеки. 100 = высокая доходность + низкая ставка.',
    unit: '',
    lowerIsBetter: false,
    calculate: calcPropertyInvestment,
    subMetrics: [
      {
        label: 'Аренда 1BR вне центра',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['property-investment'], '1 Bedroom Apartment Outside of City Centre');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Цена м² вне центра',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['property-investment'], 'Price per Square Meter to Buy Apartment Outside of Centre');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Gross rental yield',
        unit: '%',
        getValue: (c) => {
          const pi = c.sections['property-investment'];
          const rent = safeGet(pi, '1 Bedroom Apartment Outside of City Centre');
          const priceM2 = safeGet(pi, 'Price per Square Meter to Buy Apartment Outside of Centre');
          if (rent === null || priceM2 === null) return null;
          const rentEur = convertToEur(rent, c.city);
          const priceM2Eur = convertToEur(priceM2, c.city);
          if (priceM2Eur === 0) return null;
          return Math.round(((rentEur * 12) / (priceM2Eur * 50)) * 1000) / 10;
        },
      },
      {
        label: 'Ставка ипотеки (20 лет)',
        unit: '%',
        getValue: (c) => safeGet(c.sections['property-investment'], 'Annual Mortgage Interest Rate (20-Year Fixed, in %)'),
      },
    ],
  },
  {
    key: 'net-rental-yield',
    label: 'Чистая доходность аренды',
    description: '(Аренда − Коммуналка) × 12 / (Цена м² × 50) × 100. Чистый годовой доход от 1BR квартиры за вычетом расходов на содержание.',
    unit: '%',
    lowerIsBetter: false,
    scaleToData: true,
    calculate: calcNetRentalYield,
    subMetrics: [
      {
        label: 'Аренда 1BR вне центра',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['property-investment'], '1 Bedroom Apartment Outside of City Centre');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Коммуналка 85м²',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['cost-of-living'], 'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)');
          return v !== null ? convertToEur(v, c.city) : null;
        },
      },
      {
        label: 'Чистый доход в год',
        unit: '€',
        getValue: (c) => {
          const pi = c.sections['property-investment'];
          const col = c.sections['cost-of-living'];
          const rent = safeGet(pi, '1 Bedroom Apartment Outside of City Centre');
          if (rent === null) return null;
          const rentEur = convertToEur(rent, c.city);
          const utilities = safeGet(col, 'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)');
          const utilitiesEur = utilities !== null ? convertToEur(utilities, c.city) : 0;
          return Math.round((rentEur - utilitiesEur) * 12);
        },
      },
      {
        label: 'Стоимость квартиры (50м²)',
        unit: '€',
        getValue: (c) => {
          const v = safeGet(c.sections['property-investment'], 'Price per Square Meter to Buy Apartment Outside of Centre');
          return v !== null ? Math.round(convertToEur(v, c.city) * 50) : null;
        },
      },
    ],
  },
];
