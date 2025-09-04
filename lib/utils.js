export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const foodCategories = [
  'produce',
  'dairy',
  'meat',
  'seafood',
  'pantry',
  'frozen',
  'bakery',
  'beverages',
  'snacks',
  'other'
];

export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

export const commonDietaryRestrictions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'low-carb',
  'keto',
  'paleo'
];

export const cuisineTypes = [
  'american',
  'italian',
  'mexican',
  'chinese',
  'indian',
  'thai',
  'japanese',
  'french',
  'mediterranean',
  'middle-eastern'
];
