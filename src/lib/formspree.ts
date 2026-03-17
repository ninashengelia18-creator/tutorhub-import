export const FORMSPREE_URL = "https://formspree.io/f/mojknpqp";

interface FormspreePayload extends Record<string, unknown> {
  email?: string;
}

function getFormspreeErrorMessage(result: unknown) {
  if (typeof result !== "object" || result === null) return undefined;

  const typedResult = result as {
    error?: string;
    errors?: Array<{ message?: string }>;
  };

  if (Array.isArray(typedResult.errors)) {
    const combined = typedResult.errors
      .map((issue) => issue.message)
      .filter(Boolean)
      .join(" ");

    if (combined) return combined;
  }

  return typedResult.error;
}

export async function submitFormspree(payload: FormspreePayload) {
  const response = await fetch(FORMSPREE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getFormspreeErrorMessage(result) ||
        "We couldn't send the email notification right now. Please try again in a moment.",
    );
  }

  return result;
}
