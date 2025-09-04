import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "./FileUpload";
import { DataTable } from "./DataTable";
import { DataVisualization } from "./DataVisualization";
import { StatsCards } from "./StatsCards";
import { Search, Filter, Download, BarChart3, Table2, Globe } from "lucide-react";

export interface FreedomData {
  country: string;
  region: string;
  year: number;
  status: "Libre" | "Partiellement libre" | "Pas libre";
  politicalRights: number;
  civilLiberties: number;
  totalScore: number;
  [key: string]: any;
}

const Dashboard = () => {
  const [data, setData] = useState<FreedomData[]>([]);
  const [filteredData, setFilteredData] = useState<FreedomData[]>([]);
  const [activeView, setActiveView] = useState<"table" | "charts">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleDataLoad = (newData: FreedomData[]) => {
    setData(newData);
    setFilteredData(newData);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, regionFilter, statusFilter);
  };

  const handleRegionFilter = (region: string) => {
    setRegionFilter(region);
    applyFilters(searchTerm, region, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchTerm, regionFilter, status);
  };

  const applyFilters = (search: string, region: string, status: string) => {
    let filtered = data;

    if (search) {
      filtered = filtered.filter(item =>
        item.country.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (region !== "all") {
      filtered = filtered.filter(item => item.region === region);
    }

    if (status !== "all") {
      filtered = filtered.filter(item => item.status === status);
    }

    setFilteredData(filtered);
  };

  const uniqueRegions = [...new Set(data.map(item => item.region))];

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="bg-dashboard-nav border-b border-border p-6 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Globe className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Freedom Analytics</h1>
                <p className="text-muted-foreground">Tableau de bord des données de liberté mondiale</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {data.length} enregistrements chargés
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* File Upload Section */}
        {data.length === 0 && (
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Commencez votre analyse</CardTitle>
              <CardDescription>
                Importez votre fichier Excel contenant les données de liberté mondiale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onDataLoad={handleDataLoad} />
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard */}
        {data.length > 0 && (
          <>
            {/* Stats Cards */}
            <StatsCards data={filteredData} />

            {/* Controls */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtres et recherche
                    </CardTitle>
                    <CardDescription>
                      Filtrez et analysez vos données selon vos critères
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={activeView === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveView("table")}
                    >
                      <Table2 className="h-4 w-4 mr-2" />
                      Tableau
                    </Button>
                    <Button
                      variant={activeView === "charts" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveView("charts")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Graphiques
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un pays..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={regionFilter} onValueChange={handleRegionFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les régions</SelectItem>
                      {uniqueRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="Libre">Libre</SelectItem>
                      <SelectItem value="Partiellement libre">Partiellement libre</SelectItem>
                      <SelectItem value="Pas libre">Pas libre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Display */}
            {activeView === "table" && <DataTable data={filteredData} />}
            {activeView === "charts" && <DataVisualization data={filteredData} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;