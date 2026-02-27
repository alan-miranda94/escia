"use client";

import React, { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "../context/UserContext";

export default function ProductListView() {
  const { products, selectedUserId, addPurchase } = useUsers();
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const handleBuyProduct = (productId: number) => {
    if (!selectedUserId) return;

    const product = products.find((item) => item.id === productId);
    if (!product) return;

    addPurchase({
      userId: selectedUserId,
      product,
    });

    setAddedProductId(productId);
    window.setTimeout(() => {
      setAddedProductId((currentId) =>
        currentId === productId ? null : currentId,
      );
    }, 500);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="border-b py-5">
        <CardTitle className="flex items-center gap-2 font-semibold tracking-tight">
          <Package className="size-4" aria-hidden="true" />
          Product List
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products available.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-1 overflow-hidden rounded-xl border bg-muted/30 transition-colors hover:bg-muted/50"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-40 object-cover"
                />

                <div className="p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground capitalize">
                      {product.color}
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={!selectedUserId}
                    onClick={() => handleBuyProduct(product.id)}
                    className="mt-4 h-10 w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300"
                  >
                    {addedProductId === product.id ? "Added" : "Buy Now"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
