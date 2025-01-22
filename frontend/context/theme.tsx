"use client";

import React, { createContext, ReactNode, useState, useContext } from "react";

type ThemeContextType = {
    theme: string;
    setTheme: (theme: string) => void;
};

const contextDefaultValue: ThemeContextType = {
    theme: "light",
    setTheme: () => { },
};

const ThemeContext = createContext<ThemeContextType>(contextDefaultValue);

interface ThemeProviderProps {
    children: ReactNode;
}

export function WebThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<string>("light");

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useWebThemeContext = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeContext must be used within a ThemeProvider");
    }
    return context;
};

