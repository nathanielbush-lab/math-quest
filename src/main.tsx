import { createRoot } from "react-dom/client";
import App from "./App";
// Fonts are bundled (not loaded from Google) so the app and the offline file work without internet.
import "@fontsource/fredoka/latin-600.css";
import "@fontsource/fredoka/latin-700.css";
import "@fontsource/nunito/latin-500.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/fraunces/latin-700.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
