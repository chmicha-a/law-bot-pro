import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, Trash2 } from "lucide-react";
import { documentApi } from "@/services/api";
import { toast } from "sonner";

interface Document {
  filename: string;
  path: string;
  category?: string;
}

const LAW_CATEGORIES = [
  "Loi de la famille",
  "Loi maritime",
  "Code du travail",
  "Code pénal",
  "Code civil",
  "Loi sur les sociétés",
  "Autre"
];

export default function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(LAW_CATEGORIES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentApi.list();
      setDocuments(docs);
    } catch (error) {
      toast.error("Failed to load documents");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      toast.error("Only PDF files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      const response = await documentApi.upload(file, selectedCategory);
      toast.success(response.message || "File uploaded successfully");
      await loadDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      await documentApi.delete(filename);
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      // Always refresh the list to sync with backend state
      await loadDocuments();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your AI Law Assistant system</p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground/60" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{documents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">PDF documents indexed</p>
              </CardContent>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Upload Documents</CardTitle>
              <CardDescription>Add new legal documents to the knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Document Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAW_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-border/60 p-12 hover:border-border transition-all bg-accent/20">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload PDF files</p>
                    <p className="text-xs text-muted-foreground">Click to browse</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Browse Files
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Library */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Document Library</CardTitle>
              <CardDescription>Manage your uploaded legal documents</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents uploaded yet
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.filename}
                      className="flex items-center justify-between rounded-xl border-0 bg-accent/30 p-4 hover:bg-accent/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-7 w-7 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-[15px]">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{doc.path}</p>
                          {doc.category && (
                            <p className="text-xs text-foreground/60 mt-1">{doc.category}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.filename)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
