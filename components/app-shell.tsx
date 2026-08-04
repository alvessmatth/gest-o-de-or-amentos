import { BookMarkedIcon } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BudgetsView } from "@/components/budgets-view"
import { ClientsView } from "@/components/clients-view"
import { ServicesView } from "@/components/services-view"
import { PartnersView } from "@/components/partners-view"
import { BalanceView } from "@/components/balance-view"

const ABAS = [
  { value: "orcamentos", label: "Orçamentos" },
  { value: "clientes", label: "Clientes & Instituições" },
  { value: "servicos", label: "Serviços & Tabela de Preços" },
  { value: "parceiros", label: "Parceiros (Terceirizados)" },
  { value: "balanco", label: "Balanço Mensal & Repasses" },
]

export function AppShell() {
  return (
    <TooltipProvider>
      <Tabs defaultValue="orcamentos" className="min-h-svh gap-0">
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pt-4 md:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookMarkedIcon className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  Gestão de Orçamentos
                </span>
                <span className="text-xs text-muted-foreground">
                  Edição científica &amp; tradução acadêmica
                </span>
              </div>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
              <TabsList variant="line" className="h-9 w-max gap-2 p-0">
                {ABAS.map((aba) => (
                  <TabsTrigger key={aba.value} value={aba.value} className="px-2">
                    {aba.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 md:px-6">
          <TabsContent value="orcamentos">
            <BudgetsView />
          </TabsContent>
          <TabsContent value="clientes">
            <ClientsView />
          </TabsContent>
          <TabsContent value="servicos">
            <ServicesView />
          </TabsContent>
          <TabsContent value="parceiros">
            <PartnersView />
          </TabsContent>
          <TabsContent value="balanco">
            <BalanceView />
          </TabsContent>
        </main>
      </Tabs>
    </TooltipProvider>
  )
}
