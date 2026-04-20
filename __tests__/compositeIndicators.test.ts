import {
  safeGet,
  clamp,
  weightedMean,
  calcHousingAffordability,
  calcMonthlyBudget,
  calcPersonalSafety,
  calcCityEcology,
  calcHealthcare,
  calcUrbanMobility,
  calcPropertyInvestment,
} from '../lib/compositeIndicators';
import type { CityData } from '../lib/dataUtils';

const barcelonaData: CityData = {
  city: 'Barcelona',
  scrapedAt: '2026-01-01T00:00:00Z',
  sections: {
    'cost-of-living': {
      'Meal at an Inexpensive Restaurant': 15,
      '1 Bedroom Apartment Outside of City Centre': 1108.92,
      'Average Monthly Net Salary (After Tax)': 2069.1,
      'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)': 156.69,
      'Monthly Public Transport Pass (Regular Price)': 22,
      'Broadband Internet (Unlimited Data, 60 Mbps or Higher)': 33,
      'Mobile Phone Plan (Monthly, with Calls and 10GB+ Data)': 16.2,
    },
    crime: {
      'Level of crime': 58.01,
      'Safety walking alone during daylight': 68.64,
      'Safety walking alone during night': 41.85,
      'Worries being mugged or robbed': 60.05,
      'Worries attacked': 47.06,
      'Problem corruption and bribery': 55.24,
    },
    'health-care': {
      'Skill and competency of medical staff': 79.65,
      'Speed in completing examinations and reports': 76.16,
      'Equipment for modern diagnosis and treatment': 88.37,
      'Accuracy and completeness in filling out reports': 73.84,
      'Friendliness and courtesy of the staff': 72.09,
      'Satisfaction with responsiveness (waitings) in medical institutions': 66.07,
      'Satisfaction with cost to you': 68.6,
      'Convenience of location for you': 80.95,
    },
    pollution: {
      'Air quality': 39.46,
      'Drinking Water Quality and Accessibility': 49.33,
      'Clean and Tidy': 53.46,
      'Quality of Green and Parks': 50.23,
      'Garbage Disposal Satisfaction': 68.21,
      'Comfortable to Spend Time in the City': 50.55,
      'Quiet and No Problem with Night Lights': 36.89,
    },
    traffic: {
      'Average Travel Time': 29.71,
      'Overall': 38.97,
    },
    'property-investment': {
      '1 Bedroom Apartment Outside of City Centre': 1108.92,
      'Price per Square Meter to Buy Apartment Outside of Centre': 4202.5,
      'Annual Mortgage Interest Rate (20-Year Fixed, in %)': 3.24,
    },
  },
};

// Yerevan uses AMD currency (rate 0.0024)
const yerevanData: CityData = {
  city: 'Yerevan',
  scrapedAt: '2026-01-01T00:00:00Z',
  sections: {
    'cost-of-living': {
      'Meal at an Inexpensive Restaurant': 3000,
      '1 Bedroom Apartment Outside of City Centre': 200000,
      'Average Monthly Net Salary (After Tax)': 300000,
      'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)': 30000,
      'Monthly Public Transport Pass (Regular Price)': 5000,
      'Broadband Internet (Unlimited Data, 60 Mbps or Higher)': 5000,
      'Mobile Phone Plan (Monthly, with Calls and 10GB+ Data)': 3000,
    },
    'property-investment': {
      '1 Bedroom Apartment Outside of City Centre': 200000,
      'Price per Square Meter to Buy Apartment Outside of Centre': 500000,
      'Annual Mortgage Interest Rate (20-Year Fixed, in %)': 10,
    },
  },
};

const sparseCity: CityData = {
  city: 'SparseCity',
  scrapedAt: '2026-01-01T00:00:00Z',
  sections: {
    crime: {
      'Level of crime': 50,
      'Safety walking alone during daylight': 70,
      'Safety walking alone during night': 60,
    },
  },
};

