# Roleta Master (Roda da Fortuna) 🎡

Uma aplicação moderna, altamente customizável e robusta de Roda da Fortuna construída com React, TypeScript e Zustand. 
Esta aplicação oferece mecanismos avançados de balanceamento e "jogo justo", efeitos sonoros, animações e opções detalhadas de configuração, tornando-a ideal para sorteios, rifas, seleções de equipes e muito mais.

## 🚀 Funcionalidades

### Balanceamento Avançado e Jogo Justo ⚖️
- **Acumulação por tempo (Pity System):** Aumenta automaticamente o peso/chance de vitória dos participantes que não foram sorteados nas rodadas anteriores.
- **Divisão por vitórias (Balanceamento):** Reduz dinamicamente a probabilidade de participantes ganharem repetidamente, dividindo seu peso com base no número de vitórias anteriores.
- **Motor Anti-Repetição:** Evita que o mesmo item seja sorteado seguidamente dentro de um número configurável de rodadas.
- **Indicador Visual de Pesos:** Opção para exibir visualmente na roleta como os pesos dinâmicos (acumulação e divisão) afetam as fatias em tempo real.

### Múltiplos Modos de Roleta 🎡
- **Roleta Clássica:** O layout tradicional da roda giratória.
- **Modo Horizonte:** Um seletor de rolagem horizontal, semelhante a máquinas caça-níqueis de cassino.
- **Modo Caixa Misteriosa:** Uma exibição de suspense que revela o vencedor após uma animação de abertura.

### Modos de Jogo 🎮
- **Modo Padrão:** Sorteio aleatório clássico.
- **Modo Eliminação (Mata-mata):** Elimina automaticamente vencedores ou participantes específicos rodada por rodada até restar apenas um Grande Vencedor. Conta com opções de continuação automática e sons dramáticos.
- **Auto-Remover Vencedor:** Remove automaticamente os itens sorteados da roleta para as próximas rodadas.

### Áudio e Visuais Imersivos ✨
- Efeitos sonoros personalizados para os "ticks" do giro e para o anúncio dos vencedores.
- Adicione seus próprios áudios (suporta a importação de arquivos customizados).
- Animações de explosão de confetes ao anunciar um ganhador.
- Temas de interface, fontes e cores altamente personalizáveis.
- Controles precisos sobre o tempo de rotação e animações.

### Gerenciamento de Dados 💾
- **Persistência Local (Local Storage):** Todas as configurações, participantes e histórico de resultados são salvos automaticamente no IndexedDB / LocalStorage do navegador.
- Histórico completo de resultados com data e hora.

## 🛠️ Tecnologias Utilizadas

- **Framework:** React 19 + TypeScript
- **Estilização:** Tailwind CSS (v4)
- **Gerenciamento de Estado:** Zustand
- **Animações:** Motion (Framer Motion)
- **Banco de Dados Local:** `idb-keyval` (IndexedDB para armazenamento seguro)
- **Ícones:** Lucide React
- **Ferramenta de Build:** Vite

## 📦 Instalação e Configuração

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd <diretorio-do-projeto>
   ```

2. **Instale as dependências:**
   Certifique-se de ter o Node.js instalado.
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará acessível em `http://localhost:3000`.

4. **Build para produção:**
   ```bash
   npm run build
   ```
   Os arquivos de produção serão gerados na pasta `dist`.

## ⚙️ Destaques da Arquitetura

### Hook `useWheelData`
Calcula os pesos dinâmicos, limites de ângulo e caminhos SVG para as fatias da roleta. Ele leva em consideração os pesos básicos, o sistema de acumulação (pity system) e a lógica de redução por vitórias para computar a exibição final e a mecânica de probabilidade.

### Hook `useWheelActions`
Gerencia a mecânica central do giro, a geração de números aleatórios utilizando a API de Criptografia (`crypto.getRandomValues`) para garantir imprevisibilidade e aplica a lógica dos modos de eliminação e anti-repetição.

### `useAppStore` (Zustand)
Um estado centralizado que gerencia:
- Configurações da aplicação e temas visuais.
- Listas de participantes (Itens).
- Histórico de resultados.
- Configurações de som e volume.
- Métricas avançadas da roleta (rotação, timeouts).

## 🤝 Como Contribuir

Contribuições são bem-vindas! Sinta-se à vontade para abrir "issues", enviar "pull requests" ou sugerir novos recursos para melhorar a mecânica do sistema e interface.

## 📝 Licença

Este projeto é de código aberto e está disponível sob a Licença MIT.
