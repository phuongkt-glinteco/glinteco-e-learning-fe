import assert from "node:assert/strict";
import { readLessonPuckData } from "./reader.ts";

const fallbackRoot = {
  title: "API Title",
  description: "API Description",
  estimatedTime: "10 mins",
  order: 2,
  type: "reading",
};

{
  const result = readLessonPuckData(
    JSON.stringify({
      content: [
        {
          type: "ParagraphBlock",
          props: {
            content: "Hello",
          },
        },
      ],
      root: {
        props: {
          title: "Ignored root title",
          documents: [{ id: "doc-1" }],
          exercises: [{ id: "ex-1" }],
        },
      },
    }),
    fallbackRoot,
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.root.props?.title, "API Title");
    assert.equal(result.data.root.props?.description, "API Description");
    assert.deepEqual(result.data.root.props?.documents, [{ id: "doc-1" }]);
    assert.deepEqual(result.data.root.props?.exercises, [{ id: "ex-1" }]);
  }
}

{
  const result = readLessonPuckData("{not-json}", fallbackRoot);
  assert.deepEqual(result, { ok: false, reason: "invalid_json" });
}

{
  const result = readLessonPuckData(
    JSON.stringify({
      content: [
        {
          type: "UnknownBlock",
          props: {},
        },
      ],
    }),
    fallbackRoot,
  );

  assert.deepEqual(result, { ok: false, reason: "unknown_block" });
}

{
  const documentReference = {
    id: "doc-2",
    url: "https://example.com/doc",
    nested: { keep: true },
  };
  const exerciseReference = {
    id: "exercise-2",
    requirements: ["a", "b"],
  };

  const result = readLessonPuckData(
    JSON.stringify({
      content: [
        {
          type: "ReferenceDocumentBlock",
          props: {
            documentId: "doc-2",
            url: "https://example.com/doc",
            altText: "Doc",
          },
        },
      ],
      root: {
        props: {
          documents: [documentReference],
          exercises: [exerciseReference],
        },
      },
    }),
    fallbackRoot,
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.data.root.props?.documents, [documentReference]);
    assert.deepEqual(result.data.root.props?.exercises, [exerciseReference]);
  }
}

console.log("helper test passed");
