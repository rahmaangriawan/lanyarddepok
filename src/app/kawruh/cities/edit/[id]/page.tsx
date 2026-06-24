"use client";

import { use } from "react";
import CitiesEditor from "../../Editor";

interface EditCityPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCityPage({ params }: EditCityPageProps) {
  const resolvedParams = use(params);
  const id = parseInt(resolvedParams.id, 10);

  return <CitiesEditor editId={id} />;
}
