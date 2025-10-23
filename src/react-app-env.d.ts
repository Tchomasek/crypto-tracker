/// <reference types="react-scripts" />

// CSS file declarations for side-effect imports
declare module "*.css" {
  const content: any;
  export = content;
}
