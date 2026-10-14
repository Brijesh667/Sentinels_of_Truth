import QueryForm from "../components/QueryForm";
import usePageTitle from "../utils/usePageTitle";

export default function Home_page() {
  usePageTitle("Check a claim — Sentinels of Truth");

  return (
    <div className="w-full">
      <QueryForm />
    </div>
  );
}