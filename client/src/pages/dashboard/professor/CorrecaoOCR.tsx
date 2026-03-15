// Calia Digital — Professor: Correção OCR
// IMPORTANTE: A lógica de OCR do backend NÃO foi alterada. Esta página apenas consome a API.
// Backend endpoint: POST /ocr/correct (FormData: assessment_id, student_id, file)
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScanLine, Upload, Loader2, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CorrecaoOCR() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, s] = await Promise.all([
          apiFetch("/assessments"),
          apiFetch("/students"),
        ]);
        setAssessments(a || []);
        setStudents(s || []);
      } catch {}
    };
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const processOCR = async () => {
    if (!file) { toast.error("Selecione uma imagem"); return; }
    if (!selectedAssessment) { toast.error("Selecione uma avaliação"); return; }
    if (!selectedStudent) { toast.error("Selecione um aluno"); return; }

    setProcessing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assessment_id", selectedAssessment);
      formData.append("student_id", selectedStudent);

      // Chama o endpoint real do backend: POST /ocr/correct
      const data = await apiFetch("/ocr/correct", {
        method: "POST",
        body: formData,
      });
      setResult(data);
      toast.success("Correção concluída!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar OCR");
    } finally {
      setProcessing(false);
    }
  };

  // Filtra alunos pela turma da avaliação selecionada
  const selectedAssessmentObj = assessments.find((a) => a.id === selectedAssessment);
  const filteredStudents = selectedAssessmentObj
    ? students.filter((s) => s.class_id === selectedAssessmentObj.class_id)
    : students;

  return (
    <div>
      <PageHeader
        title="Correção por OCR"
        description="Digitalize folhas de respostas para correção automática"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-primary" /> Digitalizar Prova
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Avaliação</Label>
              <Select value={selectedAssessment} onValueChange={(v) => { setSelectedAssessment(v); setSelectedStudent(""); }}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione a avaliação" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aluno</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {preview ? (
                <div className="space-y-3">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  <p className="text-sm text-muted-foreground">{file?.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Clique para selecionar a imagem</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Foto da folha de respostas (JPG, PNG)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={processOCR}
              disabled={processing || !file || !selectedAssessment || !selectedStudent}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processando OCR...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Corrigir Prova
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Area */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Resultado da Correção</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Score */}
                <div className="p-6 rounded-lg bg-background/50 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Nota</p>
                  <p className="text-4xl font-bold font-mono text-primary">
                    {result.score != null ? result.score : "—"}
                  </p>
                </div>

                {/* Debug image from OCR */}
                {result.debug_image && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Imagem de Verificação</p>
                    <img
                      src={`data:image/jpeg;base64,${result.debug_image}`}
                      alt="Debug OCR"
                      className="w-full rounded-lg border border-border/50"
                    />
                  </div>
                )}

                {/* Answers detail */}
                {result.answers && (
                  <div>
                    <p className="text-sm font-medium mb-2">Respostas Detectadas</p>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="w-16">Questão</TableHead>
                          <TableHead>Resposta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(result.answers).map(([num, ans]) => (
                          <TableRow key={num} className="border-border/30">
                            <TableCell className="font-mono text-muted-foreground">{num}</TableCell>
                            <TableCell className="font-mono font-medium">
                              {(ans as string) === "BRANCO" ? (
                                <span className="text-yellow-400">BRANCO</span>
                              ) : (ans as string) === "ANULADA" ? (
                                <span className="text-red-400">ANULADA</span>
                              ) : (
                                <span>{ans as string}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center">
                <ScanLine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma avaliação, um aluno e envie a imagem da folha de respostas para ver o resultado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
