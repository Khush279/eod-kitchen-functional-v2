import Link from 'next/link';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import ReceiptUpload from './components/ReceiptUpload';

export default function HomePage() {
  const features = [
    {
      title: 'Receipt OCR',
      description: 'Upload receipt photos and automatically extract grocery items using Google Vision AI',
      icon: '📸',
      href: '/',
      action: 'Upload Receipt'
    },
    {
      title: 'Smart Pantry',
      description: 'Manage your pantry inventory with expiration tracking and categorization',
      icon: '📦',
      href: '/pantry',
      action: 'Manage Pantry'
    },
    {
      title: 'Recipe Generator',
      description: 'Generate personalized recipes based on your available ingredients',
      icon: '👨‍🍳',
      href: '/recipes',
      action: 'Generate Recipes'
    },
    {
      title: 'Meal Planning',
      description: 'Create weekly meal plans with shopping lists tailored to your preferences',
      icon: '📅',
      href: '/meals',
      action: 'Plan Meals'
    }
  ];

  const stats = [
    { label: 'AI-Powered', value: 'Google Cloud', description: 'Vision & Gemini AI integration' },
    { label: 'Smart Planning', value: '7-Day', description: 'Automated meal planning' },
    { label: 'Zero Waste', value: 'Expiry', description: 'Tracking & alerts' },
    { label: 'Personalized', value: 'Dietary', description: 'Preferences & restrictions' }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            <span className="text-primary-600">EOD Kitchen</span>
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600">
            Transform Receipts into Smart Meal Plans
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Upload your grocery receipts and let AI create personalized meal plans, 
            manage your pantry, and generate recipes based on what you have.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/pantry">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Generate Recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <Card.Content className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary-600">{stat.value}</div>
                <div className="font-medium text-gray-900">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Receipt Upload Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start with a Receipt
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your grocery receipt and watch as AI extracts items, 
            categorizes them, and adds them to your pantry automatically.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ReceiptUpload />
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From receipt scanning to meal planning, EOD Kitchen provides all the tools 
            you need for smart kitchen management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <Card.Content className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-gray-600">
                    {feature.description}
                  </p>

                  <Link href={feature.href}>
                    <Button variant="outline" className="w-full">
                      {feature.action}
                    </Button>
                  </Link>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <Card>
        <Card.Header>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            How It Works
          </h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900">Upload Receipt</h3>
              <p className="text-sm text-gray-600">
                Take a photo or upload an image of your grocery receipt
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900">AI Extraction</h3>
              <p className="text-sm text-gray-600">
                Google Vision AI reads and categorizes your grocery items
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900">Smart Planning</h3>
              <p className="text-sm text-gray-600">
                Gemini AI creates personalized meal plans and recipes
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900">Enjoy Cooking</h3>
              <p className="text-sm text-gray-600">
                Follow step-by-step recipes and track your pantry
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Tech Stack */}
      <Card>
        <Card.Header>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Powered by Google Cloud AI
          </h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="font-semibold text-gray-900">Google Vision AI</h3>
              <p className="text-sm text-gray-600">
                Advanced OCR technology that accurately reads text from receipt images
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-gray-900">Google Gemini AI</h3>
              <p className="text-sm text-gray-600">
                Intelligent recipe generation and meal planning based on your ingredients
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
