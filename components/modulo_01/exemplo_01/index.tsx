"use client";

import React from "react";
import UserView from "./view/UserView";
import { useUsers } from "./context/UserContext";
import ModelTrainingView from "./view/ModelTrainingView";
import ProductListView from "./view/ProductListView";
import TFVisorView from "./view/TFVisorView";
import Exemplo01Layout from "./layout";

function Exemplo01Content() {
  const {
    users,
    selectedUserId,
    selectUser,
    removePurchase,
    isTraining,
    canRunRecommendation,
    trainModel,
    runRecommendation,
  } = useUsers();

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <div className="min-w-0 flex-1 ">
        <UserView
          users={users}
          selectedUserId={selectedUserId}
          onUserSelect={selectUser}
          onPurchaseRemove={removePurchase}
        />
      </div>
      <div className="min-w-0 flex-1 ">
        <ModelTrainingView
          users={users}
          isTraining={isTraining}
          canRunRecommendation={canRunRecommendation}
          onTrainModel={trainModel}
          onRunRecommendation={runRecommendation}
        />
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <Exemplo01Layout>
      <Exemplo01Content />
      <div className="min-w-0 flex-1 mt-4">
        <ProductListView />
      </div>
      <TFVisorView />
    </Exemplo01Layout>
  );
}
