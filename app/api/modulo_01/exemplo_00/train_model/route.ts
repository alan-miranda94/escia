import { createNewModel } from "@/lib/lib/model_factory";
import * as tf from "@tensorflow/tfjs";
import { NextResponse } from "next/server";

interface Pessoa {
  nome: string;
  idade: number;
  cor: string;
  localizacao: string;
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    tf.engine().reset(); // 👈 limpa variáveis registradas
    const model = createNewModel();
    const { pessoas } = await req.json();

    const tensorPessoasNormalizado = normalizeData(pessoas);
    const tensorLabels = [
      [1, 0, 0], // premium - Erick
      [0, 1, 0], // medium - Ana
      [0, 0, 1], // basic - Carlos
    ];

    // Criamos tensores de entrada (xs) e saída (ys) para treinar o modelo
    const inputXs = tf.tensor2d(tensorPessoasNormalizado);
    const outputYs = tf.tensor2d(tensorLabels);

    // Treinamento do modelo
    // verbose: desabilita o log interno (e usa só callback)
    // epochs: quantidade de veses que vai rodar no dataset
    // shuffle: embaralha os dados, para evitar viés
    await model.fit(inputXs, outputYs, {
      verbose: 0,
      epochs: 100,
      shuffle: true,
      callbacks: {
        // onEpochEnd: (epoch, log) => console.log(
        //     `Epoch: ${epoch}: loss = ${log.loss}`
        // )
      },
    });

    let savedArtifacts: tf.io.ModelArtifacts | null = null;

    await model.save(
      tf.io.withSaveHandler(async (artifacts) => {
        savedArtifacts = artifacts;
        return {
          modelArtifactsInfo: {
            dateSaved: new Date(),
            modelTopologyType: "JSON",
          },
        };
      }),
    );

    // Agora sim:
    if (!savedArtifacts) {
      throw new Error("Falha ao salvar artifacts");
    }

    const artifacts = await extractArtifacts(model);

    const base64Weights = Buffer.from(
      artifacts.weightData as ArrayBuffer,
    ).toString("base64");

    const modelToSave = {
      modelTopology: artifacts.modelTopology,
      weightSpecs: artifacts.weightSpecs,
      weightData: base64Weights,
    };

    inputXs.dispose();
    outputYs.dispose();
    model.dispose();
    return NextResponse.json(modelToSave);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export function normalizeData(pessoas: Pessoa[]): number[][] {
  if (!pessoas.length) return [];

  const cores = ["azul", "vermelho", "verde"];
  const localizacoes = ["São Paulo", "Rio", "Curitiba"];

  const idades = pessoas.map((pessoa) => pessoa.idade);
  const idadeMin = Math.min(...idades);
  const idadeMax = Math.max(...idades);
  const divisor = idadeMax - idadeMin || 1;

  return pessoas.map((pessoa) => {
    // (idade - idadeMin) / (idadeMax - idadeMin)
    const idadeNormalizada = Number(
      ((pessoa.idade - idadeMin) / divisor).toFixed(2),
    );

    const corOneHot = cores.map((cor) => (pessoa.cor === cor ? 1 : 0));
    const localizacaoOneHot = localizacoes.map((localizacao) =>
      pessoa.localizacao === localizacao ? 1 : 0,
    );

    // Ordem: [idade_normalizada, azul, vermelho, verde, Sao Paulo, Rio, Curitiba]
    return [idadeNormalizada, ...corOneHot, ...localizacaoOneHot];
  });
}

async function extractArtifacts(
  model: tf.LayersModel,
): Promise<tf.io.ModelArtifacts> {
  let artifacts!: tf.io.ModelArtifacts;

  await model.save(
    tf.io.withSaveHandler(async (a) => {
      artifacts = a;
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: "JSON",
        },
      };
    }),
  );

  return artifacts;
}
