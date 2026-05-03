const express = require('express');
const router  = express.Router();
const Groq    = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/generate-tasks', async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description)
    return res.status(400).json({ message: 'Name and description are required.' });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{
        role: 'user',
        content: `You are a professional project manager. Generate 6-9 realistic, actionable project tasks for the following project. Return ONLY a numbered list. No headers, no explanation, no markdown.

Project: ${name}
Description: ${description}

Format:
1. Task one
2. Task two`
      }],
      temperature: 0.6,
      max_tokens: 512,
    });

    const raw   = completion.choices[0]?.message?.content || '';
    const tasks = raw.split('\n')
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(l => l.length > 0);

    res.json({ tasks });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: 'AI generation failed.' });
  }
});

module.exports = router;