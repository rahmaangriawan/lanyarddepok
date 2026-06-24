"use client";

import { useParams } from "next/navigation";
import BlogEditor from "../../Editor";

export default function EditPostPage() {
  const params = useParams();
  const editId = params?.id ? Number(params.id) : undefined;

  return <BlogEditor editId={editId} />;
}
