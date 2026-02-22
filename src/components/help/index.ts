// Help System Components - Public API
// =====================================
// 
// This module exports all help system components for embedding
// in other applications or pages.

export { HelpWidget, type HelpWidgetProps, type WidgetConfig, type HelpArticle } from '../HelpWidget';
export { default as HelpTooltip } from '../HelpTooltip';

// Usage Examples:
// ---------------
// 
// Basic HelpWidget:
// ```tsx
// import { HelpWidget } from '@/components/help';
// 
// export default function App() {
//   return (
//     <div>
//       <YourApp />
//       <HelpWidget 
//         siteId="your-site-id"
//         primaryColor="#233C6F"
//         accentColor="#EF5E33"
//       />
//     </div>
//   );
// }
// ```
// 
// HelpTooltip for contextual help:
// ```tsx
// import { HelpTooltip } from '@/components/help';
// 
// export default function FeaturePage() {
//   return (
//     <div>
//       <h1>
//         AI Citability Score
//         <HelpTooltip feature="citability" />
//       </h1>
//     </div>
//   );
// }
// ```
