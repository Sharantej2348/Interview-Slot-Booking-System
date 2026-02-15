import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/*
Auth Provider
*/
import { AuthProvider } from "./context/AuthContext";

/*
Toast notifications
*/
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <App />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="colored"
            />
        </AuthProvider>
    </React.StrictMode>,
);
