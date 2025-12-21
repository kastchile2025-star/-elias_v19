
"use client";

import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';

// FAQ data directly in component to avoid context issues
const faqData = [
  { id: "faq1", qKey: "faq1_q", aKey: "faq1_a" },
  { id: "faq2", qKey: "faq2_q", aKey: "faq2_a" },
  { id: "faq3", qKey: "faq3_q", aKey: "faq3_a" },
  { id: "faq4", qKey: "faq4_q", aKey: "faq4_a" },
  { id: "faq5", qKey: "faq5_q", aKey: "faq5_a" },
  { id: "faq6", qKey: "faq6_q", aKey: "faq6_a" },
  { id: "faq7", qKey: "faq7_q", aKey: "faq7_a" },
  { id: "faq8", qKey: "faq8_q", aKey: "faq8_a" },
];

export default function AyudaPage() {
  const { translate } = useLanguage();

  return (
    <div className="flex flex-col items-center text-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <CardTitle className="text-3xl font-bold font-headline">{translate('helpPageTitle')}</CardTitle>
            <MessageSquareQuote className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
          </div>
          <CardDescription className="mt-2 text-muted-foreground max-w-xl">
            {translate('helpPageSub')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-left">
          <h3 className="font-bold text-xl mb-4 text-center font-headline">{translate('faqTitle')}</h3>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item) => (
              <AccordionItem value={item.id} key={item.id}>
                <AccordionTrigger className="text-base hover:no-underline">
                  {translate(item.qKey)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  {translate(item.aKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-8 border-t pt-6">
            <p className="mb-3 text-muted-foreground">{translate('faqNotFound')}</p>
            <Button 
              className={cn(
                "bg-custom-blue-100 text-custom-blue-800 hover:bg-custom-blue-100/80 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30",
                "hover:brightness-110 hover:shadow-lg hover:scale-105 transition-all duration-200"
              )}
            >
              {translate('faqContactUs')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
