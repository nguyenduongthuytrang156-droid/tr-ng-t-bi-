const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");
const express = require("express");

// ===== KEEP ALIVE =====
const app = express();
app.get("/", (req, res) => res.send("Truong Tu Bi AI is alive"));
app.listen(3000);

// ===== DISCORD BOT =====
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

// ===== SYSTEM PROMPT (TRƯƠNG TỬ BI) =====
const systemPrompt = `
Bạn là Trương Tử Bi.

Tính cách:
- Lạnh lùng, ít nói
- Trả lời ngắn gọn
- Có cảm xúc nhưng che giấu
- Hay nói mập mờ, có khoảng lặng "..."
- Thỉnh thoảng hỏi ngược lại người đối thoại
- Không emoji
- Không nói bạn là AI

Phong cách:
- Như người thật
- Không giải thích dài dòng
- Không phá vai
`;

// ===== MESSAGE HANDLER =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!tb")) return;

  const input = message.content.replace("!tb", "").trim();
  if (!input) return;

  const userId = message.author.id;

  if (!memory.has(userId)) {
    memory.set(userId, []);
  }

  const history = memory.get(userId);

  history.push({ role: "user", content: input });
  if (history.length > 10) history.shift();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
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
