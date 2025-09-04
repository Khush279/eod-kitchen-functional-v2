import MealPlanner from '../components/MealPlanner';

export const metadata = {
  title: 'Meal Planner - EOD Kitchen',
  description: 'Generate smart meal plans and shopping lists based on your pantry',
};

export default function MealsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
        <p className="text-gray-600 mt-2">
          Plan your meals and generate shopping lists based on your pantry inventory
        </p>
      </div>

      <MealPlanner />
    </div>
  );
}
