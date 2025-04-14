import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./Login.css";

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer, step]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const sendOtp = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/send-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep(2);
      setTimer(120);
      Swal.fire("OTP Sent", `OTP has been sent to ${email}`, "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/verify-reset-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      setStep(3);
    } catch (err) {
      Swal.fire("Invalid OTP", err.message, "error");
    }
  };

  const updatePassword = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/update-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password update failed");
      }

      Swal.fire("Success", "Password updated successfully", "success");
      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Reset Password</h2>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
            <input
              type="email"
              placeholder="Enter your registered email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="login-button">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); verifyOtp(); }}>
            <input
              type="text"
              placeholder="Enter OTP"
              className="login-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="login-button">Verify OTP</button>

            <div style={{ marginTop: "10px" }}>
              {timer > 0 ? (
                <p>Resend available in: {formatTime()}</p>
              ) : (
                <button type="button" onClick={sendOtp} className="login-button">
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); updatePassword(); }}>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "10px",
                  cursor: "pointer",
                  userSelect: "none",
                  fontWeight: "bold"
                }}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>

            <button type="submit" className="login-button">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
