import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "./Loading";
import { toPersianNumbers } from "../utils/toPersianNumber";

export type DashboardStat = { title: string; value: number | string; icon: LucideIcon };

// One dashboard for every role; each role's page passes its own stats.
function Dashboard({ isLoading, stats }: { isLoading: boolean; stats: DashboardStat[] }) {
  const { t } = useTranslation();
  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader>
              <CardDescription>{title}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">{toPersianNumbers(value)}</CardTitle>
              <CardAction>
                <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default Dashboard;
