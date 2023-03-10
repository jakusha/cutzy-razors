import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./features/auth/Login";
import NoMatch from "./components/NoMatch";
import Signup from "./components/Signup";
import Dashboard from "./features/dashboard/Dashboard";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import History from "./features/dashboard/History";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<HomePage />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route
					path="/dashboard"
					element={
						<PersistLogin>
							<RequireAuth>
								<Dashboard />
							</RequireAuth>
						</PersistLogin>
					}
				/>
				<Route
					path="/history"
					element={
						<PersistLogin>
							<RequireAuth>
								<History />
							</RequireAuth>
						</PersistLogin>
					}
				/>
				<Route path="*" element={<NoMatch />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
