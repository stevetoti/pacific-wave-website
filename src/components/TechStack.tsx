'use client';

import { motion } from 'framer-motion';
import FadeInView from './animations/FadeInView';

const technologies = [
  { name: 'React', icon: '⚛️', color: '#61DAFB' },
  { name: 'Next.js', icon: '▲', color: '#000000' },
  { name: 'TypeScript', icon: '📘', color: '#3178C6' },
  { name: 'Node.js', icon: '💚', color: '#339933' },
  { name: 'Python', icon: '🐍', color: '#3776AB' },
  { name: 'Supabase', icon: '⚡', color: '#3ECF8E' },
  { name: 'AWS', icon: '☁️', color: '#FF9900' },
  { name: 'Docker', icon: '🐳', color: '#2496ED' },
  { name: 'Tailwind', icon: '🎨', color: '#06B6D4' },
  { name: 'PostgreSQL', icon: '🐘', color: '#4169E1' },
  { name: 'OpenAI', icon: '🤖', color: '#412991' },
  { name: 'Vercel', icon: '🔺', color: '#000000' },
];

export default function TechStack() {
  return (
    <section className="py-20 bg-gradient-to-br from-dark-navy via-deep-blue to-dark-navy overflow-hidden">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <FadeInView>
          <div className="text-center mb-12">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">
              Our Tech Stack
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mt-3 mb-4">
              Built With Modern Technologies
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              We use cutting-edge tools and frameworks to deliver scalable, performant solutions.
            </p>
          </div>
        </FadeInView>

        {/* Animated scrolling tech logos */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-dark-navy to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-dark-navy to-transparent z-10" />
          
          {/* Scrolling container */}
          <motion.div
            className="flex gap-8 py-8"
            animate={{ x: [0, -1200] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 20,
                ease: 'linear',
              },
            }}
          >
            {[...technologies, ...technologies].map((tech, i) => (
              <motion.div
                key={`${tech.name}-${i}`}
                className="flex-shrink-0 flex flex-col items-center gap-3 px-6 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-vibrant-orange/50 transition-colors cursor-pointer group"
                whileHover={{ scale: 1.1, y: -5 }}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {tech.icon}
                </span>
                <span className="text-white/80 text-sm font-medium whitespace-nowrap">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <FadeInView delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {[
              { value: '50+', label: 'Projects Delivered' },
              { value: '12+', label: 'Technologies' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-vibrant-orange font-heading"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-blue-200 text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
