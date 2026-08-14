import { Bell, CheckCheck, MessageSquare, Sparkles, Timer, CircleCheckBig, Radio } from "lucide-react";
import { useState } from "react";

import { GlassButton } from "@/components/glass";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications, type Notification } from "@/data/complaints";
import { useI18n } from "@/lib/i18n";

const icons: Record<Notification["category"], typeof Bell> = {
  status: Radio,
  message: MessageSquare,
  alert: Sparkles,
  deadline: Timer,
  resolution: CircleCheckBig,
};

const filters = [
  { id: "all", key: "notif.all" },
  { id: "status", key: "notif.status" },
  { id: "message", key: "notif.messages" },
  { id: "alert", key: "notif.alerts" },
  { id: "deadline", key: "notif.deadlines" },
  { id: "resolution", key: "notif.resolutions" },
] as const;

export function NotificationCenter() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const [read, setRead] = useState(false);

  const items = notifications.filter((n) => filter === "all" || n.category === filter);
  const unread = read ? 0 : notifications.filter((n) => n.unread).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <GlassButton variant="glass" size="icon" aria-label={t("notif.open")} className="relative">
          <Bell className="size-4.5" aria-hidden="true" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          ) : null}
        </GlassButton>
      </SheetTrigger>
      <SheetContent className="glass-surface-strong w-full gap-0 border-l-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("notif.title")}</SheetTitle>
        </SheetHeader>

        <div className="px-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/70 p-1">
              {filters.map((f) => (
                <TabsTrigger key={f.id} value={f.id} className="rounded-xl text-xs">
                  {t(f.key)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ul className="mt-4 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {items.length === 0 ? (
            <li className="py-10 text-center text-sm text-muted-foreground">{t("notif.empty")}</li>
          ) : null}
          {items.map((n) => {
            const Icon = icons[n.category];
            return (
              <li
                key={n.id}
                className="glass-surface grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl p-4"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-pretty">{n.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{n.at}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border p-4">
          <GlassButton
            variant="ghost"
            className="w-full rounded-2xl"
            onClick={() => setRead(true)}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            {t("notif.markread")}
          </GlassButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
