"use client";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  actionButton?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

function DashboardCard({
  title,
  icon,
  actionButton,
  children,
  className = "",
  contentClassName = "",
  headerClassName = ""
}: DashboardCardProps) {
  return (
    <Card className={`flex h-full min-h-0 flex-col rounded-lg border border-zinc-800 bg-zinc-950 ${className}`}>
      <CardHeader className={`flex-shrink-0 border-b border-zinc-800 pb-3 ${headerClassName}`}>
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
          <span className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </span>
          {actionButton && actionButton}
        </CardTitle>
      </CardHeader>
      <CardContent className={`flex-1 min-h-0 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}

export default DashboardCard;