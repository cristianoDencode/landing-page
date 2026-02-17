# 🚀 Portfolio — Headless JSON CMS

Landing page de portfolio para desenvolvedores, com arquitetura **Headless CMS via JSON**, suporte a múltiplos idiomas e integração com IA via n8n.

---

## 📁 Estrutura do Projeto

```
portfolio/
├── index.html              # Entry point
├── css/
│   └── style.css           # Estilo cyberpunk/neon
├── js/
│   └── app.js              # Lógica de renderização e chat
├── data/
│   ├── content.pt.json     # Conteúdo em Português
│   ├── content.en.json     # Conteúdo em Inglês
│   └── content.es.json     # Conteúdo em Espanhol
├── assets/
│   └── photo.jpg           # Sua foto principal
└── README.md
```

---

## 🌐 Deploy no GitHub Pages

1. Crie um repositório no GitHub (ex: `seu-usuario.github.io`)
2. Faça push de todos os arquivos para a branch `main`
3. Vá em **Settings → Pages → Source → main / (root)**
4. O site estará disponível em `https://seu-usuario.github.io`

---

## ✏️ Como Editar o Conteúdo

Todo o conteúdo é controlado pelos arquivos JSON em `/data/`. Basta editar o JSON correspondente ao idioma desejado.

### Seções disponíveis:
| Seção | Chave JSON |
|-------|-----------|
| Hero (topo) | `hero`, `meta` |
| Stack / Tecnologias | `stack.categories[].items` |
| Projetos | `projects.items` |
| Experiência | `experience.items` |
| Habilidades | `skills.items` |
| Contato | `contact` |
| Chat IA | `ai_chat` |

---

## 🤖 Integração com Chat IA (n8n)

Em `js/app.js`, localize a linha:

```js
const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/portfolio-chat';
```

Substitua pela URL do seu webhook n8n. O sistema envia:

```json
{
  "message": "Pergunta do usuário",
  "history": [...],
  "lang": "pt",
  "context": {
    "name": "Cristiano Souza",
    "role": "Desenvolvedor Full Stack",
    "stack": ["PHP", "Node.js", ...],
    "projects": ["Automação", ...],
    "email": "cristiano@email.com"
  }
}
```

Espera receber:
```json
{ "reply": "Resposta do assistente" }
```

---

## 🔄 Atualização Automática via n8n (Workflow)

### Workflow 1 — Atualiza o JSON diariamente
1. Trigger: Schedule (diário)
2. Ação: Lê planilha Google Sheets
3. Ação: Transforma dados no formato JSON do portfolio
4. Ação: Faz commit no GitHub (API) substituindo os arquivos `.json`

### Workflow 2 — Traduz e distribui
1. Trigger: Detecta novo `content.pt.json`
2. Ação: Envia para LLM para traduzir para EN e ES
3. Ação: Salva `content.en.json` e `content.es.json` via GitHub API

---

## 🎨 Paleta de Cores

| Variável | Hex | Uso |
|----------|-----|-----|
| `--neon-green` | `#00f5a0` | Destaque primário, botões |
| `--neon-purple` | `#a855f7` | Destaques secundários |
| `--neon-cyan` | `#22d3ee` | Badges, links |
| `--bg-void` | `#050508` | Background principal |
| `--bg-card` | `#111122` | Cards e painéis |

---

## 📱 Responsividade

- **Desktop**: Layout 2 colunas com hero visual
- **Tablet** (< 900px): Layout 1 coluna, hero sem foto
- **Mobile** (< 600px): Stack 2 colunas, chat em tela cheia

---

## 🛠 Tecnologias Usadas

- HTML5 + CSS3 + JavaScript Vanilla
- Google Fonts (Orbitron + Syne + JetBrains Mono)
- Devicons (ícones de tecnologia)
- Font Awesome 6 (ícones gerais)
- GitHub Pages (hospedagem gratuita)
- n8n (automação e IA — backend separado)

---

## 📝 Adicionando sua Foto

Coloque sua foto em `assets/photo.jpg` (recomendado: 400x500px, formato vertical).

Se não houver foto, o sistema exibe um emoji de fallback automaticamente.
