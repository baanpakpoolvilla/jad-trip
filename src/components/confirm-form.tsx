"use client";

/**
 * Wraps a server action `<form>` with a native confirm dialog before submission.
 * Pass the server action as `action` and a confirmation message as `message`.
 */
export function ConfirmForm({
  action,
  message,
  className,
  children,
}: {
  action: (fd: FormData) => Promise<void> | void;
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