const emptyCrimeCity: CityData = {
  city: 'EmptyCrimeCity',
  scrapedAt: '2026-01-01T00:00:00Z',
  sections: {
    crime: {
      'Level of crime': 50,
      'Safety walking alone during daylight': 70,
    },
  },
};

describe('safeGet', () => {
  it('returns value for existing numeric key', () => {
    expect(safeGet({ foo: 42 }, 'foo')).toBe(42);
  });
  it('returns null for missing key', () => {
    expect(safeGet({ foo: 42 }, 'bar')).toBeNull();
  });
  it('returns null for undefined section', () => {
    expect(safeGet(undefined, 'foo')).toBeNull();
  });
});

describe('clamp', () => {
  it('clamps below min', () => expect(clamp(-5, 0, 100)).toBe(0));
  it('clamps above max', () => expect(clamp(150, 0, 100)).toBe(100));
  it('passes through mid value', () => expect(clamp(50, 0, 100)).toBe(50));
});

describe('weightedMean', () => {
  it('computes weighted mean', () => {
    const result = weightedMean([[10, 1], [20, 3]], 1);
    expect(result).toBeCloseTo(17.5);
  });
  it('returns null when below minCount', () => {
    expect(weightedMean([[null, 1], [null, 1], [10, 1]], 4)).toBeNull();
  });
  it('skips null values and reweights', () => {
    const result = weightedMean([[null, 2], [20, 1]], 1);
    expect(result).toBeCloseTo(20);
  });
});

describe('calcHousingAffordability', () => {
  it('returns score for Barcelona (rent/salary ~0.54 → ~46)', () => {
    const score = calcHousingAffordability(barcelonaData);
    expect(score).not.toBeNull();
    expect(score!).toBeCloseTo(100 - (1108.92 / 2069.1) * 100, 0);
  });
  it('returns null when rent is missing', () => {
    const city: CityData = {
      city: 'X',
      scrapedAt: '',
      sections: { 'cost-of-living': { 'Average Monthly Net Salary (After Tax)': 2000 } },
    };
    expect(calcHousingAffordability(city)).toBeNull();
  });
  it('returns null when salary is missing', () => {
    const city: CityData = {
      city: 'X',
      scrapedAt: '',
      sections: { 'cost-of-living': { '1 Bedroom Apartment Outside of City Centre': 1000 } },
    };
    expect(calcHousingAffordability(city)).toBeNull();
  });
});

describe('calcMonthlyBudget', () => {
  it('returns EUR budget for Barcelona', () => {
    const budget = calcMonthlyBudget(barcelonaData);
    expect(budget).not.toBeNull();
    // rent + utilities + transport + meals*20 + broadband + mobile
    const expected = 1108.92 + 156.69 + 22 + 15 * 20 + 33 + 16.2;
    expect(budget!).toBeCloseTo(expected, 0);
  });
  it('converts AMD to EUR for Yerevan', () => {
    const budget = calcMonthlyBudget(yerevanData);
    expect(budget).not.toBeNull();
    // values in AMD * 0.0024
    const rentEur = 200000 * 0.0024;
    const utilitiesEur = 30000 * 0.0024;
    const transportEur = 5000 * 0.0024;
    const mealsEur = 3000 * 0.0024 * 20;
    const broadbandEur = 5000 * 0.0024;
    const mobileEur = 3000 * 0.0024;
    const expected = rentEur + utilitiesEur + transportEur + mealsEur + broadbandEur + mobileEur;
    expect(budget!).toBeCloseTo(expected, 0);
  });
  it('returns null when rent is missing', () => {
    const city: CityData = { city: 'X', scrapedAt: '', sections: {} };
    expect(calcMonthlyBudget(city)).toBeNull();
  });
});

