export type RegistrationDetails = {
  name: string;
  phone: string;
  attendance: 'online' | 'in_person' | 'mixed';
};
type Contact = { name?: unknown; phone?: unknown; attendance?: unknown };
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const validPhone = (value: unknown) => text(value).replace(/\D/g, '').length >= 5;
/** Reuse this student's saved contact details, with prior orders as a fallback. */
export function registrationDetails(
  profile: { full_name?: unknown; phone?: unknown } | null,
  orders: readonly Contact[],
  accountName?: unknown,
): RegistrationDetails {
  const latestAttendance = orders.find(order => ['online', 'in_person', 'mixed'].includes(text(order.attendance)))?.attendance;
  return {
    name: text(profile?.full_name) || text(orders.find(order => text(order.name))?.name) || text(accountName),
    phone: validPhone(profile?.phone) ? text(profile?.phone) : text(orders.find(order => validPhone(order.phone))?.phone),
    attendance: latestAttendance === 'in_person' || latestAttendance === 'mixed' ? latestAttendance : 'online',
  };
}
export function hasRegistrationDetails(details: RegistrationDetails) {
  return details.name.length >= 2 && validPhone(details.phone);
}
