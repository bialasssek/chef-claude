import React, { useState } from "react";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";
import process from "process";

export default function Content() {
	const [ingredients, setIngredients] = React.useState([
		"all the main spices",
		"pasta",
		"ground beef",
		"tomato paste",
	]);
	const [recipeShown, setRecipeShown] = React.useState(false);
	const [reply, setReply] = useState("");
	const [loading, setLoading] = useState(false);

	function toggleRecipeShown() {
		setRecipeShown((prevShown) => !prevShown);
	}

	function addIngredient(formData) {
		const newIngredient = formData.get("ingredient");
		setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
	}

	React.useEffect(() => {
		if (!recipeShown) return;
		const ingredientsString = ingredients.join(", ");

		const prompt = `You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page, (here goes the user )=> I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`;

		setLoading(true);
		setReply("");

		fetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "x-ai/grok-4-fast:free",
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: prompt,
							},
						],
					},
				],
			}),
		})
			.then((res) => {
				if (!res.ok) throw new Error(res.status);
				return res.json();
			})
			.then((data) => {
				setReply(data.choices[0].message.content);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	}, [recipeShown]);

	return (
		<main>
			<form action={addIngredient} className="add-ingredient-form">
				<input
					type="text"
					placeholder="e.g. oregano"
					aria-label="Add ingredient"
					name="ingredient"
				/>
				<button>Add ingredient</button>
			</form>

			{ingredients.length > 0 && (
				<IngredientsList
					ingredients={ingredients}
					toggleRecipeShown={toggleRecipeShown}
				/>
			)}

			{recipeShown && <ClaudeRecipe reply={reply} loading={loading} />}
		</main>
	);
}
