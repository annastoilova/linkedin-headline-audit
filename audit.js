// /api/audit.js
// Vercel serverless function — keeps your API key safe on the server.

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull the inputs from the request
  const { headline, audience, outcome } = req.body || {};

  if (!headline || !audience || !outcome) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Basic length safety (prevents abuse via huge inputs)
  if (headline.length > 500 || audience.length > 300 || outcome.length > 300) {
    return res.status(400).json({ error: 'Input too long' });
  }

  const prompt = `You are a LinkedIn conversion strategist trained on Anna Stoilova's Minimum Viable Brand methodology. You audit and rewrite LinkedIn headlines so they convert profile visitors into leads.

CURRENT HEADLINE: "${headline}"
TARGET AUDIENCE: ${audience}
OUTCOME DELIVERED: ${outcome}

Audit this headline against these criteria:
1. Does it state the specific outcome the audience gets? (Not vague, not abstract.)
2. Does it contain at least one searchable keyword the target audience would type into LinkedIn search?
3. Is it free of banned buzzwords: results-driven, passionate about, team player, seasoned professional, thought leader, motivated self-starter, detail-oriented, dynamic, innovative, synergy, guru, ninja, rockstar, proven track record, go-getter, hard-working, strategic thinker, leverage, helping businesses grow, transforming lives.
4. Is it under 220 characters?
5. Does it position rather than describe? (Position = what you do for whom; describe = job title only.)
6. Would the target audience self-identify in the first 5 words?

Then write 3 rewrite variants under 220 characters each:
- AUTHORITY-FORWARD: leads with credential or proof + outcome
- OUTCOME-FORWARD: leads with the result the audience gets
- NICHE-SPECIFIC: leads with the specific audience served + transformation

Each rewrite must contain at least one searchable keyword. No banned buzzwords. Direct, peer-level voice. No hype.

Return ONLY valid JSON in this exact shape, no markdown fences, no preamble:
{
  "score": <number 1-10>,
  "verdict": "<one warm, direct sentence summarising the headline's current state>",
  "wins": ["<specific thing working>", "<specific thing working>"],
  "fixes": ["<specific issue + what to change>", "<specific issue + what to change>", "<specific issue + what to change>"],
  "rewrites": [
    {"type": "Authority-forward", "text": "<rewrite under 220 chars>"},
    {"type": "Outcome-forward", "text": "<rewrite under 220 chars>"},
    {"type": "Niche-specific", "text": "<rewrite under 220 chars>"}
  ]
}

If wins are scarce (low-scoring headline), include 1 win minimum and be honest. If fixes are minimal (high-scoring), include 1-2 polish notes.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(500).json({ error: 'AI service unavailable' });
    }

    const data = await response.json();
    const textBlock = data.content.find(b => b.type === 'text');

    if (!textBlock) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Strip any markdown fences just in case
    const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Audit error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
