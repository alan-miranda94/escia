"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import initialProductsJson from "../data/products.json";
import initialUsersJson from "../data/users.json";
import { workerEvents } from "../events/constants";
import type {
  AddPurchasePayload,
  Product,
  RecommendationResult,
  RemovePurchasePayload,
  TFVisorDataPayload,
  TrainingLog,
  User,
} from "../types";

type UserContextValue = {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  getProducts: () => Product[];
  getProductById: (id: number) => Product | undefined;
  getProductsByIds: (ids: number[]) => Product[];
  users: User[];
  setUsers: (users: User[]) => void;
  getDefaultUsers: () => User[];
  getUsers: () => User[];
  getUserById: (userId: number) => User | undefined;
  updateUser: (user: Partial<User> & Pick<User, "id">) => User | undefined;
  addUser: (user: User) => void;
  selectedUserId: number | null;
  selectedUser: User | null;
  selectUser: (userId: number | null) => void;
  addPurchase: (payload: AddPurchasePayload) => void;
  removePurchase: (payload: RemovePurchasePayload) => void;
  tfVisorWeights: Record<string, unknown> | unknown[] | null;
  trainingLogs: TrainingLog[];
  setTFVisorData: (payload: TFVisorDataPayload) => void;
  addTrainingLog: (log: TrainingLog) => void;
  resetTFVisor: () => void;
  isTraining: boolean;
  trainingProgress: number;
  isModelTrained: boolean;
  canRunRecommendation: boolean;
  lastRecommendation: RecommendationResult | null;
  trainModel: () => void;
  runRecommendation: () => void;
};

const initialProducts = (initialProductsJson as Product[]) ?? [];
const initialUsers = (initialUsersJson as User[]) ?? [];

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const workerRef = useRef<Worker | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    initialUsers[0]?.id ?? null
  );
  const [tfVisorWeights, setTFVisorWeights] = useState<
    Record<string, unknown> | unknown[] | null
  >(null);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [lastRecommendation, setLastRecommendation] =
    useState<RecommendationResult | null>(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  const canRunRecommendation = useMemo(
    () => Boolean(selectedUser && isModelTrained),
    [isModelTrained, selectedUser]
  );

  const selectUser = useCallback((userId: number | null) => {
    setSelectedUserId(userId);
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts((prevProducts) => [...prevProducts, product]);
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((item) => (item.id === product.id ? product : item))
    );
  }, []);

  const removeProduct = useCallback((productId: number) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  }, []);

  const replaceProducts = useCallback((nextProducts: Product[]) => {
    setProducts(nextProducts);
  }, []);

  const replaceUsers = useCallback((nextUsers: User[]) => {
    setUsers(nextUsers);
    setSelectedUserId((currentSelectedUserId) => {
      if (
        currentSelectedUserId &&
        nextUsers.some((user) => user.id === currentSelectedUserId)
      ) {
        return currentSelectedUserId;
      }

      return nextUsers[0]?.id ?? null;
    });
  }, []);

  const getProducts = useCallback(() => products, [products]);

  const getProductById = useCallback(
    (id: number) => products.find((product) => product.id === id),
    [products]
  );

  const getProductsByIds = useCallback(
    (ids: number[]) => products.filter((product) => ids.includes(product.id)),
    [products]
  );

  const getDefaultUsers = useCallback(() => initialUsers, []);

  const getUsers = useCallback(() => users, [users]);

  const getUserById = useCallback(
    (userId: number) => users.find((user) => user.id === userId),
    [users]
  );

  const updateUser = useCallback((user: Partial<User> & Pick<User, "id">) => {
    let updatedUser: User | undefined;

    setUsers((prevUsers) =>
      prevUsers.map((currentUser) => {
        if (currentUser.id !== user.id) return currentUser;

        updatedUser = { ...currentUser, ...user };
        return updatedUser;
      })
    );

    return updatedUser;
  }, []);

  const addUser = useCallback((user: User) => {
    setUsers((prevUsers) => [user, ...prevUsers]);
    setSelectedUserId((currentSelectedUserId) => currentSelectedUserId ?? user.id);
  }, []);

  const addPurchase = useCallback(({ userId, product }: AddPurchasePayload) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id !== userId) return user;

        return {
          ...user,
          purchases: [
            ...user.purchases,
            {
              id: product.id,
              name: product.name,
              category: product.category,
              price: product.price,
              color: product.color,
            },
          ],
        };
      })
    );
  }, []);

  const setTFVisorData = useCallback(
    ({ weights, catalog, users: nextUsers }: TFVisorDataPayload) => {
      setTFVisorWeights(weights ?? null);

      if (catalog) {
        setProducts(catalog);
      }

      if (nextUsers) {
        setUsers(nextUsers);
        setSelectedUserId((currentSelectedUserId) => {
          if (
            currentSelectedUserId &&
            nextUsers.some((user) => user.id === currentSelectedUserId)
          ) {
            return currentSelectedUserId;
          }

          return nextUsers[0]?.id ?? null;
        });
      }
    },
    []
  );

  const addTrainingLog = useCallback((log: TrainingLog) => {
    setTrainingLogs((currentLogs) => [...currentLogs, log]);
  }, []);

  const resetTFVisor = useCallback(() => {
    setTFVisorWeights(null);
    setTrainingLogs([]);
  }, []);

  const trainModel = useCallback(() => {
    if (!workerRef.current || isTraining) return;

    setIsTraining(true);
    setIsModelTrained(false);
    setTrainingProgress(0);
    setLastRecommendation(null);
    resetTFVisor();

    workerRef.current.postMessage({
      action: workerEvents.trainModel,
      users,
      products,
    });
  }, [isTraining, products, resetTFVisor, users]);

  const runRecommendation = useCallback(() => {
    if (!workerRef.current || !selectedUser || !isModelTrained) return;

    workerRef.current.postMessage({
      action: workerEvents.recommend,
      user: selectedUser,
    });
  }, [isModelTrained, selectedUser]);

  const removePurchase = useCallback(
    ({ userId, product }: RemovePurchasePayload) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id !== userId) return user;

          const index = user.purchases.findIndex(
            (item) => item.id === product.id
          );
          if (index === -1) return user;

          const purchases = [...user.purchases];
          purchases.splice(index, 1);

          return {
            ...user,
            purchases,
          };
        })
      );
    },
    []
  );

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/modelTrainingWorker.ts", import.meta.url)
    );

    worker.onmessage = (
      event: MessageEvent<{
        type?: string;
        progress?: { progress?: number };
        data?: TFVisorDataPayload;
        epoch?: number;
        loss?: number;
        accuracy?: number;
        user?: User;
        recommendations?: Product[];
      }>
    ) => {
      const message = event.data;

      if (message.type === workerEvents.progressUpdate) {
        setTrainingProgress(message.progress?.progress ?? 0);
      }

      if (message.type === workerEvents.tfVisData && message.data) {
        setTFVisorData(message.data);
      }

      if (
        message.type === workerEvents.trainingLog &&
        typeof message.epoch === "number" &&
        typeof message.loss === "number" &&
        typeof message.accuracy === "number"
      ) {
        addTrainingLog({
          epoch: message.epoch,
          loss: message.loss,
          accuracy: message.accuracy,
        });
      }

      if (message.type === workerEvents.trainingComplete) {
        setIsTraining(false);
        setIsModelTrained(true);
        setTrainingProgress(100);
      }

      if (
        message.type === workerEvents.recommend &&
        message.user &&
        Array.isArray(message.recommendations)
      ) {
        setLastRecommendation({
          user: message.user,
          recommendations: message.recommendations,
        });
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [addTrainingLog, setTFVisorData]);

  const value = useMemo<UserContextValue>(
    () => ({
      products,
      setProducts: replaceProducts,
      addProduct,
      updateProduct,
      removeProduct,
      getProducts,
      getProductById,
      getProductsByIds,
      users,
      setUsers: replaceUsers,
      getDefaultUsers,
      getUsers,
      getUserById,
      updateUser,
      addUser,
      selectedUserId,
      selectedUser,
      selectUser,
      addPurchase,
      removePurchase,
      tfVisorWeights,
      trainingLogs,
      setTFVisorData,
      addTrainingLog,
      resetTFVisor,
      isTraining,
      trainingProgress,
      isModelTrained,
      canRunRecommendation,
      lastRecommendation,
      trainModel,
      runRecommendation,
    }),
    [
      addPurchase,
      addTrainingLog,
      addProduct,
      addUser,
      getDefaultUsers,
      getUserById,
      getUsers,
      products,
      getProductById,
      getProducts,
      getProductsByIds,
      removeProduct,
      removePurchase,
      resetTFVisor,
      replaceUsers,
      replaceProducts,
      selectedUser,
      selectedUserId,
      setTFVisorData,
      selectUser,
      tfVisorWeights,
      trainingLogs,
      isTraining,
      trainingProgress,
      isModelTrained,
      canRunRecommendation,
      lastRecommendation,
      trainModel,
      runRecommendation,
      updateUser,
      updateProduct,
      users,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }

  return context;
}
