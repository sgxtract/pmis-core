"use client";

import { useEffect, useState } from "react";
import { useProfileActivity } from "./ProfileActivityProvider";

import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: number;
  module: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
};

export default function AccountActivity() {
  const { refreshKey } = useProfileActivity();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivity() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Unable to identify your account.");
        setLoading(false);
        return;
      }

      const { data, error: activityError } = await supabase
        .from("audit_logs")
        .select("id, module, field_name, old_value, new_value, changed_at")
        .eq("user_id", user.id)
        .order("changed_at", { ascending: false })
        .limit(10);

      if (activityError) {
        console.error("LOAD ACCOUNT ACTIVITY ERROR:", activityError);
        setError("Unable to load account activity.");
        setLoading(false);
        return;
      }

      setActivities(data ?? []);
      setLoading(false);
    }

    loadActivity();
  }, [refreshKey]);

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Account Activity
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Recent activity associated with your PMIS account.
        </p>
      </div>

      <div className="px-6 py-5">
        {loading && (
          <p className="text-sm text-gray-500">Loading account activity...</p>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <p className="text-sm text-gray-500">
            No account activity has been recorded yet.
          </p>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.module === "profiles"
                        ? "Profile Updated"
                        : activity.module === "auth"
                          ? "Account Security"
                          : activity.module}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {activity.field_name === "full_name"
                        ? "Full Name"
                        : activity.field_name === "password"
                          ? "Password"
                          : activity.field_name === "email"
                            ? "Email"
                            : activity.field_name}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs text-gray-500">
                    {new Date(activity.changed_at).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                {(activity.old_value || activity.new_value) && (
                  <div className="mt-2 text-xs text-gray-500">
                    {activity.old_value && (
                      <span>From: {activity.old_value}</span>
                    )}

                    {activity.old_value && activity.new_value && (
                      <span className="mx-2">→</span>
                    )}

                    {activity.new_value && (
                      <span>To: {activity.new_value}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
