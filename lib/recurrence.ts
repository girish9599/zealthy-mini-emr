// lib/recurrence.ts
import { RRule } from "rrule";
import dayjs from "dayjs";

export function expandAppointments(opts: {
  start: Date;
  repeat: "none" | "weekly" | "monthly";
  repeatUntil?: Date | null;
}) {
  const until =
    opts.repeatUntil ?? dayjs().add(3, "month").endOf("day").toDate();
  if (opts.repeat === "none") return [opts.start];
  const rule = new RRule({
    freq: opts.repeat === "weekly" ? RRule.WEEKLY : RRule.MONTHLY,
    dtstart: opts.start,
    until,
  });
  return [opts.start, ...rule.between(new Date(), until, true)].slice(0, 50);
}

export function expandRefills(opts: {
  refillOn: Date;
  schedule: "monthly" | "weekly" | "none";
}) {
  if (opts.schedule === "none") return [opts.refillOn];
  const until = dayjs().add(3, "month").endOf("day").toDate();
  const rule = new RRule({
    freq: opts.schedule === "weekly" ? RRule.WEEKLY : RRule.MONTHLY,
    dtstart: opts.refillOn,
    until,
  });
  return [opts.refillOn, ...rule.between(new Date(), until, true)].slice(0, 50);
}
