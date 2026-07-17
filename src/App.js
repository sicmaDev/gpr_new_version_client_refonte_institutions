import React, { useMemo } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './layouts/Layout';
import { ThemeColorsProvider, useThemeColors, getPagePrimary } from './context/ThemeColorsContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Rebuilds the MUI theme whenever the user changes their primary color.
// Uses the blended color when sidebar and topbar colors differ.
const DynamicMuiTheme = ({ children }) => {
  const { colors } = useThemeColors();
  const theme = useMemo(() => createTheme({
    palette: {
      primary: { main: getPagePrimary(colors) },
    },
  }), [colors.sidebarColor, colors.topbarColor]);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

function App() {
  return (
    <div className="App">
      <ThemeColorsProvider>
        <DynamicMuiTheme>
          <Provider store={store}>
            <Layout />
          </Provider>
        </DynamicMuiTheme>
      </ThemeColorsProvider>
    </div>
  );
}

export default App;
