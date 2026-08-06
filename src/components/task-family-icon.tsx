import {
  Building2,
  CalendarDays,
  HeartPulse,
  House,
  Landmark,
  Plane,
  ShoppingBag,
  Smartphone,
  TrainFront,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { TaskFamilyId } from "@/lib/schema";

const TASK_FAMILY_ICONS: Record<TaskFamilyId, LucideIcon> = {
  "email-calendar": CalendarDays,
  "shopping-delivery": ShoppingBag,
  "travel-accommodation": Plane,
  "restaurants-local": Utensils,
  "money-banking-investing": Landmark,
  "mobility-transit": TrainFront,
  "healthcare-administration": HeartPulse,
  "government-civic": Building2,
  "home-utilities": House,
  "telecom-subscriptions": Smartphone,
};

export function TaskFamilyIcon({ family }: { family: TaskFamilyId }) {
  const Icon = TASK_FAMILY_ICONS[family];

  return (
    <span
      className="mica-task-family-icon"
      data-task-family-icon
      data-task-family-id={family}
    >
      <Icon aria-hidden="true" focusable="false" />
    </span>
  );
}
