"use client";

import React, { useMemo } from "react";
import { CircleX, History, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Purchase, User, UserViewProps } from "../types";

export function UserView({
  users = [],
  selectedUserId = null,
  onUserSelect,
  onPurchaseRemove,
}: UserViewProps) {
  const selectedUser = useMemo<User | null>(() => {
    if (!selectedUserId) return null;
    return users.find((user) => user.id === selectedUserId) ?? null;
  }, [users, selectedUserId]);

  const purchases = selectedUser?.purchases ?? [];

  const handleRemovePurchase = (product: Purchase) => {
    if (!selectedUserId || !onPurchaseRemove) return;

    onPurchaseRemove({
      userId: selectedUserId,
      product,
    });
  };

  return (
    <Card className="  rounded-2xl">
      <CardHeader className="border-b py-5">
        <CardTitle className="flex items-center gap-2   font-semibold tracking-tight  ">
          <UserIcon />
          User Profile
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="user-select"
              className="text-xs tracking-[0.12em] text-slate-500 uppercase"
            >
              Select User
            </Label>
            <Select
              value={selectedUserId ? String(selectedUserId) : ""}
              onValueChange={(value) =>
                onUserSelect?.(value ? Number(value) : null)
              }
            >
              <SelectTrigger id="user-select" className="h-12 w-full">
                <SelectValue className="bg-blue-400" placeholder="Choose..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="user-age"
              className="text-xs tracking-[0.12em] text-slate-500 uppercase"
            >
              Age
            </Label>
            <Input
              id="user-age"
              value={selectedUser?.age ?? ""}
              readOnly
              placeholder="-"
              className=" bg-muted/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ">
          <History className="size-4" aria-hidden="true" />
          <h3 className="text-2xl font-semibold">Past Purchases</h3>
        </div>

        {purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No past purchases found.
          </p>
        ) : (
          <div className="space-y-3">
            {purchases.map((product) => (
              <div
                key={`${product.id}-${product.name}`}
                className="flex items-center justify-between rounded-xl border bg-muted/35 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold leading-tight ">
                    {product.name}
                  </p>
                  <p className="text-base text-slate-500">
                    Price: ${Number(product.price).toFixed(2)} • Color:{" "}
                    {product.color}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Remove purchase"
                  aria-label={`Remove ${product.name}`}
                  onClick={() => handleRemovePurchase(product)}
                  className="shrink-0 text-slate-400 hover:text-slate-700"
                >
                  <CircleX className="size-5" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UserView;
