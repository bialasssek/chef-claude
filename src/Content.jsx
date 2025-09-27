import React, { useState } from "react";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";

export default function Content() {
	const [ingredients, setIngredients] = React.useState([]);
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

		setLoading(true);
		setReply("");

		fetch("/.netlify/functions/getRecipe", {
			method: "POST",
			body: JSON.stringify({ ingredients }),
		})
			.then((res) => {
				if (!res.ok) throw new Error(res.status);
				return res.json();
			})
			.then((data) => {
				setLoading(false);
				setReply(data.choices[0].message.content);
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
