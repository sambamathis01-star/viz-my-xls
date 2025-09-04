import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { FreedomData } from "./Dashboard";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onDataLoad: (data: FreedomData[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoad }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const processExcelFile = useCallback((file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setProgress(30);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        setProgress(60);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setProgress(80);
        
        // Transform data to match our interface
        const transformedData: FreedomData[] = jsonData.map((row: any, index) => {
          // Handle different possible column names and formats
          const country = row.Pays || row.Country || row.country || `Pays ${index}`;
          const region = row.Region || row.region || "Non spécifiée";
          const year = parseInt(row.Année || row.Year || row.year || new Date().getFullYear());
          const status = row.Status || row.status || "Non spécifié";
          const politicalRights = parseInt(row["Droits politiques"] || row["Political Rights"] || row.politicalRights || 0);
          const civilLiberties = parseInt(row["Libertés civiles"] || row["Civil Liberties"] || row.civilLiberties || 0);
          
          return {
            country,
            region,
            year: isNaN(year) ? new Date().getFullYear() : year,
            status: status as any,
            politicalRights: isNaN(politicalRights) ? 0 : politicalRights,
            civilLiberties: isNaN(civilLiberties) ? 0 : civilLiberties,
            totalScore: (isNaN(politicalRights) ? 0 : politicalRights) + (isNaN(civilLiberties) ? 0 : civilLiberties),
            ...row // Keep original data
          };
        });

        setProgress(100);
        onDataLoad(transformedData);
        setSuccess(true);
        setUploading(false);
        
        toast({
          title: "Fichier importé avec succès",
          description: `${transformedData.length} enregistrements ont été chargés.`,
        });

        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError("Erreur lors du traitement du fichier. Vérifiez le format Excel.");
        setUploading(false);
        setProgress(0);
        
        toast({
          title: "Erreur d'importation",
          description: "Le fichier n'a pas pu être traité. Vérifiez le format.",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier.");
      setUploading(false);
      setProgress(0);
    };

    reader.readAsArrayBuffer(file);
  }, [onDataLoad, toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.includes("sheet") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        processExcelFile(file);
      } else {
        setError("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      }
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: uploading
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${success ? 'border-success bg-success/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {success ? (
            <CheckCircle className="h-12 w-12 text-success" />
          ) : uploading ? (
            <FileSpreadsheet className="h-12 w-12 text-primary animate-pulse" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground" />
          )}
          
          <div>
            {success ? (
              <p className="text-lg font-medium text-success">Fichier importé avec succès !</p>
            ) : uploading ? (
              <p className="text-lg font-medium text-primary">Traitement en cours...</p>
            ) : isDragActive ? (
              <p className="text-lg font-medium text-primary">Déposez le fichier ici...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-foreground mb-2">
                  Glissez-déposez votre fichier Excel ici
                </p>
                <p className="text-sm text-muted-foreground">
                  ou cliquez pour sélectionner un fichier (.xlsx, .xls)
                </p>
              </>
            )}
          </div>

          {!uploading && !success && (
            <Button variant="outline" size="lg">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Sélectionner un fichier
            </Button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-success text-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Fichier importé avec succès ! Vous pouvez maintenant analyser vos données.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};