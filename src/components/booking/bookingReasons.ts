export const CANCEL_REASONS = [
  { key: "schedule_conflict", label: "Schedule conflict" },
  { key: "personal_emergency", label: "Personal emergency" },
  { key: "illness", label: "Illness" },
  { key: "no_longer_needed", label: "No longer needed" },
  { key: "financial_reasons", label: "Financial reasons" },
  { key: "other", label: "Other" },
] as const;

export const RESCHEDULE_REASONS = [
  { key: "schedule_conflict", label: "Schedule conflict" },
  { key: "personal_emergency", label: "Personal emergency" },
  { key: "illness", label: "Illness" },
  { key: "found_better_time", label: "Found a better time" },
  { key: "travel", label: "Travel / transportation issue" },
  { key: "other", label: "Other" },
] as const;
