export const onboardingVideo = "/media/onboarding/introduction-v1.mp4";
export const onboardingPoster = "/media/onboarding/introduction-v1.jpg";
export const onboardingPreview = "/media/onboarding/introduction-v1.gif";
export const onboardingShareNotice = "I agree to share this onboarding conversation with Stephen and my course instructors so they can understand my motivation, expectations and learning goals. Other coaching conversations stay private.";
export function onboardingCourse(value?: string) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
export function onboardingPath(courseId: string) {
  return `/training-center/course/${encodeURIComponent(courseId)}?tutor=onboarding`;
}
export function onboardingSignIn(courseId: string) {
  return `/training-center/account?mode=signin&onboarding=${encodeURIComponent(courseId)}`;
}
