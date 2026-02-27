"use client";

import React from "react";
import { UserProvider } from "./context/UserContext";

type Exemplo01LayoutProps = {
  children: React.ReactNode;
};

export default function Exemplo01Layout({ children }: Exemplo01LayoutProps) {
  return <UserProvider>{children}</UserProvider>;
}
