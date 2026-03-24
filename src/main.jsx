import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import "@/globals.css";

window.addEventListener("vite:preloadError", (event) => {
  // If a preload error occurs (like chunk loading failures during network drop or app updates), reload the page
  console.warn("Vite preload error, reloading page...", event);
  setTimeout(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("refresh", Date.now().toString());
    window.location.href = url.toString();
  }, 1000); // slight delay to prevent infinite reload loop in certain error conditions
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
