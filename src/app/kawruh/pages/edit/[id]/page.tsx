"use client";

import { useParams } from "next/navigation";
import PagesEditor from "../../Editor";

export default function EditPagePage() {
  const params = useParams();
  const editId = params?.id ? Number(params.id) : undefined;

  return <PagesEditor editId={editId} />;
}
