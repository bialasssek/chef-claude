export async function handler(event) {
	try {
		const { ingredients } = JSON.parse(event.body || "{}");
		if (!ingredients || !Array.isArray(ingredients)) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Invalid ingredients" }),
			};
		}
		const ingredientsString = ingredients.join(", ");

		const prompt = `You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page, (here goes the user )=> I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`;

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
