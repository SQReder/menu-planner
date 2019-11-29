import recipesList from "./recipes.json";

export interface Recipe {
  title: string;
  ingredients: Record<string, string>;
}

export type Recipes = readonly Recipe[];

const recipes: Recipes = recipesList;

export default recipes;
