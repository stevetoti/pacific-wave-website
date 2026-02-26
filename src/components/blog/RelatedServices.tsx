import Link from 'next/link';

interface RelatedServicesProps {
  category: string | null;
}

const servicesByCategory: Record<string, { title: string; description: string; icon: string }[]> = {
  'AI Solutions': [
    { title: 'AI Chatbots', description: 'Smart customer service that works 24/7', icon: '🤖' },
    { title: 'Business Automation', description: 'Streamline workflows and reduce costs', icon: '⚡' },
    { title: 'Predictive Analytics', description: 'Data-driven decision making', icon: '📊' },
  ],
  'Web Development': [
    { title: 'Custom Websites', description: 'Fast, responsive sites for Pacific businesses', icon: '🌐' },
    { title: 'E-commerce', description: 'Online stores with local payment support', icon: '🛒' },
    { title: 'Web Applications', description: 'Powerful tools for your operations', icon: '💻' },
  ],
  'Mobile Development': [
    { title: 'iOS & Android Apps', description: 'Native apps built for Pacific conditions', icon: '📱' },
    { title: 'Offline-First Design', description: 'Works even without internet', icon: '📡' },
    { title: 'Cross-Platform', description: 'One codebase, all devices', icon: '🔄' },
  ],
  'Digital Marketing': [
    { title: 'SEO', description: 'Get found by tourists and locals', icon: '🔍' },
    { title: 'Social Media', description: 'Engage your Pacific audience', icon: '📣' },
    { title: 'Google Ads', description: 'Target the right customers', icon: '🎯' },
  ],
};

const defaultServices = [
  { title: 'Web Development', description: 'Fast, responsive websites', icon: '🌐' },
  { title: 'AI Solutions', description: 'Smart automation for your business', icon: '🤖' },
  { title: 'Digital Marketing', description: 'Grow your online presence', icon: '📣' },
];

export default function RelatedServices({ category }: RelatedServicesProps) {
  const services = category && servicesByCategory[category] 
    ? servicesByCategory[category] 
    : defaultServices;

  return (
    <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
      <h3 className="text-xl font-bold text-deep-blue font-heading mb-2">
        Related Services
      </h3>
      <p className="text-gray-600 text-sm mb-6">
        Explore how Pacific Wave Digital can help your business with these services:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {services.map((service, index) => (
          <div 
            key={index}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-vibrant-orange hover:shadow-md transition-all"
          >
            <span className="text-2xl mb-2 block">{service.icon}</span>
            <h4 className="font-semibold text-deep-blue text-sm mb-1">{service.title}</h4>
            <p className="text-gray-500 text-xs">{service.description}</p>
          </div>
        ))}
      </div>

      <Link
        href="/services"
        className="inline-flex items-center text-vibrant-orange font-semibold hover:underline"
      >
        View All Services
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}
