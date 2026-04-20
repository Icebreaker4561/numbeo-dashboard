import { promises as fs } from 'fs';
import path from 'path';
import { filterValidCities } from '@/lib/dataUtils';
import type { CityData } from '@/lib/dataUtils';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'app', 'data', 'cities.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const allCities: CityData[] = JSON.parse(raw);
  const validCities = filterValidCities(allCities);

  return <Dashboard cities={validCities} />;
}
