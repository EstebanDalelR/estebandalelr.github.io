import React from "react";
import { addDecorator } from "@storybook/react";
import { withA11y } from "@storybook/addon-a11y";
import { withKnobs } from "@storybook/addon-knobs";
import "../styles/tailwind.css"
addDecorator(withA11y);
addDecorator(withKnobs);

const Padding = storyFn => (
    <div className="px-20 py-10">
        {storyFn()}
    </div>
)
addDecorator(Padding);
