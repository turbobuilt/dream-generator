// import { ComponentOptions } from "vue";

// declare module "*.vue" {
//     const componentOptions: ComponentOptions;
//     export default componentOptions;
// }

declare module "*.vue" {
    import Vue from "vue"
    export default Vue
  }
  