"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { TripForm } from "@/components/trip-form";
import type { TripAiPrefillFields } from "@/lib/trip-ai-prefill-fields";

// Lazy-load TripAiPrefillPanel — ไม่จำเป็นต้องโหลดทันทีตอนเปิดหน้า
const TripAiPrefillPanel = dynamic(
  () => import("@/components/trip-ai-prefill-panel").then((m) => ({ default: m.TripAiPrefillPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-36 rounded bg-border" />
            <div className="h-3.5 w-52 rounded bg-border" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-border" />
        </div>
      </div>
    ),
  },
);

type OrganizerProfile = {
  userId: string;
  name: string;
  bio: string;
  avatarUrl: string;
};

type Props = {
  organizerProfile: OrganizerProfile;
};

export function OrganizerNewTripShell({ organizerProfile }: Props) {
  const [aiFieldOverrides, setAiFieldOverrides] = useState<TripAiPrefillFields | null>(null);
  const [formKey, setFormKey] = useState(0);

  const onAiApplied = useCallback((fields: TripAiPrefillFields) => {
    setAiFieldOverrides(fields);
    setFormKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      <TripAiPrefillPanel onApplied={onAiApplied} />
      <TripForm
        key={formKey}
        mode="create"
        organizerProfile={organizerProfile}
        aiFieldOverrides={aiFieldOverrides}
      />
    </div>
  );
}
