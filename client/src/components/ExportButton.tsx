import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, FileText, Sheet } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  onExportPDF?: () => Promise<void>;
  onExportExcel?: () => Promise<void>;
  disabled?: boolean;
}

export default function ExportButton({
  onExportPDF,
  onExportExcel,
  disabled = false,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      setLoading(true);
      if (format === "pdf" && onExportPDF) {
        await onExportPDF();
        toast.success("PDF exportado com sucesso!");
      } else if (format === "excel" && onExportExcel) {
        await onExportExcel();
        toast.success("Excel exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar arquivo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onExportExcel && (
          <DropdownMenuItem onClick={() => handleExport("excel")}>
            <Sheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </DropdownMenuItem>
        )}
        {onExportPDF && (
          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
