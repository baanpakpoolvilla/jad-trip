"use client";

import { useCallback, useState } from "react";
import { TripForm } from "@/components/trip-form";
import { TripAiPrefillPanel } from "@/components/trip-ai-prefill-panel";
import type { TripAiPrefillFields } from "@/lib/trip-ai-prefill-fields";

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
