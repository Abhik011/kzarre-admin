import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const WorldMap = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Points of Presence locations (lat, long)
  const pointsOfPresence = [
    // North America
    { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
    { lat: 40.7128, lng: -74.0060, name: 'New York' },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago' },
    { lat: 33.4484, lng: -112.0740, name: 'Phoenix' },
    { lat: 47.6062, lng: -122.3321, name: 'Seattle' },
    { lat: 32.7767, lng: -96.7970, name: 'Dallas' },
    { lat: 43.6532, lng: -79.3832, name: 'Toronto' },
    { lat: 49.2827, lng: -123.1207, name: 'Vancouver' },
    { lat: 19.4326, lng: -99.1332, name: 'Mexico City' },
    
    // South America
    { lat: -23.5505, lng: -46.6333, name: 'São Paulo' },
    { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires' },
    { lat: -12.0464, lng: -77.0428, name: 'Lima' },
    { lat: 4.7110, lng: -74.0721, name: 'Bogotá' },
    
    // Europe
    { lat: 51.5074, lng: -0.1278, name: 'London' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris' },
    { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
    { lat: 41.9028, lng: 12.4964, name: 'Rome' },
    { lat: 40.4168, lng: -3.7038, name: 'Madrid' },
    { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
    { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
    { lat: 50.1109, lng: 8.6821, name: 'Frankfurt' },
    { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
    { lat: 59.9139, lng: 10.7522, name: 'Oslo' },
    { lat: 60.1699, lng: 24.9384, name: 'Helsinki' },
    { lat: 50.8503, lng: 4.3517, name: 'Brussels' },
    
    // Asia
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    { lat: 37.5665, lng: 126.9780, name: 'Seoul' },
    { lat: 31.2304, lng: 121.4737, name: 'Shanghai' },
    { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
    { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' },
    { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
    { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
    { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
    { lat: 13.7563, lng: 100.5018, name: 'Bangkok' },
    { lat: -6.2088, lng: 106.8456, name: 'Jakarta' },
    { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
    { lat: 33.8938, lng: 35.5018, name: 'Beirut' },
    { lat: 41.0082, lng: 28.9784, name: 'Istanbul' },
    { lat: 24.7136, lng: 46.6753, name: 'Riyadh' },
    
    // Oceania
    { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
    { lat: -37.8136, lng: 144.9631, name: 'Melbourne' },
    { lat: -27.4698, lng: 153.0251, name: 'Brisbane' },
    { lat: -41.2865, lng: 174.7762, name: 'Wellington' },
    { lat: -36.8485, lng: 174.7633, name: 'Auckland' },
    
    // Africa
    { lat: -33.9249, lng: 18.4241, name: 'Cape Town' },
    { lat: -26.2041, lng: 28.0473, name: 'Johannesburg' },
    { lat: 30.0444, lng: 31.2357, name: 'Cairo' },
    { lat: -1.2921, lng: 36.8219, name: 'Nairobi' },
    { lat: 33.8869, lng: 9.5375, name: 'Tunis' },
  ];

  // Convert lat/lng to SVG coordinates
  const projectPoint = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  // Generate background dots for the world map
  const generateMapDots = () => {
    const dots = [];
    const dotSpacing = 15;
    
    for (let x = 0; x < 1000; x += dotSpacing) {
      for (let y = 0; y < 500; y += dotSpacing) {
        // Add some randomness to make it look more organic
        if (Math.random() > 0.3) {
          dots.push({ x: x + Math.random() * 5, y: y + Math.random() * 5 });
        }
      }
    }
    return dots;
  };

  const mapDots = generateMapDots();

  const theme = {
    dark: {
      bg: '#0a0a0a',
      cardBg: '#111111',
      text: '#ffffff',
      subtext: '#888888',
      mapDot: '#2a2a2a',
      point: '#10b981',
      pointGlow: '#10b98140',
      border: '#1f1f1f'
    },
    light: {
      bg: '#ffffff',
      cardBg: '#f9fafb',
      text: '#111827',
      subtext: '#6b7280',
      mapDot: '#e5e7eb',
      point: '#059669',
      pointGlow: '#05966940',
      border: '#e5e7eb'
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <div style={{
      minHeight: '100vh',
      background: currentTheme.bg,
      color: currentTheme.text,
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em'
            }}>
              Global CDN
            </h1>
            <p style={{
              fontSize: '18px',
              color: currentTheme.subtext,
              margin: 0
            }}>
              Our global CDN has 119 globally distributed points of presence.
            </p>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: currentTheme.text,
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Map Container */}
        <div style={{
          background: currentTheme.cardBg,
          borderRadius: '16px',
          padding: '40px',
          border: `1px solid ${currentTheme.border}`,
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
          {/* Legend */}
          <div style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: currentTheme.bg,
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${currentTheme.border}`
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currentTheme.point,
                boxShadow: `0 0 8px ${currentTheme.pointGlow}`
              }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Points of Presence ({pointsOfPresence.length})
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: currentTheme.bg,
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${currentTheme.border}`
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currentTheme.mapDot,
                border: `1px solid ${currentTheme.border}`
              }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Edge Regions (19)
              </span>
            </div>
          </div>

          {/* World Map SVG */}
          <div style={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: '8px'
          }}>
            <svg
              viewBox="0 0 1000 500"
              style={{
                width: '100%',
                height: 'auto'
              }}
            >
              {/* Background dots */}
              {mapDots.map((dot, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="1.5"
                  fill={currentTheme.mapDot}
                  opacity="0.4"
                />
              ))}

              {/* Points of Presence */}
              {pointsOfPresence.map((point, i) => {
                const { x, y } = projectPoint(point.lat, point.lng);
                const size = 3 + Math.random() * 4;
                
                return (
                  <g key={`point-${i}`}>
                    {/* Glow effect */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size * 3}
                      fill={currentTheme.point}
                      opacity="0.1"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={size * 2}
                      fill={currentTheme.point}
                      opacity="0.2"
                    />
                    {/* Main point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size}
                      fill={currentTheme.point}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <title>{point.name}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '32px'
        }}>
          {[
            { label: 'Total Locations', value: pointsOfPresence.length },
            { label: 'Continents', value: '6' },
            { label: 'Countries', value: '35+' },
            { label: 'Avg Latency', value: '<50ms' }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: currentTheme.cardBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: currentTheme.point,
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: currentTheme.subtext,
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;