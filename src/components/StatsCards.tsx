import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { FreedomData } from "./Dashboard";

interface StatsCardsProps {
  data: FreedomData[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ data }) => {
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const totalCountries = data.length;
    const freeCountries = data.filter(d => d.status === "Libre").length;
    const partiallyFreeCountries = data.filter(d => d.status === "Partiellement libre").length;
    const notFreeCountries = data.filter(d => d.status === "Pas libre").length;

    const avgPoliticalRights = data.reduce((sum, d) => sum + d.politicalRights, 0) / totalCountries;
    const avgCivilLiberties = data.reduce((sum, d) => sum + d.civilLiberties, 0) / totalCountries;
    const avgTotalScore = data.reduce((sum, d) => sum + d.totalScore, 0) / totalCountries;

    const uniqueRegions = new Set(data.map(d => d.region)).size;
    const uniqueYears = new Set(data.map(d => d.year)).size;

    // Calculate trends if we have multiple years
    const yearlyData = data.reduce((acc, item) => {
      const year = item.year;
      if (!acc[year]) {
        acc[year] = { totalScore: 0, count: 0, political: 0, civil: 0 };
      }
      acc[year].totalScore += item.totalScore;
      acc[year].political += item.politicalRights;
      acc[year].civil += item.civilLiberties;
      acc[year].count += 1;
      return acc;
    }, {} as Record<number, any>);

    const years = Object.keys(yearlyData).map(Number).sort();
    let trend = "stable";
    
    if (years.length > 1) {
      const firstYear = yearlyData[years[0]];
      const lastYear = yearlyData[years[years.length - 1]];
      
      const firstAvg = firstYear.totalScore / firstYear.count;
      const lastAvg = lastYear.totalScore / lastYear.count;
      
      if (lastAvg > firstAvg + 0.5) trend = "improving";
      else if (lastAvg < firstAvg - 0.5) trend = "declining";
    }

    return {
      totalCountries,
      freeCountries,
      partiallyFreeCountries,
      notFreeCountries,
      avgPoliticalRights: avgPoliticalRights.toFixed(1),
      avgCivilLiberties: avgCivilLiberties.toFixed(1),
      avgTotalScore: avgTotalScore.toFixed(1),
      uniqueRegions,
      uniqueYears,
      trend,
      freePercentage: ((freeCountries / totalCountries) * 100).toFixed(1),
      partiallyFreePercentage: ((partiallyFreeCountries / totalCountries) * 100).toFixed(1),
      notFreePercentage: ((notFreeCountries / totalCountries) * 100).toFixed(1)
    };
  }, [data]);

  if (!stats) return null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-success";
      case "declining":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Countries */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-bl-full" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des pays</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCountries}</div>
          <p className="text-xs text-muted-foreground">
            {stats.uniqueRegions} régions • {stats.uniqueYears} années
          </p>
        </CardContent>
      </Card>

      {/* Freedom Status */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-success/20 to-success/5 rounded-bl-full" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pays libres</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.freeCountries}</div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-success text-success text-xs">
              {stats.freePercentage}%
            </Badge>
            <p className="text-xs text-muted-foreground">libres</p>
          </div>
        </CardContent>
      </Card>

      {/* Average Political Rights */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-chart-1/20 to-chart-1/5 rounded-bl-full" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Droits politiques</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgPoliticalRights}</div>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-chart-1 transition-all duration-300"
                style={{ width: `${(parseFloat(stats.avgPoliticalRights) / 7) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">/ 7</p>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br rounded-bl-full ${
          stats.trend === "improving" ? "from-success/20 to-success/5" :
          stats.trend === "declining" ? "from-destructive/20 to-destructive/5" :
          "from-muted/20 to-muted/5"
        }`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tendance</CardTitle>
          {getTrendIcon(stats.trend)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getTrendColor(stats.trend)}`}>
            {stats.avgTotalScore}
          </div>
          <p className="text-xs text-muted-foreground">
            Score total moyen • {stats.trend === "improving" ? "En amélioration" : 
                                 stats.trend === "declining" ? "En déclin" : "Stable"}
          </p>
        </CardContent>
      </Card>

      {/* Additional Stats - Full Width */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Répartition détaillée</CardTitle>
          <CardDescription>
            Vue d'ensemble de la distribution des statuts de liberté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="text-3xl font-bold text-success mb-2">{stats.freeCountries}</div>
              <div className="text-sm font-medium text-success mb-1">Pays libres</div>
              <Badge variant="outline" className="border-success text-success">
                {stats.freePercentage}%
              </Badge>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="text-3xl font-bold text-warning mb-2">{stats.partiallyFreeCountries}</div>
              <div className="text-sm font-medium text-warning mb-1">Partiellement libres</div>
              <Badge variant="outline" className="border-warning text-warning">
                {stats.partiallyFreePercentage}%
              </Badge>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="text-3xl font-bold text-destructive mb-2">{stats.notFreeCountries}</div>
              <div className="text-sm font-medium text-destructive mb-1">Pas libres</div>
              <Badge variant="outline" className="border-destructive text-destructive">
                {stats.notFreePercentage}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};