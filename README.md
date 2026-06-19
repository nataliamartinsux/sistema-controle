# SysMerenda - Sistema de Controle de Acesso para Refeição Escolar - Front-end

## 📖 Visão Geral do Projeto e Contextualização do Problema

O front-end do **SysMerenda - Sistema de Controle de Acesso para Refeição Escolar** foi desenvolvido para ser a interface de alta performance, intuitiva e em tempo real que conecta os operadores da cantina, fiscais e gestores ao motor de regras de negócio do sistema.

Em ambientes escolares, o tempo disponível para a distribuição de refeições é escasso, tornando filas longas um grande problema operacional. Esta interface foi projetada especificamente para responder com velocidade extrema, utilizando estímulos visuais claros de alto contraste para que o operador da cantina consiga validar o fluxo de alunos sem fricção, mesmo estando distante da tela do computador.

## 🎯 Objetivos da Solução Desenvolvida

* **Experiência do Usuário (UX) Ágil:** Prover uma tela de operação diária com feedback visual instantâneo baseado em cores semânticas de alto contraste (verde para liberado e vermelho para bloqueado).


* **Controle de Acesso Baseado em Funções (RBAC):** Proteger caminhos e renderizar menus dinamicamente no ecossistema da aplicação de acordo com o papel do usuário autenticado.


* **Sincronização Bidirecional em Tempo Real:** Atualizar dados de consumo, contadores de refeições diárias e logs de últimas liberações instantaneamente através de conexões WebSocket estáveis.


* **Tratamento Resiliente de Erros:** Capturar falhas de comunicação com a API ou expiração de sessões (erros 401 e 403) e reagir de forma transparente para proteger a integridade do sistema.

## 🛠️ Tecnologias Utilizadas

A interface foi construída utilizando as ferramentas mais modernas do ecossistema JavaScript voltadas para performance e tipagem estática:

* **Framework Principal:** React com Vite para um ecossistema de compilação e Hot Module Replacement (HMR) extremamente rápido.
* **Linguagem:** TypeScript, garantindo segurança de tipos nas propriedades, estados e contratos com as entidades da API.
* **Estilização e UI:** Tailwind CSS para design responsivo, utilitários de alto contraste e consistência visual.
* **Gerenciamento de Rotas:** React Router Dom, configurado com componentes de proteção de rotas.
* **Comunicação HTTP:** Axios estruturado com interceptors globais para injeção de tokens e tratamento de status de erro.
* **Comunicação Real-Time:** WebSocket API nativa do navegador para escuta ativa dos eventos disparados pelo servidor ASGI do Django.
* **Notificações:** Biblioteca `sonner` para a exibição de avisos fluídos (Toasts).



## ⚙️ Instruções para Instalação, Configuração e Execução

### Pré-requisitos

* Node.js (versão 18 ou superior) instalado.
* Gerenciador de pacotes `npm` ou `yarn`.

### Passo a Passo

1. **Clonar o repositório e acessar a pasta do front-end:**

```bash
git clone https://github.com/lelevs1/Sistema-de-Controle-de-Acesso-para-Refei-o-Escolar.git
cd "Sistema-de-Controle-de-Acesso-para-Refei-o-Escolar/[Nome_da_sua_pasta_frontend]"

```

2. **Configurar as Variáveis de Ambiente:**
Crie um arquivo `.env.local` na raiz do projeto (mesmo nível do arquivo `package.json`) e insira o endereço do seu backend local ou de produção:

```text
VITE_API_URL=http://localhost:8000

```

*(Você pode consultar o arquivo `.env.example` para verificar os padrões de configuração do ambiente da equipe).*

3. **Instalar as dependências do projeto:**

```bash
npm install

```

4. **Executar o servidor de desenvolvimento:**

```bash
npm run dev

```

A aplicação abrirá localmente, geralmente no endereço `http://localhost:5173`.

## 🧠 Principais Decisões Técnicas Adotadas pela Equipe

* **Roteamento Protegido e Fluxo de Login Dinâmico:** Implementamos um componente `ProtectedRoute` que avalia os privilégios armazenados com segurança. Usuários comuns são impedidos de renderizar páginas restritas, e o redirecionamento pós-login é inteligente: operadores são enviados diretamente para a interface de operação `/cantina`, enquanto fiscais e gestores acessam o `/dashboard`.
* **Interceptação Automática de Sessões Expiradas:** O front-end monitora de perto todas as respostas da API através de interceptors do Axios. Caso o servidor retorne um erro indicando token inválido ou falta de permissão, a aplicação limpa os dados salvos localmente e redireciona o usuário imediatamente para a tela de autenticação, impedindo navegações fantasmas.
* **Atualização em Tempo Real via WebSockets:** Para os painéis administrativos e a página da cantina, configuramos listeners ativos que escutam transmissões contínuas. Isso elimina a necessidade de requisições repetitivas ao servidor (Polling) e atualiza a interface de múltiplos terminais de atendimento de forma síncrona.
* **Mecanismo de Fallback Manual Assistido:** Quando a leitura biométrica falha, a interface de busca permite ao operador localizar estudantes por nome ou matrícula de forma preditiva. O sistema renderiza componentes de tratamento de imagem com fallbacks automáticos para exibição da foto de perfil do aluno, garantindo a validação visual humana com segurança antes da confirmação da refeição.



## 👥 Integrantes da Equipe

* **[Natália Martins](https://github.com/nataliamartinsux)** - Desenvolvedora Full-Stack / Front-end / Back-end
* **[Letícia Vieira](https://github.com/lelevs1)** - Desenvolvedora Back-end
