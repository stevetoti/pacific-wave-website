import type { Course } from '../lms/types';
import { blpSlug } from '../lms/blp-workshop';
import { trainingTemplate } from './training-template';

type Workshop = Pick<Course, 'title' | 'slug' | 'requires_approval'>;
function workshopDetails(course: Workshop) {
  return [
    `Workshop: ${course.title}`,
    ...(course.slug === blpSlug ? ['Business Link Pacific · Digitisation, AI and Cyber Security. Wednesday 21 October 2026, 9 am–4 pm at Yumiwork Conference Room (Vanuatu time).'] : []),
    course.slug === blpSlug ? 'Your workshop dashboard brings together the course outline, participant workbook, facilitator guide, published lessons and recordings, AI learning support and private class discussions.' : 'Your workshop dashboard brings together your learning resources, published lessons and recordings, learning progress and instructor support.',
    'Your workshop community connects you with fellow participants and your instructors.',
  ];
}
export function privateWorkshopAccountEmail(course: Workshop, mode: 'signup' | 'welcome' | 'recovery', existing: boolean, url: string) {
  const label = course.slug === blpSlug ? 'BLP workshop' : course.title;
  const recovery = mode === 'recovery';
  const welcome = mode === 'welcome';
  return {
    subject: recovery ? `Reset your ${label} account password` : `Welcome to your ${label}`,
    ...trainingTemplate({
      blp: course.slug === blpSlug,
      title: recovery ? `Reset your ${label} password` : `Welcome to your ${label}`,
      intro: recovery
        ? 'Use the secure button below to choose a new password for your workshop account.'
        : welcome ? 'Your workshop account is ready. Sign in to view your registration status and workshop dashboard.'
        : existing ? 'You already have an account with this email address. Use your existing password to sign in to your workshop.'
        : 'Confirm your email address to activate your workshop account.',
      action: recovery ? 'Reset my password' : welcome || existing ? 'Open my workshop dashboard' : 'Verify my email address',
      url,
      details: recovery ? ['If you did not request this reset, ignore this email. Your password stays unchanged.'] : [
        ...(course.requires_approval ? ['Registration is free. Our team will check participant eligibility and approve your workshop access. Until then, your registration will show “Awaiting approval”.', 'After approval, your workshop resources, learning activities, AI coaches and private class chat will open.'] : []),
        ...workshopDetails(course),
      ],
    }),
  };
}
export function privateWorkshopUpdateEmail(course: Workshop, status: string, name: string, url: string) {
  const label = course.slug === blpSlug ? 'BLP workshop' : course.title;
  const approved = ['granted', 'paid'].includes(status);
  const removed = ['revoked', 'refunded'].includes(status);
  return {
    subject: `${label}: ${approved ? 'your access is approved' : removed ? 'access update' : 'registration awaiting approval'}`,
    ...trainingTemplate({
      blp: course.slug === blpSlug,
      title: approved ? 'Your workshop access is approved' : removed ? 'Your workshop access has changed' : 'Your workshop registration is saved',
      intro: `Hello ${name}. ${approved ? 'Our team has approved your participation. Your workshop dashboard and learning resources are ready.' : removed ? 'Your workshop access is no longer active. Contact our team if you need assistance.' : 'Your free registration is awaiting administrator approval. We will confirm your eligibility before opening learning resources and private class chat.'}`,
      action: 'Open my workshop dashboard', url,
      details: [...(removed ? [] : ['This workshop is free for participants.']), ...workshopDetails(course)],
    }),
  };
}
