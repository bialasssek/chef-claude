import fetch from "node-fetch";
import process from "process";

export async function handler(event) {
	const { ingredients } = JSON.parse(event.body);

	const prompt = `You are an assistant that receives a list of ingredients: ${ingredients.join(
		", "
	)} ...`;

	const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`, // safe here
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "x-ai/grok-4-fast:free",
			messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
		}),
	});

	const data = await res.json();
	return {
		statusCode: 200,
		body: JSON.stringify(data),
	};
}
