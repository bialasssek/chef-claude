export async function handler(event) {
	try {
		const { ingredients } = JSON.parse(event.body || "{}");
		if (!ingredients || !Array.isArray(ingredients)) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Invalid ingredients" }),
			};
		}

		const prompt = `You are an assistant that receives a list of ingredients: ${ingredients.join(
			", "
		)} ...`;

		const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "x-ai/grok-4-fast:free",
				messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`OpenRouter API error: ${res.status} ${text}`);
		}

		const data = await res.json();
		return { statusCode: 200, body: JSON.stringify(data) };
	} catch (err) {
		console.error(err);
		return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
	}
}
