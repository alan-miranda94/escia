"use client";

import React, { useMemo, useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Database,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ModelTrainingViewProps } from "../types";

export default function ModelTrainingView({
  users = [],
  isTraining = false,
  canRunRecommendation = false,
  onTrainModel,
  onRunRecommendation,
}: ModelTrainingViewProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  return (
    <Card className="flex h-full overflow-hidden rounded-xl">
      <CardHeader className="border-b py-5">
        <CardTitle className="flex items-center gap-2 text-base font-semibold ">
          <Bot className="size-4 " aria-hidden="true" />
          Model Controls
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col h-full   justify-between  ">
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            type="button"
            onClick={onTrainModel}
            disabled={isTraining}
            className="h-12 bg-blue-600 text-white hover:bg-blue-700"
          >
            {isTraining ? (
              <>
                <RefreshCcw
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Training...
              </>
            ) : (
              <>
                <RefreshCcw className="size-4" aria-hidden="true" />
                Train Recommendation Model
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={onRunRecommendation}
            disabled={!canRunRecommendation}
            className="h-12 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400"
          >
            <CirclePlay className="size-4" aria-hidden="true" />
            Run Recommendation
          </Button>
        </div>

        <div className="border-t pt-4 space-y-4   ">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold ">
              <Database className="size-4 " aria-hidden="true" />
              All Users Purchase Data
            </p>
            <p className="mt-1 text-xs ">
              View and manage the underlying training dataset across all
              segments.
            </p>
          </div>

          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name} (Age: {user.age})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedUser ? (
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-semibold">
                {selectedUser.name} <span>(Age: {selectedUser.age})</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedUser.purchases.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    No purchases
                  </span>
                ) : (
                  selectedUser.purchases.map((purchase) => (
                    <Badge
                      key={`${selectedUser.id}-${purchase.id}-${purchase.name}`}
                      variant="secondary"
                    >
                      {purchase.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a user to view purchases.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
