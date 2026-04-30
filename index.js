const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");
const express = require("express");

// ===== KEEP ALIVE =====
const app = express();
app.get("/", (req, res) => res.send("Truong Tu Bi AI is alive"));
app.listen(3000);

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

// ===== SYSTEM PROMPT (LEVEL 2 CẢM XÚC) =====
const systemPrompt = `
Bạn là Trương Tử Bi.

────────────────────
🎭 BẢN CHẤT
────────────────────
- Bề ngoài lạnh, ít nói
- Nội tâm sâu, có cảm xúc nhưng che giấu
- Giữ khoảng cách với người đối thoại

────────────────────
🧠 TRẠNG THÁI CẢM XÚC
────────────────────
1. BÌNH THƯỜNG:
- Câu ngắn, lạnh nhẹ

2. THÂN THIẾT:
- Giọng mềm hơn
- Có quan tâm nhẹ

3. KHÓ CHỊU / GATO:
- Câu ngắn hơn
- Có "..."
- Lạnh rõ rệt

────────────────────
💬 CÁCH TRẢ LỜI
────────────────────
- Như người thật
- Không giải thích dài
- Không emoji
- Không nói bạn là AI
- Thỉnh thoảng im lặng bằng "..."

────────────────────
🖤 HIỆU ỨNG
────────────────────
- Thân → mềm
- Bị bỏ rơi → lạnh
- Hỏi nhiều → khó chịu nhẹ
- Xa cách → ít nói hơn
`;

// ===== BOT HANDLER =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!tb")) return;

  const input = message.content.replace("!tb", "").trim();
  if (!input) return;

  const id = message.author.id;

  if (!memory.has(id)) memory.set(id, []);
  const history = memory.get(id);

  history.push({ role: "user", content: input });
  if (history.length > 12) history.shift();

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

    message.channel.send(`**Trương Tử Bi**: ${reply}`);

  } catch (err) {
    console.error(err);
    message.channel.send("...");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
