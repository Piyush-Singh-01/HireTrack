import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { route } from "./utils/AppRoutes";
import "./App.css";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import ProtectedLayout from "./layout/layout";
import AppModulesProvider from "./utils/AppModulesContext";
import RouteGuard from "./utils/RouteGuard";
import { LoginPage } from "./pages";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={
          <>
            <RouteGuard />
            <LoginPage />
          </>
        }
      />
      {route
        .filter((r) => !r.isProtected && r.path !== "/")
        .map((ele) => (
          <Route key={ele.id} path={ele.path} element={ele.element} />
        ))}
      <Route element={<ProtectedRoutes />}>
        <Route element={<ProtectedLayout />}>
          {route
            .filter((r) => r.isProtected)
            .map((ele) => (
              <Route key={ele.id} path={ele.path} element={ele.element} />
            ))}
        </Route>
      </Route>
    </>
  )
);

function App() {
  return (
    <AppModulesProvider>
      <RouterProvider router={router} />
    </AppModulesProvider>
  );
}

export default App;