describe('calcPersonalSafety', () => {
  it('returns weighted safety score for Barcelona (expect ~48)', () => {
    const score = calcPersonalSafety(barcelonaData);
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(40);
    expect(score!).toBeLessThan(60);
  });
  it('returns non-null for sparse city with exactly 3 values', () => {
    expect(calcPersonalSafety(sparseCity)).not.toBeNull();
  });
  it('returns null for city with fewer than 3 values', () => {
    expect(calcPersonalSafety(emptyCrimeCity)).toBeNull();
  });
});

describe('calcCityEcology', () => {
  it('returns ecology score for Barcelona (expect ~49)', () => {
    const score = calcCityEcology(barcelonaData);
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(40);
    expect(score!).toBeLessThan(60);
  });
  it('returns null when no pollution data', () => {
    const city: CityData = { city: 'X', scrapedAt: '', sections: {} };
    expect(calcCityEcology(city)).toBeNull();
  });
});

describe('calcHealthcare', () => {
  it('returns healthcare score for Barcelona (expect ~76)', () => {
    const score = calcHealthcare(barcelonaData);
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(70);
    expect(score!).toBeLessThan(85);
  });
  it('returns null when fewer than 4 metrics available', () => {
    const city: CityData = {
      city: 'X',
      scrapedAt: '',
      sections: {
        'health-care': {
          'Skill and competency of medical staff': 80,
          'Equipment for modern diagnosis and treatment': 90,
          'Satisfaction with cost to you': 70,
        },
      },
    };
    expect(calcHealthcare(city)).toBeNull();
  });
});

describe('calcUrbanMobility', () => {
  it('returns mobility score for Barcelona', () => {
    const score = calcUrbanMobility(barcelonaData);
    expect(score).not.toBeNull();
    // avgTravelTime=29.71 → timeScore=(60-29.71)/50*100=60.58
    // overall=38.97 → overallScore=(70-38.97)/60*100=51.72
    // score = 60.58*0.6 + 51.72*0.4 = 57.04
    expect(score!).toBeCloseTo(57, 0);
  });
  it('returns null when travel time is missing', () => {
    const city: CityData = {
      city: 'X',
      scrapedAt: '',
      sections: { traffic: { 'Overall': 40 } },
    };
    expect(calcUrbanMobility(city)).toBeNull();
  });
  it('returns null when overall is missing', () => {
    const city: CityData = {
      city: 'X',
      scrapedAt: '',
      sections: { traffic: { 'Average Travel Time': 30 } },
    };
    expect(calcUrbanMobility(city)).toBeNull();
  });
});

describe('calcPropertyInvestment', () => {
  it('returns investment score for Barcelona', () => {
    const score = calcPropertyInvestment(barcelonaData);
    expect(score).not.toBeNull();
    // grossYield = (1108.92*12)/(4202.5*50)*100 = 6.33%
    // yieldScore = clamp((6.33-3)/9*100, 0, 100) = 37.0
    // mortgageScore = clamp((15-3.24)/13*100, 0, 100) = 90.46
    // score = 37.0*0.65 + 90.46*0.35 = 55.7
    expect(score!).toBeGreaterThan(45);
    expect(score!).toBeLessThan(65);
  });
  it('converts AMD for Yerevan investment', () => {
    const score = calcPropertyInvestment(yerevanData);
    expect(score).not.toBeNull();
    // rent=200000 AMD → 480 EUR, price=500000 AMD → 1200 EUR
    // grossYield = (480*12)/(1200*50)*100 = 9.6%
    // yieldScore = clamp((9.6-3)/9*100, 0, 100) = 73.3
    // mortgageScore = clamp((15-10)/13*100, 0, 100) = 38.46
    // score = 73.3*0.65 + 38.46*0.35 = 61.1
    expect(score!).toBeGreaterThan(50);
    expect(score!).toBeLessThan(75);
  });
  it('returns null when price data missing', () => {
    const city: CityData = {
      city: 'X',
      scrapedAt: '',
      sections: { 'property-investment': { '1 Bedroom Apartment Outside of City Centre': 1000 } },
    };
    expect(calcPropertyInvestment(city)).toBeNull();
  });
});
