import { workerEvents } from "../events/constants";
import * as tf from "@tensorflow/tfjs";
import type {
  RecommendPayload,
  TrainingPayload,
  WorkerState,
  User,
  Product,
  Purchase,
} from "../types";

const ctx: WorkerState = {
  weights: null,
  catalog: [],
  users: [],
};

const workerScope = self as unknown as {
  postMessage: (message: unknown) => void;
  onmessage:
    | ((
        event: MessageEvent<{ action: string } & Record<string, unknown>>,
      ) => void)
    | null;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const normalize = (value: number, min: number, max: number) =>
  (value - min) / (max - min || 1);

function makeContext(catalog: Product[], users: User[]) {
  const ages = users.map((a) => a.age);
  const prices = catalog.map((p) => p.price);

  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const colors = [...new Set(catalog.map((p) => p.color))];
  const categories = [...new Set(catalog.map((p) => p.category))];

  const colorsIndex = Object.entries(
    colors.map((color, index) => {
      return [color, index];
    }),
  );

  const categoriesIndex = Object.entries(
    categories.map((category, index) => {
      return [category, index];
    }),
  );

  //computar a media de idade dos pompradore por produto
  const midAge = (minAge + maxAge) / 2;
  const ageSums: any = {};
  const ageCounts: any = {};

  users.forEach((user: User) => {
    user.purchases.forEach((p: Purchase) => {
      ageSums[p.name] = ageSums[p.name] || 0;
      ageCounts[p.name] = ageCounts[p.name] || 0;
    });
  });

  const productAvgAgeNorm: any = Object.fromEntries(
    catalog.map((product) => {
      const avg = ageCounts[product.name]
        ? ageSums[product.name] / ageCounts[product.name]
        : midAge;

      return [product.name, normalize(avg, minAge, maxAge)];
    }),
  );

  return {
    catalog,
    users,
    colorsIndex,
    categoriesIndex,
    minAge,
    maxAge,
    minPrice,
    maxPrice,
    numCategories: categories.length,
    numColors: colors.length,
    dimentions: 2 + categories.length + colors.length,
  };
}

async function trainModel({ users, products }: TrainingPayload) {
  ctx.users = users;
  ctx.catalog = products;
  ctx.weights = Object.fromEntries(
    products.map((product, index) => [
      String(product.id),
      Number((1 + index / 10).toFixed(2)),
    ]),
  );

  const context = makeContext(ctx.catalog, ctx.users);

  workerScope.postMessage({
    type: workerEvents.progressUpdate,
    progress: { progress: 10 },
  });

  workerScope.postMessage({
    type: workerEvents.tfVisData,
    data: {
      weights: ctx.weights,
      catalog: products,
      users,
    },
  });

  const epochs = [
    { epoch: 1, loss: 0.92, accuracy: 0.41, progress: 35 },
    { epoch: 2, loss: 0.56, accuracy: 0.68, progress: 65 },
    { epoch: 3, loss: 0.28, accuracy: 0.87, progress: 100 },
  ];

  for (const epochData of epochs) {
    await wait(350);

    workerScope.postMessage({
      type: workerEvents.progressUpdate,
      progress: { progress: epochData.progress },
    });

    workerScope.postMessage({
      type: workerEvents.trainingLog,
      epoch: epochData.epoch,
      loss: epochData.loss,
      accuracy: epochData.accuracy,
    });
  }

  workerScope.postMessage({
    type: workerEvents.trainingComplete,
  });
}

function recommend({ user }: RecommendPayload) {
  const purchasedIds = new Set(user.purchases.map((purchase) => purchase.id));
  const recommendations = ctx.catalog
    .filter((product) => !purchasedIds.has(product.id))
    .slice(0, 3);

  workerScope.postMessage({
    type: workerEvents.recommend,
    user,
    recommendations,
  });
}

const handlers: Record<string, (payload: any) => void | Promise<void>> = {
  [workerEvents.trainModel]: trainModel,
  [workerEvents.recommend]: recommend,
};

workerScope.onmessage = (
  event: MessageEvent<{ action: string } & Record<string, unknown>>,
) => {
  const { action, ...payload } = event.data;
  const handler = handlers[action];

  if (handler) {
    void handler(payload);
  }
};
