import { cookies } from "next/headers";
import { ADMIN_COOKIE, tokenIsValid, isAdminConfigured } from "@/lib/adminAuth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminOrders, type AdminOrder } from "@/components/AdminOrders";

export const dynamic = "force-dynamic"; // never cache the admin list

export default async function OrdersAdminPage() {
  const authed = tokenIsValid(cookies().get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return <AdminLogin configured={isAdminConfigured()} />;
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Admin</h1>
        <p className="mt-3 text-charcoal/70">
          Database not configured. Set the Supabase env vars to see orders.
        </p>
      </div>
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (error ? [] : (data as AdminOrder[])) ?? [];

  return <AdminOrders orders={orders} loadError={Boolean(error)} />;
}
