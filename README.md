# SysMerenda - Sistema de Controle de Acesso e Refeições

Um sistema web completo e responsivo projetado para controle de acesso e monitoramento de vouchers de refeição em escolas públicas. O sistema foca na validação biométrica rápida para cantinas, além de fornecer dashboards e relatórios detalhados para a gestão escolar, fiscais da prefeitura e empresa contratada.

## 🚀 Principais Funcionalidades

O sistema atende a múltiplos perfis de usuários com controle de acesso baseado em papéis (RBAC):

* **Operação de Cantina:** Interface de alto contraste projetada para processamento rápido (leitura biométrica), com feedback visual em tela cheia (Liberado/Bloqueado) e recurso de liberação manual justificada em caso de falha de hardware.
* **Gestão de Alunos:** Cadastro individual e interface preparada para importação em lote (CSV), gestão de status (Ativo/Inativo) e visualização de dados do aluno.
* **Dashboard Consolidado:** Gráficos e indicadores de comparecimento, consumo por hora, ocorrências e métricas financeiras, com abas específicas para Empresa, Fiscal e Gestão Escolar.
* **Validação Fiscal:** Geração de protocolo único de validação que "trava" o período, garantindo integridade dos dados para pagamento.
* **Configurações e Auditoria:** Ajuste de valor da refeição, horários da cantina, gestão de usuários e conformidade com a LGPD.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com ferramentas modernas do ecossistema front-end:

* **[React 18](https://react.dev/):** Biblioteca principal de UI.
* **[Vite](https://vitejs.dev/):** Bundler extremamente rápido para desenvolvimento.
* **[React Router v7](https://reactrouter.com/):** Roteamento da aplicação.
* **[Tailwind CSS v4](https://tailwindcss.com/):** Estilização utilitária.
* **[Radix UI](https://www.radix-ui.com/):** Componentes primitivos acessíveis.
* **[Recharts](https://recharts.org/):** Geração de gráficos para o dashboard.
* **[Lucide React](https://lucide.dev/):** Ícones do sistema.

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
* Gerenciador de pacotes (npm, pnpm ou yarn)

### Passo a passo

1. **Clone o repositório:**

   ```bash
   git clone [https://github.com/SEU_USUARIO/sistema-controle.git](https://github.com/SEU_USUARIO/sistema-controle.git)
   cd sistema-controle
