import { useRouteError } from "react-router-dom";
import NavigationButtons from "./components/shared/NavigationButtons";
import { Button } from "./components/ui/button";

export default function ErrorPage() {
  const frontEndError: any = useRouteError();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <h1 className="text-2xl font-semibold text-red-600">
        Oops! Something went wrong.
      </h1>
      <p className="text-sm text-gray-500 mt-4">
        An unexpected error occurred. The app will refresh automatically in a
        few seconds. If it doesn’t, click the button below.
      </p>
      {frontEndError && (
        <pre className="mt-4 p-4 bg-gray-200 rounded text-left text-sm text-gray-800 max-w-md overflow-x-auto">
          {frontEndError}
        </pre>
      )}
      <Button
        onClick={() => location.reload()}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Refresh Now
      </Button>
      <NavigationButtons />
    </div>
  );
}
