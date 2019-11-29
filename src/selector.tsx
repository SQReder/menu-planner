import { Recipes } from "./recipes";
import React, { PropsWithChildren, useCallback, useMemo } from "react";
import Select, { ActionMeta, ValueType, components } from "react-select";

const MyValueContainer = ({
  children = [],
  ...props
}: PropsWithChildren<any>) => {
  const children1 = children as any;
  if (children1[0] && children1[0].length) {
    const newChilds = children1[0].map((child: any) =>
      React.cloneElement(child, { key: child.props.children })
    );
    newChilds.forEach((newChild: any, index: number) => {
      children[0][index] = newChild;
    });
    // children[0] = newChilds;  wont work. children[0] is readonly
  }
  return (
    <components.ValueContainer {...props}>
      {children1}
    </components.ValueContainer>
  );
};

interface OwnProps {
  recipes: Recipes;
  onChange: (recipes: Recipes | null | undefined) => void;
}

export default function Selector({ recipes, onChange }: OwnProps) {
  const options = useMemo(
    () => recipes.map(recipe => ({ label: recipe.title, value: recipe })),
    [recipes]
  );

  const handleChange = useCallback(
    (value: ValueType<any>, actionMeta: ActionMeta) => {
      if (value) onChange(value.map((x: any) => x.value));
    },
    [onChange]
  );

  return (
    <Select
      options={options}
      isMulti
      isSearchable
      onChange={handleChange}
      components={{
        ValueContainer: MyValueContainer
      }}
    />
  );
}
