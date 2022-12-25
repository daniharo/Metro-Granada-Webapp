import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Encode_Sans_Condensed } from "@next/font/google";

const encodeSansCondensed = Encode_Sans_Condensed({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "fallback",
});

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: "#ad2938",
    800: "#b42d3e",
    700: "#D42A40",
  },
};

const components = {
  Input: {
    defaultProps: {
      focusBorderColor: "brand.700",
    },
  },
};

const shadows = {
  outline: "none",
};

const fonts = {
  body: `${encodeSansCondensed.style.fontFamily}, sans-serif`,
  heading: `${encodeSansCondensed.style.fontFamily}, sans-serif`,
  mono: "Menlo, monospace",
};

const theme = extendTheme({ colors, fonts, components, shadows });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
