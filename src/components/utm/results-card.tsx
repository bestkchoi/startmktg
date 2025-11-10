"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ResultsCardProps = {
  finalUrl: string | null;
  mergedQuery: Record<string, string> | null;
  platforms: string[];
  onCopyUrl: () => void;
  onCopyJson: () => void;
};

export function ResultsCard({
  finalUrl,
  mergedQuery,
  platforms,
  onCopyUrl,
  onCopyJson
}: ResultsCardProps) {
  const chips = useMemo(() => {
    if (!mergedQuery) {
      return [];
    }
    return Object.entries(mergedQuery);
  }, [mergedQuery]);

  return (
    <Card className="border border-border/60 bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Result
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          조립된 URL을 복사하거나 JSON 형태로 내려받을 수 있습니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Result URL
          </label>
          <Input
            value={finalUrl ?? ""}
            readOnly
            placeholder="Build URL 버튼을 눌러 결과를 확인하세요."
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onCopyUrl}
            disabled={!finalUrl}
          >
            Copy URL
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto border border-border"
            onClick={onCopyJson}
            disabled={!mergedQuery}
          >
            Copy JSON
          </Button>
        </div>

        {platforms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {platforms.map((platform) => (
              <Badge
                key={platform}
                variant="secondary"
                className="border border-primary/30 bg-primary/10 text-primary"
              >
                {platform} detected
              </Badge>
            ))}
          </div>
        )}

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map(([key, value]) => (
              <Badge
                key={key}
                variant="outline"
                className="border-border bg-surface font-medium text-foreground"
              >
                {key}={value}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            파라미터가 생성되면 여기에서 확인할 수 있습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}


