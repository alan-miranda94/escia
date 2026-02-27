"use client";

import React, { useMemo, useState } from "react";
import { Activity, BarChart3, ChartLine, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUsers } from "../context/UserContext";
import type { ChartPoint } from "../types";

type MiniLineChartProps = {
  title: string;
  points: ChartPoint[];
  color: string;
  xLabel: string;
  yLabel: string;
};

const chartHeight = 180;
const chartWidth = 320;

function buildPolyline(points: ChartPoint[], maxY: number) {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `0,${chartHeight / 2}`;
  }

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * chartWidth;
      const normalizedY = maxY <= 0 ? 0.5 : point.y / maxY;
      const y = chartHeight - normalizedY * chartHeight;

      return `${x},${y}`;
    })
    .join(" ");
}

function MiniLineChart({
  title,
  points,
  color,
  xLabel,
  yLabel,
}: MiniLineChartProps) {
  const maxY = useMemo(() => {
    if (points.length === 0) return 1;
    return Math.max(...points.map((point) => point.y), 1);
  }, [points]);

  const polylinePoints = useMemo(
    () => buildPolyline(points, maxY),
    [maxY, points],
  );

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ChartLine className="size-4" aria-hidden="true" />
        <p className="text-sm font-semibold">{title}</p>
      </div>

      {points.length === 0 ? (
        <div className="flex h-45 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          Nenhum dado de treinamento ainda.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-45 w-full overflow-visible"
          role="img"
          aria-label={title}
        >
          <line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="currentColor"
            className="text-border"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={chartHeight}
            stroke="currentColor"
            className="text-border"
          />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polylinePoints}
          />
          {points.map((point, index) => {
            const x =
              points.length === 1
                ? 0
                : (index / (points.length - 1)) * chartWidth;
            const y =
              chartHeight - (maxY <= 0 ? 0.5 : point.y / maxY) * chartHeight;

            return (
              <circle
                key={`${title}-${index}`}
                cx={x}
                cy={y}
                r="3"
                fill={color}
              />
            );
          })}
        </svg>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{xLabel}</span>
        <span>{yLabel}</span>
      </div>
    </div>
  );
}

export default function TFVisorView() {
  const [open, setOpen] = useState(true);
  const { products, users, tfVisorWeights, trainingLogs } = useUsers();

  const lossPoints = useMemo<ChartPoint[]>(
    () =>
      trainingLogs.map((log) => ({
        x: log.epoch,
        y: log.loss,
      })),
    [trainingLogs],
  );

  const accPoints = useMemo<ChartPoint[]>(
    () =>
      trainingLogs.map((log) => ({
        x: log.epoch,
        y: log.accuracy,
      })),
    [trainingLogs],
  );

  const latestLog = trainingLogs[trainingLogs.length - 1] ?? null;
  const weightsCount = Array.isArray(tfVisorWeights)
    ? tfVisorWeights.length
    : tfVisorWeights && typeof tfVisorWeights === "object"
      ? Object.keys(tfVisorWeights).length
      : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="fixed right-4 bottom-4 z-40 shadow-md"
        >
          <BarChart3 className="size-4" aria-hidden="true" />
          TF Visor
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="size-4" aria-hidden="true" />
            TFVis Dashboard
          </SheetTitle>
          <SheetDescription>
            Painel lateral com dados, métricas e logs de treinamento.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Database className="size-4" aria-hidden="true" />
                Catálogo
              </div>
              <p className="mt-2 text-2xl font-semibold">{products.length}</p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="size-4" aria-hidden="true" />
                Usuários
              </div>
              <p className="mt-2 text-2xl font-semibold">{users.length}</p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ChartLine className="size-4" aria-hidden="true" />
                Pesos
              </div>
              <p className="mt-2 text-2xl font-semibold">{weightsCount}</p>
            </div>
          </div>

          <MiniLineChart
            title="Precisão do Modelo"
            points={accPoints}
            color="#16a34a"
            xLabel="Época"
            yLabel="Precisão (%)"
          />

          <MiniLineChart
            title="Erro de Treinamento"
            points={lossPoints}
            color="#dc2626"
            xLabel="Época"
            yLabel="Erro"
          />

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm font-semibold">Último log</p>
            {latestLog ? (
              <div className="mt-3 grid gap-2 text-sm">
                <p>Época: {latestLog.epoch}</p>
                <p>Loss: {Number(latestLog.loss).toFixed(4)}</p>
                <p>Accuracy: {Number(latestLog.accuracy).toFixed(4)}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum log recebido ainda.
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm font-semibold">Histórico de treino</p>
            {trainingLogs.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma época processada.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {trainingLogs
                  .slice(-8)
                  .reverse()
                  .map((log, index) => (
                    <div
                      key={`${log.epoch}-${index}`}
                      className="rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <span className="font-medium">Época {log.epoch}</span>
                      <span className="ml-2 text-muted-foreground">
                        Loss {Number(log.loss).toFixed(4)} | Acc{" "}
                        {Number(log.accuracy).toFixed(4)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
