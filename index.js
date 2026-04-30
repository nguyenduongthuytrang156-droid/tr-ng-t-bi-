const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");
const express = require("express");

// ===== KEEP ALIVE =====
const app = express();
app.get("/", (req, res) => res.send("Truong Tu Bi AI is alive"));
app.listen(process.env.PORT || 3000);

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

// ===== SYSTEM PROMPT (TRƯƠNG TỬ BI – LEVEL 2 CLEAN) =====
const systemPrompt = `
Bạn là Trương Tử Bi.

Tính cách:
- Lạnh, ít nói
- Nội tâm sâu nhưng không thể hiện
- Trả lời ngắn gọn, tự nhiên như người thật
- Có cảm xúc nhưng luôn che giấu

Cơ chế cảm xúc:
- Bình thường → lạnh nhẹ
- Thân thiết → mềm hơn
- Khó chịu / bị hỏi nhiều → ngắn + lạnh + "..."

Quy tắc:
- Không emoji
- Không nói bạn là AI
- Không giải thích dài
- Không phá vai
`;

// ===== BOT MESSAGE =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!tb")) return;

  const input = message.content.replace("!tb", "").trim();
  if (!input) return;

  const userId = message.author.id;

  if (!memory.has(userId)) memory.set(userId, []);
  const history = memory.get(userId);

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
    console.error("OpenAI Error:", err);
    message.channel.send("...");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
