"use client";

import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { BuildOptions } from "@/lib/utm";
import type { UtmFormValues } from "@/lib/utm-form-schema";

type FormCardProps = {
  form: UseFormReturn<UtmFormValues>;
  options: BuildOptions;
  submitting: boolean;
  showErrorAlert: boolean;
  onOptionsChange: (options: BuildOptions) => void;
  onReset: () => void;
  onSubmit: (values: UtmFormValues) => Promise<void> | void;
};

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm transition focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export function FormCard({
  form,
  options,
  submitting,
  showErrorAlert,
  onOptionsChange,
  onReset,
  onSubmit
}: FormCardProps) {
  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  const toggleOption = useCallback(
    (key: keyof BuildOptions) => (checked: boolean) => {
      if (key === "encodeSpace") {
        onOptionsChange({
          ...options,
          encodeSpace: checked ? "%20" : "+"
        });
      } else {
        onOptionsChange({
          ...options,
          [key]: checked
        });
      }
    },
    [onOptionsChange, options]
  );

  return (
    <Card className="h-full border border-border/60 bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Build URL
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          GA4 표준 규칙에 맞춰 UTM 파라미터를 조합합니다.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-sm font-medium">
              Base URL
            </Label>
            <Input
              id="baseUrl"
              type="url"
              placeholder="https://startmktg.com/landing"
              className={cn(
                inputClass,
                errors.baseUrl && "border-destructive focus-visible:ring-destructive/30"
              )}
              {...register("baseUrl")}
            />
            {errors.baseUrl && (
              <p className="text-xs font-medium text-destructive">
                {errors.baseUrl.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["utm_source", "utm_source*"] as const,
                ["utm_medium", "utm_medium*"] as const,
                ["utm_campaign", "utm_campaign*"] as const,
                ["utm_content", "utm_content"] as const,
                ["utm_term", "utm_term"] as const
              ] satisfies Array<[keyof UtmFormValues, string]>
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium capitalize">
                  {label.replace(/_/g, " ")}
                </Label>
                <Input
                  id={key}
                  placeholder={`${key} 값`}
                  className={cn(
                    inputClass,
                    errors[key] && "border-destructive focus-visible:ring-destructive/30"
                  )}
                  {...register(key)}
                />
                {errors[key] && (
                  <p className="text-xs font-medium text-destructive">
                    {errors[key]?.message as string}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/60 bg-surface p-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              옵션
            </h4>
            <div className="flex flex-col gap-4">
              <ToggleRow
                label="Lowercase keys"
                description="UTM 키를 모두 소문자로 변환합니다."
                checked={options.lowercaseKeys}
                onCheckedChange={toggleOption("lowercaseKeys")}
              />
              <ToggleRow
                label="Trim empty params"
                description="값이 비어 있는 파라미터는 제외합니다."
                checked={options.trimEmptyParams}
                onCheckedChange={toggleOption("trimEmptyParams")}
              />
              <ToggleRow
                label="Encode spaces as %20"
                description="공백 문자를 %20 또는 +로 변환합니다."
                checked={options.encodeSpace === "%20"}
                onCheckedChange={toggleOption("encodeSpace")}
              />
            </div>
          </div>

          {showErrorAlert && (
            <Alert variant="destructive" className="border-destructive/60">
              <AlertTitle className="text-sm font-semibold">
                Missing required fields.
              </AlertTitle>
              <AlertDescription className="text-sm">
                Please fill highlighted inputs.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              {submitting ? "Building..." : "Build URL"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                onReset();
              }}
              disabled={submitting}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type ToggleRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}


