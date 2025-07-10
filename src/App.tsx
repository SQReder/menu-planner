import React, { useCallback, useMemo, useState } from "react";
import "./App.css";
import Selector from "./selector";
import recipes, { Recipes } from "./recipes";
import { map, sum } from "ramda";
import {
  Container,
  CssBaseline,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@material-ui/core";

const App: React.FC = () => {
  const [selected, setSelected] = useState<Recipes>([]);
  const [portions, setPortions] = useState<Record<string, number>>({});



  const handleChange = useCallback(
    (values: Recipes | null | undefined) => {
      const newSelected = values || [];
      setSelected(newSelected);

      const newPortions = (newSelected || []).reduce<Record<string, number>>(
        (acc, recipe) => {
          acc[recipe.title] = portions[recipe.title] || 1;
          return acc;
        },
        {}
      );
      setPortions(newPortions);
    },
    [portions]
  );

  const handlePortionChange = (recipeTitle: string, count: number) => {
    const newPortions = {
      ...portions,
      [recipeTitle]: count >= 1 ? count : 1
    };
    setPortions(newPortions);
  };

  const ingredients = useMemo<Record<string, string[]>>(() => {
    return selected.reduce<Record<string, string[]>>((acc, recipe) => {
      if (!recipe.ingredients) return acc;

      const portionCount = portions[recipe.title] || 1;

      return Object.keys(recipe.ingredients).reduce((ing, key) => {
        const val = recipe.ingredients[key];
        const amount = (parseInt(val, 10) || 0) * portionCount;

        if (amount === 0) return ing;

        const currentValues = ing[key] || [];

        return {
          ...ing,
          [key]: [...currentValues, `${amount}`]
        };
      }, acc);
    }, {});
  }, [selected, portions]);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Планировщик меню
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper style={{ padding: '1rem' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Выберите рецепты
              </Typography>
              <Selector recipes={recipes} onChange={handleChange} />
            </Paper>
          </Grid>

          {selected.length > 0 && (
            <Grid item xs={12}>
              <Paper style={{ padding: '1rem' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Укажите количество порций
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Рецепт</TableCell>
                      <TableCell>Количество порций</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selected.map(recipe => (
                      <TableRow key={recipe.title}>
                        <TableCell>{recipe.title}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={portions[recipe.title] || 1}
                            onChange={e =>
                              handlePortionChange(
                                recipe.title,
                                parseInt(e.target.value, 10)
                              )
                            }
                            inputProps={{ min: 1, step: 1 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          )}

          {Object.keys(ingredients).length > 0 && (
            <Grid item xs={12}>
              <Paper style={{ padding: '1rem' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Список покупок
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ингредиент</TableCell>
                      <TableCell>Сумма (по частям)</TableCell>
                      <TableCell>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(ingredients)
                      .sort()
                      .map(i => (
                        <TableRow key={i}>
                          <TableCell>{i}</TableCell>
                          <TableCell>{ingredients[i].join(", ")}</TableCell>
                          <TableCell>
                            {sum(map(Number.parseInt, ingredients[i])) || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default App;
