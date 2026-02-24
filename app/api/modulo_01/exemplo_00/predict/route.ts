import * as tf from "@tensorflow/tfjs";
import { NextResponse } from "next/server";
import { normalizeData } from "../train_model/route";

interface Pessoa {
  nome: string;
  idade: number;
  cor: string;
  localizacao: string;
}

export async function POST(req: Request) {
  try {
    const { model, pessoa } = await req.json();
    const labelsNomes = ["premium", "medium", "basic"];
    // 🔥 1️⃣ Reconstruir weightData (base64 → ArrayBuffer)
    const weightBuffer = Uint8Array.from(atob(model.weightData), (c) =>
      c.charCodeAt(0),
    ).buffer;

    // 🔥 2️⃣ Reconstruir o modelo real
    const loadedModel = await tf.loadLayersModel(
      tf.io.fromMemory({
        modelTopology: model.modelTopology,
        weightSpecs: model.weightSpecs,
        weightData: weightBuffer,
      }),
    );

    // 🔥 3️⃣ Normalizar input
    const pessoaNormalizada = normalizeData([pessoa]);
    const tfInput = tf.tensor2d(pessoaNormalizada);

    // 🔥 4️⃣ Fazer predição
    const pred = loadedModel.predict(tfInput) as tf.Tensor;
    const predArray: any = await pred.array();

    const predictions = predArray[0].map((prob: number, index: number) => ({
      prob,
      index,
    }));
    loadedModel.dispose();
    tfInput.dispose();
    pred.dispose();
    const ordeResult = predictions
      .sort((a: any, b: any) => b.prob - a.prob)
      .map(
        (p: any) => `${labelsNomes[p.index]} (${(p.prob * 100).toFixed(2)}%)`,
      )
      .join("\n");

    return NextResponse.json(ordeResult);
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
