import React, { useMemo, useEffect } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './layouts/Layout';
import { ThemeColorsProvider, useThemeColors, getPagePrimary } from './context/ThemeColorsContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const injectButtonStyles = () => {
  let el = document.getElementById('gpr-btn-overrides');
  if (!el) {
    el = document.createElement('style');
    el.id = 'gpr-btn-overrides';
    document.head.appendChild(el);
  }
  el.textContent = `
    .MuiButton-containedPrimary,
    .MuiLoadingButton-root.MuiButton-containedPrimary {
      background: linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%) !important;
      box-shadow: none !important;
    }
    .MuiButton-containedPrimary:hover:not(.Mui-disabled),
    .MuiLoadingButton-root.MuiButton-containedPrimary:hover:not(.Mui-disabled) {
      filter: brightness(0.88);
      box-shadow: none !important;
    }
    .MuiButton-containedPrimary.Mui-disabled,
    .MuiLoadingButton-root.MuiButton-containedPrimary.Mui-disabled {
      background: var(--gpr-primary) !important;
      opacity: 0.55 !important;
    }
    .MuiButton-outlinedPrimary {
      border-color: var(--gpr-primary) !important;
      color: var(--gpr-primary) !important;
    }
    .MuiButton-outlinedPrimary:hover:not(.Mui-disabled) {
      background: var(--gpr-primary-light) !important;
    }
    .MuiFab-primary {
      background: var(--gpr-primary) !important;
      box-shadow: 0 4px 12px var(--gpr-primary-light) !important;
    }
    .MuiFab-primary:hover:not(.Mui-disabled) {
      background: var(--gpr-primary-dark) !important;
    }
  `;
};

// Rebuilds the MUI theme whenever the user changes their primary color.
// Uses the blended color when sidebar and topbar colors differ.
const DynamicMuiTheme = ({ children }) => {
  const { colors } = useThemeColors();

  useEffect(() => { injectButtonStyles(); }, []);

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
