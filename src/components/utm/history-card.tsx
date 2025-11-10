"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { HistoryItem } from "@/hooks/use-local-history";

type HistoryCardProps = {
  items: HistoryItem[];
  onCopy: (url: string) => void;
};

export function HistoryCard({ items, onCopy }: HistoryCardProps) {
  return (
    <Card className="border border-border/60 bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Recent history
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          최근 5개의 생성 기록입니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent items yet</p>
        )}

        {items.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {item.baseUrl}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(item.finalUrl)}
              >
                Copy
              </Button>
            </div>
            <Badge
              variant="outline"
              className="max-w-full truncate border-border bg-surface text-xs font-medium text-muted-foreground"
              title={item.finalUrl}
            >
              {item.finalUrl}
            </Badge>
            {index !== items.length - 1 && <Separator className="bg-border/60" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


