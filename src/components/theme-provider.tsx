import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: any) {
  return (
    <NextThemesProvider {...props} attribute="class">
      {children}
    </NextThemesProvider>
  );
}
