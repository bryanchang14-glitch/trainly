"use client";

import { useTransition } from "react";
import { setBookingStatus } from "@/app/actions";

export function BookingActions({ bookingId }: { bookingId: string }) {
  const [pending, start] = useTransition();

  function act(status: "CONFIRMED" | "DECLINED") {
    start(async () => {
      await setBookingStatus({ bookingId, status });
    });
  }

  return (
    <>
      <button className="btn-outline text-xs" disabled={pending} onClick={() => act("DECLINED")}>
        Decline
      </button>
      <button className="btn-sage text-xs" disabled={pending} onClick={() => act("CONFIRMED")}>
        {pending ? "…" : "Accept"}
      </button>
    </>
  );
}
