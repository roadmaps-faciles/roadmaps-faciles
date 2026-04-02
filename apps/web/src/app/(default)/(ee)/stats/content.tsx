import { Card, CardContent, CardHeader, CardTitle } from "@roadmaps-faciles/ui";

import { fetchMatomoData } from "@/lib/matomo";

export const StatsContent = async () => {
  const matomoData = await fetchMatomoData();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Nombre de visites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{matomoData.nbVisits}</p>
          <p className="text-sm text-muted-foreground">Sur les 12 derniers mois</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Nombre de pages vues (total)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{matomoData.nbPageViews}</p>
          <p className="text-sm text-muted-foreground">Sur les 12 derniers mois</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Nombre de pages vues (uniques)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{matomoData.nbUniqPageViews}</p>
          <p className="text-sm text-muted-foreground">Sur les 12 derniers mois</p>
        </CardContent>
      </Card>
    </div>
  );
};
