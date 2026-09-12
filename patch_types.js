const fs = require('fs');

let code = fs.readFileSync('src/types/index.ts', 'utf8');
code = code.replace(
`export type Booking = {
  id: string;
  userId: string;
  participantType: 'self' | 'child';
  childId?: string;
  packageId: string;
  instructorId?: string;
  courseSubscriptionId?: string;
  status: BookingStatus;
  scheduledAt: string;
  createdAt: string;
};`,
`export type Booking = {
  id: string;
  sessionId: string;
  status: BookingStatus;
  bookedAt: string;
};`);
fs.writeFileSync('src/types/index.ts', code);

let sup = fs.readFileSync('src/types/supabase.ts', 'utf8');
sup = sup.replace(
`      bookings: {
        Row: {
          id: string
          dependent_participant_id: string | null
          independent_participant_id: string | null
          package_id: string
          instructor_id: string | null
          course_subscription_id: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          scheduled_at: string
          created_at: string
        }
        Insert: {
          id?: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          package_id: string
          instructor_id?: string | null
          course_subscription_id?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          scheduled_at: string
          created_at?: string
        }
        Update: {
          id?: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          package_id?: string
          instructor_id?: string | null
          course_subscription_id?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          scheduled_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_course_subscription_id_fkey"
            columns: ["course_subscription_id"]
            isOneToOne: false
            referencedRelation: "course_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "creative_writing_packages"
            referencedColumns: ["id"]
          },
        ]
      }`,
`      bookings: {
        Row: {
          id: string
          session_id: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          booked_at: string
        }
        Insert: {
          id?: string
          session_id: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          booked_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          booked_at?: string
        }
        Relationships: []
      }`);

fs.writeFileSync('src/types/supabase.ts', sup);
