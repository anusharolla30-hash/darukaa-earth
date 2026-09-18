import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const sitesRef = useRef([]);

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [showSiteForm, setShowSiteForm] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [pendingGeometry, setPendingGeometry] = useState(null);

  const [analytics, setAnalytics] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  const [showAnalyticsForm, setShowAnalyticsForm] = useState(false);
  const [analyticsYear, setAnalyticsYear] = useState("");
  const [carbonValue, setCarbonValue] = useState("");
  const [biodiversityValue, setBiodiversityValue] = useState("");

  const [loginError, setLoginError] = useState("");

  // ---------------- SITE ANALYTICS ----------------

  useEffect(() => {
    if (!selectedSite || !token) {
      return;
    }

    const loadSiteAnalytics = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/sites/${selectedSite.id}/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to load site analytics:", error);
        setAnalytics([]);
      }
    };

    loadSiteAnalytics();
  }, [selectedSite, token]);

  // ---------------- LOGIN ----------------

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      const accessToken = response.data.access_token;

      localStorage.setItem("token", accessToken);
      setToken(accessToken);
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response) {
        setLoginError(error.response.data.detail || "Login failed");
      } else {
        setLoginError("Unable to connect to server");
      }
    }
  };

  // ---------------- CREATE PROJECT ----------------

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/projects/`,
        {
          name: projectName,
          description: projectDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newProject = {
        project_id: response.data.project_id,
        name: response.data.name,
        description: response.data.description,
      };

      setProjects((previousProjects) => [...previousProjects, newProject]);

      setSelectedProject(newProject);

      setProjectName("");
      setProjectDescription("");
      setShowProjectForm(false);

      alert("Project created successfully!");
    } catch (error) {
      console.error("Failed to create project:", error);

      if (error.response) {
        alert(error.response.data.detail || "Failed to create project");
      } else {
        alert("Unable to connect to server");
      }
    }
  };

  // ---------------- LOAD PROJECTS ----------------

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/projects/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProjects(response.data);

        if (response.data.length > 0) {
          setSelectedProject(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };

    loadProjects();
  }, [token]);

  // ---------------- MAP ----------------

  useEffect(() => {
    if (!token || !selectedProject) {
      return;
    }

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-60, -3],
      zoom: 8,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Mapbox Draw controls are placed on the RIGHT
    // so they do not overlap the dashboard.
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    map.current.addControl(draw, "bottom-right");

    // ---------------- MAP LOAD ----------------

    map.current.on("load", async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/projects/${selectedProject.project_id}/sites`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const projectSites = response.data;

        setSites(projectSites);
        sitesRef.current = projectSites;

        projectSites.forEach((site) => {
          const geometry = JSON.parse(site.geometry);

          map.current.addSource(`site-${site.site_id}`, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {
                site_id: site.site_id,
                name: site.name,
              },
              geometry,
            },
          });

          map.current.addLayer({
            id: `site-${site.site_id}-fill`,
            type: "fill",
            source: `site-${site.site_id}`,
            paint: {
              "fill-color": "#2f855a",
              "fill-opacity": 0.25,
            },
          });

          map.current.addLayer({
            id: `site-${site.site_id}-outline`,
            type: "line",
            source: `site-${site.site_id}`,
            paint: {
              "line-color": "#166534",
              "line-width": 3,
            },
          });

          map.current.on("click", `site-${site.site_id}-fill`, () => {
            setSelectedSite({
              id: site.site_id,
              name: site.name,
              description: site.description,
              created_at: site.created_at,
            });
          });
        });

        if (projectSites.length > 0) {
          const firstSite = projectSites[0];

          const analyticsResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/sites/${firstSite.site_id}/analytics`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          setAnalytics(analyticsResponse.data);

          setSelectedSite({
            id: firstSite.site_id,
            name: firstSite.name,
            description: firstSite.description,
            created_at: firstSite.created_at,
          });
        } else {
          setAnalytics([]);
          setSelectedSite(null);
        }
      } catch (error) {
        console.error("Failed to load data:", error);

        if (error.response) {
          console.error(error.response.data);
        }
      }
    });

    // ---------------- SITE CLICK ----------------

    map.current.on("click", (event) => {
      const siteLayerIds = sitesRef.current.map(
        (site) => `site-${site.site_id}-fill`,
      );

      if (siteLayerIds.length === 0) {
        return;
      }

      const features = map.current.queryRenderedFeatures(event.point, {
        layers: siteLayerIds,
      });

      if (features.length === 0) {
        return;
      }

      const clickedFeature = features[0];

      const selectedSiteId = Number(clickedFeature.properties.site_id);

      const site = sitesRef.current.find(
        (item) => item.site_id === selectedSiteId,
      );

      if (site) {
        setSelectedSite({
          id: site.site_id,
          name: site.name,
          description: site.description,
          created_at: site.created_at,
        });
      }
    });

    // ---------------- DRAW POLYGON ----------------

    map.current.on("draw.create", (event) => {
      const polygon = event.features[0];

      setPendingGeometry(polygon.geometry);
      setSiteName("");
      setSiteDescription("");
      setShowSiteForm(true);
    });

    // ---------------- CLEANUP ----------------

    return () => {
      map.current?.remove();
      map.current = null;
      sitesRef.current = [];
    };
  }, [token, selectedProject]);

  // ---------------- LOGOUT ----------------

  const handleLogout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setAnalytics([]);
    setSelectedSite(null);
    setSelectedProject(null);
  };

  // ---------------- CHART DATA ----------------

  const latestAnalytics =
    analytics.length > 0 ? analytics[analytics.length - 1] : null;

  const yearsTracked = analytics.length;

  const chartData = {
    labels: analytics.map((item) => item.year),

    datasets: [
      {
        label: "Carbon",
        data: analytics.map((item) => item.carbon_value),

        yAxisID: "y",

        borderColor: "#166534",
        backgroundColor: "rgba(22, 101, 52, 0.10)",

        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },

      {
        label: "Biodiversity",
        data: analytics.map((item) => item.biodiversity_value),

        yAxisID: "y1",

        borderColor: "#147d7e",
        backgroundColor: "rgba(20, 125, 126, 0.10)",

        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 18,
          font: {
            size: 12,
          },
        },
      },

      title: {
        display: true,
        text: "Site Performance Over Time",
        color: "#12372a",
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          bottom: 18,
        },
      },

      tooltip: {
        backgroundColor: "#12372a",
        padding: 10,
        cornerRadius: 8,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#718078",
          font: {
            size: 11,
          },
        },
      },

      y: {
        type: "linear",
        position: "left",

        beginAtZero: true,

        title: {
          display: true,
          text: "Carbon",
          color: "#166534",
        },

        ticks: {
          color: "#166534",
        },

        grid: {
          color: "rgba(22, 101, 52, 0.08)",
        },
      },

      y1: {
        type: "linear",
        position: "right",

        beginAtZero: true,

        title: {
          display: true,
          text: "Biodiversity",
          color: "#147d7e",
        },

        ticks: {
          color: "#147d7e",
        },

        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // ---------------- LOGIN SCREEN ----------------

  if (!token) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #eef7f1 0%, #f5f7f4 50%, #e8f2ee 100%)",
          fontFamily: "Inter, Arial, Helvetica, sans-serif",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: "390px",
            background: "rgba(255,255,255,0.98)",
            padding: "38px",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(21, 65, 48, 0.14)",
            border: "1px solid #e3ebe6",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#166534",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              marginBottom: "18px",
            }}
          >
            🌿
          </div>

          <h1
            style={{
              margin: "0 0 8px 0",
              color: "#12372a",
              fontSize: "28px",
              letterSpacing: "-0.5px",
            }}
          >
            Darukaa.Earth
          </h1>

          <p
            style={{
              color: "#6b7c74",
              margin: "0 0 28px 0",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Geospatial analytics for carbon and biodiversity projects.
          </p>

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#344e41",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              width: "100%",
              padding: "13px 14px",
              marginBottom: "16px",
              border: "1px solid #d7e1db",
              borderRadius: "10px",
              boxSizing: "border-box",
              outline: "none",
              fontSize: "14px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#344e41",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{
              width: "100%",
              padding: "13px 14px",
              marginBottom: "16px",
              border: "1px solid #d7e1db",
              borderRadius: "10px",
              boxSizing: "border-box",
              outline: "none",
              fontSize: "14px",
            }}
          />

          {loginError && (
            <div
              style={{
                padding: "10px 12px",
                marginBottom: "16px",
                borderRadius: "9px",
                background: "#fff1f0",
                color: "#b42318",
                fontSize: "13px",
              }}
            >
              {loginError}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "10px",
              background: "#166534",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 5px 14px rgba(22,101,52,0.22)",
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // ---------------- MAIN APPLICATION ----------------

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      {/* MAP */}

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* BRANDING */}

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "calc(50% - 100px)",
          zIndex: 4,
          background: "rgba(255,255,255,0.94)",
          padding: "9px 18px",
          borderRadius: "12px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
          border: "1px solid rgba(255,255,255,0.9)",
          color: "#12372a",
          fontWeight: "700",
          fontSize: "15px",
          letterSpacing: "0.2px",
        }}
      >
        🌿 Darukaa.Earth
      </div>

      {/* LOGOUT */}

      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "80px",
          zIndex: 10,
          padding: "10px 16px",
          border: "1px solid #dce5df",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.96)",
          color: "#344e41",
          cursor: "pointer",
          boxShadow: "0 3px 14px rgba(0,0,0,0.12)",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        Logout
      </button>

      {/* ANALYTICS DASHBOARD */}

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "420px",
          maxWidth: "calc(100% - 40px)",
          height: "calc(100vh - 40px)",
          background: "rgba(255,255,255,0.97)",
          padding: "22px",
          borderRadius: "18px",
          boxShadow: "0 12px 40px rgba(24,55,42,0.18)",
          border: "1px solid #e4ebe7",
          zIndex: 5,
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* DASHBOARD HEADER */}

        <div
          style={{
            paddingBottom: "18px",
            marginBottom: "18px",
            borderBottom: "1px solid #edf1ee",
          }}
        >
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "#6b8a7b",
              fontWeight: "700",
            }}
          >
            Geospatial Dashboard
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "23px",
              color: "#12372a",
              letterSpacing: "-0.4px",
            }}
          >
            Project Analytics
          </h2>

          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: "13px",
              color: "#718078",
            }}
          >
            Monitor site performance and environmental indicators.
          </p>
        </div>

        {/* PROJECT */}

        {selectedProject && (
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#4d6359",
              }}
            >
              ACTIVE PROJECT
            </label>

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              {/* DROPDOWN BUTTON */}
              <button
                type="button"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: showProjectDropdown
                    ? "1.5px solid #2f855a"
                    : "1px solid #d8e2dc",
                  borderRadius: "10px",
                  fontSize: "14px",
                  background: "#eaf6ee",
                  color: "#166534",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  outline: "none",
                  fontWeight: "600",
                  boxShadow: showProjectDropdown
                    ? "0 4px 12px rgba(47, 133, 90, 0.12)"
                    : "0 2px 8px rgba(47, 133, 90, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                }}
              >
                <span>🌿 {selectedProject.name}</span>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#2f855a",
                    transform: showProjectDropdown
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* DROPDOWN OPTIONS */}
              {showProjectDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    width: "100%",
                    background: "white",
                    border: "1px solid #d8e2dc",
                    borderRadius: "10px",
                    boxShadow: "0 8px 22px rgba(24, 55, 42, 0.15)",
                    overflow: "hidden",
                    zIndex: 50,
                  }}
                >
                  {projects.map((project) => {
                    const isActive =
                      selectedProject.project_id === project.project_id;

                    return (
                      <button
                        key={project.project_id}
                        type="button"
                        onClick={() => {
                          setSelectedProject(project);
                          setSelectedSite(null);
                          setAnalytics([]);
                          setShowAnalyticsForm(false);
                          setShowProjectDropdown(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "11px 12px",
                          border: "none",
                          borderBottom: "1px solid #edf1ee",
                          background: isActive ? "#eaf6ee" : "white",
                          color: isActive ? "#166534" : "#344e41",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: isActive ? "700" : "500",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          boxSizing: "border-box",
                        }}
                      >
                        <span>🌿 {project.name}</span>

                        {isActive && (
                          <span
                            style={{
                              color: "#2f855a",
                              fontSize: "15px",
                              fontWeight: "700",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE PROJECT */}

        <button
          onClick={() => setShowProjectForm(!showProjectForm)}
          style={{
            width: "100%",
            padding: "11px",
            marginBottom: "16px",
            border: "1px solid #166534",
            borderRadius: "10px",
            background: showProjectForm ? "#f0f7f2" : "#166534",
            color: showProjectForm ? "#166534" : "white",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showProjectForm ? "− Close Project Form" : "+ Create New Project"}
        </button>

        {showProjectForm && (
          <div
            style={{
              marginBottom: "18px",
              padding: "16px",
              border: "1px solid #dce8e0",
              borderRadius: "12px",
              background: "#f7faf8",
            }}
          >
            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              style={{
                width: "100%",
                padding: "10px 11px",
                marginBottom: "9px",
                border: "1px solid #d6e1da",
                borderRadius: "8px",
                boxSizing: "border-box",
                fontSize: "13px",
              }}
            />

            <textarea
              placeholder="Project description"
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              rows="3"
              style={{
                width: "100%",
                padding: "10px 11px",
                marginBottom: "10px",
                border: "1px solid #d6e1da",
                borderRadius: "8px",
                boxSizing: "border-box",
                resize: "vertical",
                fontSize: "13px",
              }}
            />

            <button
              onClick={handleCreateProject}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "8px",
                background: "#2f855a",
                color: "white",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Create Project
            </button>
          </div>
        )}

        {/* SITES */}

        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "15px",
                color: "#20382d",
              }}
            >
              Sites
            </h3>

            <span
              style={{
                padding: "4px 8px",
                borderRadius: "20px",
                background: "#edf7f0",
                color: "#28734a",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              {sites.length} {sites.length === 1 ? "site" : "sites"}
            </span>
          </div>

          {sites.length === 0 ? (
            <div
              style={{
                padding: "15px",
                borderRadius: "10px",
                background: "#f7f9f8",
                border: "1px dashed #ccd9d1",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "6px",
                }}
              >
                🗺️
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#718078",
                }}
              >
                No sites available for this project.
              </p>

              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "11px",
                  color: "#8b9992",
                }}
              >
                Use the polygon tool on the map to add one.
              </p>
            </div>
          ) : (
            <div>
              {sites.map((site) => (
                <button
                  key={site.site_id}
                  onClick={() => {
                    setSelectedSite({
                      id: site.site_id,
                      name: site.name,
                      description: site.description,
                      created_at: site.created_at,
                    });
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px",
                    marginBottom: "8px",
                    border:
                      selectedSite?.id === site.site_id
                        ? "1px solid #86b89a"
                        : "1px solid #e0e7e3",
                    borderRadius: "10px",
                    background:
                      selectedSite?.id === site.site_id ? "#f0f7f2" : "white",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#2f855a",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#263f33",
                      }}
                    >
                      {site.name}
                    </span>
                  </div>

                  {site.description && (
                    <div
                      style={{
                        marginTop: "5px",
                        marginLeft: "17px",
                        fontSize: "11px",
                        color: "#718078",
                        lineHeight: "1.4",
                      }}
                    >
                      {site.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SELECTED SITE */}

        {selectedSite && (
          <div
            style={{
              paddingTop: "18px",
              borderTop: "1px solid #edf1ee",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                margin: "0 0 5px 0",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#6b8a7b",
                fontWeight: "700",
              }}
            >
              Selected Site
            </p>

            <h3
              style={{
                margin: 0,
                fontSize: "19px",
                color: "#12372a",
              }}
            >
              {selectedSite.name}
            </h3>

            {selectedSite.description && (
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "12px",
                  color: "#718078",
                  lineHeight: "1.45",
                }}
              >
                {selectedSite.description}
              </p>
            )}

            {selectedProject && (
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "11px",
                  color: "#8a9891",
                }}
              >
                Project: {selectedProject.name}
              </p>
            )}

            {/* ADD ANALYTICS */}

            <button
              onClick={() => setShowAnalyticsForm(!showAnalyticsForm)}
              style={{
                marginTop: "13px",
                padding: "9px 13px",
                border: "1px solid #2f855a",
                borderRadius: "8px",
                background: showAnalyticsForm ? "#eaf6ee" : "#2f855a",
                color: showAnalyticsForm ? "#166534" : "white",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {showAnalyticsForm ? "− Close Analytics Form" : "+ Add Analytics"}
            </button>

            {showAnalyticsForm && (
              <div
                style={{
                  marginTop: "13px",
                  padding: "14px",
                  background: "#f7fbf8",
                  border: "1px solid #d8e8dc",
                  borderRadius: "10px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 11px 0",
                    fontSize: "13px",
                    color: "#24553a",
                  }}
                >
                  Add Analytics Data
                </h4>

                <input
                  type="number"
                  placeholder="Year"
                  value={analyticsYear}
                  onChange={(event) => setAnalyticsYear(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px",
                    marginBottom: "7px",
                    border: "1px solid #ddd9ef",
                    borderRadius: "7px",
                    boxSizing: "border-box",
                    fontSize: "12px",
                  }}
                />

                <input
                  type="number"
                  step="0.1"
                  placeholder="Carbon value"
                  value={carbonValue}
                  onChange={(event) => setCarbonValue(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px",
                    marginBottom: "7px",
                    border: "1px solid #ddd9ef",
                    borderRadius: "7px",
                    boxSizing: "border-box",
                    fontSize: "12px",
                  }}
                />

                <input
                  type="number"
                  step="0.1"
                  placeholder="Biodiversity value"
                  value={biodiversityValue}
                  onChange={(event) => setBiodiversityValue(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px",
                    marginBottom: "9px",
                    border: "1px solid #ddd9ef",
                    borderRadius: "7px",
                    boxSizing: "border-box",
                    fontSize: "12px",
                  }}
                />

                <button
                  onClick={async () => {
                    if (!analyticsYear || !carbonValue || !biodiversityValue) {
                      alert("Please fill all fields");
                      return;
                    }

                    try {
                      const response = await axios.post(
                        `${import.meta.env.VITE_API_URL}/sites/${selectedSite.id}/analytics`,
                        {
                          year: Number(analyticsYear),
                          carbon_value: Number(carbonValue),
                          biodiversity_value: Number(biodiversityValue),
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      );

                      console.log("Analytics saved:", response.data);

                      alert("Analytics saved successfully!");

                      setAnalyticsYear("");
                      setCarbonValue("");
                      setBiodiversityValue("");
                      setShowAnalyticsForm(false);

                      const analyticsResponse = await axios.get(
                        `${import.meta.env.VITE_API_URL}/sites/${selectedSite.id}/analytics`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      );

                      setAnalytics(analyticsResponse.data);
                    } catch (error) {
                      console.error("Failed to save analytics:", error);

                      if (error.response) {
                        const detail = error.response.data.detail;

                        if (Array.isArray(detail)) {
                          alert(detail[0].msg);
                        } else {
                          alert(detail || "Failed to save analytics");
                        }
                      } else {
                        alert("Unable to connect to server");
                      }
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "9px",
                    border: "none",
                    borderRadius: "7px",
                    background: "#2f855a",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  Save Analytics
                </button>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS SUMMARY */}

        {latestAnalytics && (
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#6b8a7b",
                fontWeight: "700",
                marginBottom: "9px",
              }}
            >
              Latest Performance
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
              }}
            >
              {/* CARBON */}

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#eef8f1",
                  border: "1px solid #d9ecdf",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#5d7467",
                    marginBottom: "5px",
                  }}
                >
                  Carbon
                </div>

                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: "700",
                    color: "#166534",
                  }}
                >
                  {latestAnalytics.carbon_value}
                </div>
              </div>

              {/* BIODIVERSITY */}

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#edf7f7",
                  border: "1px solid #d5eaea",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#5d746f",
                    marginBottom: "5px",
                  }}
                >
                  Biodiversity
                </div>

                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: "700",
                    color: "#147d7e",
                  }}
                >
                  {latestAnalytics.biodiversity_value}
                </div>
              </div>

              {/* YEARS */}

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f8f4eb",
                  border: "1px solid #eee4d1",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#776b56",
                    marginBottom: "5px",
                  }}
                >
                  Years
                </div>

                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: "700",
                    color: "#8a6a32",
                  }}
                >
                  {yearsTracked}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHART */}

        <div
          style={{
            paddingTop: "18px",
            borderTop: "1px solid #edf1ee",
          }}
        >
          {analytics.length > 0 ? (
            <div
              style={{
                height: "310px",
                position: "relative",
              }}
            >
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div
              style={{
                padding: "25px 10px",
                textAlign: "center",
                color: "#7b8982",
                fontSize: "13px",
              }}
            >
              No analytics available for this site.
            </div>
          )}
        </div>
      </div>

      {/* SITE DETAILS MODAL */}

      {showSiteForm && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "350px",
            maxWidth: "calc(100vw - 40px)",
            background: "rgba(255,255,255,0.98)",
            padding: "22px",
            borderRadius: "16px",
            boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
            border: "1px solid #dce6df",
            zIndex: 20,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#12372a",
                fontSize: "18px",
              }}
            >
              Add Site Details
            </h3>

            <button
              onClick={() => {
                setShowSiteForm(false);
                setPendingGeometry(null);
                setSiteName("");
                setSiteDescription("");
              }}
              style={{
                width: "30px",
                height: "30px",
                border: "none",
                borderRadius: "8px",
                background: "#f2f5f3",
                color: "#52655b",
                cursor: "pointer",
                fontSize: "17px",
              }}
            >
              ×
            </button>
          </div>

          <p
            style={{
              margin: "0 0 17px 0",
              fontSize: "12px",
              color: "#718078",
              lineHeight: "1.5",
            }}
          >
            Your polygon has been drawn. Add a name and description to save this
            site.
          </p>

          <input
            type="text"
            placeholder="Site name"
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
            style={{
              width: "100%",
              padding: "11px",
              marginBottom: "9px",
              border: "1px solid #d6e1da",
              borderRadius: "9px",
              boxSizing: "border-box",
              fontSize: "13px",
            }}
          />

          <textarea
            placeholder="Site description"
            value={siteDescription}
            onChange={(event) => setSiteDescription(event.target.value)}
            rows="3"
            style={{
              width: "100%",
              padding: "11px",
              marginBottom: "12px",
              border: "1px solid #d6e1da",
              borderRadius: "9px",
              boxSizing: "border-box",
              resize: "vertical",
              fontSize: "13px",
            }}
          />

          <button
            onClick={async () => {
              if (!siteName.trim()) {
                alert("Please enter a site name");
                return;
              }

              try {
                const response = await axios.post(
                  `${import.meta.env.VITE_API_URL}/projects/${selectedProject.project_id}/sites`,
                  {
                    name: siteName,
                    description: siteDescription,
                    geometry: pendingGeometry,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );

                console.log("Site saved successfully:", response.data);

                setShowSiteForm(false);
                setPendingGeometry(null);
                setSiteName("");
                setSiteDescription("");

                window.location.reload();
              } catch (error) {
                console.error("Failed to save site:", error);

                if (error.response) {
                  alert(error.response.data.detail || "Failed to save site");
                } else {
                  alert("Unable to connect to server");
                }
              }
            }}
            style={{
              width: "100%",
              padding: "11px",
              border: "none",
              borderRadius: "9px",
              background: "#166534",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Save Site
          </button>

          <button
            onClick={() => {
              setShowSiteForm(false);
              setPendingGeometry(null);
              setSiteName("");
              setSiteDescription("");
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              border: "1px solid #d7e1db",
              borderRadius: "9px",
              background: "white",
              color: "#52655b",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
