import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const routes = {
        patient: "/dashboard/patient",
        doctor: "/dashboard/doctor",
        receptionist: "/dashboard/receptionist",
        labTechnician: "/dashboard/labtechnician",
        admin: "/dashboard/admin",
        cleaningStaff: "/dashboard/cleaning",
      };
      navigate(routes[result.data.role] ?? "/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const styles = {
    wrapper: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Poppins', sans-serif",
      background: "linear-gradient(135deg, #1f4068, #2980b9)",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      position: "relative",
    },
    backButton: {
      position: "fixed",
      top: "20px",
      left: "20px",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(8px)",
      padding: "8px 16px",
      borderRadius: "20px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    card: {
      width: "400px",
      maxWidth: "100%",
      background: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(20px)",
      padding: "40px 30px",
      borderRadius: "20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.37)",
      border: "1px solid rgba(255,255,255,0.18)",
      color: "#fff",
      textAlign: "center",
      animation: "fadeIn 1s ease",
    },
    icon: {
      fontSize: "60px",
      marginBottom: "15px",
      animation: "float 3s ease-in-out infinite",
    },
    headerText: {
      fontSize: "22px",
      fontWeight: "600",
      marginBottom: "20px",
    },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      background: "rgba(255,255,255,0.15)",
      borderRadius: "10px",
      padding: "12px 15px",
      marginBottom: "10px",
    },
    input: {
      border: "none",
      outline: "none",
      flex: 1,
      marginLeft: "10px",
      fontSize: "14px",
      background: "transparent",
      color: "#fff",
    },
    button: {
      width: "100%",
      padding: "12px",
      border: "none",
      borderRadius: "12px",
      background: "linear-gradient(90deg, #2980b9, #6dd5fa)",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "0.3s",
      marginTop: "10px",
    },
    error: {
      color: "#ff6b6b",
      marginBottom: "10px",
      fontWeight: "500",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "22px 0 16px",
    },
    divLine: {
      flex: 1,
      height: "1px",
      background: "rgba(255,255,255,0.2)",
    },
    divText: {
      fontSize: "12px",
      letterSpacing: "2px",
      color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase",
    },
    regSection: {
      marginTop: "16px",
    },
    regRow: {
      display: "flex",
      gap: "12px",
      marginBottom: "12px",
    },
    regLink: {
      flex: 1,
      textAlign: "center",
      padding: "10px 8px",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "10px",
      color: "rgba(255,255,255,0.85)",
      textDecoration: "none",
      fontSize: "11px",
      letterSpacing: "1px",
      textTransform: "uppercase",
      background: "rgba(255,255,255,0.05)",
      transition: "all 0.2s ease",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },
    regLinkSingle: {
      flex: 1,
      textAlign: "center",
      padding: "10px 8px",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "10px",
      color: "rgba(255,255,255,0.85)",
      textDecoration: "none",
      fontSize: "11px",
      letterSpacing: "1px",
      textTransform: "uppercase",
      background: "rgba(255,255,255,0.05)",
      transition: "all 0.2s ease",
      fontWeight: "600",
    },
  };

  const regLinks = [
    { label: "Patient", to: "/register/patient" },
    { label: "Doctor", to: "/register/doctor" },
    { label: "Receptionist", to: "/register/receptionist" },
    { label: "Cleaning Staff", to: "/register/cleaningstaff" },
    { label: "Lab Technician", to: "/register/labtechnician" },
  ];

  const patientLink = regLinks.find(l => l.label === "Patient");
  const doctorLink = regLinks.find(l => l.label === "Doctor");
  const receptionistLink = regLinks.find(l => l.label === "Receptionist");
  const cleaningLink = regLinks.find(l => l.label === "Cleaning Staff");
  const labLink = regLinks.find(l => l.label === "Lab Technician");

  const handleHover = (e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
    e.currentTarget.style.color = "#fff";
  };

  const handleLeave = (e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
  };

  return (
    <div style={styles.wrapper}>
      {/* Back button */}
      <div
        style={styles.backButton}
        onClick={() => navigate("/")}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.25)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <FaArrowLeft /> Back
      </div>

      <div style={styles.card}>
        <FaSignInAlt style={styles.icon} />
        <h2 style={styles.headerText}>Welcome Back</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <FaEnvelope />
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <FaLock />
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.divLine} />
          <span style={styles.divText}>Register</span>
          <div style={styles.divLine} />
        </div>

        <div style={styles.regSection}>
          {/* Row 1: Patient alone */}
          <div style={styles.regRow}>
            <Link
              to={patientLink.to}
              style={styles.regLinkSingle}
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              {patientLink.label}
            </Link>
          </div>
          {/* Row 2: Doctor & Receptionist */}
          <div style={styles.regRow}>
            <Link
              to={doctorLink.to}
              style={styles.regLink}
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              {doctorLink.label}
            </Link>
            <Link
              to={receptionistLink.to}
              style={styles.regLink}
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              {receptionistLink.label}
            </Link>
          </div>
          {/* Row 3: Cleaning Staff & Lab Technician */}
          <div style={styles.regRow}>
            <Link
              to={cleaningLink.to}
              style={styles.regLink}
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              {cleaningLink.label}
            </Link>
            <Link
              to={labLink.to}
              style={styles.regLink}
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              {labLink.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;