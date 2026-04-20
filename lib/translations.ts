export const UI = {
  title: 'Дашборд городов',
  subtitle: (cities: number, categories: number) =>
    `Сравнение ${cities} городов по ${categories} категориям`,
  selectCities: 'Выбор городов',
  selected: (n: number) => `${n} выбрано`,
  all: 'Все',
  none: 'Нет',
  colorLegend: 'Легенда',
  noData: 'Нет данных. Выберите хотя бы один город.',
  metricsCount: (m: number, c: number) => `${m} показателей · ${c} городов`,
  footer: (date: string) => `Данные: Numbeo · Обновлено ${date}`,
  selectOneCity: 'Выберите хотя бы один город для отображения графиков.',
};

export const SECTION_LABELS_RU: Record<string, string> = {
  'cost-of-living': 'Стоимость жизни',
  'quality-of-life': 'Качество жизни',
  crime: 'Преступность',
  'health-care': 'Здравоохранение',
  pollution: 'Загрязнение',
  traffic: 'Транспорт',
  'property-investment': 'Недвижимость',
};

export const METRIC_LABELS_RU: Record<string, string> = {
  // cost-of-living — питание и рестораны
  'Meal at an Inexpensive Restaurant': 'Обед в дешёвом ресторане',
  'Meal for Two at a Mid-Range Restaurant (Three Courses, Without Drinks)': 'Обед на двоих (средний ресторан, без напитков)',
  "Combo Meal at McDonald's (or Equivalent Fast-Food Meal)": 'Комбо в McDonald\'s',
  'Domestic Draft Beer (0.5 Liter)': 'Пиво разливное местное (0.5 л)',
  'Imported Beer (0.33 Liter Bottle)': 'Пиво импортное (0.33 л)',
  'Domestic Beer (0.5 Liter Bottle)': 'Пиво местное в бутылке (0.5 л)',
  'Cappuccino (Regular Size)': 'Капучино (обычный)',
  'Soft Drink (Coca-Cola or Pepsi, 0.33 Liter Bottle)': 'Безалкогольный напиток (0.33 л)',
  'Bottled Water (0.33 Liter)': 'Вода в бутылке (0.33 л)',
  'Bottled Water (1.5 Liter)': 'Вода в бутылке (1.5 л)',
  'Bottle of Wine (Mid-Range)': 'Бутылка вина (средняя)',
  // продукты
  'Milk (Regular, 1 Liter)': 'Молоко (1 л)',
  'Fresh White Bread (500 g Loaf)': 'Белый хлеб (500 г)',
  'White Rice (1 kg)': 'Белый рис (1 кг)',
  'Eggs (12, Large Size)': 'Яйца (12 шт, крупные)',
  'Local Cheese (1 kg)': 'Местный сыр (1 кг)',
  'Chicken Fillets (1 kg)': 'Куриное филе (1 кг)',
  'Beef Round or Equivalent Back Leg Red Meat (1 kg)': 'Говядина (1 кг)',
  'Apples (1 kg)': 'Яблоки (1 кг)',
  'Bananas (1 kg)': 'Бананы (1 кг)',
  'Oranges (1 kg)': 'Апельсины (1 кг)',
  'Tomatoes (1 kg)': 'Помидоры (1 кг)',
  'Potatoes (1 kg)': 'Картофель (1 кг)',
  'Onions (1 kg)': 'Лук (1 кг)',
  'Lettuce (1 Head)': 'Салат (1 кочан)',
  // транспорт
  'One-Way Ticket (Local Transport)': 'Проездной билет (одна поездка)',
  'Monthly Public Transport Pass (Regular Price)': 'Проездной на месяц',
  'Taxi Start (Standard Tariff)': 'Такси: посадка',
  'Taxi 1 km (Standard Tariff)': 'Такси: 1 км',
  'Taxi 1 Hour Waiting (Standard Tariff)': 'Такси: час ожидания',
  'Gasoline (1 Liter)': 'Бензин (1 л)',
  'Volkswagen Golf 1.5 (or Equivalent New Compact Car)': 'VW Golf 1.5 (новый компакт)',
  'Toyota Corolla Sedan 1.6 (or Equivalent New Mid-Size Car)': 'Toyota Corolla 1.6 (новый)',
  // коммуналка
  'Basic Utilities for 85 m2 Apartment (Electricity, Heating, Cooling, Water, Garbage)': 'Коммунальные услуги (85 м², свет/отоп./вода/мусор)',
  'Mobile Phone Plan (Monthly, with Calls and 10GB+ Data)': 'Мобильный тариф (в месяц, 10 ГБ+)',
  'Broadband Internet (Unlimited Data, 60 Mbps or Higher)': 'Интернет (безлим, 60 Мбит/с+)',
  // спорт/одежда/развлечения
  'Fitness Club, Monthly Fee for 1 Adult': 'Фитнес-клуб (в месяц)',
  'Monthly Fitness Club Membership': 'Фитнес-клуб (абонемент)',
  'Tennis Court Rental (1 Hour, Weekend)': 'Аренда теннисного корта (1 час, выходной)',
  'Cinema Ticket (International Release)': 'Билет в кино',
  'Jeans (Levi\'s 501 or Similar)': 'Джинсы (Levi\'s 501)',
  'Summer Dress in a Chain Store (e.g. Zara or H&M)': 'Летнее платье (Zara/H&M)',
  'Nike Running Shoes (Mid-Range)': 'Nike (кроссовки, средний сегмент)',
  'Men\'s Leather Business Shoes': 'Мужские кожаные туфли',
  // образование
  'Private Full-Day Preschool or Kindergarten, Monthly Fee per Child': 'Частный детский сад (в месяц)',
  'International Primary School, Annual Tuition per Child': 'Международная школа (год)',
  // аренда / зарплата
  '1 Bedroom Apartment in City Centre': '1-комн. квартира в центре (аренда)',
  '1 Bedroom Apartment Outside of City Centre': '1-комн. квартира вне центра (аренда)',
  '3 Bedroom Apartment in City Centre': '3-комн. квартира в центре (аренда)',
  '3 Bedroom Apartment Outside of City Centre': '3-комн. квартира вне центра (аренда)',
  'Average Monthly Net Salary (After Tax)': 'Средняя зарплата (чистыми, в месяц)',
  'Annual Mortgage Interest Rate (20-Year Fixed, in %)': 'Ипотечная ставка (20 лет, фикс., %)',
  // покупка недвижимости
  'Price per Square Meter to Buy Apartment in City Centre': 'Цена м² в центре',
  'Price per Square Meter to Buy Apartment Outside of Centre': 'Цена м² вне центра',

  // quality-of-life
  'Purchasing Power Index': 'Индекс покупательной способности',
  'Safety Index': 'Индекс безопасности',
  'Health Care Index': 'Индекс здравоохранения',
  'Climate Index': 'Индекс климата',
  'Cost of Living Index': 'Индекс стоимости жизни',
  'Property Price to Income Ratio': 'Соотношение цена/доход на недвижимость',
  'Pollution Index': 'Индекс загрязнения',
  'Traffic Commute Time Index': 'Индекс времени в пробках',
  'ƒ Quality of Life Index:': 'Индекс качества жизни',

  // crime
  'Level of crime': 'Уровень преступности',
  'Crime increasing in the past 5 years': 'Рост преступности за 5 лет',
  'Worries home broken and things stolen': 'Опасения: кража из дома',
  'Worries being mugged or robbed': 'Опасения: ограбление',
  'Worries car stolen': 'Опасения: угон автомобиля',
  'Worries things from car stolen': 'Опасения: кража из машины',
  'Worries attacked': 'Опасения: нападение',
  'Worries being insulted': 'Опасения: оскорбление',
  'Worries being subject to a physical attack because of your skin color, ethnic origin, gender or religion':
    'Опасения: нападение по расовым/гендерным причинам',
  'Problem people using or dealing drugs': 'Проблема: наркотики',
  'Problem property crimes such as vandalism and theft': 'Проблема: вандализм и кражи',
  'Problem violent crimes such as assault and armed robbery': 'Проблема: насилие и вооружённый грабёж',
  'Problem corruption and bribery': 'Проблема: коррупция и взятки',
  'Safety walking alone during daylight': 'Безопасность: прогулка днём',
  'Safety walking alone during night': 'Безопасность: прогулка ночью',

  // health-care
  'Skill and competency of medical staff': 'Квалификация медперсонала',
  'Speed in completing examinations and reports': 'Скорость обследований',
  'Equipment for modern diagnosis and treatment': 'Оборудование для диагностики и лечения',
  'Accuracy and completeness in filling out reports': 'Точность и полнота документации',
  'Friendliness and courtesy of the staff': 'Вежливость персонала',
  'Satisfaction with responsiveness (waitings) in medical institutions': 'Удовлетворённость временем ожидания',
  'Satisfaction with cost to you': 'Удовлетворённость стоимостью',
  'Convenience of location for you': 'Удобство расположения клиник',

  // pollution
  'Air Pollution': 'Загрязнение воздуха',
  'Air quality': 'Качество воздуха',
  'Water Pollution': 'Загрязнение воды',
  'Water Quality': 'Качество воды',
  'Drinking Water Pollution and Inaccessibility': 'Загрязнение питьевой воды',
  'Drinking Water Quality and Accessibility': 'Качество питьевой воды',
  'Noise and Light Pollution': 'Шум и световое загрязнение',
  'Clean and Tidy': 'Чистота и порядок',
  'Dirty and Untidy': 'Грязь и беспорядок',
  'Dissatisfaction with Garbage Disposal': 'Недовольство вывозом мусора',
  'Garbage Disposal Satisfaction': 'Удовлетворённость вывозом мусора',
  'Dissatisfaction with Green and Parks in the City': 'Недовольство зелёными зонами',
  'Quality of Green and Parks': 'Качество парков и зелёных зон',
  'Dissatisfaction with Spending Time in the City': 'Дискомфорт от пребывания в городе',
  'Comfortable to Spend Time in the City': 'Комфорт пребывания в городе',
  'Quiet and No Problem with Night Lights': 'Тишина и отсутствие световых помех',

  // traffic
  'Working from Home': 'Работа из дома',
  'Walking': 'Пешком',
  'Bicycle': 'На велосипеде',
  'Motorcycle': 'На мотоцикле',
  'Car': 'На машине',
  'Bus/Trolleybus': 'Автобус/Троллейбус',
  'Train/Metro': 'Поезд/Метро',
  'Tram/Streetcar': 'Трамвай',
  'Bus/Trolleybus Ride': 'Поездка на автобусе/троллейбусе',
  'Train/Metro Ride': 'Поездка на поезде/метро',
  'Tram/Streetcat Ride': 'Поездка на трамвае',
  'Driving Car': 'За рулём',
  'Overall': 'В среднем',
  'Average Distance': 'Средняя дистанция (км)',
  'Average Travel Time': 'Среднее время в пути (мин)',
  'Distance': 'Расстояние',
  'Waiting': 'Ожидание',
  'Motorcycle ': 'На мотоцикле',
};

export function t(key: string): string {
  return METRIC_LABELS_RU[key] ?? key;
}

export function tSection(key: string): string {
  return SECTION_LABELS_RU[key] ?? key;
}
