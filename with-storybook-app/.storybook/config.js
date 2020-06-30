import { configure } from "@storybook/react";

require("./stories.decorators");

const req = require.context("../stories", true, /.stories.js$/);

configure(req, module);
