import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Pacific Wave Digital — Vanuatu\'s leading digital agency. Founded by Stephen Totimeh, we bring world-class AI solutions, web development, and digital transformation to the Pacific.',
  keywords: [
    'Pacific Wave Digital about',
    'web development Vanuatu company',
    'digital agency Pacific Islands',
    'AI automation Vanuatu team',
    'Stephen Totimeh',
    'business automation Pacific experts',
    'digital transformation Vanuatu',
    'tech company Pacific Islands',
  ],
};

const values = [
  {
    title: 'Innovation',
    description: 'We stay at the cutting edge of technology, bringing the latest AI and digital solutions to the Pacific region.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Impact',
    description: 'Every solution we build is designed to create meaningful change for communities and businesses across the Pacific.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Integrity',
    description: 'We operate with transparency, honesty, and respect in every client relationship and partnership.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Community',
    description: 'We are committed to uplifting Pacific Island communities through technology education, local hiring, and pro-bono work.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const timeline = [
  { year: '2018', event: 'Pacific Wave Digital founded in Port Vila, Vanuatu' },
  { year: '2019', event: 'Launched VanuConnect — our first commercial product' },
  { year: '2020', event: 'Expanded AI capabilities and launched DigiAssist AI' },
  { year: '2021', event: 'VanuWay and Learn Bislama released to the public' },
  { year: '2022', event: 'Established Global Digital Prime network partnership' },
  { year: '2023', event: 'MEDD-SIM launched for medical education institutions' },
  { year: '2024', event: 'Akwaaba AI launched for African markets via Ghana office' },
  { year: '2025', event: 'Aelan Basket and TrainerSim enter beta; 50+ projects delivered' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-blue"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-vibrant-orange rounded-full blur-3xl"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">About Us</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-4 mb-6">
            Pioneering Digital
            <span className="block text-vibrant-orange">Innovation in the Pacific</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We combine global expertise with deep local knowledge to create technology that truly serves Pacific Island communities.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/port-vila.jpg"
                  alt="Port Vila, Vanuatu"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[450px]"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-vibrant-orange text-white p-6 rounded-2xl shadow-xl hidden md:block">
                <div className="text-3xl font-bold font-heading">🇻🇺</div>
                <div className="text-sm font-semibold">Port Vila, Vanuatu</div>
              </div>
            </div>
            <div>
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-6">
                From Port Vila to the World
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Pacific Wave Digital was founded in 2018 by <strong>Stephen Totimeh</strong> with a simple but ambitious vision: to bring world-class digital innovation to the Pacific Islands.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Having seen the transformative power of technology in larger markets, Stephen recognized the untapped potential in the Pacific region. Businesses here face unique challenges — remote locations, connectivity constraints, and limited access to cutting-edge tools — that require equally unique solutions.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Today, Pacific Wave Digital has grown into a multi-country operation with a portfolio of proprietary products and a track record of 50+ successful projects across government agencies, private enterprises, and non-profit organizations.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through our Global Network — spanning Vanuatu, the USA, Indonesia, and Ghana — we bring together diverse talent and perspectives to deliver solutions that make a real difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">
              What Drives Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-8 text-center card-hover border border-gray-100">
                <div className="w-14 h-14 rounded-xl bg-pale-orange text-vibrant-orange flex items-center justify-center mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-deep-blue font-heading mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Leadership</span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-6">
                Meet Our Founder & CEO
              </h2>
              <h3 className="text-2xl font-bold text-vibrant-orange font-heading mb-4">Stephen Totimeh</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Stephen Totimeh is a visionary technologist and entrepreneur with deep expertise in AI, software engineering, and digital transformation. Originally from Ghana, he established Pacific Wave Digital in Vanuatu to bridge the digital divide in the Pacific region.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Under his leadership, the company has developed multiple award-winning products, including MEDD-SIM for medical education and DigiAssist AI for business automation. Stephen&apos;s approach combines technical excellence with a deep understanding of the unique challenges facing Pacific Island businesses.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Stephen also leads the Global Digital Prime network, connecting innovation hubs across Vanuatu, the USA, Indonesia, and Ghana to deliver world-class digital solutions to emerging markets.
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/business-handshake.jpg"
                  alt="Stephen Totimeh - CEO of Pacific Wave Digital"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[450px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding gradient-blue">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mt-3 mb-4">
              Milestones
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <div key={item.year} className="flex items-start space-x-6 mb-8 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-vibrant-orange text-white flex items-center justify-center font-bold text-sm">
                    {item.year}
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-blue-100 text-lg">{item.event}</p>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-8 bg-white/20 ml-0 mt-4"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Image */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">
              The People Behind the Innovation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our diverse team of developers, designers, and AI specialists brings together global talent with deep local understanding.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/diverse-team.jpg" alt="Our diverse team" width={400} height={300} className="object-cover w-full h-[300px]" />
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/team-meeting.jpg" alt="Team collaboration" width={400} height={300} className="object-cover w-full h-[300px]" />
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/laptop-work.jpg" alt="Working on projects" width={400} height={300} className="object-cover w-full h-[300px]" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-light-gray">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mb-6">
            Want to Work With Us?
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-xl mx-auto">
            Whether you&apos;re a potential client or looking to join our team, we&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-lg !px-10 !py-4">
              Get in Touch
            </Link>
            <Link href="/portfolio" className="btn-outline text-lg !px-10 !py-4">
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
