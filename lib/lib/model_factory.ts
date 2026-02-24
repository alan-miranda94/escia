import * as tf from "@tensorflow/tfjs";

export function createNewModel(): tf.Sequential {
  const model = tf.sequential();

  // Primeira camada da rede:
  // entrada de 7 posições (idade normalizada + 3 cores + 3 localizacoes)

  // 80 neuronios = aqui coloquei tudo isso, pq tem pouca base de treino
  // quanto mais neuronios, mais complexidade a rede pode aprender
  // e consequentemente, mais processamento ela vai usar

  // A ReLU age como um filtro:
  // É como se ela deixasse somente os dados interessantes seguirem viagem na rede
  /// Se a informação chegou nesse neuronio é positiva, passa para frente!
  // se for zero ou negativa, pode jogar fora, nao vai servir para nada

  model.add(
    tf.layers.dense({
      inputShape: [7],
      units: 80,
      activation: "relu",
    }),
  );

  // Saída: 3 neuronios
  // um para cada categoria (premium, medium, basic)

  // activation: softmax normaliza a saida em probabilidades
  model.add(
    tf.layers.dense({
      units: 3,
      activation: "softmax",
    }),
  );

  // Compilando o modelo
  // optimizer Adam ( Adaptive Moment Estimation)
  // é um treinador pessoal moderno para redes neurais:
  // ajusta os pesos de forma eficiente e inteligente
  // aprender com historico de erros e acertos

  // loss: categoricalCrossentropy
  // Ele compara o que o modelo "acha" (os scores de cada categoria)
  // com a resposta certa
  // a categoria premium será sempre [1, 0, 0]

  // quanto mais distante da previsão do modelo da resposta correta
  // maior o erro (loss)
  // Exemplo classico: classificação de imagens, recomendação, categorização de
  // usuário
  // qualquer coisa em que a resposta certa é "apenas uma entre várias possíveis"

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}
