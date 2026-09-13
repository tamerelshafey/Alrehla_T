import { createClient } from '@/lib/supabase/server';
import type {
  CreativeService,
  InstructorServiceOffer,
  ServiceProvider,
} from '@/types';

/**
 * Standalone creative services ("الخدمات الإبداعية").
 *
 * This module reads from the database only — it has no mock fallback by
 * design. The services page used to keep its own hardcoded copy of this
 * list, the two drifted apart, and a placeholder entry ended up live on
 * the site. One source of truth, deliberately.
 */

export async function getStandaloneServices(): Promise<CreativeService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('standalone_services')
    .select('id, name, price, description, category, price_type, sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description ?? '',
    category: row.category ?? undefined,
    priceType: row.price_type === 'starts_from' ? 'starts_from' : 'fixed',
    sortOrder: row.sort_order ?? undefined,
  }));
}

/**
 * Every offer belonging to one instructor, whatever its status.
 * Used by the admin screen and by the instructor's own dashboard.
 */
export async function getInstructorServiceOffers(
  instructorId: string
): Promise<InstructorServiceOffer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor_services')
    .select('*')
    .eq('instructor_id', instructorId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    instructorId: row.instructor_id,
    serviceId: row.service_id,
    requestedPrice: row.requested_price ?? undefined,
    approvedPrice: row.approved_price ?? undefined,
    status: row.status as InstructorServiceOffer['status'],
    isActive: row.is_active,
    adminNotes: row.admin_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * The instructors a visitor can choose from for one service.
 * Only approved, active offers with a real price are returned — row-level
 * security enforces the same rule at the database, this is not the only
 * guard.
 */
export async function getProvidersForService(
  serviceId: string
): Promise<ServiceProvider[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor_services')
    .select(
      'id, approved_price, instructor_id, instructors(id, display_name, bio, years_experience)'
    )
    .eq('service_id', serviceId)
    .eq('status', 'approved')
    .eq('is_active', true);

  if (error || !data) return [];

  return data
    .map((row) => {
      const joined = row.instructors as unknown as {
        id: string;
        display_name: string;
        bio: string;
        years_experience: number;
      } | null;
      if (!joined || row.approved_price == null) return null;
      return {
        offerId: row.id,
        instructorId: joined.id,
        displayName: joined.display_name,
        bio: joined.bio,
        yearsExperience: joined.years_experience,
        price: row.approved_price,
      };
    })
    .filter((p): p is ServiceProvider => p !== null)
    .sort((a, b) => a.price - b.price);
}

/**
 * The lowest approved price across all providers of a service — this is the
 * number behind "يبدأ من" on the services page. Returns null when nobody
 * offers it yet, so the page can say so instead of inventing a price.
 */
export async function getStartingPriceForService(
  serviceId: string
): Promise<number | null> {
  const providers = await getProvidersForService(serviceId);
  return providers.length > 0 ? providers[0].price : null;
}

/** A service order enriched with the names needed to display it. */
export type ServiceOrderRow = {
  id: string;
  buyerProfileId: string;
  serviceId: string | null;
  serviceName: string;
  instructorId: string | null;
  instructorName: string | null;
  amount: number;
  status: string;
  transactionReference: string | null;
  createdAt: string;
};

async function mapServiceOrders(rows: any[]): Promise<ServiceOrderRow[]> {
  return rows.map((row) => {
    const service = row.standalone_services as { name: string } | null;
    const instructor = row.instructors as { display_name: string } | null;
    return {
      id: row.id,
      buyerProfileId: row.buyer_profile_id,
      serviceId: row.standalone_service_id,
      serviceName: service?.name ?? 'خدمة غير معروفة',
      instructorId: row.instructor_id,
      instructorName: instructor?.display_name ?? null,
      amount: row.amount,
      status: row.status,
      transactionReference: row.transaction_reference,
      createdAt: row.created_at,
    };
  });
}

const SERVICE_ORDER_SELECT =
  'id, buyer_profile_id, standalone_service_id, instructor_id, amount, status, transaction_reference, created_at, standalone_services(name), instructors(display_name)';

/** Every service order — row-level security limits this to admins. */
export async function getAllServiceOrders(): Promise<ServiceOrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_orders')
    .select(SERVICE_ORDER_SELECT)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return mapServiceOrders(data);
}

/** The signed-in customer's own service orders. */
export async function getMyServiceOrders(): Promise<ServiceOrderRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('service_orders')
    .select(SERVICE_ORDER_SELECT)
    .eq('buyer_profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return mapServiceOrders(data);
}
