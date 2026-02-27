"use client";
import type { ToolUIPart } from "ai";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

import {
  ExampleComponent,
  isModulo,
  moduloRegistry,
} from "@/components/modulo-registro";
import { ModeToggle } from "@/components/theme-mode";

export default function Page() {
  const pathName = usePathname();
  const [_, modulo, exemple] = pathName.split("/");

  if (!isModulo(modulo)) {
    return <div>Módulo inválido</div>;
  }

  const moduloData = moduloRegistry[modulo];

  if (!(exemple in moduloData)) {
    return <div>Exemplo inválido</div>;
  }

  const ModuloExemploComponent = moduloData[exemple as keyof typeof moduloData];

  return (
    <div className="max-h-[calc(100vh-5rem)] ">
      <header className="flex h-16 shrink-0 items-center gap-2  justify-between">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/modulo_01/exemplo_00">
                  {modulo.replace("_", " ").toUpperCase()}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {exemple.replace("_", " ").toUpperCase()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <ModeToggle />
      </header>
      <div className=" ">
        <ModuloExemploComponent />
      </div>
    </div>
  );
}
