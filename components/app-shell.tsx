"use client"

import * as React from "react"
import {
  BookMarkedIcon,
  FileTextIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  TagIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { DashboardView } from "@/components/dashboard-view"
import { BudgetsView } from "@/components/budgets-view"
import { ClientsView } from "@/components/clients-view"
import { ServicesView } from "@/components/services-view"
import { PartnersView } from "@/components/partners-view"
import { BalanceView } from "@/components/balance-view"
import { SettingsView } from "@/components/settings-view"
import { ProfileModal } from "@/components/profile-modal"

const MENU_ITENS = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { value: "orcamentos", label: "Orçamentos", icon: FileTextIcon },
  { value: "clientes", label: "Clientes & Instituições", icon: UsersIcon },
  { value: "servicos", label: "Serviços & Preços", icon: TagIcon },
  { value: "parceiros", label: "Parceiros Terceirizados", icon: HandshakeIcon },
  { value: "balanco", label: "Balanço & Repasses", icon: TrendingUpIcon },
]

export function AppShell() {
  const [abaAtiva, setAbaAtiva] = React.useState("dashboard")
  const [perfilAberto, setPerfilAberto] = React.useState(false)
  const [mobileMenuAberto, setMobileMenuAberto] = React.useState(false)

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Cabeçalho Mobile */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookMarkedIcon className="size-4" />
            </span>
            <span className="text-sm font-semibold">Gestão de Orçamentos</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuAberto(!mobileMenuAberto)}
          >
            {mobileMenuAberto ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>

        {/* Sidebar Lateral */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-200 ease-in-out
            md:static md:translate-x-0
            ${mobileMenuAberto ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Logo e Título */}
          <div className="flex flex-col gap-2 border-b px-5 py-4">
            <img
              src="/scriba-coter-logo.png"
              alt="Scriba Coter"
              className="h-9 w-auto self-start"
            />
            <span className="text-xs text-muted-foreground">
              Gestão de Orçamentos · Edição Científica
            </span>
          </div>

          {/* Cartão de Perfil */}
          <div className="p-3">
            <button
              onClick={() => setPerfilAberto(true)}
              className="flex w-full items-center gap-3 rounded-lg border bg-secondary/50 p-2.5 text-left transition-colors hover:bg-secondary"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  MP
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-xs font-medium">Márcia Maria Palhares</span>
                <span className="truncate text-[10px] text-muted-foreground">Editar perfil</span>
              </div>
              <UserIcon className="size-4 text-muted-foreground" />
            </button>
          </div>

          {/* Navegação Principal */}
          <nav className="flex-1 space-y-1 px-3 py-2">
            {MENU_ITENS.map((item) => {
              const Icon = item.icon
              const ativo = abaAtiva === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    setAbaAtiva(item.value)
                    setMobileMenuAberto(false)
                  }}
                  className={`
                    flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                    ${
                      ativo
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Rodapé da Sidebar: Configurações & Sair da Conta */}
          <div className="space-y-1 border-t p-3">
            <button
              onClick={() => {
                setAbaAtiva("configuracoes")
                setMobileMenuAberto(false)
              }}
              className={`
                flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${
                  abaAtiva === "configuracoes"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              `}
            >
              <SettingsIcon className="size-4" />
              Configurações
            </button>

            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={() => void supabase.auth.signOut()}
            >
              <LogOutIcon className="mr-2 size-4" />
              Sair da conta
            </Button>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">
            {abaAtiva === "dashboard" && <DashboardView onNavigate={(tab) => setAbaAtiva(tab)} />}
            {abaAtiva === "orcamentos" && <BudgetsView />}
            {abaAtiva === "clientes" && <ClientsView />}
            {abaAtiva === "servicos" && <ServicesView />}
            {abaAtiva === "parceiros" && <PartnersView />}
            {abaAtiva === "balanco" && <BalanceView />}
            {abaAtiva === "configuracoes" && <SettingsView />}
          </div>
        </main>

        <ProfileModal open={perfilAberto} onOpenChange={setPerfilAberto} />
      </div>
    </TooltipProvider>
  )
}
