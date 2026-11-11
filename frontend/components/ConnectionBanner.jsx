"use client";

export default function ConnectionBanner({ connected }) {
  if (connected) return null;
  return (
    <div className="banner-error" role="alert">
      Connection Lost: Reconnecting...
    </div>
  );
}