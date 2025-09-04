import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { FreedomData } from "./Dashboard";

interface DataVisualizationProps {
  data: FreedomData[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const statusDistribution = useMemo(() => {
    const distribution = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / data.length) * 100).toFixed(1)
    }));
  }, [data]);

  const regionDistribution = useMemo(() => {
    const distribution = data.reduce((acc, item) => {
      acc[item.region] = (acc[item.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .map(([name, count]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullName: name,
        count,
        avgPolitical: data.filter(d => d.region === name).reduce((sum, d) => sum + d.politicalRights, 0) / data.filter(d => d.region === name).length,
        avgCivil: data.filter(d => d.region === name).reduce((sum, d) => sum + d.civilLiberties, 0) / data.filter(d => d.region === name).length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  const yearlyTrends = useMemo(() => {
    const yearData = data.reduce((acc, item) => {
      const year = item.year;
      if (!acc[year]) {
        acc[year] = { year, totalCountries: 0, avgPolitical: 0, avgCivil: 0, libre: 0, partLibre: 0, pasLibre: 0 };
      }
      acc[year].totalCountries += 1;
      acc[year].avgPolitical += item.politicalRights;
      acc[year].avgCivil += item.civilLiberties;
      
      if (item.status === "Libre") acc[year].libre += 1;
      else if (item.status === "Partiellement libre") acc[year].partLibre += 1;
      else acc[year].pasLibre += 1;
      
      return acc;
    }, {} as Record<number, any>);

    return Object.values(yearData).map((item: any) => ({
      ...item,
      avgPolitical: (item.avgPolitical / item.totalCountries).toFixed(1),
      avgCivil: (item.avgCivil / item.totalCountries).toFixed(1)
    })).sort((a: any, b: any) => a.year - b.year);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par statut de liberté</CardTitle>
          <CardDescription>Distribution globale des pays selon leur niveau de liberté</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Region Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par région</CardTitle>
          <CardDescription>Nombre de pays et scores moyens par région</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rights Comparison by Region */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des droits par région</CardTitle>
          <CardDescription>Scores moyens des droits politiques vs libertés civiles</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 7]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="avgPolitical" fill="hsl(var(--chart-1))" name="Droits politiques" radius={[2, 2, 0, 0]} />
              <Bar dataKey="avgCivil" fill="hsl(var(--chart-2))" name="Libertés civiles" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Yearly Trends */}
      {yearlyTrends.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution temporelle</CardTitle>
            <CardDescription>Évolution des scores moyens au fil des années</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 7]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgPolitical" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3} 
                  name="Droits politiques"
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgCivil" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3} 
                  name="Libertés civiles"
                  dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};