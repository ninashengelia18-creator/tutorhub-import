/**
 * Centralized subject taxonomy for the platform.
 * Used by tutor applications, search filters, homepage cards, and profile editing.
 */

export interface SubjectItem {
  value: string;   // stored in DB / used for filtering
  label: string;   // displayed in dropdowns, filters, cards
}

export interface SubjectCategory {
  key: string;
  label: string;
  groups: SubjectGroup[];
}

export interface SubjectGroup {
  label: string;
  subjects: SubjectItem[];
}

export const SUBJECT_TAXONOMY: SubjectCategory[] = [
  {
    key: "k12",
    label: "K‑12",
    groups: [
      {
        label: "Maths",
        subjects: [
          { value: "US School Math", label: "US School Math" },
          { value: "Algebra", label: "Algebra" },
          { value: "Geometry", label: "Geometry" },
          { value: "Trigonometry", label: "Trigonometry" },
          { value: "Calculus", label: "Calculus" },
        ],
      },
      {
        label: "Science",
        subjects: [
          { value: "Biology", label: "Biology" },
          { value: "Chemistry", label: "Chemistry" },
          { value: "Physics", label: "Physics" },
        ],
      },
      {
        label: "English",
        subjects: [
          { value: "Reading & Writing Support", label: "Reading & Writing Support" },
          { value: "US English/ELA", label: "US English / ELA" },
        ],
      },
      {
        label: "Coding & Computer Science",
        subjects: [
          { value: "Coding for Kids", label: "Coding for Kids" },
          { value: "Coding for Teens", label: "Coding for Teens" },
          { value: "AP Computer Science", label: "AP Computer Science" },
        ],
      },
    ],
  },
  {
    key: "gcse",
    label: "GCSE",
    groups: [
      {
        label: "Maths",
        subjects: [
          { value: "GCSE Maths", label: "GCSE Maths" },
          { value: "GCSE Maths Higher Tier", label: "GCSE Maths (Higher Tier)" },
          { value: "IGCSE Maths", label: "IGCSE Maths" },
        ],
      },
      {
        label: "Science",
        subjects: [
          { value: "GCSE Combined Science", label: "GCSE Combined Science" },
          { value: "GCSE Biology", label: "GCSE Biology" },
          { value: "GCSE Chemistry", label: "GCSE Chemistry" },
          { value: "GCSE Physics", label: "GCSE Physics" },
        ],
      },
      {
        label: "English",
        subjects: [
          { value: "GCSE English Language", label: "GCSE English Language" },
          { value: "GCSE English Literature", label: "GCSE English Literature" },
        ],
      },
    ],
  },
  {
    key: "alevel",
    label: "A‑Level",
    groups: [
      {
        label: "Maths",
        subjects: [
          { value: "A-Level Maths", label: "A‑Level Maths" },
          { value: "Further Maths", label: "Further Maths" },
        ],
      },
      {
        label: "Science",
        subjects: [
          { value: "A-Level Physics", label: "A‑Level Physics" },
          { value: "A-Level Chemistry", label: "A‑Level Chemistry" },
          { value: "A-Level Biology", label: "A‑Level Biology" },
        ],
      },
      {
        label: "English",
        subjects: [
          { value: "A-Level English Language", label: "A‑Level English Language" },
          { value: "A-Level English Literature", label: "A‑Level English Literature" },
        ],
      },
    ],
  },
  {
    key: "university",
    label: "University",
    groups: [
      {
        label: "Maths & Stats",
        subjects: [
          { value: "University Calculus", label: "Calculus" },
          { value: "Statistics & Data Analysis", label: "Statistics & Data Analysis" },
          { value: "Linear Algebra", label: "Linear Algebra" },
          { value: "University Maths", label: "University Maths" },
        ],
      },
      {
        label: "English",
        subjects: [
          { value: "University English Language", label: "English Language" },
          { value: "University English Literature", label: "English Literature" },
        ],
      },
    ],
  },
  {
    key: "professionals",
    label: "Professionals",
    groups: [
      {
        label: "ESL & Business English",
        subjects: [
          { value: "General English", label: "General English" },
          { value: "Conversation Practice", label: "Conversation Practice" },
          { value: "Business English", label: "Business English" },
          { value: "Interview Prep", label: "Interview Prep" },
          { value: "IELTS Academic", label: "IELTS Academic" },
          { value: "IELTS General", label: "IELTS General" },
          { value: "TOEFL", label: "TOEFL" },
        ],
      },
      {
        label: "Coding for Career Change",
        subjects: [
          { value: "Python for Beginners", label: "Python for Beginners" },
          { value: "Web Development Basics", label: "Web Development Basics" },
          { value: "Data Skills for Professionals", label: "Data Skills for Non‑Technical Professionals" },
        ],
      },
    ],
  },
];
/** Flat list of all subjects for dropdowns and validation */
export function getAllSubjects(): SubjectItem[] {
  return SUBJECT_TAXONOMY.flatMap((cat) =>
    cat.groups.flatMap((group) => group.subjects),
  );
}

/** Just the string values */
export function getAllSubjectValues(): string[] {
  return getAllSubjects().map((s) => s.value);
}

/** Lookup label by value */
export function getSubjectLabel(value: string): string {
  const item = getAllSubjects().find(
    (s) => s.value.toLowerCase() === value.toLowerCase(),
  );
  return item?.label ?? value;
}

/**
 * "Quick filter" subjects shown as pill buttons on the search page.
 * These are high-level groupings to keep the filter bar concise.
 */
export const SEARCH_FILTER_SUBJECTS = [
  "All",
  "Maths",
  "Science",
  "English",
  "Computer Science",
  "Business English",
  "IELTS / TOEFL",
  "Programming",
] as const;

/** Map a quick-filter label to matching subject values for filtering */
export function getSubjectValuesForFilter(filter: string): string[] | null {
  if (filter === "All") return null; // no filter

  const map: Record<string, string[]> = {
    Maths: [
      "US School Math", "Algebra", "Geometry", "Trigonometry", "Calculus",
      "GCSE Maths", "IGCSE Maths", "A-Level Maths", "Further Maths",
      "University Calculus", "Linear Algebra", "Statistics & Data Analysis",
    ],
    Science: [
      "General Science", "Biology", "Chemistry", "Physics",
      "GCSE Sciences", "A-Level Biology", "A-Level Chemistry", "A-Level Physics",
      "Intro Physics", "Intro Chemistry",
    ],
    English: [
      "Reading & Writing Support", "US English/ELA",
      "GCSE English Language", "GCSE English Literature",
      "A-Level English Language", "A-Level English Literature",
      "General English", "Academic Writing",
    ],
    "Computer Science": [
      "Coding for Kids", "Coding for Teens",
      "GCSE Computer Science", "A-Level Computer Science", "AP Computer Science",
    ],
    "Business English": [
      "Business English", "Conversation Practice", "Interview Prep",
    ],
    "IELTS / TOEFL": [
      "IELTS Academic", "IELTS General", "TOEFL",
    ],
    Programming: [
      "Python for Data Analysis", "Intro Programming",
      "R or Excel Statistics", "Python for Beginners",
      "Web Development Basics", "Data Skills for Professionals",
    ],
  };

  return map[filter] ?? null;
}
