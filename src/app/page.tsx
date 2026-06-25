import HomeClient from "./HomeClient";

export const revalidate = 600; // Cache homepage for 10 minutes

export default function Home() {
  return <HomeClient />;
}
