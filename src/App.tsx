import { AppSidebar } from "./components/app-sidebar";
import DashboardPage from "./routes/dashboard";

export default function App() {
  return (
    <>
      <AppSidebar />
      <DashboardPage />
    </>
  );
}
