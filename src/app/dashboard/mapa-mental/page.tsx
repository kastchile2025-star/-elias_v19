
"use client";

import { useState } from 'react';
import Image from 'next/image'; 
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Sparkles, Download, Newspaper as SummaryIcon, FileQuestion, ClipboardList } from 'lucide-react'; 
import { BookCourseSelector } from '@/components/common/book-course-selector';
import { createMindMapAction } from '@/actions/mind-map-actions';
import { useToast } from "@/hooks/use-toast";
import { useAIProgress } from "@/hooks/use-ai-progress";
import { cn } from '@/lib/utils';
import { contentDB } from '@/lib/sql-content';
import { useAuth } from '@/contexts/auth-context';

export default function MapaMentalPage() {
  const { translate, language: currentUiLanguage } = useLanguage();
  const { toast } = useToast();
  const { progress, progressText, isLoading, startProgress, stopProgress } = useAIProgress();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [centralTheme, setCentralTheme] = useState('');
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [mindMapResult, setMindMapResult] = useState<string | null>(null);
  const [currentCentralThemeForDisplay, setCurrentCentralThemeForDisplay] = useState('');


  const handleGenerateMap = async () => {
     if (!selectedBook && !selectedSubject) {
      toast({ title: translate('errorGenerating'), description: translate('noBookSelected'), variant: 'destructive'});
      return;
    }
    if (!centralTheme.trim()) {
      toast({ title: translate('errorGenerating'), description: translate('noTopicProvided'), variant: 'destructive'});
      return;
    }

    setMindMapResult(null);
    setCurrentCentralThemeForDisplay(centralTheme.trim());
    
    // Start progress simulation
    const progressInterval = startProgress('mindmap', 10000);
    
    try {
      // Intentar Server Action primero
      try {
        const result = await createMindMapAction({
          centralTheme: centralTheme.trim(),
          bookTitle: selectedBook || selectedSubject,
          language: currentUiLanguage,
          isHorizontal: isHorizontal,
        });
        setMindMapResult(result.imageDataUri);
        try {
          await contentDB.saveMindMap({
            id: crypto.randomUUID(),
            userId: (user as any)?.id || null,
            username: user?.username || null,
            courseId: selectedCourse || null,
            sectionId: null,
            subjectName: selectedBook || selectedSubject || null,
            centralTheme: centralTheme.trim(),
            imageDataUri: result.imageDataUri,
            language: currentUiLanguage,
            createdAt: new Date().toISOString()
          });
        } catch (e) { console.warn('[MapaMental] No se pudo persistir en BD', e); }
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        const looksLikeInvalidServerActions = msg.includes('Invalid Server Actions request');
        if (!looksLikeInvalidServerActions) throw err;

        // Fallback a API cuando Server Actions no es válido (p.ej., origen no permitido)
        const resp = await fetch('/api/create-mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            centralTheme: centralTheme.trim(),
            bookTitle: selectedBook || selectedSubject,
            language: currentUiLanguage,
            isHorizontal: isHorizontal,
          })
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        if (!data?.imageDataUri) throw new Error('Respuesta inválida del generador de mapas');
        setMindMapResult(data.imageDataUri);
        try {
          await contentDB.saveMindMap({
            id: crypto.randomUUID(),
            userId: (user as any)?.id || null,
            username: user?.username || null,
            courseId: selectedCourse || null,
            sectionId: null,
            subjectName: selectedBook || selectedSubject || null,
            centralTheme: centralTheme.trim(),
            imageDataUri: data.imageDataUri,
            language: currentUiLanguage,
            createdAt: new Date().toISOString()
          });
        } catch (e) { console.warn('[MapaMental] No se pudo persistir en BD', e); }
      }
      
      // Show success notification
      toast({ 
        title: translate('mapGeneratedTitle'), 
        description: translate('mapGeneratedDesc'),
        variant: 'default'
      });
      
      // Increment maps count
  const currentCount = parseInt(localStorage.getItem('mapsCreatedCount') || '0', 10);
  localStorage.setItem('mapsCreatedCount', (currentCount + 1).toString());
  try { window.dispatchEvent(new Event('localStorageUpdate')); } catch {}
  try { window.dispatchEvent(new Event('toolCountersUpdated')); } catch {}
  } catch (error) {
      console.error("Error generating mind map:", error);
      toast({ title: translate('errorGenerating'), description: (error as Error).message, variant: 'destructive'});
      setMindMapResult(null);
    } finally {
      stopProgress(progressInterval);
    }
  };

  const handleDownloadPdf = () => {
    if (!mindMapResult) return;

    const title = `${translate('mindMapResultTitle').toUpperCase()} - ${currentCentralThemeForDisplay.toUpperCase()}`;
    
    const contentHtml = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
            body { font-family: 'Space Grotesk', sans-serif; margin: 20px; text-align: center; }
            img { max-width: 100%; height: auto; border: 1px solid #eee; }
            h1 { font-size: 1.5em; margin-bottom: 1em; font-family: 'Space Grotesk', sans-serif; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <img src="${mindMapResult}" alt="${title}" />
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(contentHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
          printWindow.print();
      }, 500); 
    } else {
       toast({
        title: translate('errorGenerating'),
        description: translate('mapDownloadErrorPopupBlocked', {defaultValue: "Could not open print window. Please check your pop-up blocker settings."}),
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="items-center">
          <Network className="w-10 h-10 text-yellow-500 dark:text-yellow-400 mb-3" />
          <CardTitle className="text-3xl font-bold font-headline">{translate('mapPageTitle')}</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground max-w-2xl">
            {translate('mapPageSub')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <BookCourseSelector
            selectedCourse={selectedCourse}
            selectedBook={selectedBook}
            selectedSubject={selectedSubject}
            onCourseChange={setSelectedCourse}
            onBookChange={setSelectedBook}
            onSubjectChange={setSelectedSubject}
            showSubjectSelector={true}
            showBookSelector={false}
          />
          <Textarea
            rows={2}
            value={centralTheme}
            onChange={(e) => setCentralTheme(e.target.value)}
            placeholder={translate('mapCentralThemePlaceholder')}
            className="text-base md:text-sm"
          />
          <div className="flex items-center space-x-2 justify-start"> 
            <Checkbox
              id="horizontal-orientation"
              checked={isHorizontal}
              onCheckedChange={(checked) => setIsHorizontal(Boolean(checked))}
            />
            <Label htmlFor="horizontal-orientation" className="text-sm font-medium">
              {translate('mapHorizontalOrientation')}
            </Label>
          </div>
          <Button
            onClick={handleGenerateMap}
            disabled={isLoading}
            className={cn(
              "w-full font-semibold py-3 text-base md:text-sm home-card-button-yellow",
              "hover:brightness-110 hover:shadow-lg transition-all duration-200"
            )}
          >
            {isLoading ? (
              <>{translate('loading')} {progress}%</>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {translate('mapGenerateBtn')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {mindMapResult && !isLoading && (
        <Card className="w-full max-w-3xl text-left shadow-md">
           <CardHeader>
            <CardTitle className="font-headline text-center mind-map-title">
              {translate('mindMapResultTitle').toUpperCase()} - {currentCentralThemeForDisplay.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <img 
                src={mindMapResult} 
                alt={translate('mindMapResultTitle')} 
                className="w-full h-auto rounded-md border object-contain"
              />
            </div>
            
            <div className="mt-8 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button
                onClick={handleDownloadPdf}
                className="font-semibold py-2 px-6 rounded-lg transition-colors home-card-button-yellow text-xs sm:text-sm"
              >
                <Download className="mr-2 h-4 w-4" /> {translate('mapActionDownloadPdf', {defaultValue: "Download PDF"})}
              </Button>
              <Button asChild className="font-semibold py-2 px-6 rounded-lg transition-colors home-card-button-blue text-xs sm:text-sm">
                <Link href="/dashboard/resumen">
                  <SummaryIcon className="mr-2 h-4 w-4" /> {translate('mapActionCreateSummary', {defaultValue: "Create Summary"})}
                </Link>
              </Button>
              <Button asChild className="font-semibold py-2 px-6 rounded-lg transition-colors home-card-button-cyan text-xs sm:text-sm">
                <Link href="/dashboard/cuestionario">
                  <FileQuestion className="mr-2 h-4 w-4" /> {translate('mapActionCreateQuiz', {defaultValue: "Create Quiz"})}
                </Link>
              </Button>
              <Button asChild className="font-semibold py-2 px-6 rounded-lg transition-colors home-card-button-purple text-xs sm:text-sm">
                <Link href="/dashboard/evaluacion">
                  <ClipboardList className="mr-2 h-4 w-4" /> {translate('mapActionCreateEval', {defaultValue: "Create Evaluation"})}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
