import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Invitation } from "@/lib/invitation";

export type StoredBooking = {
  date: string;
  time: string;
  activity: string;
  message: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  client ??= createClient(supabaseUrl!, supabaseAnonKey!);
  return client;
}

export async function createStoredInvitation(invitation: Invitation): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = createShareId();
    const { error } = await supabase.from("invitations").insert({ id, data: invitation });

    if (!error) return id;
    if (error.code !== "23505") throw error;
  }

  throw new Error("Impossible de générer un identifiant unique.");
}

export async function getStoredInvitation(id: string): Promise<Invitation | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_invitation", { invitation_id: id });

  if (error) throw error;
  if (!data || typeof data !== "object") return null;
  return data as Invitation;
}

export async function createStoredResponse(invitationId: string, booking: StoredBooking) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("responses").insert({
    invitation_id: invitationId,
    date: booking.date,
    time: booking.time,
    activity: booking.activity,
    message: booking.message || null,
  });

  if (error) throw error;
  return true;
}

function createShareId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  }

  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
