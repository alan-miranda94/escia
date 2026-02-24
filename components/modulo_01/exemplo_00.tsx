import React, { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolUIPart } from "ai";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { CodeBlock, CodeBlockCopyButton } from "../ai-elements/code-block";

interface Pessoa {
  nome: string;
  idade: number;
  cor: string;
  localizacao: string;
}

export default function exemplo_00() {
  const [state, setState] = useState<ToolUIPart["state"]>("output-available");
  const [output, setOutput] = useState("");
  const [currentTab, setCurrentTab] = useState("code");
  const [pessoa, setPessoa] = useState<Pessoa>({
    nome: "Erick",
    idade: 30,
    cor: "azul",
    localizacao: "São Paulo",
  });
  const [modelTrained, setModelTrained] = useState("");
  const [isPeding, startTransition] = useTransition();
  const [pessoas, setPessoas] = useState<Pessoa[]>([
    { nome: "Erick", idade: 30, cor: "azul", localizacao: "São Paulo" },
    { nome: "Ana", idade: 25, cor: "vermelho", localizacao: "Rio" },
    { nome: "Carlos", idade: 40, cor: "verde", localizacao: "Curitiba" },
  ]);

  const handleAdicionarPessoa = useCallback(() => {
    setPessoas((prev) => {
      const proximoIndice = prev.length + 1;
      return [
        ...prev,
        {
          nome: `Pessoa ${proximoIndice}`,
          idade: 20 + proximoIndice,
          cor: "azul",
          localizacao: "São Paulo",
        },
      ];
    });
  }, []);

  const handlePessoaChange = useCallback(
    (field: keyof Pessoa, value: string | number) => {
      setPessoa((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const trainModel = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/modulo_01/exemplo_00/train_model", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pessoas,
          }),
        });

        if (!res.ok) {
          throw new Error("Erro na requisição");
        }

        const data = await res.json(); // 👈 aqui estava faltando isso
        setState("output-available");
        setModelTrained(data);
        setOutput("Modelo treinado com Sucesso!");
      } catch (error) {
        setState("output-error");
        setOutput(`${error}`);
      }
    });
  };

  const predic = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/modulo_01/exemplo_00/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pessoa,
            model: modelTrained,
          }),
        });

        if (!res.ok) {
          throw new Error("Erro na requisição");
        }

        const data = await res.json(); // 👈 aqui estava faltando isso
        setState("output-available");
        setOutput(`${data}`);
        setCurrentTab("output");
      } catch (error) {
        setState("output-error");
        setOutput(`${error}`);
      }
    });
  };

  return (
    <div className="rounded-md border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pessoas para treino</h2>
        <div className="space-x-2">
          {/* <Button onClick={handleAdicionarPessoa}>Adicionar pessoa</Button> */}
          <Button
            className={cn("bg-yellow-600", modelTrained && "bg-green-700")}
            onClick={trainModel}
            disabled={isPeding}
          >
            {isPeding && <Spinner data-icon="inline-start" />}
            Treinar Modelo
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-2">Nome</th>
              <th className="px-2 py-2">Idade</th>
              <th className="px-2 py-2">Cor</th>
              <th className="px-2 py-2">Localização</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map((pessoa) => (
              <tr key={pessoa.nome} className="border-b">
                <td className="px-2 py-2">{pessoa.nome}</td>
                <td className="px-2 py-2">{pessoa.idade}</td>
                <td className="px-2 py-2">{pessoa.cor}</td>
                <td className="px-2 py-2">{pessoa.localizacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-md border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Pessoa para classificação</h3>
          <Button onClick={predic} disabled={isPeding || !modelTrained}>
            {/* {isPeding && <Spinner data-icon="inline-start" />} */}
            Classificar pessoa
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={pessoa.nome}
              onChange={(e) => handlePessoaChange("nome", e.target.value)}
              placeholder="Nome"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Idade</label>
            <Input
              type="number"
              min={0}
              value={pessoa.idade}
              onChange={(e) =>
                handlePessoaChange("idade", Number(e.target.value))
              }
              placeholder="Idade"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Cor</label>
            <Select
              value={pessoa.cor}
              onValueChange={(value) => handlePessoaChange("cor", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="azul">azul</SelectItem>
                <SelectItem value="vermelho">vermelho</SelectItem>
                <SelectItem value="verde">verde</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Localização</label>
            <Select
              value={pessoa.localizacao}
              onValueChange={(value) =>
                handlePessoaChange("localizacao", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a localiza\u00E7\u00E3o" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S\u00E3o Paulo">São Paulo</SelectItem>
                <SelectItem value="Rio">Rio</SelectItem>
                <SelectItem value="Curitiba">Curitiba</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CodeBlock className="border mt-4" code={output} language="log">
          <CodeBlockCopyButton
            className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            size="sm"
          />
        </CodeBlock>
      </div>
    </div>
  );
}
