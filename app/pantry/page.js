import PantryManager from '../components/PantryManager';

export const metadata = {
  title: 'Pantry Management - EOD Kitchen',
  description: 'Manage your pantry inventory with smart categorization and expiry tracking',
};

export default function PantryPage() {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Pantry Management</h1>
        <p className="text-gray-600 mt-2">
          Keep track of your ingredients with smart categorization and expiry alerts
        </p>
      </div>

      <PantryManager />
    </div>
  );
}
