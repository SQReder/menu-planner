import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Selector from "./selector";
import recipes, { Recipes } from "./recipes";
import { map, sum } from "ramda";
import {
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@material-ui/core";

const App: React.FC = () => {
  const [selected, setSelected] = useState<Recipes>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recipes");
    if (stored) {
      setSelected(JSON.parse(stored));
    }
  }, []);

  const handleChange = useCallback((values: Recipes | null | undefined) => {
    setSelected(values || []);
    if (values != null) {
      const keys = values.map(r => r.title);
      localStorage.setItem("recipes", JSON.stringify(keys || []));
    }
  }, []);

  const ingredients = useMemo<Record<string, string[]>>(() => {
    console.log("foo");
    return selected.reduce<Record<string, string[]>>((acc, { ingredients }) => {
      if (!ingredients) return acc;

      console.log(acc, ingredients);
      console.log(Object.keys(ingredients));

      return Object.keys(ingredients).reduce((ing, key) => {
        const val = ingredients[key];
        return {
          ...ing,
          [key]: [...(ing[key] || []), val]
        };
      }, acc);
    }, {});
  }, [selected]);

  return (
    <>
      <CssBaseline />
      <div>
        <Selector recipes={recipes} onChange={handleChange} />
        <Typography variant={"body1"}>
          {selected.map(x => x.title).join(", ")}
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
                <TableRow>
                  <TableCell>{i}</TableCell>
                  <TableCell>{ingredients[i].join(", ")}</TableCell>
                  <TableCell>
                    {sum(map(Number.parseInt, ingredients[i])) || 0}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default App;
