import { Config } from "@puckeditor/core";
import {
  HeadingBlock,
  ListBlock,
  TableBlock,
  CodeBlock,
  CalloutBlock,
} from "../blocks/common";

// Cấu hình mẫu cho Document Builder (Tách riêng cho Document)
export const documentPuckConfig: Config = {
  categories: {
    content: {
      title: "Nội dung tài liệu",
      components: [
        "HeadingBlock",
        "ListBlock",
        "TableBlock",
        "CodeBlock",
        "CalloutBlock",
      ],
    },
  },
  components: {
    HeadingBlock,
    ListBlock,
    TableBlock,
    CodeBlock,
    CalloutBlock,
  },
};
