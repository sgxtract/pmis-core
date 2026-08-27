"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export default function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    let inactivityTimer: ReturnType<typeof setTimeout>;

    // -----------------------------------------
    // Logout the user
    // -----------------------------------------

    const logout = async () => {
      await supabase.auth.signOut();

      router.replace("/login");
    };

    // -----------------------------------------
    // Reset inactivity timer
    // -----------------------------------------

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT);
    };

    // -----------------------------------------
    // User activity events
    // -----------------------------------------

    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(
        event,
        resetInactivityTimer
      );
    });

    // -----------------------------------------
    // Start the initial timer
    // -----------------------------------------

    resetInactivityTimer();

    // -----------------------------------------
    // Cleanup
    // -----------------------------------------

    return () => {
      clearTimeout(inactivityTimer);

      activityEvents.forEach((event) => {
        window.removeEventListener(
          event,
          resetInactivityTimer
        );
      });
    };
  }, [router]);

  return null;
}