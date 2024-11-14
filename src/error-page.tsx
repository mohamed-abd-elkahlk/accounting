import { useRouteError } from "react-router-dom";
import NavigationButtons from "./components/shared/NavigationButtons";
import { Button } from "./components/ui/button";

export default function ErrorPage() {
  const error: any = useRouteError();
  return (
    <div className="m-auto flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <h1 className="text-6xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-lg text-gray-700 mb-4">
        Sorry, an unexpected error has occurred.
      </p>
      <p className="text-gray-500 italic">
        {error.statusText || error.message}
      </p>
      <Button
        onClick={() => (window.location.href = "/")}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      ></Button>
      Go back to Home <NavigationButtons />
    </div>
  );
}
