import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { staticPortfolioData } from '../utils/portfolioData';

const PortfolioDataContext = createContext(null);
const POLL_INTERVAL = 2500;

export function PortfolioDataProvider({ children }) {
  const [data, setData] = useState(staticPortfolioData);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastRef = useRef(staticPortfolioData);

  const refresh = useCallback(async () => {
    if (!import.meta.env.DEV) {
      setData(staticPortfolioData);
      setLive(false);
      setLoading(false);
      return;
    }

    try {
      const {
        fetchPortfolioData,
        portfolioDataEqual,
      } = await import('../utils/localPortfolioData');

      const next = await fetchPortfolioData();
      setLive(Boolean(next?.__live));

      if (!portfolioDataEqual(lastRef.current, next)) {
        lastRef.current = next;
        setData(next);
      }
    } catch {
      // Keep the last known data on failure.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      setLoading(false);
      return;
    }

    let active = true;
    let timer = null;

    async function start() {
      try {
        const { isAdminApiAvailable } = await import(
          '../utils/localPortfolioData'
        );

        const available = await isAdminApiAvailable();
        if (!active) return;

        if (available) {
          setLive(true);
          await refresh();

          if (active) {
            timer = window.setInterval(() => {
              if (active) refresh();
            }, POLL_INTERVAL);
          }
        } else {
          setLive(false);
          setData(staticPortfolioData);
          lastRef.current = staticPortfolioData;
          setLoading(false);
        }
      } catch {
        if (active) {
          setLive(false);
          setLoading(false);
        }
      }
    }

    start();

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ data, live, loading, refresh }),
    [data, live, loading, refresh]
  );

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);

  if (!context) {
    return {
      data: staticPortfolioData,
      live: false,
      loading: false,
      refresh: async () => {},
    };
  }

  return context;
}
