export interface ProjectCaseStudy {
  slug: string;
  name: string;
  category: string;
  location: string;
  website: string;
  summary: string;
  context: string;
  approach: string;
  features: readonly { title: string; description: string }[];
  delivery: string;
  services: readonly { href: string; label: string }[];
}

export const projectCaseStudies: readonly ProjectCaseStudy[] = [
  {
    slug: 'aelan-basket', name: 'Aelan Basket', category: 'E-commerce website',
    location: 'Port Vila, Vanuatu', website: 'https://www.aelanbasket.com',
    summary: 'An online grocery storefront connecting product discovery, a shopping basket and delivery information for Port Vila customers.',
    context: 'For a grocery business, a website needs to help shoppers find what they need and understand how to order. Pacific Wave Digital built Aelan Basket’s e-commerce website for its Port Vila operation.',
    approach: 'The storefront organises groceries into shopping categories and provides search, a cart and customer account access. Delivery information sits alongside the shopping journey so visitors can understand the service before ordering.',
    features: [
      { title: 'Product discovery', description: 'A searchable catalogue and category navigation help shoppers browse different types of groceries and household products.' },
      { title: 'Shopping journey', description: 'Shopping-cart and account features connect browsing with the next steps of an online order.' },
      { title: 'Local delivery information', description: 'Port Vila delivery messaging gives the storefront a clear local service context.' },
    ],
    delivery: 'The public storefront provides a concrete example of e-commerce development for a Vanuatu business. Its live site shows the catalogue navigation, shopping entry points and delivery messaging; customer order records remain private.',
    services: [{ href: '/services/ecommerce', label: 'E-commerce development' }, { href: '/services/web-development', label: 'Web development' }],
  },
  {
    slug: 'enauwi-beach-resort', name: 'E’Nauwi Beach Resort', category: 'Resort website',
    location: 'Efate, Vanuatu', website: 'https://www.enauwibeachresort.org',
    summary: 'A resort website bringing accommodation, guest experiences, travel information and booking enquiries into one place.',
    context: 'Travellers need to understand a resort before they contact it: the rooms, the setting, what they can do and how to get there. Pacific Wave Digital developed E’Nauwi Beach Resort’s website to bring that information together.',
    approach: 'The site gives accommodation and experiences their own sections, supported by a gallery, location information and direct routes to bookings and enquiries. This connects the visual presentation with practical next steps for guests.',
    features: [
      { title: 'Accommodation presentation', description: 'Room options and supporting details help visitors compare the accommodation offered by the resort.' },
      { title: 'Experiences and practical information', description: 'Activities, amenities, images and getting-here guidance support trip planning.' },
      { title: 'Booking and enquiry entry points', description: 'Room-booking links and a contact form give visitors ways to follow up with the resort.' },
    ],
    delivery: 'The published website demonstrates hospitality web design for a Vanuatu resort. It brings discovery and enquiry into the same experience without requiring visitors to piece together separate sources of information.',
    services: [{ href: '/services/web-design', label: 'Web design' }, { href: '/services/web-development', label: 'Web development' }],
  },
  {
    slug: 'lapita-beach', name: 'Lapita Beach', category: 'Accommodation and tour website',
    location: 'Aore Island, Vanuatu', website: 'https://lapitabeach.com',
    summary: 'An accommodation and day-tour website connecting Aore Island stays, experiences and direct booking enquiries.',
    context: 'Lapita Beach offers both accommodation and tours. Pacific Wave Digital built its website to help visitors explore these choices and move towards a direct enquiry with their preferred dates and guest details.',
    approach: 'Accommodation and tours have distinct entry points and detail pages. The planning journey connects the place, the experience and the information a visitor needs to provide when requesting a stay or tour.',
    features: [
      { title: 'Separate stay and tour journeys', description: 'Visitors can explore accommodation or day tours according to the kind of trip they are planning.' },
      { title: 'Detailed offer pages', description: 'Individual accommodation and tour pages bring the relevant descriptions and planning information together.' },
      { title: 'Direct booking enquiries', description: 'Date and guest information helps visitors explain what they want to book and supports the team’s follow-up.' },
    ],
    delivery: 'The published site is an example of tourism web development in Vanuatu. It gives accommodation and experiences a shared home while keeping the visitor’s next step specific to their chosen stay or tour.',
    services: [{ href: '/services/web-design', label: 'Web design' }, { href: '/services/web-development', label: 'Web development' }],
  },
];
