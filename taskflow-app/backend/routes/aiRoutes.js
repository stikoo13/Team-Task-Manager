const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');

// POST /api/ai/generate-tasks
// Generates tasks for a given project name+description using Claude/OpenAI
router.post('/generate-tasks', protect, async (req, res) => {
  // Prevent duplicate rapid calls — simple flag per request is enough since
  // frontend now disables the button while loading
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'Project name and description are required' });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback: return sample tasks so app still works without AI key
      const fallbackTasks = [
        `Define requirements for ${name}`,
        `Create project timeline and milestones`,
        `Design system architecture`,
        `Set up development environment`,
        `Implement core features`,
        `Write unit and integration tests`,
        `Conduct user acceptance testing`,
        `Deploy to production`,
        `Document the project`,
        `Post-launch review and monitoring`,
      ];
      return res.json({ tasks: fallbackTasks });
    }

    // ── OpenAI path ──────────────────────────────────────────
    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a project management assistant. 
                      Given a project name and description, generate 8-12 specific, 
                      actionable task titles. Return ONLY a JSON array of strings. 
                      No explanations, no markdown, no extra text. 
                      Example: ["Task 1","Task 2","Task 3"]`
          },
          {
            role: 'user',
            content: `Project: ${name}\nDescription: ${description}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const raw = completion.choices[0].message.content.trim();
      let tasks;
      try {
        tasks = JSON.parse(raw);
        if (!Array.isArray(tasks)) throw new Error('Not array');
      } catch {
        // Try to extract JSON array from response if wrapped in text
        const match = raw.match(/\[[\s\S]*\]/);
        tasks = match ? JSON.parse(match[0]) : [`Complete ${name} project`];
      }

      return res.json({ tasks: tasks.filter(t => typeof t === 'string' && t.trim()) });
    }

    // ── Anthropic path ───────────────────────────────────────
    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

      const message = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Generate 8-12 specific actionable task titles for this project.
                      Return ONLY a JSON array of strings, no markdown, no explanation.
                      Project: ${name}
                      Description: ${description}
                      Example format: ["Task 1","Task 2"]`
          }
        ]
      });

      const raw = message.content[0].text.trim();
      let tasks;
      try {
        tasks = JSON.parse(raw);
        if (!Array.isArray(tasks)) throw new Error('Not array');
      } catch {
        const match = raw.match(/\[[\s\S]*\]/);
        tasks = match ? JSON.parse(match[0]) : [`Complete ${name} project`];
      }

      return res.json({ tasks: tasks.filter(t => typeof t === 'string' && t.trim()) });
    }

  } catch (err) {
    console.error('AI GENERATE ERROR:', err.message);
    res.status(500).json({ message: 'AI generation failed: ' + err.message });
  }
});

module.exports = router;