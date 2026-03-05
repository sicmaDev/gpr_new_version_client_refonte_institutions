import React, { useState, useEffect, useRef } from 'react';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import './supersetDashboard.css';

function SupersetDashboard() {
  const [dashboardId, setDashboardId] = useState('');
  const [token, setToken] = useState(null);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const dashboardRef = useRef(null);

  const fetchToken = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/guest-token?dashboardId=${dashboardId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error('Error fetching guest token:', error);
      alert('Error fetching guest token. Check console and make sure Backend is running.');
    }
  };

  useEffect(() => {
    if (token && dashboardRef.current) {
        // Clear previous dashboard if any (simple way)
        dashboardRef.current.innerHTML = "";
        
        embedDashboard({
            id: dashboardId, // Given by the Superset dashboard id
            supersetDomain: "http://localhost:8088",
            mountPoint: dashboardRef.current, // Valid HTML element
            fetchGuestToken: () => Promise.resolve(token),
            dashboardUiConfig: {
                hideTitle: true,
                hideChartControls: true,
                hideTab: true,
            },
        });
        setDashboardLoaded(true);
    }
  }, [token, dashboardId]);

  return (
    <div className="App">
      <div className="controls">
        <input 
            type="text" 
            placeholder="Enter ID (UUID) du raport" 
            value={dashboardId} 
            onChange={(e) => setDashboardId(e.target.value)} 
        />
        <button onClick={fetchToken}>Charger le rapport</button>
      </div>

      <div className="dashboard-wrapper">
           <div className="dashboard-container" ref={dashboardRef}></div>
      </div>
    </div>
  );
}

export default SupersetDashboard;