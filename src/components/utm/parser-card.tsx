"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { parseUtmUrl, type ParsedUtm } from "@/lib/utm";

type ParserCardProps = {
  onParse: (parsed: ParsedUtm) => void;
};

export function ParserCard({ onParse }: ParserCardProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("URL을 입력해주세요.");
      return;
    }

    const parsed = parseUtmUrl(trimmed);
    if (!parsed) {
      setError("유효한 URL을 붙여넣어주세요.");
      return;
    }

    setError(null);
    onParse(parsed);
  };

  return (
    <Card className="h-full border border-border/60 bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Parser
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          기존 URL을 붙여넣으면 폼에 자동으로 채워집니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={5}
          placeholder="Paste your URL"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <Button className="w-full sm:w-auto" variant="secondary" onClick={handleParse}>
          Parse
        </Button>
      </CardContent>
    </Card>
  );
}


