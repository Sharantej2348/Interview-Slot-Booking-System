import React from "react";

function Loader({ text = "Loading..." }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>

            {/* Loading text */}
            <p className="text-gray-700 text-lg font-semibold">{text}</p>
        </div>
    );
}

export default Loader;
