import { startTransition } from "react";

/**
 * `onSubmit` for a form driven by `useActionState`. Passing the action as
 * `<form action>` makes React reset uncontrolled fields once it finishes —
 * including after a validation error, which throws away what you typed.
 * Dispatching it ourselves keeps the values; forms that should clear on
 * success remount themselves instead.
 */
export function keepValues(action: (formData: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => action(formData));
  };
}
