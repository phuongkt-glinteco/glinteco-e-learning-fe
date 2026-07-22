import { Config } from "@puckeditor/core";
import {
  HeadingBlock,
  CodeBlock,
  CalloutBlock,
} from "../blocks/common";

// Cấu hình mẫu cho Exercise Builder (Sẽ được mở rộng khi thiết kế chi tiết Exercise)
export const exercisePuckConfig: Config = {
  categories: {
    common: {
      title: "Chung",
      components: ["HeadingBlock", "CodeBlock", "CalloutBlock"],
    },
  },
  components: {
    HeadingBlock,
    CodeBlock,
    CalloutBlock,
  },
};
