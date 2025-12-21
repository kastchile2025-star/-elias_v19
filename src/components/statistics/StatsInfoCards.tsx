'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, UserCheck, BookOpen, School } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export interface InfoCardData {
  key: string;
  value: number | string;
  icon: 'users' | 'graduation' | 'userCheck' | 'book' | 'school';
  labelKey: string;
  fallbackLabel: string;
  description?: string;
}

const iconMap = {
  users: Users,
  graduation: GraduationCap,
  userCheck: UserCheck,
  book: BookOpen,
  school: School,
};

interface SingleInfoCardProps {
  value: number | string;
  icon: 'users' | 'graduation' | 'userCheck' | 'book' | 'school';
  label: string;
  description?: string;
  isLoading?: boolean;
}

function SingleInfoCard({ value, icon, label, description, isLoading }: SingleInfoCardProps) {
  const Icon = iconMap[icon];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 bg-muted/30 rounded animate-pulse" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <div className="text-xs text-muted-foreground mt-1">{description}</div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export interface StatsInfoCardsProps {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalSections?: number;
  isLoading?: boolean;
}

/**
 * Componente modular para las tarjetas de información general
 * Muestra: Estudiantes, Cursos, Profesores, Usuarios totales
 */
export default function StatsInfoCards({
  totalUsers,
  totalStudents,
  totalTeachers,
  totalCourses,
  totalSections,
  isLoading = false,
}: StatsInfoCardsProps) {
  const { translate } = useLanguage();
  const t = (key: string, fallback?: string) => {
    const v = translate(key);
    return v === key ? (fallback ?? key) : v;
  };

  const cards: InfoCardData[] = [
    {
      key: 'students',
      value: totalStudents,
      icon: 'graduation',
      labelKey: 'students',
      fallbackLabel: 'Estudiantes',
    },
    {
      key: 'courses',
      value: totalCourses,
      icon: 'school',
      labelKey: 'courses',
      fallbackLabel: 'Cursos',
      description: totalSections ? `${totalSections} ${t('sections', 'secciones')}` : undefined,
    },
    {
      key: 'teachers',
      value: totalTeachers,
      icon: 'userCheck',
      labelKey: 'teachers',
      fallbackLabel: 'Profesores',
    },
    {
      key: 'users',
      value: totalUsers,
      icon: 'users',
      labelKey: 'totalUsers',
      fallbackLabel: 'Usuarios',
      description: `${totalTeachers} ${t('teachers', 'profesores')}, ${totalStudents} ${t('students', 'estudiantes')}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-section>
      {cards.map((card) => (
        <SingleInfoCard
          key={card.key}
          value={card.value}
          icon={card.icon}
          label={t(card.labelKey, card.fallbackLabel)}
          description={card.description}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
