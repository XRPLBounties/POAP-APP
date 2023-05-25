import { BrowserRouter } from "react-router-dom";
import { Provider as JotaiProvider } from "jotai";
import { SnackbarProvider } from "notistack";
import Routes from "routes";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Slide from "@mui/material/Slide";

import { Web3Provider } from "connectors/context";

function App() {
  const theme = createTheme();

  return (
    <JotaiProvider>
      <Web3Provider>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <SnackbarProvider
              autoHideDuration={10000}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              TransitionComponent={Slide}
              maxSnack={3}
            >
              <CssBaseline />
              <Routes />
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Web3Provider>
    </JotaiProvider>
  );
}

export default App;
