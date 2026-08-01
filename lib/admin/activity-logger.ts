import { createClient } from "@/lib/supabase/client";

export interface LogActionParams {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  details?: any;
}

export async function logAdminAction(params: LogActionParams): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      admin_email: user.email,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
    });
  } catch (err) {
    console.error("Failed to insert activity log:", err);
  }
}
