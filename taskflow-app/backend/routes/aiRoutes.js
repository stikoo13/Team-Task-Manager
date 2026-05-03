const express = require('express');
const router  = express.Router();
const Groq    = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/generate-tasks', async (req, res) => {
  const { name, description, members = [] } = req.body;
  if (!name || !description)
    return res.status(400).json({ message: 'Name and description are required.' });

  const memberList = members.length > 0
    ? members.map((m, i) => `${i+1}. ${m.name} (${m.role})`).join('\n')
    : null;

  const prompt = memberList
    ? `You are a professional project manager. Generate 6-9 realistic actionable project tasks and assign each to the most suitable team member based on their role. Return ONLY a valid JSON array, no explanation, no markdown.

Project: ${name}
Description: ${description}

Team Members:
${memberList}

Return format:
[{"task":"Task title","assignee":"Member Name"}]`
    : `You are a professional project manager. Generate 6-9 realistic actionable project tasks. Return ONLY a numbered list, no explanation, no markdown.

Project: ${name}
Description: ${description}

Format:
1. Task one
2. Task two`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content || '';

    if (memberList) {
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      const tasks = parsed.map(item => ({
        text: item.task,
        assignee: item.assignee,
        assigneeId: members.find(m => m.name === item.assignee)?.id || null,
      }));
      return res.json({ tasks });
    }

    const tasks = raw.split('\n')
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(l => l.length > 0)
      .map(text => ({ text, assignee: null, assigneeId: null }));

    res.json({ tasks });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: 'AI generation failed.' });
  }
});

module.exports = router;