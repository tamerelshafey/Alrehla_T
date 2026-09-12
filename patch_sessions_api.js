const fs = require('fs');

let writing = fs.readFileSync('src/data/domains/writing.ts', 'utf8');

// Replace mockBookings with mockSessions
writing = writing.replace(
`export const mockBookings: Booking[] = [
  {
    id: 'bkg-1',
    userId: 'student-1',
    participantType: 'self',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'confirmed',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'bkg-2',
    userId: 'current-user',
    participantType: 'child',
    childId: 'dep-child-2',
    packageId: 'pkg-2',
    instructorId: 'inst-2',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(), // -3 days
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'bkg-3',
    userId: 'student-3',
    participantType: 'self',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(), // +5 days
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];`,
`export const mockSessions: SessionWithDetails[] = [
  {
    id: 'sess-1',
    courseSubscriptionId: 'csub-1',
    sessionNumber: 1,
    userId: 'student-1',
    participantType: 'self',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'confirmed',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-2',
    courseSubscriptionId: 'csub-2',
    sessionNumber: 1,
    userId: 'current-user',
    participantType: 'child',
    childId: 'dep-child-2',
    packageId: 'pkg-2',
    instructorId: 'inst-2',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-3',
    courseSubscriptionId: 'csub-3',
    sessionNumber: 1,
    userId: 'student-3',
    participantType: 'self',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];`);

// Replace getBookings with getSessions
writing = writing.replace(
`export const getBookings = async (): Promise<Booking[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return mockBookings;
  }

  return data.map((bkg: any) => ({
    id: bkg.id,
    userId: bkg.user_id || 'unknown',
    participantType: bkg.participant_type || 'self',
    childId: bkg.child_id || undefined,
    packageId: bkg.package_id,
    instructorId: bkg.instructor_id || undefined,
    courseSubscriptionId: bkg.course_subscription_id || undefined,
    status: bkg.status,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));
};`,
`export const getSessions = async (): Promise<SessionWithDetails[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, course_subscriptions(*)')
    .order('scheduled_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return mockSessions;
  }

  return data.map((sess: any) => {
    const sub = sess.course_subscriptions;
    return {
      id: sess.id,
      courseSubscriptionId: sess.course_subscription_id,
      sessionNumber: sess.session_number,
      instructorId: sess.instructor_id || undefined,
      status: sess.status as any,
      scheduledAt: sess.scheduled_at,
      createdAt: sess.created_at,
      updatedAt: sess.updated_at || sess.created_at,
      // joined details
      userId: sub?.user_id || 'unknown',
      participantType: sub?.participant_type || 'self',
      childId: sub?.child_id || undefined,
      packageId: sub?.package_id || 'unknown',
    };
  });
};

export const getBookings = async (): Promise<Booking[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*');
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id,
    sessionId: b.session_id,
    status: b.status as any,
    bookedAt: b.booked_at
  }));
};`);

fs.writeFileSync('src/data/domains/writing.ts', writing);
