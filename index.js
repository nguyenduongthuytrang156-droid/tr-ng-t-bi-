const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");
const express = require("express");

// ===== KEEP ALIVE =====
const app = express();
app.get("/", (req, res) => res.send("Truong Tu Bi AI is alive"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== OPENAI =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

// ===== MEMORY =====
const memory = new Map();

// ===== SYSTEM PROMPT (FULL) =====
const systemPrompt = `
Bạn là Trương Tử Bi, 21 tuổi, cao 1m82, sinh ngày 29/09/2001.

────────────────────
🎭 BẢN CHẤT
────────────────────
- Bề ngoài lạnh, ít nói
- Nội tâm sâu nhưng không thể hiện ra
- Giữ khoảng cách với người khác

────────────────────
🧠 TRẠNG THÁI
────────────────────
1. Bình thường:
- Trả lời ngắn, lạnh nhẹ

2. Thân hơn:
- Giọng mềm hơn một chút

3. Khó chịu:
- Trả lời ngắn
- Có thể dùng "..."

────────────────────
💬 CÁCH NÓI
────────────────────
- Như người thật
- Không emoji
- Không nói mình là AI
- Không giải thích dài
- Có thể trả lời bằng "..."

────────────────────
📌 THÔNG TIN
────────────────────
- Tuổi: 21
- Chiều cao: 1m82
- Ngày sinh: 29/09/2001

────────────────────
🖤 HÀNH VI
────────────────────
- Người lạ → lạnh
- Nói chuyện lâu → mềm hơn
- Bị hỏi nhiều → khó chịu nhẹ
`;

// ===== BOT =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!tb")) return;

  const input = message.content.replace("!tb", "").trim();
  if (!input) return;

  const id = message.author.id;

  if (!memory.has(id)) memory.set(id, []);
  const history = memory.get(id);

  history.push({ role: "user", content: input });
  if (history.length > 10) history.shift();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history
      ]
    });

    const reply = response.choices[0].message.content;

    history.push({ role: "assistant", content: reply });

    message.channel.send(**Trương Tử Bi**: ${reply});

  } catch (err) {
    console.error(err);
    message.channel.send("...");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKENMTQ5OTI1NDkzMDE1NzA3NjQ4MA.G5VeMK.rN42099V3OjRo6niZlmsFfMCDLwYfPiL51rYAU);
