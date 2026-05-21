# FleetX - Guia de Engenharia e Operação (Master Documentation)

## 📌 Visão Geral e Propósito
O **FleetX** é um ecossistema de gestão automotiva de elite. Ele não é apenas um rastreador de despesas, mas um **Legado Técnico** para o veículo. Projetado para mecânicos e proprietários exigentes, o app transforma dados brutos em decisões inteligentes, preservando o valor de revenda e a segurança operacional.

---

## 🏗️ Arquitetura e Lógica Principal

### 🛡️ Filosofia LocalFirst
A privacidade é o pilar central. **Todos os dados de frota, fotos e históricos são armazenados exclusivamente no dispositivo do usuário (`localStorage`)**.
- **Vantagem**: Funciona sem internet, latência zero e privacidade total.
- **Integração Cloud**: O Firebase é usado estritamente para o que é global: **Autenticação, Gestão de Créditos IA e Status da Assinatura PRO**.

### 🧠 Inteligência Artificial (Gemini integration)
O FleetX utiliza modelos de linguagem grande (LLM) para processar conhecimento técnico complexo:
- **Leitura de Manuais**: Processa PDFs técnicos e extrai especificações de óleo, planos de revisão, tabelas de fusíveis e significados de luzes de painel.
- **Diagnóstico e Sugestão**: Baseado no histórico de manutenção, a IA sugere intervenções preditivas.
- **Segurança de Chaves**: Usuários FREE usam créditos da plataforma. Usuários PRO podem inserir sua própria **API Key**, garantindo autonomia infinita.

### 🌎 Adaptabilidade Internacional (Aba Regional)
O sistema é agnóstico em relação à localização:
- **Rótulo do Identificador**: Configurável para "Placa" (Brasil), "Matrícula" (Portugal/Espanha), "License Plate" (EUA), etc.
- **Placeholder de Máscara**: Define o formato visual (Ex: "AAA-0000" vs "ABC 1234").
- **Multi-Linguagem**: Tradução em tempo real para 9 idiomas (PT, EN, ES, FR, IT, DE, RU, ZH, KO).

---

## 📱 Módulos e Funcionalidades

### 1. Central de Veículos (Garagem)
- **Cadastro**: Coleta de marca, modelo, ano, motorização e quilometragem inicial.
- **Diferencial**: Interface visual inspirada em painéis de alta tecnologia (High Contrast).

### 2. Manutenção e Protocolo do Mecânico
- **Categorização**: Divisão por sistemas (Motor, Suspensão, Freios, Elétrica).
- **Provas Técnicas**: Anexo de fotos de notas fiscais e peças trocadas.
- **Auditoria**: O sistema gera um índice de confiança baseado na completude dos dados.

### 3. Inteligência de Consumo (Combustível)
- **Cálculo de Eficiência**: km/L ou L/100km automáticos.
- **Análise Financeira**: Histórico de preços e variação de custo por quilômetro rodado.

### 4. Catálogo de Peças Personalizado
- **Inventário**: Permite guardar referências e números de série de peças instaladas, facilitando reposições futuras.

### 5. Manual do Veículo IA
- **Organização**: Estrutura em "Acordeão" para fácil leitura.
- **Campos Específicos**: Cronogramas de revisão, Especificações de Fluidos, Fusíveis e Relés, Símbolos do Painel e Notas Técnicas.

---

## 🛠️ Ecossistema de Desenvolvimento (Roadmap Híbrido)

Agora que o projeto caminha para o desenvolvimento em **VS Code** e geração de **APK no Android Studio**:

1. **Hibridização (Capacitor/Cordova)**:
   - Utilizar o Capacitor para expor APIs nativas (Câmera, Sistema de Arquivos).
   - Otimizar o consumo de bateria durante o processamento de imagens.
2. **Persistence Upgrade (IndexedDB)**:
   - Migrar do `localStorage` (limite ~5MB) para `IndexedDB` (~Gigas) para suportar centenas de fotos de manutenção em alta definição.
3. **PWA & Instalação**:
   - Manter manifestos compatíveis para que o usuário possa usar como Web App enquanto a versão nativa é compilada.

---

## ⚠️ DIRETRIZES DE OURO PARA FUTUROS DESENVOLVEDORES
1. **Nunca quebre o LocalFirst**: A sincronização forçada com nuvem destruiría a confiança do usuário.
2. **Preserve a Estética FleetX**: Bordas `3xl`, fontes `JetBrains Mono`, ícones `Lucide` e tons sofisticados.
3. **Segurança de Créditos**: Toda interação de IA deve validar o saldo via `useFirebase`.
4. **Respeite o Manual**: O manual em `AppManual.tsx` deve ser a fonte da verdade para o usuário final.

---
*Documento atualizado em 21 de Maio de 2026 - FleetX Engineering Team.*

