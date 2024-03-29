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
import { AuthProvider } from "components/AuthContext";

function App() {
  const theme = createTheme();

  return (
    <BrowserRouter>
      <JotaiProvider>
        <Web3Provider>
          <AuthProvider>
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
          </AuthProvider>
        </Web3Provider>
      </JotaiProvider>
    </BrowserRouter>
  );
}

export default App;
