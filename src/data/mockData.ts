import { App, Category, Platform } from '../types/app.types';

const LOGOS = [
  'https://images.pexels.com/photos/5726693/pexels-photo-5726693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/5082580/pexels-photo-5082580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/13009432/pexels-photo-13009432.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/13265592/pexels-photo-13265592.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
];

const APP_NAMES = [
  'Expedia',
  'Nike',
  'Dropbox',
  'Creme',
  'Klarna',
  'Wise',
  'Revolut',
  'Monzo',
  'Notion',
  'Trello',
];

const APP_DESCRIPTIONS = [
  'Trip planner & booking app',
  'Sports & fitness app',
  'Cloud storage & file sharing',
  'Creative design tool',
  'Payment & shopping app',
  'Money transfer & exchange',
  'Banking & finance app',
  'Digital banking app',
  'Productivity & notes app',
  'Project management tool',
];

const CATEGORIES: Category[] = [
  'All',
  'Finance',
  'Business',
  'Health & Fitness',
  'Food & Drink',
  'Education',
  'Shopping',
  'Artificial Intelligence',
  'Travel & Transportation',
  'Lifestyle',
  'Entertainment',
  'Communication',
];

const PLATFORMS: Platform[] = ['iOS', 'Android'];

const SCREEN_URLS = [
  'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/5082586/pexels-photo-5082586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/4132538/pexels-photo-4132538.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/35550/ipad-tablet-technology-touch.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/947448/pexels-photo-947448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
];

// Generate mock apps data
export const generateMockApps = (count: number): App[] => {
  const apps: App[] = [];

  for (let i = 0; i < count; i++) {
    const appIndex = Math.floor(Math.random() * APP_NAMES.length);
    const categoryIndex = Math.floor(Math.random() * CATEGORIES.length);
    const platformIndex = Math.floor(Math.random() * PLATFORMS.length);
    const updated = Math.random() > 0.5;
    const updatedDate = new Date();
    updatedDate.setDate(updatedDate.getDate() - Math.floor(Math.random() * 30));

    // Generate 1-5 screens for each app
    const screens = Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map((_, j) => ({
      id: `screen-${i}-${j}`,
      url: SCREEN_URLS[Math.floor(Math.random() * SCREEN_URLS.length)],
      alt: `${APP_NAMES[appIndex]} screen ${j + 1}`,
    }));

    apps.push({
      id: `app-${i}`,
      name: APP_NAMES[appIndex],
      logo: LOGOS[Math.floor(Math.random() * LOGOS.length)],
      description: APP_DESCRIPTIONS[appIndex],
      category: CATEGORIES[categoryIndex === 0 ? 1 + Math.floor(Math.random() * (CATEGORIES.length - 1)) : categoryIndex],
      platform: PLATFORMS[platformIndex],
      screens,
      updated,
      updatedAt: updatedDate,
    });
  }

  return apps;
};

export const mockApps = generateMockApps(30);
export { CATEGORIES, PLATFORMS };