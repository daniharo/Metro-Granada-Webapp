import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: "#ad2938",
    800: "#b42d3e",
    700: "#D42A40",
  },
};

const fonts = {
  body: "Encode-Sans, sans-serif",
  heading: "Georgia, serif",
  mono: "Menlo, monospace",
};

const theme = extendTheme({ colors, fonts });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
