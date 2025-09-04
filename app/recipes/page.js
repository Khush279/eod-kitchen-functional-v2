import RecipeGenerator from '../components/RecipeGenerator';

export const metadata = {
  title: 'Recipe Generator - EOD Kitchen',
  description: 'Generate personalized recipes based on your pantry ingredients using AI',
};

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Recipe Generator</h1>
        <p className="text-gray-600 mt-2">
          Create delicious recipes using ingredients from your pantry
        </p>
      </div>

      <RecipeGenerator />
    </div>
  );
}
