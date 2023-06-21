import { BrowserRouter } from "react-router-dom";
import { Provider as JotaiProvider } from "jotai";
import { SnackbarProvider } from "notistack";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Slide from "@mui/material/Slide";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Routes from "routes";
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <Routes />
              </LocalizationProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Web3Provider>
    </JotaiProvider>
  );
}

export default App;
