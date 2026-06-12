"use client";

import * as React from "react";

interface Props {
  heading?: string;
  subheading?: string;
  target?: string;
}

function diff(target: number) {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function CountdownWidget({ heading, subheading, target }: Props) {
  const targetMs = target ? new Date(target).getTime() : NaN;
  const valid = !Number.isNaN(targetMs);
  const [t, setT] = React.useState(() => (valid ? diff(targetMs) : null));

  React.useEffect(() => {
    if (!valid) return;
    const id = window.setInterval(() => setT(diff(targetMs)), 1000);
    return () => window.clearInterval(id);
  }, [valid, targetMs]);

  if (!valid || !t) return null;

  const units: { label: string; value: number }[] = [
    { label: "Ngày", value: t.days },
    { label: "Giờ", value: t.hours },
    { label: "Phút", value: t.minutes },
    { label: "Giây", value: t.seconds },
  ];

  return (
    <section className="container-page py-8">
      <div className="mx-auto max-w-xl rounded-xl border bg-muted/30 p-6 text-center">
        {heading && <h3 className="text-xl font-semibold">{heading}</h3>}
        {subheading && <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>}
        <div className="mt-4 flex justify-center gap-3">
          {units.map((u) => (
            <div key={u.label} className="min-w-[64px] rounded-lg bg-background p-3 shadow-sm">
              <div className="text-2xl font-bold tabular-nums">{String(u.value).padStart(2, "0")}</div>
              <div className="text-xs text-muted-foreground">{u.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
