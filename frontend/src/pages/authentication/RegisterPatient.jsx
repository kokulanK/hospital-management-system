import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaUserMd, FaEnvelope, FaLock, FaHeartbeat } from "react-icons/fa";

const RegisterPatient = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;

    setPasswordStrength(strength);

    if (pwd.length < 6) setPasswordMessage("Password must be at least 6 characters");
    else if (strength < 50) setPasswordMessage("Weak password");
    else if (strength < 75) setPasswordMessage("Moderate password");
    else setPasswordMessage("Strong password");
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    calculatePasswordStrength(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const result = await register({ name, email, password, role: "patient" });
    if (result.success) navigate("/dashboard/patient");
    else setError(result.error);
  };

  const styles = {
    wrapper: { display: "flex", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: "linear-gradient(135deg, #1f4068, #2980b9)", justifyContent: "center", alignItems: "center", padding: "20px" },
    card: { width: "400px", maxWidth: "100%", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", padding: "40px 30px", borderRadius: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.37)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", textAlign: "center", animation: "fadeIn 1s ease" },
    icon: { fontSize: "60px", marginBottom: "15px", animation: "float 3s ease-in-out infinite" },
    headerText: { fontSize: "22px", fontWeight: "600", marginBottom: "20px" },
    inputGroup: { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "12px 15px", marginBottom: "10px" },
    input: { border: "none", outline: "none", flex: 1, marginLeft: "10px", fontSize: "14px", background: "transparent", color: "#fff" },
    button: { width: "100%", padding: "12px", border: "none", borderRadius: "12px", background: "linear-gradient(90deg, #2980b9, #6dd5fa)", color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "0.3s" },
    error: { color: "#ff6b6b", marginBottom: "10px", fontWeight: "500" },
    registerLinks: { marginTop: "15px", fontSize: "13px", color: "#fff" },
    link: { display: "inline-block", margin: "5px", color: "#00c6ff", textDecoration: "none" },
    passwordStrengthBar: { height: "6px", borderRadius: "5px", background: "#555", marginBottom: "5px", overflow: "hidden" },
    passwordStrengthFill: { height: "100%", width: `${passwordStrength}%`, background: passwordStrength < 50 ? "#ff6b6b" : passwordStrength < 75 ? "#f1c40f" : "#2ecc71", transition: "width 0.3s ease" },
    passwordMessage: { fontSize: "12px", textAlign: "left", color: "#fff", marginBottom: "10px" },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <FaHeartbeat style={styles.icon} />
        <h2 style={styles.headerText}>Register as Patient</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}><FaUserMd /><input style={styles.input} type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div style={styles.inputGroup}><FaEnvelope /><input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div style={styles.inputGroup}><FaLock /><input style={styles.input} type="password" placeholder="Password" value={password} onChange={handlePasswordChange} required /></div>

          {/* Password Strength */}
          <div style={styles.passwordStrengthBar}>
            <div style={styles.passwordStrengthFill}></div>
          </div>
          {password && <div style={styles.passwordMessage}>{passwordMessage}</div>}

          <button type="submit" style={styles.button}>Register</button>
        </form>
        <div style={styles.registerLinks}>
          <p>Already have an account? <Link style={styles.link} to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPatient;